import { Controller } from "@hotwired/stimulus";

import debounce from "../util/debounce";

export class TextareaAutoResize extends Controller<HTMLTextAreaElement> {
    static values = {
        delay: {
            type: Number,
            default: 300
        }
    }

    declare readonly delayValue: number

    private declare handleResize: () => void

    initialize() {
        this.resizeElement = this.resizeElement.bind(this)
        this.handleResize = debounce(this.resizeElement, this.delayValue)
    }

    connect() {
        this.resizeElement()
        this.element.addEventListener('input', this.resizeElement)
        window.addEventListener('resize', this.handleResize)
    }

    disconnect() {
        window.addEventListener('resize', this.handleResize)
    }

    resizeElement() {
        this.element.style.height = 'auto'
        this.element.style.height = `${this.element.scrollHeight}px`
    }
}
