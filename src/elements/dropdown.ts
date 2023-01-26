import { PopoverBase } from "./popover_base";
import {useAriaParent} from "../mixins/use_aria_parent";

export class Dropdown extends PopoverBase {

    declare readonly ariaControlsParent: Element

    connect() {
        super.connect();
        useAriaParent(this, this.element, "controls")
    }

    protected getReferenceElement(): Element {
        return this.ariaControlsParent
    }
}
