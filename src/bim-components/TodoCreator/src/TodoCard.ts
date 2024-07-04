import * as OBC from "openbim-components"

export class TodoCard extends OBC.SimpleUIComponent {

    onCardClick = new OBC.Event()

    set description(value: string) {
        const descriptionElement = this.getInnerElement("description") as HTMLParagraphElement
        descriptionElement.textContent = value
    }

    set date(value: Date) {
        const dateElement = this.getInnerElement("date") as HTMLParagraphElement
        dateElement.textContent = value.toLocaleDateString()
    }

    constructor(components: OBC.Components) {
        const template = `    
        <div class="todo-item" style="background: var(--primary-blue-100); padding: 5px 15px; border-radius: 5px">        
            <div class="to-do-card-header">
                <div class="to-do-logo-container">
                    <span class="material-icons-sharp" style="scale: 1.2">construction</span>
                </div>
                <p id="description" style="padding-right: 4px; align-self: center;">Name</p>
                <p id="date" class="to-do-date">Fri, 20 sep</p>
            </div>
        </div>
        `
        super(components, template)

        const cardElement = this.get()
        cardElement.addEventListener("click", () => {
            this.onCardClick.trigger()
        })
    }
}