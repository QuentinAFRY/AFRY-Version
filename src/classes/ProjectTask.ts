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
        this.ui.innerHTML = `
        <div class="to-do-logo-container">
            <span class="material-icons-sharp" style="scale: 1.3">
                ${this.taskLogo}
            </span>
        </div>
        <p>${this.name}</p>
        <p style="text-align: right; font-style: italic">
            ${this.creationDate.toLocaleDateString()}
        </p>
        `
    }
}