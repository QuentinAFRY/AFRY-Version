import { v4 as uuidv4 } from "uuid"
import { ProjectTask, IProjectTask, TaskStatus, TaskLogo } from "./ProjectTask";

export type BusinessUnit = "none" | "transportation" | "sustainability" | "energy" | "Industrial"
export type ProjectStatus = "pending" | "active" | "finished"

export interface IProject {
  name: string
  acronym: string
  description: string
  businessUnit: BusinessUnit
  projectStatus: ProjectStatus
  finishDate: Date
  progress: number
}

export class Project implements IProject {
  //To satisfy IProject
  name: string
  acronym: string
  description: string
  businessUnit: "none" | "transportation" | "sustainability" | "energy" | "Industrial"
  projectStatus: "pending" | "active" | "finished"
  finishDate: Date

  //Class internals
  logoColor: string
  cost: number = 0
  id: string
  progress: number
  contactPerson: string = "Quentin Hamm"
  onTaskAdded = (task: IProjectTask, tempId: string) => {}
  onTaskUpdated = (data: IProjectTask) => {}
  onTaskDeleted = (id: string) => {}

  tasks: ProjectTask[] = []

  constructor(data: IProject, id = uuidv4()) {
    for (const key in data) {
      this[key] = data[key]
    }
    if (typeof this.finishDate == "string") {this.finishDate = new Date(this.finishDate)}
    if (this.finishDate instanceof Date && isNaN(this.finishDate.getDate())) {this.finishDate = new Date()}
    if (this.name.length<5) {throw new Error(`The name "${this.name}" is invalid. Name must contain at least 5 characters`)}
    this.id = id
  }


  // setAcronym() {
  //   if (!this.acronym) {
  //     const name = this.name
  //     const nameParts = name.split(' ')
  //     if (nameParts[0].length<4) {
  //       const length = nameParts[0].length as number
  //       const restLength = 4-length
  //       const firstPart = nameParts[0].toUpperCase()
  //       const secondPart = nameParts[1].substring(0,restLength).toUpperCase()
  //       const newName = firstPart+secondPart
  //       this.acronym = newName
  //     } else if (nameParts[0].length>=4) {
  //       const newName = nameParts[0].substring(0, 4).toUpperCase()
  //       this.acronym = newName
  //     }
  //   }
  // }


  // setLogoColor() {

  //   if (this.logoColor!==undefined) {return}
  //   const getRandomValue = () => Math.floor(Math.random() * 256)
  //   let color = ``

  //   for (let brightness = 0; brightness<126;) {
  //      // Generiere zufällige RGB-Werte
  //     const red = getRandomValue()
  //     const green = getRandomValue()
  //     const blue = getRandomValue()
  //     // Überprüft den Farbunterschied zur Hintergrundfarbe
  //     let difference = (Math.max(64, red)-Math.min(64, red))+(Math.max(80, green)-Math.min(80, green))+(Math.max(64, blue)-Math.min(64, blue))
  //     if (difference<100) {continue}
  //     // Berechne die Helligkeitskomponente (wenn kleiner 128, schlecht lesbar mit weißem text)
  //     brightness = 280-(0.3*red + 0.587*green + 0.3*blue);
  //    // Gib die RGB-Farbe zurück
  //     color = `rgb(${red}, ${green}, ${blue})`
  //   }
  //   this.logoColor = color
  // }


  // updateUI() {
  //   if (this.ui && this.ui instanceof HTMLDivElement) {
  //     this.ui.innerHTML = `
  //     <div class="card-header">
  //       <div class="card-logo" style="background-color: ${this.logoColor}">
  //         <p>${this.acronym}</p>
  //       </div>
  //       <div>
  //         <h5>${this.name}</h5>
  //         <p>${this.description}</p>
  //       </div>
  //     </div>
  //     <div class="card-content">
  //       <div class="card-property">
  //         <p style="color: #969696">Status</p>
  //         <p>${this.projectStatus}</p>
  //       </div>
  //       <div class="card-property">
  //         <p style="color: #969696">Business Unit</p>
  //         <p>${this.businessUnit}</p>
  //       </div>
  //       <div class="card-property">
  //         <p style="color: #969696">Cost</p>
  //         <p>$${this.cost}</p>
  //       </div>
  //       <div class="card-property">
  //         <p style="color: #969696">Contact Person</p>
  //         <a href="#">Quentin Hamm</a>
  //       </div>
  //       <div class="card-property">
  //         <p style="color: #969696">Estimated Progress</p>
  //         <p>${(this.progress).toFixed(0)}%</p>
  //       </div>
  //     </div>`
  //   }
  // }

  createTask(data: IProjectTask) {
    const tempId = data.id
    console.log("Task ID: ", data.id)
    if(!tempId) {console.error("Task id is missing"); return}
    const newTask = new ProjectTask(data, tempId)
    const taskIDs = this.tasks.map(task => task.id)
    if (taskIDs.includes(tempId)) {return console.error(`Task with id ${tempId} already exists`)}
    this.tasks.push(newTask)
    this.onTaskAdded(newTask as IProjectTask, tempId)
  }

  fetchTask(data: IProjectTask, id: string) {
    const newTask = new ProjectTask(data, id)
    const taskIDs = this.tasks.map(task => task.id)
    if (taskIDs.includes(id)) {return console.error(`Task with id ${id} already exists`)}
    this.tasks.push(newTask)
  }

  updateTask(data: Partial<IProjectTask>, id: string) {
    const task = this.tasks.find(task => task.id === id)
    if (task) {
      for (const key in data) {
        task[key] = data[key]
      }
      this.onTaskUpdated(task as IProjectTask)
    } else {
      console.error(`Task with id ${id} not found`)
    }
  }

  deleteTask(id: string) {
    const index = this.tasks.findIndex(task => task.id === id)
    if (index !== -1) {
      const task = this.tasks[index]
      this.tasks.splice(index, 1)
      this.onTaskDeleted(task.id)
    }
  }

  getTask(id: string): ProjectTask | undefined {
    const task = this.tasks.find(task => task.id === id)
    if (!task) {console.error(`Task with id ${id} not found`); return}
    return task
  }
}