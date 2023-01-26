import { PopoverBase } from "./popover_base";
import {addRole} from "../util/element_helpers";
import {useAriaParent} from "../mixins/use_aria_parent";

export class Tooltip extends PopoverBase {
    declare readonly ariaDescribedByParent: Element

    connect() {
        super.connect();
        addRole(this.element, "tooltip")
        useAriaParent(this, this.element, "described-by")
    }

    protected getReferenceElement(): Element {
        console.log('test', Object.getOwnPropertyNames(this))
        return this.ariaDescribedByParent
    }
}
