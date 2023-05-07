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
        }
    }

    declare readonly placementValue: Placement
    declare readonly strategyValue: Strategy
    declare readonly flipValue: object
    declare readonly shiftValue: object
    declare readonly offsetValue: object

    declare private referenceElement: Element | null
    declare private attachElement: (target?: Element) => void
    declare private detachElement: () => void
    declare private observeClickOutside: () => void
    declare private unobserveClickOutside: () => void
    declare private toggleState: ToggleStateFunction

    get isVisible(): boolean {
        return !!this.referenceElement
    }

    initialize(): void {
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
    }

    disconnect(): void {
        this.hide()
    }

    toggle(e: Event): void {
        this.application.logDebugActivity(this.identifier, 'toggle', { visible: this.isVisible, reference: this.referenceElement, target: e.target })

        if (this.isVisible) {
            this.hide()
        } else {
            this.show(e)
        }
    }

    show(e: Event): void {
        this.application.logDebugActivity(this.identifier, 'show', { reference: this.referenceElement, target: e.target })

        if (e.currentTarget == this.referenceElement) {
            return
        }

        this.referenceElement = e.currentTarget as Element
        this.dispatch('showing')
        this.attachElement(this.referenceElement)
    }

    hide(): void {
        this.application.logDebugActivity(this.identifier, 'hide', { reference: this.referenceElement })

        if (!this.referenceElement) {
            return
        }

        this.dispatch('hiding')
        this.toggleState('hidden')
        this.element.setAttribute('aria-hidden', 'true')
        this.unobserveClickOutside()
        this.detachElement()
        this.referenceElement = null
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
        if (!this.referenceElement ||
            (!this.referenceElement.contains(target as Node) && this.referenceElement != target)) {
            this.hide()
        }
    }
}
