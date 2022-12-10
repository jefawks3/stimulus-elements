import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static classes = ["dismissed"]

    declare readonly hasDismissedClass: boolean
    declare readonly dismissedClasses: string[]

    dismiss(): void {
        const dismissEvent = this.onDismiss()

        if (dismissEvent.defaultPrevented) {
            return
        }

        if (this.hasDismissedClass) {
            this.element.classList.add(...this.dismissedClasses)
        } else {
            this.element.remove()
        }

        this.onDismissed()
    }

    protected onDismiss(): Event {
        return this.dispatch("dismiss", { cancelable: true })
    }

    protected onDismissed(): void {
        this.dispatch("dismissed")
    }
}
