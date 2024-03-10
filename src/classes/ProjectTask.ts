import { v4 as uuidv4 } from "uuid"
export type TaskStatus = "open" | "in-progress" | "finished"
export type TaskLogo = "construction" | "view_in_ar" | "description" |"compost"

export interface IProjectTask {
    name: string
    description?: string
    taskLogo: TaskLogo
    creationDate: Date
    finishDate?: Date
    taskStatus: TaskStatus
}

export class ProjectTask implements IProjectTask{
    name: string
    description?: string | undefined
    taskLogo: TaskLogo
    creationDate: Date
    finishDate?: Date | undefined
    taskStatus: TaskStatus = "open"

    ui: HTMLDivElement
    id: string

    constructor(info: IProjectTask) {
        for (const key in info) {
            this[key] = info[key]
        }
        if (typeof this.creationDate === "string") {
            this.creationDate = new Date(this.creationDate)
        }
        if (typeof this.finishDate === "string") {
            this.finishDate = new Date(this.finishDate)
        }
        if (!this.id) {this.id = uuidv4()}
        this.setUI()
    }

    getUI() {
        return this.ui
    }
    
    setUI() {
        this.ui = document.createElement("div")
        this.ui.className = "to-do-card"
        this.ui.id = `to-do-card"-${this.id}`

        switch (this.taskStatus) {
            case "open":
                this.ui.style.backgroundColor = "var(--task-open)"; // Beispiel-Hintergrundfarbe für den Status "open"
                break;
            case "in-progress":
                this.ui.style.backgroundColor = "var(--task-in-progress)"; // Beispiel-Hintergrundfarbe für den Status "inProgress"
                break;
            case "finished":
                this.ui.style.backgroundColor = "task-finished"; // Beispiel-Hintergrundfarbe für den Status "closed"
                break;
            default:
                this.ui.style.backgroundColor = "var(--task-open)"; // Standard-Hintergrundfarbe für unbekannte Status
                break;
        }

        this.ui.innerHTML = `
        <div class="to-do-logo-container">
            <span class="material-icons-sharp" style="scale: 1.2">
                ${this.taskLogo}
            </span>
        </div>
        <p style="padding-right: 4px; align-self: center;">
            ${this.name}</p>
        <p class="to-do-date">
            ${this.creationDate.toLocaleDateString()}
        </p>
        `
    }
}