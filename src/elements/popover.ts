import {useAriaParent} from "../mixins/use_aria_parent"
import {PopoverBase} from "./popover_base";

export class Popover extends PopoverBase {
    declare readonly ariaDetailsParent: Element

    connect() {
        super.connect();
        useAriaParent(this, this.element, "details")
    }

    protected getReferenceElement(): Element {
        return this.ariaDetailsParent
    }
}
