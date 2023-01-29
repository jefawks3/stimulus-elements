
import {addToAttributeList} from "./element_helpers";

export type AriaParentReferenceType = "described-by" | "labeled-by" | "details" | "owns" | "controls"
export type AriaStateType = "expanded" | "hidden"
export type AriaTypes = AriaParentReferenceType | AriaStateType

export const ariaAttribute = (type: AriaTypes): string => `aria-${type.replace("-", "")}`

export const ariaSelector = (type: AriaTypes, id: string): string => `[${ariaAttribute(type)}~="${id}"]`

export const addAriaChild = (element: Element, type: AriaParentReferenceType, id: string): void =>
    addToAttributeList(element, ariaAttribute(type), id)

export const findParent = (type: AriaParentReferenceType, id: string): Element | null => {
    const selector = ariaSelector(type, id)
    return document.querySelector(selector)
}

export const findParents = (type: AriaParentReferenceType, id: string): Element[] => {
    const selector = ariaSelector(type, id)
    return Array.from(document.querySelectorAll(selector))
}

export const setAriaState = (element: Element, type: AriaStateType, value: string | boolean): void => {
    element.setAttribute(ariaAttribute(type), JSON.stringify(value))
}
