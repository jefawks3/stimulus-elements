import {Controller} from "@hotwired/stimulus";
import {Collapse} from "./collapse";
import {setAriaState} from "../util/aria_helpers";

export class ToggleCollapse extends Controller {
    static outlets = ["collapse"]

    declare readonly collapseOutlet: Collapse

    initialize() {
        super.initialize();

        this.updateAriaExpanded = this.updateAriaExpanded.bind(this)
    }

    toggle() {
        this.collapseOutlet.toggle()
    }

    show() {
        this.collapseOutlet.show()
    }

    hide() {
        this.collapseOutlet.hide()
    }

    collapseOutletConnected(outlet: Collapse, element: Element): void {
        this.application.logDebugActivity(this.identifier, 'collapseOutletConnected', { outlet, element })
        this.updateAriaExpanded()
        element.addEventListener('collapse:hidden', this.updateAriaExpanded)
        element.addEventListener('collapse:shown', this.updateAriaExpanded)
    }

    collapseOutletDisconnected(outlet: Collapse, element: Element): void {
        this.application.logDebugActivity(this.identifier, 'collapseOutletDisconnected', { outlet, element })
        element.removeEventListener('collapse:hidden', this.updateAriaExpanded)
        element.removeEventListener('collapse:shown', this.updateAriaExpanded)
    }

    private updateAriaExpanded() {
        setAriaState(this.element, "expanded", !this.collapseOutlet.isCollapsed)
    }
}
