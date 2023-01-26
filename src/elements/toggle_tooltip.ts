import { Controller } from "@hotwired/stimulus"

import {Tooltip} from "./tooltip"

export class ToggleTooltip extends Controller {
    static outlets = ["tooltip"]

    declare readonly tooltipOutlet: Tooltip

    toggle() {
        this.tooltipOutlet.toggle()
    }

    show() {
        this.tooltipOutlet.show()
    }

    hide() {
        this.tooltipOutlet.hide()
    }
}
