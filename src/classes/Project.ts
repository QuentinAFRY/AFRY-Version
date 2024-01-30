import { v4 as uuidv4 } from "uuid"

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
  ui: HTMLDivElement
  logoColor: string
  cost: number = 0
  id: string
  progress: number = 0.15
  contactPerson: string = "Quentin Hamm"

  constructor(data: IProject) {
    for (const key in data) {
      this[key] = data[key]
    }

    // Heutiger Tag als finishDate wenn kein Datum angegeben & Falls Datum ein string (z.B. durch JSON) Konvertiertung in DateObject
    if (typeof this.finishDate == "string") {this.finishDate = new Date(this.finishDate)}
    if (this.finishDate instanceof Date && isNaN(this.finishDate.getDate())) {this.finishDate = new Date()}

    if (!this.id) {this.id = uuidv4()}

    //Wenn der Name aus weniger als 5 Zeichen besteht, dann wird ein Error erstellt 
    if (this.name.length<5) {throw new Error(`The name "${this.name}" is invalid. Name must contain at least 5 characters`)}
    
    this.setLogoColor()
    this.setAcronym()
    this.setUI()
  }

  // Acronym Chekcer - if not provided create a new one based on the name
  setAcronym() {
    if (!this.acronym) {
      const name = this.name
      const nameParts = name.split(' ')

      if (nameParts[0].length<4) {
        const length = nameParts[0].length as number
        const restLength = 4-length
        const firstPart = nameParts[0].toUpperCase()
        const secondPart = nameParts[1].substring(0,restLength).toUpperCase()
        const newName = firstPart+secondPart
        this.acronym = newName
      } else if (nameParts[0].length>=4) {
        const newName = nameParts[0].substring(0, 4).toUpperCase()
        this.acronym = newName
      }
    }
  }

  // Erstelle Logo color falls nicht vorhanden
  setLogoColor() {

    if (this.logoColor!==undefined) {return}
    const getRandomValue = () => Math.floor(Math.random() * 256)
    let color = ``

    for (let brightness = 0; brightness<126;) {

       // Generiere zufällige RGB-Werte
      const red = getRandomValue()
      const green = getRandomValue()
      const blue = getRandomValue()
      
      // Überprüft den Farbunterschied zur Hintergrundfarbe
      let difference = (Math.max(64, red)-Math.min(64, red))+(Math.max(80, green)-Math.min(80, green))+(Math.max(64, blue)-Math.min(64, blue))
      if (difference<100) {continue}
      
      // Berechne die Helligkeitskomponente (wenn kleiner 128, schlecht lesbar mit weißem text)
      brightness = 280-(0.3*red + 0.587*green + 0.3*blue);

     // Gib die RGB-Farbe zurück
      color = `rgb(${red}, ${green}, ${blue})`
    }

    this.logoColor = color
  }

  //creates the project card UI
  setUI() {
    if (this.ui && this.ui instanceof HTMLDivElement) {return}

    this.ui = document.createElement("div")
    this.ui.className = "project-card"
    this.ui.innerHTML = `
    <div class="card-header">
      <div class="card-logo" style="background-color: ${this.logoColor}">
        <p>${this.acronym}</p>
      </div>
      <div>
        <h5>${this.name}</h5>
        <p>${this.description}</p>
      </div>
    </div>
    <div class="card-content">
      <div class="card-property">
        <p style="color: #969696">Status</p>
        <p>${this.projectStatus}</p>
      </div>
      <div class="card-property">
        <p style="color: #969696">Business Unit</p>
        <p>${this.businessUnit}</p>
      </div>
      <div class="card-property">
        <p style="color: #969696">Cost</p>
        <p>$${this.cost}</p>
      </div>
      <div class="card-property">
        <p style="color: #969696">Contact Person</p>
        <a href="#">Quentin Hamm</a>
      </div>
      <div class="card-property">
        <p style="color: #969696">Estimated Progress</p>
        <p>${(this.progress).toFixed(0)}%</p>
      </div>
    </div>`
  }
}
