import { IProject, Project, BusinessUnit, ProjectStatus } from "./Project"
import * as Firestore from "firebase/firestore"  

export class ProjectsManager {
  list: Project[] = []
  activeProjectId: string
  onProjectCreated = (project: Project) => {}
  onProjectDeleted = (id: string) => {}

  getProjectList () {
    return this.list
  }
  
  newProject(data: IProject, id?: string) {
    const projectNames = this.list.map((project) => {
      return project.name
    })
    const nameInUse = projectNames.includes(data.name)
    if (nameInUse) {
      throw new Error (`A Project with the name "${data.name}" already exists`)
    }

    if (!data.acronym) {
      data.acronym = data.name.slice(0, 4).toUpperCase()
    }

    if (data.acronym.length != 4) {
      throw new Error (`The acronym "${data.acronym}" is invalid. It must consist of 4 letters`)
    }
    
    const project = new Project(data, id)
    this.list.push(project)
    this.onProjectCreated(project)
    return project
  }

  filterProjects(value: string) {
    const filteredProjects = this.list.filter((project) => {
      return project.name.includes(value)
    })
    return filteredProjects
  }

  // private setDetailsPage(project: Project) {
  //   const detailsPage = document.getElementById("project-details")
  //   if (!detailsPage) {return}

  //   //Flexible progress bar - abhängig vom progress value
  //   const progressBar = detailsPage.querySelector("[data-project-info='progressBar']") as HTMLDivElement
  //   const progressContainer = detailsPage.querySelector("[data-project-info='progressContainer']") as HTMLDivElement
  //   if (progressBar && progressContainer) {
  //     const progress = project.progress
  //     const progressRest = 100-progress

  //     if (progressBar && progressContainer) {
  //       // Ausgangswert
  //       progressBar.textContent = ""
  //       progressContainer.textContent = ""
  //       progressBar.style.width = progress.toFixed(0)+"%"
  //       progressContainer.style.width = progressRest.toFixed(0)+"%"
  //       progressBar.style.backgroundColor = "rgba(36, 218, 60, 0.795)"

  //       // Darstellungsanpassung je nach Fortschritt
  //       if (progress >= 15 && progress <= 100) {
  //         progressBar.textContent = progress.toFixed(0)+"%"
  //       } else if (2 <= progress && progress < 15) {
  //         progressContainer.textContent = progress.toFixed(0)+"%"
  //       } else if (0 <= progress && progress < 2) {
  //         progressBar.style.width = "2%"
  //         progressBar.style.backgroundColor = "var(--primary-green-400)"
  //         progressContainer.style.width = "98%"
  //         progressContainer.textContent = "0%"
  //       } else {
  //         console.log(`The project ${project.name} has an invalid progress value of: ${project.progress}`)
  //       }
  //     }
  //   }

  //   //Handeling the Name - Comes twice (In header and details card)
  //   const nameList = detailsPage.querySelectorAll("[data-project-info='name']")
  //   if (nameList) {
  //     nameList.forEach(name => {
  //       name.textContent = project.name
  //     })
  //   }

  //   //Function that handles all querys that occur once
  //   function updateDetailsPage(project, propertyList) {

  //     const dateElement = detailsPage?.querySelector(`[data-project-info='finishDate']`) as HTMLElement
  //     try {
  //       const date = project.finishDate as Date
  //       const newDate = date.toLocaleDateString('de-DE')
  //       dateElement.textContent = newDate
  //     } catch (err) {
  //       console.log(err, `The finishDate was causing issues: "${project.finishDate}"`)
  //     }

  //     const logoElement = detailsPage?.querySelector(`[data-project-info='logoColor']`) as HTMLElement
  //     try {
  //       logoElement.style.backgroundColor = project.logoColor
  //     } catch (err) {
  //       console.log(err, `The logoColor was causing issues: "${project.logoColor}"`)
  //     }

  //     propertyList.forEach(property => {
  //       const attribute = `data-project-info='${property}'`
  //       const element = detailsPage?.querySelector(`[${attribute}]`) as HTMLElement
  //       if (element && project[property]) {
  //         try {
  //           element.textContent = project[property]
  //           console.log(project[property])
  //         } catch (err) {
  //           console.log(err, `The following property was causing issues: ${property}`)
  //         }
  //       }
  //     })}
  //   //List of properties to be iterated through (adaptable)
  //   const propertiesToUpdate = [
  //     "acronym", 
  //     "description", 
  //     "projectStatus", 
  //     "businessUnit", 
  //     "contactPerson", 
  //   ]
  //   updateDetailsPage(project, propertiesToUpdate)
  // }

  // private setDetailsPageTasks() {
  //   const detailsPage = document.getElementById("project-details")
  //   if (!detailsPage) {return}

  //   const taskList = document.getElementById("task-list") as HTMLDivElement
  //   taskList.innerHTML = ``
  //   const project = this.getProject(this.activeProjectId)
  //   if (project && project.tasks != undefined) {
  //     for (const task of project.tasks) {
  //       taskList.append(task.ui)
  //     }
  //   }
  // }

  updateProjects(firebaseProjects: Firestore.QuerySnapshot<IProject, Firestore.DocumentData>, newData: Partial<Project>) {
    for (const doc of firebaseProjects.docs) {
      const data = doc.data()
      const project: IProject = {
        ...data,
        finishDate: (data.finishDate as unknown as Firestore.Timestamp).toDate()
      }
      try {
        this.updateProjectData(project, doc.id)
      } catch (error) {
        console.log(error)
      }
    }
  }
  
  async updateProjectData(newData: Partial<Project>, id: string) {
    const project = this.getProject(id)
    if (!project) {return}
    for (const key in newData) {
      if (newData.hasOwnProperty(key) && project[key]) {
        project[key] = newData[key]
        if (typeof newData.name =="string" && newData.name.length<5) {throw new Error(`The name "${newData.name}" is invalid. Name must contain at least 5 characters`)}
        if (typeof newData.acronym =="string" && newData.acronym.length!=4) {throw new Error(`The acronym "${newData.acronym}" is invalid. It must consist of 4 letters`)}
      }
    }
  }

  updateByImport(project, newData: Partial<Project>) {
    for (const key in newData) {
      if (newData.hasOwnProperty(key) && project[key]) {
        if (key == "finishDate" && newData.finishDate instanceof Date) {
          const dateVaule = newData?.finishDate.toISOString().split('T')[0]
          project[key] = dateVaule
        } else {
          project[key] = newData[key]
          if (typeof newData.name =="string" && newData.name.length<5) {throw new Error(`The name "${newData.name}" is invalid. Name must contain at least 5 characters`)}
          if (typeof newData.acronym =="string" && newData.acronym.length!=4) {throw new Error(`The acronym "${newData.acronym}" is invalid. It must consist of 4 letters`)}
        }
      }
    }
  }

  setActiveProjectId (id: string) {
    this.activeProjectId = id
  }

  getProject(id: string) {
    const project = this.list.find((project) => project.id === id)
    if (!project) {return}
    return project
  }

  deleteProject(id: string) {
    const project = this.getProject(id)
    if (!project) {return}
    const remaining = this.list.filter((project) => project.id !== id)
    this.list = remaining
    this.onProjectDeleted(id)
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
      const newProjects: Project[] = JSON.parse(json as string)
      console.log("THIS IS parsedJSON: ", newProjects)

      const existingProjectNames = this.list.map((project) => {
        return project.name})
      const existingProjectsId = this.list.map((project) => {
        return project.id})

      for (const project of newProjects) {
        try {
          if (existingProjectNames.includes(project.name) && !existingProjectsId.includes(project.id)) {
          throw new Error(`Ein Projekt mit dem namen ${project.name} ist bereits vorhanden`)
        } else if (existingProjectsId.includes(project.id)) {
          const oldProject = this.getProject(project.id)
          this.updateByImport(oldProject, project)
          // oldProject?.updateUI()
        } else {
          this.newProject(project)
          console.log()
        } 
      } catch (err) {
        console.log(`${err}`)
        window.alert(`Import nicht möglich: ${err}`)
        continue
      }}
    })
    input.click()
  }
}
