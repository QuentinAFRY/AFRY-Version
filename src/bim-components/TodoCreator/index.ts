import { TodoCard } from './src/TodoCard';
import { TodoItem, ToDoPriority } from './src/TodoItem';
import * as THREE from "three"
import * as OBC from "openbim-components"
import { v4 as uuidv4 } from "uuid"

type FormState = "create" | "edit"
export class TodoCreator extends OBC.Component<TodoItem[]> implements OBC.UI, OBC.Disposable {
    
    static uuid = "c5014422-1e54-452f-a280-a09e1a3c966c"
    enabled = true
    uiElement = new OBC.UIElement<{
        activationButton: OBC.Button
        todoList: OBC.FloatingWindow
        colorizeBtn: OBC.Button
        form: OBC.Modal
    }>()

    private _formState: FormState = "create"
    private _components: OBC.Components
    private _list: TodoItem[] = []

    onTodoCreated = new OBC.Event<TodoItem>()
    onDisposed: OBC.Event<any>;

    priorityColors = {
        Low: 0x59bc59,
        Normal: 0x597cff,
        High: 0xff7676,
    }


    constructor(components: OBC.Components) {
        super(components)
        this._components = components
        components.tools.add(TodoCreator.uuid, this)
        this.setUI()
    }

    formatColorToHex(color: any) {
        const hexColor = new THREE.Color(color)
        const stringColor = hexColor.getHexString()
        return "#" + stringColor
    }

    setup() {
        const highlighter = this._components.tools.get(OBC.FragmentHighlighter)
        highlighter.add(`${TodoCreator.uuid}-priority-Low`, [new THREE.MeshStandardMaterial({color: this.priorityColors.Low})])
        highlighter.add(`${TodoCreator.uuid}-priority-Normal`, [new THREE.MeshStandardMaterial({color: this.priorityColors.Normal})])
        highlighter.add(`${TodoCreator.uuid}-priority-High`, [new THREE.MeshStandardMaterial({color: this.priorityColors.High})])
    }


    private setUI() {
        const activationButton = new OBC.Button(this._components)
        activationButton.materialIcon = "construction"

        const newTodoBtn = new OBC.Button(this._components, {name: "Create"})
        activationButton.addChild(newTodoBtn)

        const form = this.setForm()

        newTodoBtn.onClick.add(() => form.visible = true)                                  

        const todoList = new OBC.FloatingWindow(this._components)
        this._components.ui.add(todoList)
        todoList.get().style.justifyContent = "flex-start"
        todoList.visible = false
        todoList.title = "ToDo List"

        const todoListToolbar = new OBC.SimpleUIComponent(this._components)
        todoList.addChild(todoListToolbar)

        const colorizeBtn = new OBC.Button(this._components, {name: "Colorize"})
        colorizeBtn.materialIcon = "palette"
        todoListToolbar.addChild(colorizeBtn)

        colorizeBtn.onClick.add(() => {
            colorizeBtn.active = !colorizeBtn.active
            if (colorizeBtn.active) {
                this.applyColor()
            } else {
                this.removeColor()
            }
        })

        const todoListBtn = new OBC.Button(this._components, {name: "List"})
        activationButton.addChild(todoListBtn)
        todoListBtn.onClick.add(() => todoList.visible = !todoList.visible)

        this.uiElement.set({activationButton, todoList, colorizeBtn, form})
    }

    private setForm(): OBC.Modal {
        const form = new OBC.Modal(this._components)
        this._components.ui.add(form)
        form.title = "Create New ToDo"

        const descriptionInput = new OBC.TextArea(this._components)
        descriptionInput.label = "Description"
        form.slots.content.addChild(descriptionInput)

        const priorityDropdown = new OBC.Dropdown(this._components)
        priorityDropdown.label = "Priority"
        priorityDropdown.addOption("Low", "Normal", "High")
        priorityDropdown.value = "Normal"
        form.slots.content.addChild(priorityDropdown)


        form.slots.content.get().style.padding = "20px"
        form.slots.content.get().style.display = "flex"
        form.slots.content.get().style.flexDirection = "column"
        form.slots.content.get().style.rowGap = "20px"

        form.onAccept.add(() => {
            if (this._formState === "create") {
                this.addTodo(descriptionInput.value, priorityDropdown.value as ToDoPriority)
                descriptionInput.value = ""
                form.visible = false
            }
        })

        form.onCancel.add(() => {
            form.visible = false
        })
        
        return form
    }

    addTodo(description: string, priority: ToDoPriority) {
        if (!this.enabled) {return}

        const todo = new TodoItem(this._components)
        todo.setTodo(description, priority)
        this._list.push(todo)

        const todoList = this.uiElement.get("todoList")
        todoList.addChild(todo.uiElement.get("todoCard"))

        this.onTodoCreated.trigger(todo)

        todo.onDelete.add(() => {
            this.deleteTodo(todo)
        })

        todo.onEdit.add(() => {
            this._formState = "edit"
            this.editTodo(todo)
        })
    }

    editTodo(todo: TodoItem) {
        if (!this.enabled) {return}
        const form = this.uiElement.get("form") as OBC.Modal
        if (form.visible) {
            console.error("You cannot edit at the moment, a form is already open.")
            return
        }
        todo.zoomTodo()
        form.visible = true
        form.title = "Edit ToDo"
        const description = form.slots.content.children[0].innerElements.input as HTMLInputElement
        description.value = todo.description

        const dropdown = form.slots.content.children[1] as OBC.Dropdown
        dropdown.value = todo.priority

        form.onAccept.add(() => {
            if (this._formState === "edit") {
                todo.updateTodo(description.value, dropdown.value as ToDoPriority)
                this._formState = "create"
                this.updateColor()
                form.visible = false
            }
        })
    }

    deleteTodo(todo: TodoItem) {
        if (!this.enabled) {return}
        const index = this._list.indexOf(todo)
        this._list.splice(index, 1)
        this.updateColor()
    }

    // This method colorizes the todo elements by their priority
    private applyColor() {
        const highlighter = this._components.tools.get(OBC.FragmentHighlighter)
        for (const todo of this._list) {
            const fragmentMapLenght = Object.keys(todo.fragmentMap).length
            if (fragmentMapLenght === 0) {return}
            highlighter.highlightByID(`${TodoCreator.uuid}-priority-${todo.priority}`, todo.fragmentMap)
            const icon = todo.uiElement.get("todoCard").getInnerElement("icon") as HTMLSpanElement
            icon.style.backgroundColor = `${this.formatColorToHex((this.priorityColors[todo.priority]))}`
        }
    }

    // This method removes the colorization from the todo elements
    private removeColor() {
        const highlighter = this._components.tools.get(OBC.FragmentHighlighter)
        highlighter.clear(`${TodoCreator.uuid}-priority-Low`)
        highlighter.clear(`${TodoCreator.uuid}-priority-Normal`)
        highlighter.clear(`${TodoCreator.uuid}-priority-High`)
        for (const todo of this._list) {
            const icon = todo.uiElement.get("todoCard").getInnerElement("icon") as HTMLSpanElement
            icon.style.backgroundColor = "var(--primary-grey-100)"
        }
    }

    // This method updates the colorization of the todo elements
    updateColor() {
        if (!(this.uiElement.get("colorizeBtn").active)) {return}
        this.removeColor()
        this.applyColor()
    }

    async dispose() {
        this.uiElement.dispose()
        this._list = []
        this.enabled = false
    }

    get(): TodoItem[] {
        return this._list
    }
}