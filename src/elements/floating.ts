import {Controller} from "@hotwired/stimulus";

import {Placement, Strategy, useFloatingUI, EventWithPositionReturn, EventReturn} from "../mixins/use_floating_ui";
import {AriaParentReferenceType, findParent} from "../util/aria_helpers";

const MIDDLEWARE_VALUES = ['offset', 'inline', 'flip', 'shift', 'autoPlacement', 'hide']

export interface AttachEvent {
    params?: {
        reference?: string
    },
    detail?: {
        reference?: Element
    }
}

export class Floating extends Controller {
    static values = {
        placement: {
            type: String,
            default: "bottom",
        },
        strategy: {
            type: String,
            default: "absolute",
        },
        ariaAttribute: {
            type: String,
            default: "details"
        }
    }

    declare readonly placementValue: Placement
    declare readonly strategyValue: Strategy
    declare readonly ariaAttributeValue: AriaParentReferenceType

    declare private attached: boolean
    declare private attachElement: (target?: Element) => void
    declare private detachElement: () => void

    initialize() {
        const middleware = Object.keys(MIDDLEWARE_VALUES).reduce<{[key: string]: any}>((result, name) => {
            const rawValue = this.data.get(name)

            if (rawValue) {
                result[name] = JSON.parse(rawValue)
            }

            return result
        }, [])

        const options = {
            floatingElement: this.element,
            placement: this.placementValue,
            strategy: this.strategyValue,
            middleware: Object.keys(middleware).length > 0 ? middleware : null
        }

        const [attach, detach] = useFloatingUI(this, options);
        this.attachElement = attach
        this.detachElement = detach
    }

    attach(event?: AttachEvent): void {
        if (this.attached) {
            return
        }

        const reference = event ? this.findReference(event) : undefined
        this.dispatch('attaching', { detail: { reference } })
        this.attached = true
        this.attachElement(reference)
    }

    detach(): void {
        if (!this.attached) {
            return
        }

        this.dispatch('detaching')
        this.attached = false
        this.detachElement()
    }

    onAttachFloating(e: EventWithPositionReturn) {
        this.dispatch('attached', { detail: { ...e } })
    }

    onDetachFloating(e: EventReturn) {
        this.dispatch('detached', { detail: { ...e } })
    }

    onUpdateFloating(e: EventWithPositionReturn) {
        this.dispatch('changed', { detail: { ...e } })
    }

    private findReference(event: AttachEvent): Element | undefined {
        if (event?.detail?.reference) {
            return event.detail.reference
        }

        if (event?.params?.reference) {
            const element = document.querySelector(event.params.reference)

            if (element) {
                return element
            }
        }

        const element = findParent(this.ariaAttributeValue, this.element.id)

        if (element) {
            return element
        }

        return undefined
    }
}
