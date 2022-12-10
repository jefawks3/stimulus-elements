import { Context, Controller, ActionEvent } from "@hotwired/stimulus"

class TogglerProxyHandler implements ProxyHandler<Toggler> {
    get(target: Toggler, p: string | symbol, _receiver: any): any {
        if (p in target) {
            return (target as any)[p]
        } else {
            return (e: ActionEvent) => target.dispatchToTarget(p as string, e)
        }
    }
}

class Toggler extends Controller {
    static values = {
        target: String,
    }

    declare readonly targetValue: string

    constructor(context: Context) {
        super(context)

        return new Proxy(this, new TogglerProxyHandler())
    }

    dispatchToTarget(eventName: string, _e: ActionEvent): void {
        const target = document.getElementById(this.targetValue) as Element | undefined
        this.dispatch(eventName, { target, detail: { toggler: this.element } })
    }
}

export default Toggler
