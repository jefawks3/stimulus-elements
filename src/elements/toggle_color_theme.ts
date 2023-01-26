import {Controller} from "@hotwired/stimulus";

import {ToggleStateFunction, useToggleState} from "../mixins/use_toggle_state";
import {ColorTheme} from "./color_theme";

export class ToggleColorTheme extends Controller {
    static outlets = ["color-theme"]

    static values = {
        theme: String
    }

    declare readonly themeValue: string

    declare private toggleState: ToggleStateFunction

    initialize() {
        this.handleThemeUpdated = this.handleThemeUpdated.bind(this)
        this.toggleState = useToggleState(this, this.element, ["unselected", "selected"])
    }

    colorThemeOutletConnected(outlet: ColorTheme, element: Element) {
        this.application.logDebugActivity(this.identifier, 'colorThemeOutletConnected', { outlet, element })
        this.toggleState(outlet.currentThemeKey === this.themeValue ? 'selected' : 'unselected')
        element.addEventListener('color-theme:updated', this.handleThemeUpdated)
    }

    colorThemeOutletDisconnected(outlet: ColorTheme, element: Element) {
        this.application.logDebugActivity(this.identifier, 'colorThemeOutletDisconnected', { outlet, element })
        element.removeEventListener('color-theme:updated', this.handleThemeUpdated)
    }

    private handleThemeUpdated(event: Event): void {
        const { detail: { theme } } = (event as CustomEvent)
        this.application.logDebugActivity(this.identifier, 'handleThemeUpdated', { theme })
        this.toggleState(theme === this.themeValue ? 'selected' : 'unselected')
    }
}
