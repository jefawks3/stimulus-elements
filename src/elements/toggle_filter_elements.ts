import { Controller } from "@hotwired/stimulus";

import { useToggleState, ToggleStateFunction } from "../mixins/use_toggle_state";
import {FilterElements} from "./filter_elements";

export class ToggleFilterElements extends Controller {
    static outlets = ["filter-elements"]

    static values = {
        tags: {
            type: Array,
            default: []
        }
    }

    declare readonly filterElementsOutlet: FilterElements

    declare readonly tagsValue: string[]

    declare private toggleState: ToggleStateFunction

    get isShowAll(): boolean {
        return this.tagsValue.length === 0
    }

    initialize() {
        super.initialize();
        this.toggleState = useToggleState(this, this.element, ["selected", "unselected"])
        this.handleFiltered = this.handleFiltered.bind(this)
    }

    filter() {
        this.filterElementsOutlet.filter({ params: { tags: this.tagsValue } })
    }

    filterElementsOutletConnected(outlet: FilterElements, element: HTMLElement) {
        element.addEventListener('filter-elements:filtered', this.handleFiltered)
        this.handleFiltered()
    }

    filterElementsOutletDisconnected(outlet: FilterElements, element: HTMLElement) {
        element.removeEventListener('filter-elements:filtered', this.handleFiltered)
    }

    private handleFiltered(): void {
        const selected = (this.isShowAll && this.filterElementsOutlet.isShowingAll) ||
            (!this.isShowAll && this.tagsValue.every((tag) => this.filterElementsOutlet.selectedTags.includes(tag)))
        this.application.logDebugActivity(this.identifier, 'handleFiltered', { selected, tags: this.tagsValue, filtered: this.filterElementsOutlet.selectedTags })
        this.toggleState(selected ? 'selected' : 'unselected')
    }
}
