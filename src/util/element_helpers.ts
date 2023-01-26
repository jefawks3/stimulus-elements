
export const addToAttributeList = (element: Element, attribute: string, value: string): void => {
    const values = (element.getAttribute(attribute) || "").split(" ")

    if (!values.includes(value)) {
        values.push(value)
    }

    element.setAttribute(attribute, values.join(" "))
}

export const addRole = (element: Element, role: string): void =>
    addToAttributeList(element, 'role', role)

