import { Controller } from "@hotwired/stimulus"

export class Dismiss extends Controller {
    static classes = ["dismissed"]

    declare readonly hasDismissedClass: boolean
    declare readonly dismissedClasses: string[]

    dismiss(): void {
        if (!this.onDismiss()) {
            return
        }

        if (this.hasDismissedClass) {
            this.element.classList.add(...this.dismissedClasses)
        } else {
            this.element.remove()
        }

        this.onDismissed()
    }

    protected onDismiss(): boolean {
        const event = this.dispatch("dismiss", { cancelable: true })
        return event.defaultPrevented
    }

    protected onDismissed(): void {
        this.dispatch("dismissed")
    }
}
