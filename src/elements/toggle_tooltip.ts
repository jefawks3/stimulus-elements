import { Controller } from "@hotwired/stimulus"

import {Tooltip} from "./tooltip"

export class ToggleTooltip extends Controller {
    static outlets = ["tooltip"]

    declare readonly tooltipOutlet: Tooltip

    toggle(e: Event) {
        this.tooltipOutlet.toggle(e)
    }

    show(e: Event) {
        this.tooltipOutlet.show(e)
    }

    hide() {
        this.tooltipOutlet.hide()
    }
}
