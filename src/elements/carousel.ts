import { Controller, ActionEvent } from "@hotwired/stimulus";
import debounce from "../util/debounce";

interface GoToEvent extends ActionEvent {
    params: {
        position: number
    }
}

export class Carousel extends Controller {
    static targets = ["slide", "slideContainer", "indicator"]
    static classes = ["slideHidden", "slidePending", "slideIn", "slideOut", "indicatorActive", "indicatorInactive"]

    static values = {
        defaultSlide: {
            type: Number,
            default: 0
        },
        interval: {
            type: Number,
            default: 3000,
        },
        responsiveHeight: {
            type: Boolean,
            default: false
        },
        heightPadding: {
            type: Number,
            default: 0
        }
    }

    declare readonly defaultSlideValue: number
    declare readonly intervalValue: number
    declare readonly responsiveHeightValue: boolean
    declare readonly heightPaddingValue: number

    declare readonly slideTargets: HTMLElement[]
    declare readonly hasSlideContainerTarget: boolean
    declare readonly slideContainerTarget: HTMLElement
    declare readonly indicatorTargets: HTMLElement[]

    declare readonly slideHiddenClasses: string[]
    declare readonly slidePendingClasses: string[]
    declare readonly slideInClasses: string[]
    declare readonly slideOutClasses: string[]
    declare readonly indicatorActiveClasses: string[]
    declare readonly indicatorInactiveClasses: string[]

    private declare position: number | undefined
    private declare intervalInstance: NodeJS.Timer | undefined

    initialize() {
        this.handleResize = debounce(this.handleResize.bind(this), 130)
    }

    connect() {
        this.setActiveSlide(this.defaultSlideValue)
        this.startCycle()
        window.addEventListener('resize', this.handleResize)
    }

    disconnect() {
        this.stopCycle()
        window.removeEventListener('resize', this.handleResize)
    }

    goTo({ params: { position } }: GoToEvent) {
        this.setActiveSlide(position)
    }

    next() {
        this.setActiveSlide(this.getNextPosition(this.position as number))
    }

    previous() {
        this.setActiveSlide(this.getPreviousPosition(this.position as number))
    }

    intervalValueChanged() {
        this.stopCycle()
        this.startCycle()
    }

    protected onChange(nextPosition: number, currentPosition: number | undefined): boolean {
        const event = this.dispatch('change', { detail: { position: currentPosition, nextPosition }})
        return !event.defaultPrevented
    }

    protected onChanged(position: number, previousPosition: number | undefined) {
        this.dispatch( 'changed', { detail: { position, previousPosition }})
    }

    private startCycle() {
        if (this.intervalValue > 0 && !this.intervalInstance) {
            this.intervalInstance = setInterval(this.next.bind(this), this.intervalValue)
        }
    }

    private stopCycle() {
        clearInterval(this.intervalInstance)
        this.intervalInstance = undefined
    }

    private setActiveSlide(position: number) {
        if (!this.onChange(position, this.position)) {
            return
        }

        this.stopCycle()
        this.rotateSlides(position)
        this.setActiveIndicator(position)
        this.setContainerSize(position)
        const previousPosition = this.position = position
        this.startCycle()
        this.onChanged(position, previousPosition)
    }

    private getPreviousPosition(position: number): number {
        return ((position === 0) ? this.slideTargets.length : position) - 1
    }

    private getNextPosition(position: number): number {
        return (position + 1) % this.slideTargets.length
    }

    private rotateSlides(position: number) {
        const previousPosition = this.getPreviousPosition(position)
        const nextPosition = this.getNextPosition(position)

        this.slideTargets.forEach((el, i) => {
            el.classList.add(...this.slideHiddenClasses)
            el.classList.remove(...this.slidePendingClasses, ...this.slideInClasses, ...this.slideOutClasses)
        })

        if (previousPosition != nextPosition) {
            this.slideTargets[previousPosition].classList.remove(...this.slideHiddenClasses)
            this.slideTargets[previousPosition].classList.add(...this.slideOutClasses)
        }

        this.slideTargets[position].classList.remove(...this.slideHiddenClasses)
        this.slideTargets[position].classList.add(...this.slideInClasses)
        this.slideTargets[nextPosition].classList.remove(...this.slideHiddenClasses)
        this.slideTargets[nextPosition].classList.add(...this.slidePendingClasses)
    }

    private handleResize() {
        this.stopCycle()
        this.setContainerSize(this.position as number)
        this.startCycle()
    }

    private setContainerSize(position: number) {
        if (this.responsiveHeightValue && this.hasSlideContainerTarget) {
            const { height } = (this.slideTargets[position].firstElementChild as HTMLElement).getBoundingClientRect();
            this.slideContainerTarget.style.height = `${height + this.heightPaddingValue}px`
        }
    }

    private setActiveIndicator(position: number) {
        this.indicatorTargets.forEach((el, i) => {
            if (i === position) {
                el.classList.remove(...this.indicatorInactiveClasses)
                el.classList.add(...this.indicatorActiveClasses)
                el.setAttribute("aria-current", "true")
            } else {
                el.classList.add(...this.indicatorInactiveClasses)
                el.classList.remove(...this.indicatorActiveClasses)
                el.setAttribute("aria-current", "false")
            }
        })
    }
}
