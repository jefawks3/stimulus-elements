import { PopoverBase } from "./popover_base";
import {addRole} from "../util/element_helpers";

export class Tooltip extends PopoverBase {
    connect() {
        super.connect();
        addRole(this.element, "tooltip")
    }
}
