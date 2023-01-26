import { Controller } from "@hotwired/stimulus"

import {Popover} from "./popover"

export class TogglePopover extends Controller {
    static outlets = ["popover"]

    declare readonly popoverOutlet: Popover

    toggle() {
        this.popoverOutlet.toggle()
    }

    show() {
        this.popoverOutlet.show()
    }

    hide() {
        this.popoverOutlet.hide()
    }
}
