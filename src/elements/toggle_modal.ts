import { Controller } from "@hotwired/stimulus"

import {Modal} from "./modal"

export class ToggleModal extends Controller {
    static outlets = ["modal"]

    declare readonly modalOutlet: Modal

    toggle() {
        this.modalOutlet.toggle()
    }

    show() {
        this.modalOutlet.show()
    }

    hide() {
        this.modalOutlet.hide()
    }
}
