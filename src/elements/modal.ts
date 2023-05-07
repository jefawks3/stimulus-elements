import { Controller } from "@hotwired/stimulus"

import Stack from "../util/stack"
import {ToggleStateFunction, useToggleState} from "../mixins";

export class Modal extends Controller {
    private static readonly openModals: Stack<Modal> = new Stack()

    static closeAllModals = () => this.openModals.forEach((m) => m.hide())


    static classes = ["backdrop", "body"]
    static values = {
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
    declare readonly hasBackdropClass: boolean
    declare readonly bodyClasses: string[]
    declare readonly keyboardValue: boolean
    declare readonly keyboardKeyValue: string
    declare readonly preventCloseValue: boolean
    declare readonly showValue: boolean

    private declare isOpen: boolean
    private declare backdropElement: HTMLElement | null
    declare private toggleState: ToggleStateFunction

    get opened(): boolean {
        return this.isOpen
    }

    initialize() {
        super.initialize();
        this.toggleState = useToggleState(this, this.element, ['visible', 'hidden'])
    }

    connect() {
        this.toggleState('hidden')

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
        if (this.isOpen || !this.onShow()) {
            return
        }

        Modal.closeAllModals()
        Modal.openModals.push(this)
        document.body.classList.add(...this.bodyClasses)
        this.showBackdrop()
        this.toggleState('visible')
        this.isOpen = true
        this.addOutsideHandler()
        this.addKeyboardHandler()
        this.onShown()
    }

    hide(): void {
        if (!this.isOpen || !this.onHide()) {
            return
        }

        Modal.openModals.remove(this)
        this.removeOutsideHandler()
        this.removeKeyboardHandler()
        this.removeBackdrop()
        this.toggleState('hidden')
        document.body.classList.remove(...this.bodyClasses)
        this.isOpen = false
        this.onHidden()
        Modal.openModals.peak() && Modal.openModals.peak().show()
    }

    protected onShow(): boolean {
        const event = this.dispatch("show", { cancelable: true })
        return !event.defaultPrevented
    }

    protected onShown(): void {
        this.dispatch("shown")
    }

    protected onHide(): boolean {
        const event = this.dispatch("hide", { cancelable: true })
        return !event.defaultPrevented
    }

    protected onHidden(): void {
        this.dispatch("hidden")
    }

    private showBackdrop() {
        if (!this.hasBackdropClass) {
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
