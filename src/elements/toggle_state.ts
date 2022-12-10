import { Controller } from "@hotwired/stimulus"

enum State {
    "intermediate" = "intermediate",
    "active" = "active",
    "inactive" = "inactive",
}

const stateMethods = {
    active: "activate",
    inactive: "deactivate",
    intermediate: "intermediate",
}

export default class extends Controller {
    static values = {
        state: String,
        intermediate: {
            type: Boolean,
            default: false,
        },
    }

    static classes = ["active", "inactive", "intermediate"]

    declare readonly hasStateValue: boolean
    declare readonly stateValue: string
    declare readonly intermediateValue: boolean

    private declare _state: State

    connect(): void {
        if (this.hasStateValue) {
            this._state = this.stateValue as State
        }

        if (!this._state || (this._state === State.intermediate && !this.intermediateValue)) {
            this._state = this.intermediateValue ? State.intermediate : State.inactive
        }

        this.updateClasses()
    }

    onStateValueChanged(state: string): void {
        this.update(state as State)
    }

    update(state: State): void {
        const method = stateMethods[state] as string
        ;(this as any)[method]()
    }

    toggle(): void {
        if (this._state == State.active) {
            this.deactivate()
        } else {
            this.activate()
        }
    }

    activate(): void {
        if (this._state == State.active || this.onActivating().defaultPrevented) {
            return
        }

        this._state = State.active
        this.updateClasses()
        this.onActivated()
    }

    deactivate(): void {
        if (this._state == State.inactive || this.onDeactivating().defaultPrevented) {
            return
        }

        this._state = State.inactive
        this.updateClasses()
        this.onDeactivated()
    }

    intermediate(): void {
        if (!this.intermediateValue || this._state == State.intermediate || this.onIntermediating().defaultPrevented) {
            return
        }

        this._state = State.intermediate
        this.updateClasses()
        this.onIntermediated()
    }

    protected onActivating(): Event {
        return this.dispatch("activating", { cancelable: true, detail: { state: this._state } })
    }

    protected onActivated(): void {
        this.dispatch("activated")
    }

    protected onDeactivating(): Event {
        return this.dispatch("deactivating", { cancelable: true, detail: { state: this._state } })
    }

    protected onDeactivated(): void {
        this.dispatch("deactivated")
    }

    protected onIntermediating(): Event {
        return this.dispatch("intermediating", { cancelable: true, detail: { state: this._state } })
    }

    protected onIntermediated(): void {
        this.dispatch("intermediated")
    }

    private updateClasses(state: State = this._state): void {
        Object.keys(State).forEach((otherState) => {
            if (otherState != state && this.classes.has(otherState)) {
                this.element.classList.remove(...this.classes.getAll(otherState))
            }
        })

        if (this.classes.has(state)) {
            this.element.classList.add(...this.classes.getAll(state))
        }
    }
}
