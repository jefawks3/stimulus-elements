import { Controller } from "@hotwired/stimulus";

import {findParent, findParents, AriaParentReferenceType} from "../util/aria_helpers";
import capitalize from "../util/capitalize";

export const useAriaParent = (controller: Controller, element: Element, type: AriaParentReferenceType): void => {
    const name = type.split('-').map(capitalize).join('')

    const getId = (): string => element.id

    Object.defineProperties(controller,
        {
        [`hasAria${name}Parent`]: {
            get(): boolean {
                if (!getId()) {
                    return false;
                }

                return !!findParent(type, getId())
            }
        },

        [`aria${name}Parent`]: {
            get(): Element {
                const element = findParent(type, getId())

                if (element) {
                    return element
                } else {
                    throw `Could not find any elements that match "[aria-describedby~='${getId()}']" for "${controller.identifier}".`
                }
            }
        },

        [`aria${name}Parents`]: {
            get(): Element[] {
                return findParents(type, getId())
            }
        }
    })
}
