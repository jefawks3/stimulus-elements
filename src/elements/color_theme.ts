import { ActionEvent, Controller } from "@hotwired/stimulus"

interface SetThemeEvent extends ActionEvent {
    params: {
        theme?: string | null
    }
}

export default class extends Controller {
    static targets = ["setter"]
    static classes = ["selected"]
    static values = {
        themes: {
            type: Array,
            default: ["light", "dark"],
        },
        darkTheme: {
            type: String,
            default: "dark",
        },
        defaultTheme: {
            type: String,
            default: "light",
        },
        systemThemeName: {
            type: String,
            default: "system",
        },
        storageMethod: {
            type: String,
            default: "localStorage",
        },
        storageKey: {
            type: String,
            default: "color-theme",
        },
        mode: {
            type: String,
            default: "class",
        },
        setterValueAttr: {
            type: String,
            default: "data-theme",
        },
    }

    declare readonly setterTargets: Element[]
    declare readonly themesValue: string[]
    declare readonly defaultThemeValue: string
    declare readonly darkThemeValue: string
    declare readonly systemThemeNameValue: string
    declare readonly storageMethodValue: string
    declare readonly storageKeyValue: string
    declare readonly setterValueAttrValue: string
    declare readonly modeValue: string
    declare readonly selectedClasses: string[]

    get currentTheme(): string {
        const theme = this.currentThemeKey
        return theme === this.systemThemeNameValue ? this.systemTheme : theme
    }

    get currentThemeKey(): string {
        return this.storedTheme || this.systemTheme
    }

    get systemTheme(): string {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? this.darkThemeValue : this.defaultThemeValue
    }

    get storage(): Storage {
        return (window as any)[this.storageMethodValue]
    }

    get hasStoredTheme(): boolean {
        return this.storageKeyValue in this.storage
    }

    get storedTheme(): string | null {
        const theme = this.storage.getItem(this.storageKeyValue)

        return theme != null && (theme === this.systemThemeNameValue || this.themesValue.includes(theme as string))
            ? theme
            : null
    }

    setterTargetConnected(target: HTMLElement) {
        const theme = target.getAttribute(this.setterValueAttrValue) as string

        if (theme === this.systemThemeNameValue || this.themesValue.includes(theme)) {
            target.addEventListener("click", this.setColorTheme.bind(this, theme))
        }
    }

    connect(): void {
        if (this.hasStoredTheme) {
            this.setColorTheme(this.storedTheme as string)
        } else {
            this.setColorTheme(this.systemThemeNameValue)
        }
    }

    setTheme({ params: { theme }, preventDefault }: SetThemeEvent): void {
        preventDefault()
        this.setColorTheme(theme || this.systemTheme)
    }

    setSystem(): void {
        this.setColorTheme(this.systemThemeNameValue)
    }

    protected onUpdateTheme(previous: string, next: string): Event {
        return this.dispatch("update", {
            detail: { previous, next },
            prefix: "color_theme",
            cancelable: true,
            bubbles: true,
        })
    }

    protected onUpdatedTheme(theme: string): void {
        this.dispatch("updated", { detail: { theme } })
    }

    private setColorTheme(theme: string): void {
        if (theme != this.systemThemeNameValue && !this.themesValue.includes(theme)) {
            theme = this.systemThemeNameValue
        }

        const value = theme === this.systemThemeNameValue ? this.systemTheme : theme

        if (this.onUpdateTheme(this.currentThemeKey, theme).defaultPrevented) {
            return
        }

        this.storage.setItem(this.storageKeyValue, theme)

        this.modeValue.split(",").forEach((mode) => {
            mode = mode.trim()

            if (this.modeValue.startsWith("data-")) {
                this.element.setAttribute(this.modeValue, value)
            } else if (mode === "class") {
                this.element.classList.remove(...this.themesValue.filter((t) => t != value))
                this.element.classList.add(value)
            }
        })

        this.setterTargets.forEach((target) => {
            let classes = this.selectedClasses

            if (target.hasAttribute("data-color-theme-selected-class")) {
                const targetClasses = (target.getAttribute("data-color-theme-selected-class") as string).split(" ")
                classes = classes.concat(...targetClasses)
            }

            if (target.getAttribute(this.setterValueAttrValue) === theme) {
                target.classList.add(...classes)
            } else {
                target.classList.remove(...classes)
            }
        })
    }
}
