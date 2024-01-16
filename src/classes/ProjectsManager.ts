import { IProject, Project, BusinessUnit, ProjectStatus } from "./Project"

export class ProjectsManager {
  list: Project[] = []
  ui: HTMLElement

  constructor(container: HTMLElement) {
    this.ui = container
  }

  newProject(data: IProject) {
    const projectNames = this.list.map((project) => {
      return project.name
    })
    const nameInUse = projectNames.includes(data.name)
    if (nameInUse) {
      throw new Error (`A Project with the name "${data.name}" already exists`)
    }
    const project = new Project(data)
    project.ui.addEventListener("click", () => {
      const projectsPage = document.getElementById("projects-page")
      const detailsPage = document.getElementById("project-details")
      if (!projectsPage || !detailsPage) {return}
      projectsPage.style.display = "none"
      detailsPage.style.display = "flex"
    })
    this.ui.append(project.ui)
    this.list.push(project)
    return project
  }

  defaultProject = () => {
    const data: IProject = {
      name: "Project Name" as string,
      description: "Project description goes here..." as string,
      businessUnit: "Transportation" as BusinessUnit,
      projectStatus: "Active" as ProjectStatus,
      finishDate: new Date(10 - 12 - 2023),
    }
    this.newProject(data)
  }

  getProject(id: string) {
    const project = this.list.find((project) => project.id === id)
    return project
  }

  deleteProject(id: string) {
    const project = this.getProject(id)
    if (!project) {return}
    project.ui.remove()
    const remaining = this.list.filter((project) => project.id !== id)
    this.list = remaining
  }

  getProjectByName(name: string) {
    const project = this.list.find((project) => project.name === name)
    return project
  }

  getTotalCost() {
    const totalCost = this.list.reduce((accumulator, project) => accumulator + project.cost, 0)
    return totalCost
  }

  exportToJSON(fileName: string = "projects") {
    const json = JSON.stringify(this.list, (key, value) => {
      if (key === 'ui') {
        return undefined
      }
      return value
    }, 2)
    const blob = new Blob ([json], {type: 'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }
  
  importFromJSON() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    const reader = new FileReader()
    input.addEventListener('change', () => {
      const filesList = input.files
      if (!filesList) {return}
      reader.readAsText(filesList[0])
    })

    reader.addEventListener('load', () => {
      const json = reader.result
      if (!json) {return}
      const newProjects: IProject[] = JSON.parse(json as string)
      const existingProjects = this.list.map((project) => {
        return project.name})

        for (const project of newProjects) {
          try {
            if (existingProjects.includes(project.name)) {
            throw new Error(`Ein Projekt mit dem namen ${project.name} ist bereits vorhanden`)
          } else {
            try {
              this.newProject(project)
            } catch (err) {
              console.log(err)
            }}
          } catch (err) {
            console.log(`${err}`)
            window.alert(`Import nicht möglich: ${err}`)
            continue
          }}
    })
    input.click()
  }
}
