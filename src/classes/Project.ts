import { v4 as uuidv4 } from "uuid";

export type BusinessUnit = "none" | "transportation" | "sustainability" | "energy" | "Industrial";
export type ProjectStatus = "pending" | "active" | "finished";

export interface IProject {
  name: string;
  acronym: string;
  description: string;
  businessUnit: BusinessUnit;
  projectStatus: ProjectStatus;
  finishDate: Date;
  progress: number;
}

export class Project implements IProject {
  //To satisfy IProject
  name: string;
  acronym: string;
  description: string;
  businessUnit: "none" | "transportation" | "sustainability" | "energy" | "Industrial";
  projectStatus: "pending" | "active" | "finished";
  finishDate: Date;

  //Class internals
  ui: HTMLDivElement;
  cost: number = 0;
  id: string;
  progress: number = 0.15;
  contactPerson: string = "Quentin Hamm";

  constructor(data: IProject) {
    for (const key in data) {
      this[key] = data[key]
    }
    if (!this.id) {this.id = uuidv4()}
    this.setUI()
  }

  //creates the project card UI
  setUI() {
    if (this.ui && this.ui instanceof HTMLDivElement) {return}
    this.ui = document.createElement("div");
    this.ui.className = "project-card";
    this.ui.innerHTML = `
    <div class="card-header">
      <div class="card-logo">
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
    </div>`;
  }
}
