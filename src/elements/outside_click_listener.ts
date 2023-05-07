import { Controller } from "@hotwired/stimulus"

export class OutsideClickListener extends Controller {
    static outlets = ["ignore"]

    static values = {
        listening: {
            type: Boolean,
            default: false
        }
    }

    declare readonly listeningValue: boolean
    declare readonly ignoreOutletElements: HTMLElement[]

    private declare listening: boolean

    private declare boundedHandleClickOutside: (e: Event) => void

    initialize() {
        this.listening = false
        this.boundedHandleClickOutside = this.handleClickOutside.bind(this)
    }

    connect() {
        if (this.listeningValue) {
            this.listen()
        }
    }

    disconnect() {
        this.detachListener()
    }

    listen() {
        if (this.listening || !this.onListen()) {
            return
        }

        this.listening = true
        this.attachListener()
        this.onListening()
    }

    remove() {
        if (!this.listening || !this.onRemove()) {
            return
        }

        this.listening = false
        this.detachListener()
        this.onRemoved()
    }

    protected onListen(): boolean {
        const event = this.dispatch('listen', { cancelable: true })
        return !event.defaultPrevented
    }

    protected onListening(): void {
        this.dispatch('listening')
    }

    protected onRemove(): boolean {
        const event = this.dispatch('removing', { cancelable: true })
        return !event.defaultPrevented
    }

    protected onRemoved(): void {
        this.dispatch('removed')
    }

    private attachListener() {
        window.addEventListener("click", this.boundedHandleClickOutside)
    }

    private detachListener() {
        window.removeEventListener("click", this.boundedHandleClickOutside)
    }

    private isIgnored(element: Element): boolean {
        const ignored = document.querySelectorAll(this.outlets.getSelectorForOutletName('ignore') as string)

        for (let i = 0; i < ignored.length; i++) {
            if (ignored[i] == element || ignored[i].contains(element)) {
                return true
            }
        }

        return false
    }

    private handleClickOutside({ target }: Event): void {
        if ( target !== this.element
            && !this.isIgnored(target as Element)
            && !this.element.contains(target as Node | null) ) {
            this.remove()
        }
    }
}
