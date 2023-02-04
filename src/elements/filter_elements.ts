import { Controller } from "@hotwired/stimulus"

export interface FilterAction {
    params: {
        tags: string[] | undefined
    }
}

export interface FilterEvent extends Event {
    detail: {
        tags: string[]
    }
}

export class FilterElements extends Controller {
    static targets = ['filter']

    static classes = ['active', 'hidden']

    static values = {
        tags: {
            type: Array,
            default: []
        },
        attr: {
            type: String,
            default: 'data-filter-tags'
        },
        delimiter: {
            type: String,
            default: ' '
        }
    }

    declare readonly filterTargets: HTMLElement[]
    declare readonly activeClasses: string[]
    declare readonly hiddenClasses: string[]
    declare readonly tagsValue: string[]
    declare readonly attrValue: string
    declare readonly delimiterValue: string

    declare private selected: string[]

    get selectedTags(): string[] {
        return this.selected
    }

    get isShowingAll(): boolean {
        return this.selected.length === 0
    }

    initialize() {
        super.initialize();
        this.selected = []
    }

    connect() {
        super.connect();
        this.filter({ params: { tags: this.tagsValue } })
    }

    filter({params: { tags }}: FilterAction): void {
        tags = tags || []
        tags = tags.filter((tag) => tag && tag.trim().length !== 0)

        if (tags.length === 0) {
            this.showAll()
        } else {
            this.filterElementsBy(tags)
        }
    }

    showAll() {
        if (this.onFilter().defaultPrevented) {
            return
        }

        this.selected = []
        this.filterTargets.forEach(this.showElement.bind(this))
        this.onFiltered()
    }

    protected onFilter(): Event {
        return this.dispatch('filter', { detail: { tags: this.selectedTags }, cancelable: true })
    }

    protected onFiltered(): void {
        this.dispatch('filtered', { detail: { tags: this.selectedTags } })
    }

    private filterElementsBy(tags: string[]) {
        if (this.onFilter().defaultPrevented) {
            return
        }

        this.selected = tags
        this.filterTargets.forEach((element) => {
            const elementTags = (element.getAttribute(this.attrValue) || "").split(this.delimiterValue)
            const show = elementTags.some((tag) => tags.includes(tag))

            this.application.logDebugActivity(this.identifier, 'filterElementsBy', { element, show, elementTags })

            if (elementTags.some((tag) => tags.includes(tag))) {
                this.showElement(element)
            } else {
                this.hideElement(element)
            }
        })

        this.onFiltered()
    }

    private showElement(element: HTMLElement) {
        element.classList.remove(...this.hiddenClasses)
        element.classList.add(...this.activeClasses)
        this.dispatch('shown', { target: element })
    }

    private hideElement(element: HTMLElement) {
        element.classList.remove(...this.activeClasses)
        element.classList.add(...this.hiddenClasses)
        this.dispatch('hidden', { target: element })
    }
}
