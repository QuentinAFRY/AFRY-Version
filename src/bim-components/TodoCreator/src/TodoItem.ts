import * as OBC from "openbim-components"
import * as THREE from "three"
import { TodoCard } from './TodoCard';
import { v4 as uuidv4 } from "uuid"

export type ToDoPriority = "Low" | "Normal" | "High"

interface Todo {
    description: string
    date: Date
    fragmentMap: OBC.FragmentIdMap
    camera: {position: THREE.Vector3, target: THREE.Vector3}
    priority: ToDoPriority
    id: string
    uiElement: OBC.UIElement<{
        todoCard: TodoCard
    }>;
}

export class TodoItem extends OBC.Component<Todo> implements OBC.UI, OBC.Disposable, Todo {

    onDelete = new OBC.Event()
    onEdit = new OBC.Event()
    
    enabled: boolean = true
    private _components: OBC.Components
    

    description: string
    date: Date
    fragmentMap: OBC.FragmentIdMap
    camera: {position: THREE.Vector3, target: THREE.Vector3}
    priority: ToDoPriority
    id: string

    uiElement = new OBC.UIElement<{
        todoCard: TodoCard
    }>;

    constructor(components: OBC.Components) {
        super(components)
        this._components = components

        this.description = ""
        this.date = new Date()
        this.fragmentMap = {}
        this.camera = {position: new THREE.Vector3(), target: new THREE.Vector3()}
        this.priority = "Normal"
        this.id = uuidv4()

        const todoCard = new TodoCard(this._components)
        todoCard.description = this.description
        this.uiElement.set({todoCard})
    }

    setTodo (description: string, priority: ToDoPriority) {
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

        this.camera = cameraState
        this.fragmentMap = highlighter.selection.select
        this.description = description
        this.priority = priority

        const todoCard = this.uiElement.get("todoCard") as TodoCard
        todoCard.description = this.description
        todoCard.date = this.date

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

    updateTodo (description: string, priority: ToDoPriority) {
        this.description = description
        this.priority = priority
        const todoCard = this.uiElement.get("todoCard") as TodoCard
        todoCard.description = this.description
    }
    
    onDisposed: OBC.Event<any>;
    
    get(): Todo {
        return {
            description: this.description,
            date: this.date,
            fragmentMap: this.fragmentMap,
            camera: this.camera,
            priority: this.priority,
            id: this.id,
            uiElement: this.uiElement
        }
    }
}