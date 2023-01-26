import { Controller, Context, ActionEvent } from "@hotwired/stimulus"

export class Dispatch extends Controller {
    static values = {
        target: String,
    }

    declare readonly targetValue: string

    constructor(context: Context) {
        super(context)

        return new Proxy(this, {
            get(target: any, p: string | symbol, _receiver: any): any {
                if (p in this) {
                    return (this as any)[p]
                } else {
                    return (e: ActionEvent) => target.dispatchToTarget(p as string, e)
                }
            }
        })
    }

    connect() {
        this.dispatchToTarget('connected', null)
    }

    disconnect() {
        this.dispatchToTarget('disconnected', null)
    }

    // Making sure the method is not fired to the target
    targetValueChanged() {

    }

    dispatchToTarget(eventName: string, _e: ActionEvent | null): void {
        const target = document.querySelector(this.targetValue) as Element | undefined
        this.dispatch(eventName, { target, detail: { trigger: this.element } })
    }
}
