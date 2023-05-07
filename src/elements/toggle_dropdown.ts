import { Controller } from "@hotwired/stimulus";
import { Dropdown } from "./dropdown";

export class ToggleDropdown extends Controller {
    static outlets = ["dropdown"]

    declare readonly dropdownOutlet: Dropdown

    get isVisible(): boolean {
        return this.dropdownOutlet.isVisible
    }

    initialize() {
        this.updateAriaExpanded = this.updateAriaExpanded.bind(this)
    }

    toggle(e: Event) {
        this.dropdownOutlet.toggle(e)
    }

    show(e: Event) {
        this.dropdownOutlet.show(e)
    }

    hide() {
        this.dropdownOutlet.hide()
    }

    dropdownOutletConnected(outlet: Dropdown, element: Element): void {
        this.application.logDebugActivity(this.identifier, 'dropdownOutletConnected', { outlet, element })
        this.updateAriaExpanded()
        element.addEventListener("dropdown:shown", this.updateAriaExpanded)
        element.addEventListener("dropdown:hidden", this.updateAriaExpanded)
    }

    dropdownOutletDisconnected(outlet: Dropdown, element: Element): void {
        this.application.logDebugActivity(this.identifier, 'dropdownOutletDisconnected', { outlet, element })
        element.removeEventListener("dropdown:shown", this.updateAriaExpanded)
        element.removeEventListener("dropdown:hidden", this.updateAriaExpanded)
    }

    private updateAriaExpanded(): void {
        this.element.setAttribute("aria-expanded", this.isVisible.toString())
    }
}