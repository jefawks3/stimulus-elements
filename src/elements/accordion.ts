import { ActionEvent, Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static targets = ["collapsible"]

    declare readonly collapsibleTargets: HTMLElement[]

    hideAll(): void {
        this.collapsibleTargets.forEach((target) => this.onHideTarget(target))
    }

    showAll(): void {
        this.collapsibleTargets.forEach((target) => this.onShowTarget(target))
    }

    hideSiblings(e: ActionEvent): void {
        if (this.collapsibleTargets.includes(e.target as HTMLElement)) {
            this.collapsibleTargets.forEach((target) => e.target != target && this.onHideTarget(target))
        }
    }

    protected onShowTarget(target: HTMLElement): void {
        this.dispatch("show", { target: target })
    }

    protected onHideTarget(target: HTMLElement): void {
        this.dispatch("hide", { target: target })
    }
}
