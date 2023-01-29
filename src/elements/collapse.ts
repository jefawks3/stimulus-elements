import {Controller} from "@hotwired/stimulus"
import {useToggleState, ToggleStateFunction} from "../mixins/use_toggle_state";

export class Collapse extends Controller {
    static values = {
        show: {
            type: Boolean,
            default: false
        }
    }

    declare readonly showValue: boolean

    declare private toggleState: ToggleStateFunction

    declare private collapsed: boolean

    get isCollapsed(): boolean {
        return this.collapsed
    }

    initialize() {
        super.initialize();
        this.toggleState = useToggleState(this, this.element, ['collapsed', 'expanded'])
    }

    connect() {
        this.collapsed = this.showValue
        this.toggle()
    }

    toggle() {
        if (this.collapsed) {
            this.show()
        } else {
            this.hide()
        }
    }

    show() {
        if (!this.collapsed || this.onShow().defaultPrevented) {
            return
        }

        this.collapsed = false
        this.toggleState('expanded')
        this.onShown()
    }

    hide() {
        if (this.collapsed || this.onHide().defaultPrevented) {
            return
        }

        this.collapsed = true
        this.toggleState('collapsed')
        this.onHidden()
    }

    protected onShow(): Event {
        return this.dispatch('show', { cancelable: true })
    }

    protected onShown() {
        this.dispatch('shown')
    }

    protected onHide(): Event {
        return this.dispatch('hide', {  })
    }

    protected onHidden() {
        this.dispatch('hidden')
    }
}
