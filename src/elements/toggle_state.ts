import {Context, Controller} from "@hotwired/stimulus"

export class ToggleState extends Controller<HTMLElement> {
    static values = {
        state: {
            type: String,
            default: "intermediate"
        },
        states: Array,
        intermediate: {
            type: Boolean,
            default: false,
        },
        intermediateState: {
            type: String,
            default: "intermediate"
        },
        skipIntermediateOnToggle: {
            type: Boolean,
            default: true
        },
    }

    declare stateValue: string
    declare readonly hasStatesValue: boolean
    declare readonly statesValue: string[]
    declare readonly intermediateValue: boolean
    declare readonly intermediateStateValue: string
    declare readonly skipIntermediateOnToggleValue: boolean

    private declare attributeRegexp: RegExp
    private declare availableStates: string[]

    constructor(context: Context) {
        super(context);

        return new Proxy(this, {
            get(target: any, p: string | symbol, receiver: any): any {
                const name = p.toString()

                if (p in target) {
                    return target[p]
                } else if (name.endsWith("State")) {
                    const state = name.substring(0, name.length - 5)
                    return () => target.stateValue = state
                } else {
                    return undefined
                }
            }
        })
    }

    connect(): void {
        this.attributeRegexp = new RegExp(`^data-${this.identifier}-(.*)-state-class$`)
        this.availableStates = this.hasStatesValue ? this.statesValue : this.element.getAttributeNames()
            .filter((attr) =>
                attr.startsWith(`data-${this.identifier}-`) &&
                attr.endsWith('-state-class') &&
                (
                    !this.intermediateValue ||
                    !this.skipIntermediateOnToggleValue ||
                    attr !== this.getStateAttributeName(this.intermediateStateValue)
                )
            ).map((attr) => this.attributeToStateName(attr))
    }

    stateValueChanged(state: string, previousState: string | undefined): void {
        this.dispatch(`changingTo${state}State`, { detail: { state, previousState } })
        this.dispatch('changing', { detail: { state, previousState } })
        this.removeStateClasses(previousState)
        this.addStateClasses(state)
        this.dispatch(`changedTo${state}State`, { detail: { state, previousState } })
        this.dispatch('changed', { detail: { state, previousState } })
    }

    setState(state: string): void {
        this.stateValue = state
    }

    toggle() {
        const index = this.availableStates.indexOf(this.stateValue)
        this.stateValue = this.availableStates[(index + 1) % this.availableStates.length]
    }

    private attributeToStateName(attribute: string): string {
        return (attribute.match(this.attributeRegexp) as string[])[1]
    }

    private getStateClassName(state: string): string {
        return `${state}State`
    }

    private getStateAttributeName(state: string): string {
        return this.data.getAttributeNameForKey(this.getStateClassName(state))
    }

    private getStateClasses(state: string | undefined): string[] {
        if (!state) {
            return []
        }

        const name = this.getStateClassName(state)
        return this.classes.getAll(name)
    }

    private addStateClasses(state: string | undefined): void {
        this.element.classList.add(...this.getStateClasses(state))
    }

    private removeStateClasses(state: string | undefined): void {
        this.element.classList.remove(...this.getStateClasses(state))
    }
}
