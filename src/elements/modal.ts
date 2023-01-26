import { Controller } from "@hotwired/stimulus"

import Stack from "../util/stack"
import { toggleClassActiveState } from "../util/classlist_helpers"

export class Modal extends Controller {
    private static readonly openModals: Stack<Modal> = new Stack()

    static closeAllModals = () => this.openModals.forEach((m) => m.hide())


    static classes = ["backdrop", "body", "active", "inactive"]
    static values = {
        backdrop: {
            type: Boolean,
            default: true,
        },
        keyboard: {
            type: Boolean,
            default: true,
        },
        keyboardKey: {
            type: String,
            default: "Escape",
        },
        preventClose: {
            type: Boolean,
            default: false,
        },
        show: {
            type: Boolean,
            default: false,
        },
    }

    declare readonly backdropClasses: string[]
    declare readonly bodyClasses: string[]
    declare readonly activeClasses: string[]
    declare readonly inactiveClasses: string[]
    declare readonly backdropValue: boolean
    declare readonly keyboardValue: boolean
    declare readonly keyboardKeyValue: string
    declare readonly preventCloseValue: boolean
    declare readonly showValue: boolean

    private declare isOpen: boolean
    private declare backdropElement: HTMLElement | null

    connect() {
        this.element.classList.add(...this.inactiveClasses)

        if (this.showValue) {
            this.show()
        }
    }

    disconnect() {
        Modal.openModals.remove(this)
        document.body.classList.remove(...this.bodyClasses)
        this.removeBackdrop()
        this.removeOutsideHandler()
        this.removeKeyboardHandler()
    }

    toggle(): void {
        if (this.isOpen) {
            this.hide()
        } else {
            this.show()
        }
    }

    show(): void {
        if (this.isOpen || this.onShow().defaultPrevented) {
            return
        }

        Modal.closeAllModals()
        Modal.openModals.push(this)
        document.body.classList.add(...this.bodyClasses)
        this.showBackdrop()
        toggleClassActiveState(this.element, true, this.activeClasses, this.inactiveClasses)
        this.isOpen = true
        this.addOutsideHandler()
        this.addKeyboardHandler()
        this.onShown()
    }

    hide(): void {
        if (!this.isOpen || this.onHide().defaultPrevented) {
            return
        }

        Modal.openModals.remove(this)
        this.removeOutsideHandler()
        this.removeKeyboardHandler()
        this.removeBackdrop()
        toggleClassActiveState(this.element, false, this.activeClasses, this.inactiveClasses)
        document.body.classList.remove(...this.bodyClasses)
        this.isOpen = false
        this.onHidden()
        Modal.openModals.peak() && Modal.openModals.peak().show()
    }

    protected onShow(): Event {
        return this.dispatch("show", { cancelable: true })
    }

    protected onShown(): void {
        this.dispatch("shown")
    }

    protected onHide(): Event {
        return this.dispatch("hide", { cancelable: true })
    }

    protected onHidden(): void {
        this.dispatch("hidden")
    }

    private showBackdrop() {
        if (!this.backdropValue) {
            return
        }

        this.backdropElement = this.createBackdropElement()
        document.body.append(this.backdropElement)
    }

    private removeBackdrop() {
        if (!this.backdropElement) {
            return
        }

        this.backdropElement.remove()
        this.backdropElement = null
    }

    private addOutsideHandler(): void {
        if (!this.preventCloseValue) {
            document.body.addEventListener("click", this.handleClickOutside.bind(this))
        }
    }

    private removeOutsideHandler(): void {
        document.body.removeEventListener("click", this.handleClickOutside.bind(this))
    }

    private addKeyboardHandler(): void {
        if (!this.preventCloseValue && this.keyboardValue) {
            document.body.addEventListener("keydown", this.handleKeyboard.bind(this))
        }
    }

    private removeKeyboardHandler(): void {
        document.body.removeEventListener("keydown", this.handleKeyboard.bind(this))
    }

    private createBackdropElement(): HTMLElement {
        const backdropElement = document.createElement("div")
        backdropElement.classList.add(...this.backdropClasses)
        return backdropElement
    }

    private handleClickOutside({ target }: Event): void {
        if (target == this.backdropElement || target == this.element) {
            this.hide()
        }
    }

    private handleKeyboard({ key }: KeyboardEvent): void {
        if (key === this.keyboardKeyValue) {
            this.hide()
        }
    }
}
