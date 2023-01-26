import { Controller } from "@hotwired/stimulus"

import {safeCallMethod} from "../util/reflection";
import { observe as observeEvents, unobserve as unobserveEvents } from "../util/events"

interface Options {
    element?: Element,
    events?: string[]
}

const DEFAULT_OPTIONS = {
    events: ['click', 'touchend'],
}

export const useClickOutside = (controller: Controller, options?: Options) => {
    const { element, events } = Object.assign({}, DEFAULT_OPTIONS, options)

    const handleClickOutside = (event: Event): void => {
        const outside = !element?.contains(event.target as Node) && event.target != element
        controller.application.logDebugActivity('use-click-outside', 'click', { outside })

        if (outside) {
            safeCallMethod(controller, 'onClickOutside', event)
        }
    }

    const observe = () => observeEvents(window, events, handleClickOutside, true)
    const unobserve = () => unobserveEvents(window, events, handleClickOutside, true)

    const controllerDisconnect = controller.disconnect.bind(controller)

    Object.assign(controller, {
        disconnect() {
            unobserve()
            controllerDisconnect()
        }
    })

    return [observe, unobserve] as const
}
