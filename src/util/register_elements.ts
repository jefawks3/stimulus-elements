import { Application } from "@hotwired/stimulus"
import * as Elements from "../elements"

export default (application: Application, prefix = "se--") => {
    Object.entries(Elements).forEach((element) => {
        const [name, constructor] = element
        const identifier = `${prefix}${name.replace(/(\w)([A-Z])/g, "$1-$2").toLowerCase()}`
        application.register(identifier, constructor)
    })
}
