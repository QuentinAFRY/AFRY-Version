import { v4 as uuidv4 } from "uuid"
import { toggleModal } from "../index";
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
    foldStatus: string = "closed"

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
        this.setUIEvents()
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
                this.ui.style.backgroundColor = "var(--task-finished)"; // Beispiel-Hintergrundfarbe für den Status "closed"
                break;
            default:
                this.ui.style.backgroundColor = "var(--task-open)"; // Standard-Hintergrundfarbe für unbekannte Status
                break;
        }
        
        this.ui.innerHTML = `
        <div class="to-do-card-header">
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
        </div>
        <div class="to-do-card-body">
            <div style="display: flex; flex-direction: column; justify-content: space-around; align-items: center">
                <p style="padding-right: 5px"> ${this.description? this.description : "Add a description!"}</p>
                <p style="padding-right: 5px"> Due: ${this.finishDate? this.finishDate.toLocaleDateString() : "Undefined"}
            </div>
            <div class="to-do-card-button-container">
                <div class="to-do-card-button">
                    <button class="to-do-card-edit">
                        Edit
                    </button>
                </div>
                <div class="to-do-card-button" >
                    <div class="to-do-card-delete" style="width: 80%">
                        <span class="material-icons-sharp" style="color: var(--primary-beige)">
                            delete_forever
                        </span>
                    </div>
                </div>
            </div>
            <div class="to-do-card-collapse" style="display: flex; justify-content: center;">
                <span class="material-icons-sharp" style="scale: 0.5; width: 100px; display: flex; justify-content: center">expand_less</span>
            </div>
        </div>
        `
    }

    setUIEvents() {
        const body = this.ui.getElementsByClassName("to-do-card-body")[0] as HTMLDivElement
        const head = this.ui.getElementsByClassName("to-do-card-header")[0] as HTMLDivElement

        head.addEventListener("click", () => {
            if (body.style.display = "none") {
                body.style.display = "grid"
                console.log("open")
                }
            })

        const collapseBtn = this.ui.getElementsByClassName("to-do-card-collapse")[0]
        if (collapseBtn) {
            collapseBtn.addEventListener("click", () => {
                body.style.display = "none"
                console.log("close")
            })
        }
    }
}