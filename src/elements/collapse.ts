import { Controller } from "@hotwired/stimulus"
import { toggleClassActiveState } from "../util/classlist_helpers"

export default class extends Controller {
    static targets = ["collapsible", "trigger", "icon"]
    static classes = ["collapsed", "expanded", "triggerActive", "triggerInactive", "iconActive", "iconInactive"]
    static values = {
        collapsed: {
            type: Boolean,
            default: true,
        },
    }

    declare readonly collapsibleTarget: HTMLElement
    declare readonly hasTriggerTarget: boolean
    declare readonly triggerTarget: HTMLElement
    declare readonly hasIconTarget: boolean
    declare readonly iconTarget: HTMLElement
    declare readonly collapsedClasses: string[]
    declare readonly expandedClasses: string[]
    declare readonly triggerActiveClasses: string[]
    declare readonly triggerInactiveClasses: string[]
    declare readonly iconActiveClasses: string[]
    declare readonly iconInactiveClasses: string[]
    declare readonly collapsedValue: boolean

    private declare expanded: boolean

    connect(): void {
        this.expanded = !this.collapsedValue
        this.setClassStates()
        this.updateTriggerAccessibility()
    }

    toggle(): void {
        if (this.expanded) {
            this.hide()
        } else {
            this.show()
        }
    }

    show(): void {
        if (this.expanded || this.onShow().defaultPrevented) {
            return
        }

        this.expanded = true
        this.setClassStates()
        this.updateTriggerAccessibility()
        this.onShown()
    }

    hide(): void {
        if (!this.expanded || this.onHide().defaultPrevented) {
            return
        }

        this.expanded = false
        this.setClassStates()
        this.updateTriggerAccessibility()
        this.onHidden()
    }

    protected onShow(): Event {
        return this.dispatch("show", { cancelable: true })
    }

    protected onShown(): void {
        this.dispatch("shown", { cancelable: true })
    }

    protected onHide(): Event {
        return this.dispatch("hide", { cancelable: true })
    }

    protected onHidden(): void {
        this.dispatch("hidden", { cancelable: true })
    }

    private setClassStates(): void {
        toggleClassActiveState(this.collapsibleTarget, this.expanded, this.expandedClasses, this.collapsedClasses)
        this.hasTriggerTarget &&
            toggleClassActiveState(
                this.triggerTarget,
                this.expanded,
                this.triggerActiveClasses,
                this.triggerInactiveClasses
            )
        this.hasIconTarget &&
            toggleClassActiveState(this.iconTarget, this.expanded, this.iconActiveClasses, this.iconInactiveClasses)
    }

    private updateTriggerAccessibility(): void {
        if (this.hasTriggerTarget) {
            this.triggerTarget.setAttribute("aria-expanded", this.expanded.toString())
        }
    }
}
