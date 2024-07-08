import { TodoCard } from './src/TodoCard';
import * as THREE from "three"
import * as OBC from "openbim-components"

type ToDoPriority = "Low" | "Normal" | "High"
interface ToDo {
    description: string
    date: Date
    fragmentMap: OBC.FragmentIdMap
    camera: {position: THREE.Vector3, target: THREE.Vector3}
    priority: ToDoPriority
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

    async setup() {
        const highlighter = await this._components.tools.get(OBC.FragmentHighlighter)
        highlighter.add(`${TodoCreator.uuid}-priority-Low`, [new THREE.MeshStandardMaterial({color: 0x59bc59})])
        highlighter.add(`${TodoCreator.uuid}-priority-Normal`, [new THREE.MeshStandardMaterial({color: 0x597cff})])
        highlighter.add(`${TodoCreator.uuid}-priority-High`, [new THREE.MeshStandardMaterial({color: 0xff7676})])
    }

    addTodo(description: string, priority: ToDoPriority) {
        const camera = this._components.camera
        if (!(camera instanceof OBC.OrthoPerspectiveCamera)) {
            throw new Error("TodoCreator needs an OrthoPerspectiveCamera in order to work.")
        }
        const position = new THREE.Vector3()
        camera.controls.getPosition(position)
        const target = new THREE.Vector3()
        camera.controls.getTarget(target)
        const todoCamera = {position, target}

        const highlighter = this._components.tools.get(OBC.FragmentHighlighter)
        const todo: ToDo = {
            description,
            date: new Date(),
            fragmentMap: highlighter.selection.select,
            camera: todoCamera,
            priority
        }

        this._list.push(todo)

        const todoCard = new TodoCard(this._components)
        todoCard.description = todo.description
        todoCard.date = todo.date
        todoCard.onCardClick.add(() => {
            camera.controls.setLookAt(
                todo.camera.position.x, 
                todo.camera.position.y, 
                todo.camera.position.z,
                todo.camera.target.x, 
                todo.camera.target.y, 
                todo.camera.target.z,
                true
            )
            const fragmentMapLenght = Object.keys(todo.fragmentMap).length
            if (fragmentMapLenght === 0) {return}
            highlighter.highlightByID("select", todo.fragmentMap)
        })
        const todoList = this.uiElement.get("todoList")
        todoList.addChild(todoCard)
    }

    deleteTodo() {
        // Implement the deletion of ToDo items

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
            this.addTodo(descriptionInput.value, priorityDropdown.value as ToDoPriority)
            descriptionInput.value = ""
            form.visible = false
        })
        
        form.onCancel.add(() => form.visible = false)                                           // Hide the form when the cancel button is clicked

        newTodoBtn.onClick.add(() => form.visible = true)                                   // Show the form when the button is clicked

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

        const highlighter = this._components.tools.get(OBC.FragmentHighlighter)
        colorizeBtn.onClick.add(() => {
            colorizeBtn.active = !colorizeBtn.active
            if (colorizeBtn.active) {
                for (const todo of this._list) {
                    const fragmentMapLenght = Object.keys(todo.fragmentMap).length
                    if (fragmentMapLenght === 0) {return}
                    highlighter.highlightByID(`${TodoCreator.uuid}-priority-${todo.priority}`, todo.fragmentMap)
                }
            } else {
                highlighter.clear(`${TodoCreator.uuid}-priority-Low`)
                highlighter.clear(`${TodoCreator.uuid}-priority-Normal`)
                highlighter.clear(`${TodoCreator.uuid}-priority-High`)
            }
        })

        const todoListBtn = new OBC.Button(this._components, {name: "List"})
        activationButton.addChild(todoListBtn)
        todoListBtn.onClick.add(() => todoList.visible = !todoList.visible)

        this.uiElement.set({activationButton, todoList})
    }

    get(): ToDo[] {
        return this._list
    }
}