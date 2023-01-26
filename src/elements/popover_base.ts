import { Controller} from "@hotwired/stimulus";
import { useFloatingUI, Placement, Strategy, EventReturn, EventWithPositionReturn  } from "../mixins/use_floating_ui"
import { useClickOutside } from "../mixins/use_click_outside"
import { useToggleState, ToggleStateFunction } from "../mixins/use_toggle_state"

export class PopoverBase extends Controller {
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
                mainAxis: 10,
            },
        },
        show: {
            type: Boolean,
            default: false
        }
    }

    declare readonly placementValue: Placement
    declare readonly strategyValue: Strategy
    declare readonly flipValue: object
    declare readonly shiftValue: object
    declare readonly offsetValue: object
    declare readonly showValue: boolean

    declare private visible: boolean
    declare private attachElement: (target?: Element) => void
    declare private detachElement: () => void
    declare private observeClickOutside: () => void
    declare private unobserveClickOutside: () => void
    declare private toggleState: ToggleStateFunction


    get isVisible(): boolean {
        return this.visible
    }

    initialize(): void {
        this.visible = false

        const options = {
            floatingElement: this.element,
            placement: this.placementValue,
            strategy: this.strategyValue,
            middleware: {
                offset: this.offsetValue,
                flip: this.flipValue,
                shift: this.shiftValue,
            }
        }

        const [attach, detach] = useFloatingUI(this, options);
        this.attachElement = attach
        this.detachElement = detach

        const [observe, unobserve] = useClickOutside(this, { element: this.element })
        this.observeClickOutside = observe
        this.unobserveClickOutside = unobserve

        this.toggleState = useToggleState(this, this.element, ["visible", "hidden"])
    }

    connect() {
        super.connect()
        this.element.setAttribute('aria-hidden', 'true')

        if (this.showValue) {
            this.show()
        }
    }

    disconnect(): void {
        this.hide()
    }

    toggle(): void {
        this.application.logDebugActivity(this.identifier, 'toggle', { visible: this.visible })

        if (this.visible) {
            this.hide()
        } else {
            this.show()
        }
    }

    show(): void {
        this.application.logDebugActivity(this.identifier, 'show', { visible: this.visible })

        if (this.visible) {
            return
        }

        this.dispatch('showing')
        this.visible = true
        this.attachElement(this.getReferenceElement())
    }

    hide(): void {
        this.application.logDebugActivity(this.identifier, 'hide', { visible: this.visible })

        if (!this.visible) {
            return
        }

        this.dispatch('hiding')
        this.visible = false
        this.toggleState('hidden')
        this.element.setAttribute('aria-hidden', 'true')
        this.unobserveClickOutside()
        this.detachElement()
    }

    onAttachFloating(e: EventWithPositionReturn) {
        this.toggleState('visible')
        this.observeClickOutside()
        this.element.setAttribute('aria-hidden', 'false')
        this.dispatch('shown', { detail: { ...e } })
    }

    onDetachFloating(e: EventReturn) {
        this.dispatch('hidden', { detail: { ...e } })
    }

    onUpdateFloating(e: EventWithPositionReturn) {
        this.dispatch('changed', { detail: { ...e } })
    }

    onClickOutside({target}: Event) {
        const reference = this.getReferenceElement()
        if (!reference.contains(target as Node) && reference != target) {
            this.hide()
        }
    }

    protected getReferenceElement(): Element {
        throw new Error("Not implemented")
    }
}
