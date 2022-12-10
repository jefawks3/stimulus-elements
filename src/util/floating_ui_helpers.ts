import { Controller } from "@hotwired/stimulus"

import capitalize from "./capitalize"
import { StateMap } from "./classlist_helpers"

export const SIDES = ["top", "right", "bottom", "left"]
export const ALIGNMENTS = ["start", "end"]
export const SIDE_ALIGNMENTS = SIDES.flatMap((side) => ALIGNMENTS.map((alignment) => `${side}-${alignment}`))
export const POSITIONS = [...SIDES, ...SIDE_ALIGNMENTS]

export const createPositionClassName = (...args: string[]): string =>
    [args[0], ...args.splice(1).map((s) => capitalize(s))].join("")

export const createPositionClasses = (...args: string[]): string[] =>
    POSITIONS.map((p) => createPositionClassName(...args, ...p.split("-")))

export const createPositionStateMap = (controller: Controller, ...args: string[]): StateMap => {
    return POSITIONS.reduce<StateMap>((map, position): StateMap => {
        Object.defineProperty(map, position, {
            get() {
                return controller.classes.getAll(createPositionClassName(...args, ...position.split("-")))
            },
        })

        return map
    }, {} as StateMap)
}
