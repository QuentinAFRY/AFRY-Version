import { ProjectsManager } from './../../classes/ProjectsManager';
import { TodoCard } from './src/TodoCard';
import { TodoItem, ToDoPriority, TaskSubject, ToDoStatus } from './src/TodoItem';
import * as THREE from "three"
import * as OBC from "openbim-components"
import { v4 as uuidv4 } from "uuid"
import { Project } from '../../classes/Project';
import { formatColorToHex } from '../../lib/utils';
import { getCollection } from '../../firebase';
import * as Firestore from 'firebase/firestore';
import { IProjectTask, ProjectTask } from '../../classes/ProjectTask';
import { temp } from 'three/examples/jsm/nodes/Nodes.js';

export const statusColors = {
    open: "#FBC6FF",
    in_progress: "#FFD54B",
    finished: "#59FF2F",
}

const priorityColors = {
    High: 0xd56400,
    Normal: 0x32b600,
    Low: 0x0079e0,
}

type FormState = "create" | "edit"
export class TodoCreator extends OBC.Component<TodoItem[]> implements OBC.UI, OBC.Disposable {
    
    
    static uuid = "c5014422-1e54-452f-a280-a09e1a3c966c"
    enabled = true
    onTodoCreated = new OBC.Event<TodoItem>()
    onDisposed: OBC.Event<any>;
    uiElement = new OBC.UIElement<{
        activationButton: OBC.Button
        todoList: OBC.FloatingWindow
        colorizeBtn: OBC.Button
        todoForm: OBC.Modal
        filterBar: OBC.SimpleUIComponent
    }>()

    private _projectsManager: ProjectsManager
    private _selectedProject: Project
    private _selectedTodo: TodoItem |undefined = undefined
    private _todoList: TodoItem[] = []
    private _formState: FormState = "create"
    private _components: OBC.Components


    constructor(components: OBC.Components, projectsManager: ProjectsManager) {
        super(components)
        this._components = components
        this._projectsManager = projectsManager
        components.tools.add(TodoCreator.uuid, this)
        this.setUI()
    }

    setup(id: string) {
        const project = this._projectsManager.getProject(id)
        if (!project) {
            console.error(`The project with the id ${id} could not be found.`)
            return
        }
        this._selectedProject = project
        this.fetchTodos(project)
        
        const highlighter = this._components.tools.get(OBC.FragmentHighlighter)
        highlighter.add(`${TodoCreator.uuid}-priority-Low`, [new THREE.MeshStandardMaterial({color: priorityColors.Low})])
        highlighter.add(`${TodoCreator.uuid}-priority-Normal`, [new THREE.MeshStandardMaterial({color: priorityColors.Normal})])
        highlighter.add(`${TodoCreator.uuid}-priority-High`, [new THREE.MeshStandardMaterial({color: priorityColors.High})])
    }

    private setForm(): OBC.Modal {
        const form = new OBC.Modal(this._components)
        this._components.ui.add(form)
        form.visible = false
        form.title = "Create New ToDo"

        const nameElement = new OBC.TextInput(this._components)
        nameElement.label = "Task Name"
        nameElement.name = "name"
        form.slots.content.addChild(nameElement)

        const descriptionElement = new OBC.TextArea(this._components)
        descriptionElement.label = "Description"
        descriptionElement.name = "description"
        form.slots.content.addChild(descriptionElement)

        const todoSubjectElement = new OBC.Dropdown(this._components)
        todoSubjectElement.label = "Select Subject"
        todoSubjectElement.name = "todoSubject"
        todoSubjectElement.addOption("Engineering" , "BIM" , "Documentation" ,"Sustainability")
        todoSubjectElement.value = "Engineering"
        form.slots.content.addChild(todoSubjectElement)

        const priorityElement = new OBC.Dropdown(this._components)
        priorityElement.label = "Set Priority"
        priorityElement.name = "priority"
        priorityElement.addOption("Low", "Normal", "High")
        priorityElement.value = "Normal"
        form.slots.content.addChild(priorityElement)

        const template = `
        <div style="display: flex; flex-direction: column">
            <label for="finishDate" style="color: rgb(156 163 175 / var(--tw-text-opacity))">Finish Date</label>
            <input type="date" name="finishDate" id="todo-form-finishDate">
        </div>
        `
        const finishDateElement = new OBC.SimpleUIComponent(this._components, template)
        finishDateElement.name = "finishDate"
        form.slots.content.addChild(finishDateElement)

        const statusElement = new OBC.Dropdown(this._components)
        statusElement.label = "Status"
        statusElement.name = "status"
        statusElement.addOption("Open", "In Progress", "Finished")
        statusElement.value = "Open"
        form.slots.content.addChild(statusElement)

        form.slots.content.get().style.padding = "20px"
        form.slots.content.get().style.display = "flex"
        form.slots.content.get().style.flexDirection = "column"
        form.slots.content.get().style.rowGap = "20px"
        
        

        form.onAccept.add(() => {
            let subjectValue: TaskSubject;
            switch (todoSubjectElement.value) {
                case "Engineering":
                    subjectValue = "construction";
                    break;
                case "BIM":
                    subjectValue = "view_in_ar";
                    break;
                case "Documentation":
                    subjectValue = "description";
                    break;
                case "Sustainability":
                    subjectValue = "compost";
                    break;
                default:
                    subjectValue = "construction"; // Default value if needed
                    break;
            }

            let statusValue: ToDoStatus;
            switch (statusElement.value) {
                case "Open":
                    statusValue = "open";
                    break;
                case "In Progress":
                    statusValue = "in_progress";
                    break;
                case "Finished":
                    statusValue = "finished";
                    break;
                default:
                    statusValue = "open"; // Default value if needed
                    break;
            }

            const finishDateInput = finishDateElement.getInnerElement("todo-form-finishDate") as HTMLInputElement;
            let finishDateValue = new Date();
            if (finishDateInput.value) {finishDateValue = new Date(finishDateInput.value)}

            const formData = {
                name: nameElement.value,
                description: descriptionElement.value,
                todoSubject: subjectValue,
                priority: priorityElement.value as ToDoPriority,
                finishDate: finishDateValue,
                status: statusValue as ToDoStatus
            };

            // Conditional logic for edit or add
            const editState = this._formState

            if (editState === "edit" && this._selectedTodo) {
                const todo = this._selectedTodo;
                todo.updateTodo(formData)
                this._selectedProject.updateTask(formData, todo.id)
                this.colorizeStatus(todo)
                this.updateColor();
                form.visible = false;
                form.cleanData();
                this._selectedTodo = undefined;
            } else {
                this.createTodo(formData);
                form.visible = false;
            }        
        })

        form.onCancel.add(() => {
            form.visible = false
        })
        
        return form
    }


    private setUI() {
        // UI Element Creation and setup
        const activationButton = new OBC.Button(this._components)
        activationButton.materialIcon = "construction"

        const newTodoBtn = new OBC.Button(this._components, {name: "Create"})
        const todoListBtn = new OBC.Button(this._components, {name: "List"})
        const todoForm = this.setForm()

        const todoList = new OBC.FloatingWindow(this._components)
        this._components.ui.add(todoList)
        todoList.get().style.justifyContent = "flex-start"
        todoList.get().style.minWidth = "450px"
        todoList.visible = false
        todoList.title = "ToDo List"
        const todoListToolbar = new OBC.SimpleUIComponent(this._components)
        todoListToolbar.get().style.display = "flex"
        todoListToolbar.get().style.alignItems = "center"
        todoListToolbar.get().style.justifyContent = "space-between"

        const filterBar = new OBC.SimpleUIComponent(this._components)
        filterBar.get().style.display = "flex"
        filterBar.get().style.width = "100%"
        const filterInput = new OBC.TextInput(this._components)
        filterInput.label = ""
        filterInput.get().style.width = "100%"
        const filterInputInner = filterInput.innerElements.input as HTMLInputElement
        filterInputInner.placeholder = "Filter by Name"
        filterInputInner.style.padding = "2px 5px"

        const filterLabel = new OBC.SimpleUIComponent(this._components)
        const span = document.createElement("span")
        span.style.cursor = "default"
        span.classList.add("material-icons")
        span.textContent = "search"
        span.style.scale = "0.8"
        filterLabel.get().appendChild(span)
        

        const filterDelete = new OBC.Button(this._components)
        filterDelete.materialIcon = "backspace"

        const countElementsBtn = new OBC.Button(this._components, {name: ""})
        countElementsBtn.materialIcon = "summarize"
        countElementsBtn.get().style.cursor = "help"

        const colorizeBtn = new OBC.Button(this._components, {name: ""})
        colorizeBtn.materialIcon = "palette"

                            
        
        // Event Listeners
        newTodoBtn.onClick.add(() => {
            this._formState = "create"
            const template: Partial<IProjectTask> = {
                name: "",
                description: "",
                todoSubject: "construction",
                priority: "Normal",
                status: "open",
            }
            this.setFormValues(todoForm, template)
            todoForm.visible = true}
        )
        todoListBtn.onClick.add(() => todoList.visible = !todoList.visible)

        //___filterBar
        filterInputInner.addEventListener("input", (i) => {
            if (i.target) {
                const input = i.target as HTMLInputElement
                console.log(input.value.toLowerCase())
                this.searchTodos(this._todoList, input.value.toLowerCase())
            }
        })
        filterDelete.onClick.add(() => {
            filterInputInner.value = ""
            this.searchTodos(this._todoList, "")
        })

        //___countElementsButton
        countElementsBtn.onClick.add(() => {
            this.getNumberOfFragments()
        })
        
        //___colorizeButton
        colorizeBtn.onClick.add(() => {
            colorizeBtn.active = !colorizeBtn.active
            if (colorizeBtn.active) {
                console.log("Colorize Button is active")
                this.applyColor()
            } else {
                this.removeColor()
            }
        })

        // Adding the Elements to the UI
        activationButton.addChild(todoListBtn, newTodoBtn)
        todoList.addChild(todoListToolbar)
        todoListToolbar.addChild(filterBar, countElementsBtn, colorizeBtn)
        filterBar.addChild(filterLabel, filterInput, filterDelete)
        this.uiElement.set({activationButton, todoList, filterBar, colorizeBtn, todoForm})
    }

    searchTodos(todoList: TodoItem[], filterValue: string) {
        for (const todo of todoList) {
            const name = todo.name.toLowerCase()
            console.log(name)
            if (name.includes(filterValue)) {
                todo.setVisibility(true)
            } else {
                todo.setVisibility(false)
            }
        }
    }

    getNumberOfFragments() {
        let fragments: string[] = []
        console.log(this._todoList)
        for (const todo in this._todoList) {
            for (const fragment in this._todoList[todo].fragmentMap) {
                if (!fragments.includes(fragment)) {
                    fragments.push(fragment)
                }
            }
        }
        const message = `There are ${fragments.length} elements associated with ToDos`
        console.log(fragments)

        const infoBox = new OBC.ToastNotification(this.components, {message: message, materialIconName: "info"})
        this._components.ui.add(infoBox)
        infoBox.visible = true
    }

    fetchTodos(project: Project) {
        for (const task of project.tasks) {
            const todo = new TodoItem(this._components)
            todo.setTodo(task)
            this._todoList.push(todo)

            const todoList = this.uiElement.get("todoList")
            todoList.addChild(todo.uiElement.get("todoCard"))

            this.onTodoCreated.trigger(todo)

            todo.onDelete.add(() => {
                this.deleteTodo(todo)
                this._selectedProject.deleteTask(todo.id)
            })

            todo.onEdit.add(() => {
                this._selectedTodo = todo
                this.openEditForm()
                console.log("Edit Event:", this._selectedTodo)
            })
        }
    }

    createTodo(data: Partial<IProjectTask>) {
        if (!this.enabled) {return}
        const todo = new TodoItem(this._components)
        todo.setTodo(data)
        this._todoList.push(todo)

        this.passTodoToProject(todo)
        this.colorizeStatus(todo)

        const todoList = this.uiElement.get("todoList")
        todoList.addChild(todo.uiElement.get("todoCard"))

        this.onTodoCreated.trigger(todo)

        todo.onDelete.add(() => {
            this.deleteTodo(todo)
            this._selectedProject.deleteTask(todo.id)
        })

        todo.onEdit.add(() => {
            this._selectedTodo = todo
            this.openEditForm()
            console.log("Edit Event:", this._selectedTodo)
        })

        todo.projectTaskReference.onIdUpdate = ((id, tempId) => {
            console.log("tempId: ", tempId)
            this.overwriteTempId(id, tempId)
            console.log("ID updated: ", id, tempId, todo)
        })
    }

    passTodoToProject(todo: TodoItem) {
        const projectTaskIDs = this._selectedProject.tasks.map(task => task.id)
        if (projectTaskIDs.includes(todo.id)) {
            console.error(`Task with id ${todo.id} already exists`)
            return
        }
        console.log()
        this._selectedProject.createTask(todo)
        const task = this._selectedProject.getTask(todo.id)
        if (task) {
            todo.projectTaskReference = task
        }
    }

    colorizeStatus (todo: TodoItem) {
        const todoCard = todo.uiElement.get("todoCard")
        const pStatus = todoCard.getInnerElement("status") as HTMLParagraphElement
        pStatus.style.color = statusColors[todo.status]
    }

    openEditForm(){
        const form = this.uiElement.get("todoForm") as OBC.Modal
        const todo = this._selectedTodo
        if (!form || !todo) {return}
        this._formState = "edit"
        this.setEditForm(form, todo)
        form.visible = true
    }

    setEditForm(form: OBC.Modal, todo: TodoItem) {
        if (form.visible) {
            console.error("You cannot edit at the moment, a form is already open.")
            return
        }
        todo.zoomTodo()
        form.title = "Edit ToDo"

        this.setFormValues(form, todo)
    }

    setFormValues(form: OBC.Modal, todo: Partial<TodoItem>) {
        const formSlots = form.slots.content.children

        formSlots.forEach((e) => {
            const elementName = e.name
            if (e instanceof OBC.Dropdown) {
                e.value = todo[elementName]
            } else if (e instanceof OBC.TextInput) {
                e.value = todo[elementName]
            } else if (e instanceof OBC.TextArea) {
                e.value = todo[elementName]
            } else if (e instanceof OBC.SimpleUIComponent) {
                const finishDateInput = e.getInnerElement("todo-form-finishDate") as HTMLInputElement
                if (todo[elementName] instanceof Date) {
                    const date = todo[elementName] as Date
                    finishDateInput.value = date.toISOString().split("T")[0]
                } else {
                    finishDateInput.value = ""
                }
            }
        })
    }

    deleteTodo(todo: TodoItem) {
        if (!this.enabled) {return}
        const index = this._todoList.indexOf(todo)
        this._todoList.splice(index, 1)
        this.updateColor()
    }

    overwriteTempId(id: string, tempId: string) {
        const todo = this._todoList.find(todo => todo.id === tempId)
        if (todo) {
            todo.id = id
        }
    }

    // This method colorizes the todo elements by their priority
    private applyColor() {
        console.log(this._todoList)
        const highlighter = this._components.tools.get(OBC.FragmentHighlighter)
        for (const todo of this._todoList) {
            const icon = todo.uiElement.get("todoCard").getInnerElement("todoSubject") as HTMLSpanElement
            icon.style.backgroundColor = `${formatColorToHex((priorityColors[todo.priority]))}`
            const fragmentMapLenght = Object.keys(todo.fragmentMap).length
            if (fragmentMapLenght === 0) {continue}
            highlighter.highlightByID(`${TodoCreator.uuid}-priority-${todo.priority}`, todo.fragmentMap)
        }
    }

    // This method removes the colorization from the todo elements
    private removeColor() {
        const highlighter = this._components.tools.get(OBC.FragmentHighlighter)
        highlighter.clear(`${TodoCreator.uuid}-priority-Low`)
        highlighter.clear(`${TodoCreator.uuid}-priority-Normal`)
        highlighter.clear(`${TodoCreator.uuid}-priority-High`)
        for (const todo of this._todoList) {
            const icon = todo.uiElement.get("todoCard").getInnerElement("todoSubject") as HTMLSpanElement
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
        this.enabled = false
    }

    get(): TodoItem[] {
        return this._todoList
    }
}