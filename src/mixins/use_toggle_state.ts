import { Controller } from "@hotwired/stimulus"

import { ClassNames, StateMap, toggleClassStates } from "../util/classlist_helpers";

export type StateClassName = string
export type StateClassMap = { [state: string]: StateClassName }
export type States = StateClassMap | StateClassName[]

type FormatClassName = (string: string) => string

interface Options {
    formatClassName: FormatClassName
}

export type ToggleStateFunction = (state: any) => void

const DEFAULT_OPTIONS: Options = {
    formatClassName: (state: string) => state
}

const buildStateMapFor = (controller: Controller, state: string, property: string, map: StateMap, format: FormatClassName): StateMap => {
    const name = format(state)

    Object.defineProperty(map, property, {
        get(): ClassNames {
            return controller.classes.getAll(name)
        }
    })

    return map
}

const convertStateClassMapToStateMap = (controller: Controller, states: StateClassMap, formatClassName: FormatClassName): StateMap => {
    return Object.getOwnPropertyNames(states).reduce<StateMap>((map, key):StateMap => {
        return buildStateMapFor(controller, states[key], key, map, formatClassName)
    }, {})
}

const convertStatesArrayToStateMap = (controller: Controller, states: StateClassName[], formatClassName: FormatClassName): StateMap => {
    return states.reduce<StateMap>((map, state): StateMap => {
        return buildStateMapFor(controller, state, state, map, formatClassName)
    }, {})
}

const convertStatesToStateMap = (controller: Controller, states: States, formatClassName: FormatClassName): StateMap => {
    if (Array.isArray(states)) {
        return convertStatesArrayToStateMap(controller, states, formatClassName)
    } else {
        return convertStateClassMapToStateMap(controller, states, formatClassName)
    }
}

export const useToggleState = (controller: Controller, element: Element, states: States, options?: Options): ToggleStateFunction => {
    const { formatClassName } = Object.assign({}, DEFAULT_OPTIONS, options)

    const stateMap = convertStatesToStateMap(controller, states, formatClassName)

    return (state: string): void => {
        controller.application.logDebugActivity('use-toggle-state', 'toggle', { controller, element, state, map: stateMap })
        toggleClassStates(element, state, stateMap)
    }
}
