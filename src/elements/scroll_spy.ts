import { Controller } from "@hotwired/stimulus"

import range from "../util/range"
import { toggleClassActiveState } from "../util/classlist_helpers"

export class ScrollSpy extends Controller {
    static targets = ["root", "section", "menu"]
    static classes = ["active", "inactive"]
    static values = {
        margin: {
            type: String,
            default: "0px",
        },
        threshold: {
            default: range(0.0, 1.0, 0.01),
        },
    }

    declare readonly hasRootTarget: boolean
    declare readonly rootTarget: HTMLElement
    declare readonly menuTargets: HTMLElement[]
    declare readonly marginValue: string
    declare readonly thresholdValue: number | number[]
    declare readonly activeClasses: string[]
    declare readonly inactiveClasses: string[]

    private declare observer: IntersectionObserver
    private declare currentEntry: IntersectionObserverEntry | null

    initialize(): void {
        const options = {
            root: this.hasRootTarget ? this.rootTarget : null,
            margin: this.marginValue,
            threshold: this.thresholdValue,
        }

        this.observer = new IntersectionObserver(this.handleObserver.bind(this), options)
    }

    sectionTargetConnected(target: Element): void {
        this.application.logDebugActivity(this.identifier, 'sectionTargetConnected', { target })
        if (target.id) {
            this.observer.observe(target)
        }
    }

    sectionTargetDisconnected(target: Element): void {
        this.application.logDebugActivity(this.identifier, 'sectionTargetDisconnected', { target })
        this.observer.unobserve(target)

        if (this.currentEntry && this.currentEntry.target.id == target.id) {
            this.currentEntry = null
        }
    }

    menuTargetConnected(target: HTMLElement): void {
        this.application.logDebugActivity(this.identifier, 'menuTargetConnected', { target })
        const url = new URL(target.getAttribute("href") as string, window.location.href)

        target.dataset.scrollSpyMenuState = "inactive"

        if (url.pathname == window.location.pathname) {
            target.dataset.scrollSpySectionId = url.hash.substring(1)
        }
    }

    disconnect(): void {
        this.currentEntry = null
    }

    protected onSectionShown(section: Element): void {
        this.dispatch("shown", { target: section })
    }

    protected onSectionHidden(section: Element): void {
        this.dispatch("hidden", { target: section })
    }

    protected onMenuSelected(menu: Element): void {
        this.dispatch("selected", { target: menu })
    }

    protected onMenuDeselected(menu: Element): void {
        this.dispatch("deselected", { target: menu })
    }

    private handleObserver(entries: IntersectionObserverEntry[], _observer: IntersectionObserver): void {
        let visibleEntry: IntersectionObserverEntry | null = null

        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                if (this.isNextEntryIsMoreVisible(visibleEntry, entry)) {
                    visibleEntry = entry
                }

                if (this.areEntriesEqual(entry, this.currentEntry)) {
                    this.currentEntry = entry
                }
            }
        })

        if (
            visibleEntry &&
            !this.areEntriesEqual(visibleEntry, this.currentEntry) &&
            this.isNextEntryIsMoreVisible(this.currentEntry, visibleEntry)
        ) {
            this.currentEntry && this.onSectionHidden(this.currentEntry.target)
            this.currentEntry = visibleEntry
            this.onSectionShown((visibleEntry as IntersectionObserverEntry).target)
            this.updateMenuStates()
        }
    }

    private areEntriesEqual(a: IntersectionObserverEntry | null, b: IntersectionObserverEntry | null): boolean {
        return a != null && b != null && a.target.id === b.target.id
    }

    private isNextEntryIsMoreVisible(
        current: IntersectionObserverEntry | null,
        next: IntersectionObserverEntry
    ): boolean {
        return !current || current.intersectionRect.height < next.intersectionRect.height
    }

    private updateMenuStates(): void {
        this.menuTargets.forEach((element) => {
            const state =
                this.currentEntry && element.dataset.scrollSpySectionId === this.currentEntry.target.id
                    ? "active"
                    : "inactive"

            if (state != element.dataset.scrollSpyMenuState) {
                element.dataset.scrollSpyMenuState = state
                toggleClassActiveState(element, state === "active", this.activeClasses, this.inactiveClasses)

                if (state === "active") {
                    this.onMenuSelected(element)
                } else {
                    this.onMenuDeselected(element)
                }
            }
        })
    }
}
