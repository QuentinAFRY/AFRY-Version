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
      this.setDetailsPage(project)
      console.log(this.list)
    })
    this.ui.append(project.ui)
    this.list.push(project)
    return project
  }

  private setDetailsPage(project: Project) {
    const detailsPage = document.getElementById("project-details")
    if (!detailsPage) {return}

    //Flexible progress bar - abhängig vom progress value
    const progressBar = detailsPage.querySelector("[data-project-info='progressBar']") as HTMLDivElement
    const progressContainer = detailsPage.querySelector("[data-project-info='progressContainer']") as HTMLDivElement
    if (progressBar && progressContainer) {
      const progress = project.progress
      const progressRest = 100-progress

      if (progressBar && progressContainer) {
        // Ausgangswert
        progressBar.textContent = ""
        progressContainer.textContent = ""
        progressBar.style.width = progress.toFixed(0)+"%"
        progressContainer.style.width = progressRest.toFixed(0)+"%"
        progressBar.style.backgroundColor = "rgba(36, 218, 60, 0.795)"

        // Darstellungsanpassung je nach Fortschritt
        if (progress >= 15 && progress <= 100) {
          progressBar.textContent = progress.toFixed(0)+"%"
        } else if (2 <= progress && progress < 15) {
          progressContainer.textContent = progress.toFixed(0)+"%"
        } else if (0 <= progress && progress < 2) {
          progressBar.style.width = "2%"
          progressBar.style.backgroundColor = "var(--primary-green-400)"
          progressContainer.style.width = "98%"
          progressContainer.textContent = "0%"
        } else {
          console.log(`The project ${project.name} has an invalid progress value of: ${project.progress}`)
        }
      }
    }

    //Handeling the Name - Comes twice (In header and details card)
    const nameList = detailsPage.querySelectorAll("[data-project-info='name']")
    if (nameList) {
      nameList.forEach(name => {
        name.textContent = project.name
      })
    }

    //Function that handles all querys that occur once
    function updateDetailsPage(project, propertyList) {
      propertyList.forEach(property => {
        const attribute = `data-project-info='${property}'`
        const element = detailsPage?.querySelector(`[${attribute}]`) as HTMLElement

        if (element && project[property] && property==="finishDate") {
          try {
            const date = project[property] as Date
            const newDate = date.toLocaleDateString('de-DE')
            element.textContent = newDate
          } catch (err) {
            console.log(err, `The following property was causing issues: ${property}`)
          }
        } else if (element && project[property] && property==="logoColor") {
          try {
            element.style.backgroundColor = project[property]
          } catch (err) {
            console.log(err, `The following property was causing issues: ${property}`)
          }
        } else if (element && project[property] && property!="finishDate") {
          try {
            element.textContent = project[property]
          } catch (err) {
            console.log(err, `The following property was causing issues: ${property}`)
          }
        }
      })}
    
    //List of properties to be iterated through (adaptable)
    const propertiesToUpdate = [
      "logoColor",
      "acronym", 
      "description", 
      "projectStatus", 
      "businessUnit", 
      "contactPerson", 
      "finishDate",
    ]

    updateDetailsPage(project, propertiesToUpdate)
  }

  defaultProject = () => {
    const data: IProject = {
      name: "Example Project" as string,
      acronym: "TEST" as string,
      description: "Project description goes here..." as string,
      businessUnit: "Transportation" as BusinessUnit,
      projectStatus: "Finished" as ProjectStatus,
      finishDate: new Date("") as Date,
      progress: 10 as number,
    }
    this.newProject(data)
  }

  getProjectData(data: IProject) {}

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
      console.log("THIS IS JSON: ", json)
      if (!json) {return}
      const newProjects: IProject[] = JSON.parse(json as string)
      console.log("THIS IS parsedJSON: ", newProjects)
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
