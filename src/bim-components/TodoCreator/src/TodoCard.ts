import * as OBC from "openbim-components"
import { IProjectTask } from "../../../classes/ProjectTask"
import { statusColors } from ".."

export class TodoCard extends OBC.SimpleUIComponent {

    onCardClick = new OBC.Event()
    onCardDelete = new OBC.Event()
    onCardEdit = new OBC.Event()
    onStatusChange = new OBC.Event()
    slots: {
        actionButtons: OBC.SimpleUIComponent
    }

    set values(data: Partial<IProjectTask>) {
        const normalKeysToCheck = ["description", "name", "todoSubject"]

        for (const key in data) {
            if (normalKeysToCheck.includes(key)) {
                const e = this.getInnerElement(`${key}`) as HTMLParagraphElement
                data[key] ? e.textContent = data[key] : e.textContent = "No data"
            } else if (key === "finishDate") {
                const e = this.getInnerElement(`${key}`) as HTMLParagraphElement
                const date = data[key] as Date
                e.textContent = date.toLocaleDateString()
            } else if (key === "status") {
                const e = this.getInnerElement(`${key}`) as HTMLParagraphElement
                switch (data[key]) {
                    case "open":
                        e.textContent = "Open"
                        e.style.color = statusColors.open
                        break;
                    case "in_progress":
                        e.textContent = "In Progress"
                        e.style.color = statusColors.in_progress
                        break;
                    case "finished":
                        e.textContent = "Finished"
                        e.style.color = statusColors.finished
                        break;
                    default:
                        console.error(`Invalid status: ${data[key]}`);
                }
            } else {
                continue
            }
        }
    }

    constructor(components: OBC.Components) {
        const statusTrigger = new OBC.Event()
        const template = `
        <div class="todo-item">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span id="todoSubject" class="material-icons-sharp" style="padding: 10px; background-color: var(--primary-grey-100); border-radius: 10px;">construction</span>
                <div style="display: flex; column-gap: 15px; align-items: center; width: 100%; justify-content: space-between; padding: 0 0.5rem">
                    <div>
                        <p id="name" style="font-size: var(--font-md); font-weight: bold; padding-bottom: 5px">Task Name</p>
                        <p id="description">Make anything here as you want, even something longer.</p>
                    </div>
                    <div>
                        <p id="status" style="font-size: var(--font-sm); font-style: italic; color: #a9a9a9; padding-bottom: 5px">Open</p>
                        <p id="finishDate" style="text-wrap: nowrap; color: #a9a9a9; font-size: var(--font-sm)">Fri, 20 sep</p>
                    </div>
                </div>
                <div data-tooeen-slot="actionButtons"></div>
            </div>
        </div>
        `
        super(components, template)

        const cardElement = this.get()
        cardElement.addEventListener("click", () => {
            this.onCardClick.trigger()
        })


        // seeting up the actionsbuttons slot
        this.setSlot("actionButtons", new OBC.SimpleUIComponent(this._components))

        const deleteBtn = new OBC.Button(this._components)
        deleteBtn.materialIcon = "delete"
        const editBtn = new OBC.Button(this._components)
        editBtn.materialIcon = "edit"

        this.slots.actionButtons.addChild(deleteBtn, editBtn)

        const statusElement = this.getInnerElement("taskStatus") as HTMLParagraphElement
        statusTrigger.add(() => {
            this.onStatusChange.trigger()
        })

        deleteBtn.onClick.add(() => {
            this.onCardDelete.trigger()
        })
        editBtn.onClick.add(() => {
            this.onCardEdit.trigger()
        })
    }
}