export type Listener = Element | Window
export type EventList = string[]
export type Events = EventList | string | null

export const unobserve = (listener: Listener, events: Events = null, callback: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
    const eventArray = typeof events === "string" ? [events] : events
    eventArray?.forEach(event => listener.removeEventListener(event, callback, options))
}

export const observe = (listener: Listener, events: Events = null, callback: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
    const eventArray = typeof events === "string" ? [events] : events
    eventArray?.forEach(event => listener.addEventListener(event, callback, options))

    return () => unobserve(listener, eventArray, callback, options)
}
