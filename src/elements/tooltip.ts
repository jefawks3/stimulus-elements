import { Controller } from "@hotwired/stimulus"

import { computePosition, autoUpdate, Placement, Strategy, offset, flip, shift } from "@floating-ui/dom"

import { toggleClassActiveState, toggleClassStates, StateMap } from "../util/classlist_helpers"
import { createPositionStateMap, createPositionClasses } from "../util/floating_ui_helpers"

export default class extends Controller {
    static classes = ["visible", "hidden", ...createPositionClasses(), ...createPositionClasses("arrow")]
    static targets = ["arrow"]
    static values = {
        placement: {
            type: String,
            default: "top",
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
    }

    declare readonly placementValue: Placement
    declare readonly strategyValue: Strategy
    declare readonly offsetValue: object
    declare readonly flipValue: object
    declare readonly shiftValue: object
    declare readonly visibleClasses: string[]
    declare readonly hiddenClasses: string[]
    declare readonly hasArrowTarget: boolean
    declare readonly arrowTarget: HTMLElement

    private declare visible: boolean
    private declare attachedElement: Element
    private declare cleanup: (() => void) | null
    private declare elementStateMap: StateMap
    private declare arrowStateMap: StateMap

    initialize(): void {
        this.elementStateMap = createPositionStateMap(this)
        this.arrowStateMap = createPositionStateMap(this, "arrow")
    }

    connect() {
        this.visible = false
    }

    toggle(e: CustomEvent): void {
        if (this.visible) {
            this.hide()
        } else {
            this.show(e)
        }
    }

    show({ target: originalTarget, detail: { toggler } }: CustomEvent): void {
        const target = toggler || originalTarget

        if ((this.visible && this.attachedElement === target) || this.onShow().defaultPrevented) {
            return
        }

        if (this.cleanup) {
            this.cleanup()
        }

        let init = false

        this.cleanup = autoUpdate(target, this.element as HTMLElement, () => {
            computePosition(target, this.element as HTMLElement, {
                placement: this.placementValue,
                strategy: this.strategyValue,
                middleware: [offset(this.offsetValue), flip(this.flipValue), shift(this.shiftValue)],
            }).then((position) => {
                Object.assign((this.element as HTMLElement).style, {
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    position: position.strategy,
                })

                this.togglePositionClasses(position.placement)

                if (!init) {
                    init = true
                    this.visible = true
                    this.toggleClasses()
                    this.onShown()
                }
            })
        })
    }

    hide(): void {
        if (!this.visible || this.onHide().defaultPrevented) {
            return
        }

        if (this.cleanup) {
            this.cleanup()
        }

        this.visible = false
        this.toggleClasses()
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

    private toggleClasses(visible = this.visible): void {
        toggleClassActiveState(this.element, visible, this.visibleClasses, this.hiddenClasses)
    }

    private togglePositionClasses(position: string): void {
        toggleClassStates(this.element, position, this.elementStateMap)
        this.hasArrowTarget && toggleClassStates(this.arrowTarget, position, this.arrowStateMap)
    }
}
