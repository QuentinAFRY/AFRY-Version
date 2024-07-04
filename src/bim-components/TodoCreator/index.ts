import { TodoCard } from './src/TodoCard';
import * as OBC from "openbim-components"

interface ToDo {
    description: string
    date: Date
    fragmentMap: OBC.FragmentIdMap
}


export class TodoCreator extends OBC.Component<ToDo[]> implements OBC.UI {
    static uuid = "c5014422-1e54-452f-a280-a09e1a3c966c"
    enabled = true
    uiElement = new OBC.UIElement<{
        activationButton: OBC.Button
        todoList: OBC.FloatingWindow
    }>()
    private _components: OBC.Components
    private _list: ToDo[] = []


    constructor(components: OBC.Components) {
        super(components)
        this._components = components
        components.tools.add(TodoCreator.uuid, this)
        this.setUI()
    }

    addTodo(description: string) {
        const highlighter = this._components.tools.get(OBC.FragmentHighlighter)
        const todo: ToDo = {
            description,
            date: new Date(),
            fragmentMap: highlighter.selection.select,
        }
        const todoCard = new TodoCard(this._components)
        todoCard.description = todo.description
        todoCard.date = todo.date
        todoCard.onCardClick.add(() => {
            const fragmentMapLenght = Object.keys(todo.fragmentMap).length
            if (fragmentMapLenght === 0) {return}
            highlighter.highlightByID("select", todo.fragmentMap)
        })
        const todoList = this.uiElement.get("todoList")
        todoList.addChild(todoCard)
    }


    private setUI() {
        const activationButton = new OBC.Button(this._components)
        activationButton.materialIcon = "construction"

        const newTodoBtn = new OBC.Button(this._components, {name: "Create"})
        activationButton.addChild(newTodoBtn)

        const form = new OBC.Modal(this._components)
        this._components.ui.add(form)
        form.title = "Create New ToDo"

        const descriptionInput = new OBC.TextArea(this._components)
        descriptionInput.label = "Description"
        form.slots.content.addChild(descriptionInput)
        form.slots.content.get().style.padding = "20px"
        form.slots.content.get().style.display = "flex"
        form.slots.content.get().style.flexDirection = "column"
        form.slots.content.get().style.rowGap = "20px"

        form.onAccept.add(() => {
            this.addTodo(descriptionInput.value)
            descriptionInput.value = ""
            form.visible = false
        })
        
        form.onCancel.add(() => form.visible = false)                                           // Hide the form when the cancel button is clicked

        newTodoBtn.onClick.add(() => form.visible = true)                                   // Show the form when the button is clicked

        const todoList = new OBC.FloatingWindow(this._components)
        this._components.ui.add(todoList)
        todoList.visible = false
        todoList.title = "ToDo List"

        const todoListBtn = new OBC.Button(this._components, {name: "List"})
        activationButton.addChild(todoListBtn)
        todoListBtn.onClick.add(() => todoList.visible = !todoList.visible)

        this.uiElement.set({activationButton, todoList})
    }

    get(): ToDo[] {
        return this._list
    }
}