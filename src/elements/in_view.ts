import { Controller } from "@hotwired/stimulus"

export class InView extends Controller {
    static outlets = ["root"]
    static values = {
        margin: {
            type: String,
            default: "0px",
        },
        threshold: {
            type: Array,
            default: [0.25],
        },
        triggerOnce: {
            type: Boolean,
            default: true,
        },
    }

    declare readonly hasRootTarget: boolean
    declare readonly rootTarget: HTMLElement | Document
    declare readonly observeSelfValue: boolean
    declare readonly marginValue: string
    declare readonly thresholdValue: number
    declare readonly triggerOnceValue: boolean

    private declare observer: IntersectionObserver
    private declare visibleElements: Map<Element, boolean>

    initialize() {
        const options = {
            root: this.hasRootTarget ? this.rootTarget : null,
            margin: this.marginValue,
            threshold: this.thresholdValue,
        }

        this.observer = new IntersectionObserver(this.handleObserver.bind(this), options)
        this.visibleElements = new Map()
    }

    observerTargetConnected(target: HTMLElement): void {
        this.application.logDebugActivity(this.identifier, 'observerTargetConnected', { target })
        this.observer.observe(target)
    }

    observerTargetDisconnected(target: HTMLElement): void {
        this.application.logDebugActivity(this.identifier, 'observerTargetDisconnected', { target })
        this.observer.unobserve(target)
    }

    connect(): void {
        if (this.observeSelfValue) {
            this.observer.observe(this.element)
        }
    }

    disconnect(): void {
        this.observer.unobserve(this.element)
        this.visibleElements.clear()
    }

    protected handleObserver(entries: IntersectionObserverEntry[], observer: IntersectionObserver): void {
        entries.forEach((entry) => {
            const threshold = entry.target.hasAttribute("data-in-view-threshold")
                ? parseFloat(entry.target.getAttribute("data-in-view-threshold") as string)
                : this.thresholdValue

            if (entry.intersectionRatio > threshold) {
                this.handleIntersecting(entry, observer)
            } else if (entry.intersectionRatio < threshold && this.visibleElements.has(entry.target)) {
                this.handleNoLongerIntersecting(entry, observer)
            }
        })
    }

    private handleIntersecting(entry: IntersectionObserverEntry, observer: IntersectionObserver): void {
        if (this.triggerOnceValue) {
            this.observer.unobserve(entry.target)
        } else {
            this.visibleElements.set(entry.target, true)
        }

        this.onVisible(entry.target, entry, observer)
    }

    private handleNoLongerIntersecting(entry: IntersectionObserverEntry, observer: IntersectionObserver): void {
        this.visibleElements.delete(entry.target)
        this.onHidden(entry.target, entry, observer)
    }

    protected onVisible(target: Element, entry: IntersectionObserverEntry, observer: IntersectionObserver): void {
        this.dispatch("visible", { target, detail: { entry, observer } })
    }

    protected onHidden(target: Element, entry: IntersectionObserverEntry, observer: IntersectionObserver): void {
        this.dispatch("hidden", { target, detail: { entry, observer } })
    }
}
