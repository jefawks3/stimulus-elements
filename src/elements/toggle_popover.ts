import { Controller } from "@hotwired/stimulus"

import {Popover} from "./popover"

export class TogglePopover extends Controller {
    static outlets = ["popover"]

    declare readonly popoverOutlet: Popover

    toggle(e: Event) {
        this.popoverOutlet.toggle(e)
    }

    show(e: Event) {
        this.popoverOutlet.show(e)
    }

    hide() {
        this.popoverOutlet.hide()
    }
}
