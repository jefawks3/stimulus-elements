import { Controller } from "@hotwired/stimulus"
import {
    computePosition,
    autoUpdate,
    flip,
    shift,
    inline,
    offset,
    autoPlacement,
    arrow,
    hide,
    size,
    ComputePositionReturn,
    ComputePositionConfig
} from "@floating-ui/dom"
import {InlineOptions, FlipOptions, ShiftOptions, OffsetOptions, AutoPlacementOptions, ArrowOptions, HideOptions, SizeOptions, DetectOverflowOptions} from "@floating-ui/core"
export type { Placement, Strategy, ComputePositionReturn, InlineOptions} from "@floating-ui/core"

import { safeCallMethod } from "../util/reflection";

type Target = Element | null | undefined

interface Middleware {
    inline?: Partial<InlineOptions & DetectOverflowOptions> | null,
    offset?: Partial<OffsetOptions & DetectOverflowOptions> | null,
    autoPlacement?: Partial<AutoPlacementOptions & DetectOverflowOptions> | null,
    flip?: Partial<FlipOptions & DetectOverflowOptions> | null
    shift?: Partial<ShiftOptions & DetectOverflowOptions> | null
    arrow?: ArrowOptions | null
    hide?: Partial<HideOptions & DetectOverflowOptions> | null
    size?: Partial<SizeOptions & DetectOverflowOptions> | null
}

interface UseFloatingUIOptions extends Omit<ComputePositionConfig, "middleware"> {
    floatingElement?: Element | null,
    referenceElement?: Element | null,
    middleware?: Middleware | null
}

export interface EventReturn {
    reference: Element,
    floating: Element,
}

export interface EventWithPositionReturn extends EventReturn {
    position: ComputePositionReturn
}

const DEFAULT_OPTIONS: UseFloatingUIOptions = {
    placement: "bottom",
    strategy: "absolute",
    middleware: {
        flip: {},
        shift: {}
    }
}

const MIDDLEWARE_MAP = { flip, shift, inline, offset, autoPlacement, arrow, hide, size }

export const useFloatingUI = (controller: Controller, options?: UseFloatingUIOptions) => {
    const { floatingElement, referenceElement, middleware: middlewareOptions, ...floatingOptions } = Object.assign({}, DEFAULT_OPTIONS, options)
    const floating: HTMLElement = (floatingElement || controller.element) as HTMLElement
    let reference: Element | undefined

    if (middlewareOptions) {
        const middleware: any[] = []

        Object.keys(middlewareOptions).forEach((method) => {
            if ((middlewareOptions as any)[method]) {
                middleware.push((MIDDLEWARE_MAP as any)[method]((middlewareOptions as any)[method]) as Middleware)
            }
        });

        (floatingOptions as ComputePositionConfig).middleware = middleware
    }

    const updatePlacement = (position: ComputePositionReturn): void => {
        const style = {left: `${position.x}px`, top: `${position.y}px`, position: position.strategy}
        Object.assign(floating.style, style)
        floating.setAttribute('data-placement', position.placement)
    }

    const onAttach = (position: ComputePositionReturn): void => {
        controller.dispatch('attached', { target: reference })
        safeCallMethod(controller, 'onAttachFloating', { reference, floating, position })
    }

    const onDetach = (): void => {
        controller.dispatch('detached', { target: reference })
        safeCallMethod(controller, 'onDetachFloating', { floating, reference })
    }

    const onUpdated = (position: ComputePositionReturn): void => {
        safeCallMethod(controller, 'onFloatingPositionChanged', { reference, floating, position })
    }

    const computeElementPosition = (attached: boolean): void => {
        computePosition(reference as Element, floating, floatingOptions).then((position) => {
            controller.application.logDebugActivity('use-floating-ui', 'computeElementPosition', { reference, floating, position, attached })
            updatePlacement(position)

            if (!attached) {
                onAttach(position)
            }

            onUpdated(position)
        })
    }

    let unsubscribe: (() => void) | undefined = undefined

    const detach = () => {
        if (unsubscribe) {
            controller.application.logDebugActivity('use-floating-ui', 'detach', { floating })
            unsubscribe()
            unsubscribe = undefined
            onDetach()
        }
    }

    const attach = (target: Target = undefined) => {
        detach()
        reference = (referenceElement || target) as Element
        controller.application.logDebugActivity('use-floating-ui', 'attach', { reference, floating })
        computeElementPosition(false)
        unsubscribe = autoUpdate(reference, floating, () => computeElementPosition(true))

        return () => unsubscribe && unsubscribe()
    }

    const controllerDisconnect = controller.disconnect.bind(controller)

    Object.assign(controller, {
        disconnect() {
            detach()
            controllerDisconnect()
        },
    })

    return [attach, detach] as const
}
