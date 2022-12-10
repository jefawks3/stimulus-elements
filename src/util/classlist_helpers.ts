export declare type ClassNames = string | string[]

export const addClasses = (target: Element, classes: ClassNames): void => {
    target.classList.add(...(Array.isArray(classes) ? classes : [classes]))
}

export const removeClasses = (target: Element, classes: ClassNames): void => {
    target.classList.remove(...(Array.isArray(classes) ? classes : [classes]))
}

export const toggleClassActiveState = (
    target: Element,
    state: boolean,
    active: ClassNames,
    inactive: ClassNames = []
): void => {
    if (state) {
        removeClasses(target, inactive)
        addClasses(target, active)
    } else {
        removeClasses(target, active)
        addClasses(target, inactive)
    }
}

export declare type StateMap = { [key: string]: ClassNames }

export const toggleClassStates = (target: Element, state: string, states: StateMap): void => {
    Object.getOwnPropertyNames(states).forEach((key: string) => key != state && removeClasses(target, states[key]))
    state in states && addClasses(target, states[state])
}
