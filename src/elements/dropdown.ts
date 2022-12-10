import { Controller } from "@hotwired/stimulus"
import {
    computePosition,
    autoUpdate,
    Placement,
    Strategy,
    flip,
    shift,
    offset,
    ComputePositionReturn,
} from "@floating-ui/dom"

import { toggleClassActiveState, toggleClassStates, StateMap } from "../util/classlist_helpers"
import { createPositionStateMap, createPositionClasses } from "../util/floating_ui_helpers"

export default class extends Controller {
    static targets = ["trigger", "dropdown"]
    static classes = [
        "hidden",
        "visible",
        ...createPositionClasses(),
        ...createPositionClasses("trigger"),
        ...createPositionClasses("dropdown"),
    ]

    static values = {
        placement: {
            type: String,
            default: "bottom",
        },
        strategy: {
            type: String,
            default: "absolute",
        },
        flip: {
            type: Object,
            default: {},
        },
        shift: {
            type: Object,
            default: {},
        },
        offset: {
            type: Object,
            default: {
                mainAxis: 8,
            },
        },
        hideOnSelect: {
            type: Boolean,
            default: false,
        },
        show: {
            type: Boolean,
            default: false,
        },
    }

    declare readonly triggerTarget: HTMLElement
    declare readonly dropdownTarget: HTMLElement
    declare readonly placementValue: Placement
    declare readonly strategyValue: Strategy
    declare readonly flipValue: object
    declare readonly shiftValue: object
    declare readonly offsetValue: object
    declare readonly hideOnSelectValue: boolean
    declare readonly showValue: boolean
    declare readonly hiddenClasses: string[]
    declare readonly visibleClasses: string[]

    private declare cleanup: (() => void) | null
    private declare expanded: boolean
    private declare elementStateMap: StateMap
    private declare triggerStateMap: StateMap
    private declare dropdownStateMap: StateMap

    initialize() {
        this.elementStateMap = createPositionStateMap(this)
        this.triggerStateMap = createPositionStateMap(this, "trigger")
        this.dropdownStateMap = createPositionStateMap(this, "dropdown")
    }

    connect(): void {
        this.expanded = this.showValue
        this.setClassStates()
        this.setTriggerAriaExpanded()
        this.triggerTarget.setAttribute("aria-haspopup", "true")
    }

    disconnect(): void {
        this.cleanup && this.cleanup()
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

        let init = false

        this.cleanup = autoUpdate(this.triggerTarget, this.dropdownTarget, () => {
            computePosition(this.triggerTarget, this.dropdownTarget, {
                placement: this.placementValue,
                strategy: this.strategyValue,
                middleware: [offset(this.offsetValue), flip(this.flipValue), shift(this.shiftValue)],
            }).then((position) => {
                this.handleUpdatePlacement(position)

                if (!init) {
                    init = true
                    document.body.addEventListener("click", this.handleClickOutside.bind(this))
                    this.expanded = true
                    this.setClassStates()
                    this.setTriggerAriaExpanded()
                    this.onShown()
                }
            })
        })
    }

    hide(): void {
        if (!this.expanded || this.onHide().defaultPrevented) {
            return
        }

        document.body.removeEventListener("click", this.handleClickOutside.bind(this))
        this.expanded = false
        this.setClassStates()
        this.setTriggerAriaExpanded()
        this.cleanup && this.cleanup()
        this.cleanup = null
        this.onHidden()
    }

    protected onShow(): Event {
        return this.dispatch("show", { cancelable: true })
    }

    protected onShown(): void {
        this.dispatch("shown")
    }

    protected onHide(): Event {
        return this.dispatch("hide", { cancelable: true })
    }

    protected onHidden(): void {
        this.dispatch("hidden")
    }

    private setTriggerAriaExpanded(): void {
        this.triggerTarget.setAttribute("aria-expanded", this.expanded.toString())
    }

    private setClassStates(): void {
        toggleClassActiveState(this.dropdownTarget, this.expanded, this.visibleClasses, this.hiddenClasses)
    }

    private handleUpdatePlacement({ x, y, strategy: position, placement }: ComputePositionReturn): void {
        Object.assign(this.dropdownTarget.style, { left: `${x}px`, top: `${y}px`, position })
        toggleClassStates(this.element, placement, this.elementStateMap)
        toggleClassStates(this.triggerTarget, placement, this.triggerStateMap)
        toggleClassStates(this.dropdownTarget, placement, this.dropdownStateMap)
    }

    private handleClickOutside({ target }: Event): void {
        if (
            target !== this.triggerTarget &&
            (this.hideOnSelectValue || !this.dropdownTarget.contains(target as Node | null)) &&
            !this.triggerTarget.contains(target as Node | null)
        ) {
            this.hide()
        }
    }
}
