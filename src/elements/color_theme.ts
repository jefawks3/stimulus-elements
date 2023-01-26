import {Controller} from "@hotwired/stimulus"

interface SetThemeAction {
    params: {
        theme: string
    }
}

export class ColorTheme extends Controller {
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
        clearCachedClasses: {
            type: Boolean,
            default: true
        }
    }

    declare readonly themesValue: string[]
    declare readonly defaultThemeValue: string
    declare readonly darkThemeValue: string
    declare readonly systemThemeNameValue: string
    declare readonly storageMethodValue: string
    declare readonly storageKeyValue: string
    declare readonly modeValue: string
    declare readonly clearCachedClassesValue: boolean

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

    connect(): void {
        const theme = this.hasStoredTheme ? this.storedTheme as string : this.systemThemeNameValue
        this.setColorTheme(theme)
        this.clearCachedClasses()
    }

    toggle() {
        const index = (this.themesValue.indexOf(this.currentTheme) + 1) % this.themesValue.length
        const theme = this.themesValue[index]
        this.setColorTheme(theme)
    }

    setTheme({ params: { theme } }: SetThemeAction): void {
        this.setColorTheme(theme)
    }

    setSystem(): void {
        this.setColorTheme(this.systemThemeNameValue)
    }

    protected onUpdateTheme(previous: string, next: string): Event {
        return this.dispatch("update", {
            detail: { previous, next },
            cancelable: true
        })
    }

    protected onUpdatedTheme(theme: string): void {
        this.dispatch("updated", { detail: { theme } })
    }

    protected getThemeClassName(theme: string): string {
        return `${theme.replace(/(\w)([A-Z])/g, "$1-$2").toLowerCase()}Theme`
    }

    protected getThemeClasses(theme: string): string[] {
        const className = this.getThemeClassName(theme)
        return this.classes.has(className) ? this.classes.getAll(className) : [theme]
    }

    private setColorTheme(theme: string): void {
        this.application.logDebugActivity(this.identifier, 'setColorTheme', { theme })

        if (theme != this.systemThemeNameValue && !this.themesValue.includes(theme)) {
            theme = this.systemThemeNameValue
        }

        const previousTheme = this.currentThemeKey
        const value = theme === this.systemThemeNameValue ? this.systemTheme : theme

        if (this.onUpdateTheme(previousTheme, theme).defaultPrevented) {
            return
        }

        this.storage.setItem(this.storageKeyValue, theme)

        this.modeValue.split(",").forEach((mode) => {
            mode = mode.trim()

            if (mode.startsWith("data-")) {
                this.element.setAttribute(mode, value)
            } else if (mode === "class") {
                this.themesValue.forEach((t) => t != value && this.element.classList.remove(...this.getThemeClasses(t)))
                this.element.classList.add(...this.getThemeClasses(value))
            }
        })

        this.onUpdatedTheme(theme)
    }

    private clearCachedClasses(): void {
        if (this.clearCachedClassesValue && this.element != document.documentElement) {
            this.themesValue.forEach((theme) => {
                const classes = this.getThemeClasses(theme)
                document.documentElement.classList.remove(...classes)
            })
        }
    }
}
