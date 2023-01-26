import { Context, Controller, ActionEvent } from "@hotwired/stimulus"

export class DispatchGroup extends Controller {
    static targets = ["receiver"]

    declare readonly receiverTargets: Element[]

    constructor(context: Context) {
        super(context)

        return new Proxy(this, {
            get(target: any, p: string | symbol, _receiver: any): any {
                if (p in target) {
                    return (target as any)[p]
                } else {
                    return (e: ActionEvent) => target.dispatchToTargets(p as string, e)
                }
            }
        })
    }

    dispatchToTargets(eventName: string, e: ActionEvent): void {
        const siblingsOnly = eventName.endsWith("Siblings")

        if (siblingsOnly) {
            eventName = eventName.substring(0, eventName.length - 8)
        }

        this.receiverTargets.forEach((receiver) => {
            if (!siblingsOnly || receiver != e.target) {
                this.dispatch(eventName, { target: receiver, detail: { trigger: this.element } })
            }
        })
    }
}
