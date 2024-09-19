import { Project } from './../../../classes/Project';
import * as OBC from "openbim-components"
import * as THREE from "three"
import { TodoCard } from './TodoCard';
import { v4 as uuidv4 } from "uuid"
import { IProjectTask, ProjectTask } from "../../../classes/ProjectTask";
export type ToDoPriority = "Low" | "Normal" | "High"
export type ToDoStatus = "open" | "in_progress" | "finished"
export type TaskSubject = "construction" | "view_in_ar" | "description" |"compost"

export interface ITodoIte {
    name: string
    description: string
    status: ToDoStatus
    priority: ToDoPriority
    todoSubject: TaskSubject
    creationDate: Date
    finishDate: Date
    fragmentMap: OBC.FragmentIdMap
    camera: {position: THREE.Vector3, target: THREE.Vector3}
    
    id: string
    uiElement?: OBC.UIElement<{
        todoCard: TodoCard
    }>;
}

export class TodoItem extends OBC.Component<IProjectTask> implements OBC.UI, OBC.Disposable, IProjectTask {

    onDelete = new OBC.Event()
    onEdit = new OBC.Event()
    onStatusChange = new OBC.Event()
    
    enabled: boolean = true
    private _components: OBC.Components    

    name: string
    description: string
    status: ToDoStatus
    priority: ToDoPriority
    todoSubject: TaskSubject
    creationDate: Date
    finishDate: Date
    fragmentMap: OBC.FragmentIdMap
    camera: {position: THREE.Vector3, target: THREE.Vector3}
    id: string

    uiElement = new OBC.UIElement<{
        todoCard: TodoCard
    }>;

    projectTaskReference: ProjectTask

    constructor(components: OBC.Components) {
        super(components)
        this._components = components

        this.name = "Unnamed"
        this.description = "No description added!"
        this.status = "open"
        this.todoSubject = "construction"
        this.finishDate = new Date()
        this.creationDate = new Date()
        this.fragmentMap = {}
        this.camera = {position: new THREE.Vector3(), target: new THREE.Vector3()}
        this.priority = "Normal"
        this.id = "temp-" + uuidv4()

        const todoCard = new TodoCard(this._components)
        this.uiElement.set({todoCard})
    }

    setVisibility(value: boolean) {
        const todoCard = this.uiElement.get("todoCard").get()
        if (todoCard && value === false) {
            todoCard.style.display = "none"
        }
        if (todoCard &&  value === true) {
            todoCard.style.display = "block"
        }
    }

    setTodo (data: Partial<IProjectTask>) {
        const highlighter = this._components.tools.get(OBC.FragmentHighlighter)
        const canvasCamera = this._components.camera
        if (!(canvasCamera instanceof OBC.OrthoPerspectiveCamera)) {
            throw new Error("TodoCreator needs an OrthoPerspectiveCamera in order to work.")
        }
        const position = new THREE.Vector3()
        canvasCamera.controls.getPosition(position)
        const target = new THREE.Vector3()
        canvasCamera.controls.getTarget(target)
        const cameraState = {position, target}

        this.camera = data.camera || cameraState
        this.fragmentMap = data.fragmentMap || highlighter.selection.select
        this.name = data.name || this.name;
        this.description = data.description || this.description;
        this.status = data.status || this.status;
        this.priority = data.priority || this.priority;
        this.todoSubject = data.todoSubject || this.todoSubject;
        this.creationDate = data.creationDate || this.creationDate;
        this.finishDate = data.finishDate || this.finishDate;
        if (data.id) {
            this.id = data.id
        }

        const todoCard = this.uiElement.get("todoCard") as TodoCard
        todoCard.values = {
            name: this.name,
            description: this.description,
            finishDate: this.finishDate,
            todoSubject: this.todoSubject,
            priority: this.priority,
            status: this.status
        }

        todoCard.onCardClick.add(() => {
            this.zoomTodo()
        })

        todoCard.onCardDelete.add(() => {
            this.uiElement.get("todoCard").dispose()
            this.onDelete.trigger()
        })

        todoCard.onCardEdit.add(() => {
            this.onEdit.trigger()
        })

        todoCard.onStatusChange.add(() => {
            this.onStatusChange.trigger()
        })
    }

    async dispose () {
        this.uiElement.get("todoCard").dispose()
    }

    zoomTodo () {
        const highlighter = this._components.tools.get(OBC.FragmentHighlighter)
        const canvasCamera = this._components.camera
        if (!(canvasCamera instanceof OBC.OrthoPerspectiveCamera)) {
            throw new Error("TodoCreator needs an OrthoPerspectiveCamera in order to work.")
        }
        const todoCard = this.uiElement.get("todoCard") as TodoCard
        canvasCamera.controls.setLookAt(
            this.camera.position.x, 
            this.camera.position.y, 
            this.camera.position.z,
            this.camera.target.x, 
            this.camera.target.y, 
            this.camera.target.z,
            true
        )
        const fragmentMapLenght = Object.keys(this.fragmentMap).length
        if (fragmentMapLenght === 0) {return}
        highlighter.highlightByID("select", this.fragmentMap)
    }

    updateTodo (data: Partial<IProjectTask>) {
        this.name = data.name || this.name;
        this.description = data.description || this.description;
        this.status = data.status || this.status;
        this.priority = data.priority || this.priority;
        this.todoSubject = data.todoSubject || this.todoSubject;
        this.creationDate = data.creationDate || this.creationDate;
        this.finishDate = data.finishDate || this.finishDate;
        const todoCard = this.uiElement.get("todoCard") as TodoCard
        todoCard.values = {
            name: this.name,
            description: this.description,
            todoSubject: this.todoSubject,
            priority: this.priority,
            finishDate: this.finishDate,
            status: this.status
        }
    }

    updateId(id: string) {
        this.id = id
    }

    getFragmentCount(): number {
        return Object.keys(this.fragmentMap).length
    }
    
    onDisposed: OBC.Event<any>;
    
    get(): IProjectTask {
        return {
            name: this.name,
            description: this.description,
            status: this.status,
            priority: this.priority,
            todoSubject: this.todoSubject,
            creationDate: this.creationDate,
            finishDate: this.finishDate,
            fragmentMap: this.fragmentMap,
            camera: this.camera,
            
            id: this.id,
        }
    }
}