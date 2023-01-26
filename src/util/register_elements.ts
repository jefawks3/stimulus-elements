import {Application, ControllerConstructor} from "@hotwired/stimulus"
import * as Elements from "../elements"

export default (application: Application) => {
    Object.entries(Elements).forEach((element) => {
        const [name, constructor] = element
        const identifier = name.replace(/(\w)([A-Z])/g, "$1-$2").toLowerCase()
        application.logDebugActivity('stimulus-elements', 'registerElement', { name, constructor, identifier })
        application.register(identifier, constructor as ControllerConstructor)
    })
}
