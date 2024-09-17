import { update } from 'three/examples/jsm/libs/tween.module.js';
import { v4 as uuidv4 } from "uuid"
import * as OBC from "openbim-components"
import * as THREE from "three"
import { temp } from 'three/examples/jsm/nodes/Nodes.js';


export type TaskStatus = "open" | "in-progress" | "finished"
export type TaskLogo = "construction" | "view_in_ar" | "description" |"compost"

export type ToDoPriority = "Low" | "Normal" | "High"
export type ToDoStatus = "open" | "in_progress" | "finished"
export type TaskSubject = "construction" | "view_in_ar" | "description" |"compost"

export interface IProjectTask {
    name: string
    description: string
    status: ToDoStatus
    priority: ToDoPriority
    todoSubject: TaskSubject
    creationDate: Date
    finishDate: Date
    fragmentMap: OBC.FragmentIdMap
    camera: {position: THREE.Vector3, target: THREE.Vector3}
    id?: string
}

export class ProjectTask implements IProjectTask{
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

    collapsed: boolean = false
    onIdUpdate = (id: string, tempId: string) => {}

    constructor(data: IProjectTask, id: string) {
        for (const key in data) {
            this[key] = data[key]
        }
        this.id = id
    }

    update(data: Partial<IProjectTask>) {
        for (const key in data) {
            this[key] = data[key]
        }
    }

    updateAndSyncId(id: string, tempId: string) {
        this.id = id
        this.onIdUpdate(id, tempId)
    }
}