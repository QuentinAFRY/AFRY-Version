import * as OBC from "openbim-components";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Sidebar } from "./react-components/Sidebar";
import { ProjectsPage } from "./react-components/ProjectsPage";
import { SimpleQTO } from './bim-components/SimpleQTO/index';
import { IProject, BusinessUnit, ProjectStatus } from "./classes/Project"
import { ProjectsManager } from "./classes/ProjectsManager"
import { FragmentsGroup, IfcProperties } from "bim-fragment";
import { IProjectTask, TaskLogo, TaskStatus } from "./classes/ProjectTask"

import { TodoCreator } from "./bim-components/TodoCreator";
import { fragImportHandler } from "./classes/fragImport/fragImporter";

const rootElement = document.getElementById("app") as HTMLDivElement
const appRoot = ReactDOM.createRoot(rootElement)
appRoot.render(
  <>
    <Sidebar />
    <ProjectsPage />
  </>
)

const projectsListUI = document.getElementById("projects-list") as HTMLElement
const projectsManager = new ProjectsManager()

const defaultProject = projectsManager.defaultProject
defaultProject()

export function toggleModal(id: string) {
  const modal = document.getElementById(id)
  if (modal && modal instanceof HTMLDialogElement) {
    modal.open? modal.close() : modal.showModal()
    console.log(`The Modal ${modal} was toggled`)
  } else {
    console.warn("The provided modal wasn't found in the DOM. ID: ", id)
  }
}

// function getProjectFormData(form: HTMLFormElement) {
//   const formData = new FormData(form);
//   const formDate = new Date(formData.get("finishDate") as string)
 

//   const projectData: IProject = {
//     acronym: formData.get("acronym") as string,
//     name: formData.get("name") as string,
//     description: String(formData.get("description") || "...add a project description"),
//     businessUnit: formData.get("businessUnit") as BusinessUnit,
//     projectStatus: formData.get("projectStatus") as ProjectStatus,
//     finishDate:  isNaN(formDate.getDate())? new Date() : formDate,
//     progress: Number(formData.get("progress") ?? 0)
//   }
//   return projectData
// }

function getTaskFormData(form: HTMLFormElement) {
  const formData = new FormData(form);
  const formDate = new Date(formData.get("finishDate") as string)
  let competenceArea: TaskLogo = "construction"

  switch(formData.get("taskLogo") as string) {
    case "Engineering":
      competenceArea="construction"
      break
    case "BIM":
      competenceArea="view_in_ar"
      break
    case "Documentation":
      competenceArea="description"
      break
    case "Sustainability":
      competenceArea="compost"
      break
  }
 

  const taskData: IProjectTask = {
    name: formData.get("name") as string,
    description: formData.get("description") as string || undefined,
    taskLogo: competenceArea,
    creationDate: new Date(),
    finishDate: isNaN(formDate.getDate())? undefined : formDate,
    taskStatus: "open"
  }
  
  return taskData
}

export function errorPopUp(error: string) {
  toggleModal("error-dialog")
  const errorMessage = document.getElementById("error-message") as HTMLParagraphElement
  errorMessage.textContent = error
}

// Projects overwiew - Functionalities
const exportProjectsBtn = document.getElementById("export-projects-btn")
if (exportProjectsBtn) {
  exportProjectsBtn.addEventListener("click", (e) => {
    projectsManager.exportToJSON()
  })
}

const importProjectsBtn = document.getElementById("import-projects-btn")
if (importProjectsBtn) {
  importProjectsBtn.addEventListener("click", () => {
    try {
      projectsManager.importFromJSON()
    } catch (err) {
      errorPopUp(err)
    }
  })
}

const sidebarProjectsBtn = document.getElementById("side-bar-projects")
const projectsPage = document.getElementById("projects-page")
const detailsPage = document.getElementById("project-details")

if (sidebarProjectsBtn) {
  sidebarProjectsBtn.addEventListener("click", () => {
    if (!projectsPage) {
      console.log(`"Projects Page" not found!`)
      return
    } else if (!detailsPage) {
      console.log(`"Details Page" not found!`)
      return
    } else {
      detailsPage.style.display = "none"
      projectsPage.style.display = "flex"
    }
  })
}

const errorBtn = document.getElementById("error-dialog-btn") as HTMLButtonElement
errorBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  toggleModal("error-dialog");
})


// Edit Project in the Details Page
const editProjectBtn = document.getElementById("edit-project-button") as HTMLButtonElement
const editProjectForm = document.getElementById("edit-project-form") as HTMLFormElement

const cancelProjectEditBtn = document.getElementById("cancel-project-edit-btn") as HTMLButtonElement;

if (editProjectBtn) {
  editProjectBtn.addEventListener("click", () => {
    const projectId = projectsManager.activeProjectId
    const projectData = projectsManager.getProject(projectId)
    console.log(projectData)
    
    editProjectForm.elements["acronym"].value = projectData?.acronym
    editProjectForm.elements["name"].value = projectData?.name
    editProjectForm.elements["description"].value = projectData?.description
    editProjectForm.elements["businessUnit"].value = projectData?.businessUnit
    editProjectForm.elements["projectStatus"].value = projectData?.projectStatus
    editProjectForm.elements["progress"].value = projectData?.progress
    if (projectData?.finishDate instanceof Date) {
      editProjectForm.elements["finishDate"].value = projectData?.finishDate.toISOString().split('T')[0]
    }
    toggleModal("edit-project-modal")
  })

  cancelProjectEditBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    toggleModal("edit-project-modal");
  })
} else {
  console.warn("Edit projects button was not found...")
}

if (editProjectForm && editProjectForm instanceof HTMLFormElement) {
  editProjectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = getProjectFormData(editProjectForm)
    const projectId = projectsManager.activeProjectId
    const project = projectsManager.getProject(projectId)

    try {
      projectsManager.updateProjectData(project, formData)
      project?.updateUI()
      toggleModal("edit-project-modal");
      editProjectForm.reset();
    } catch (err) {
      errorPopUp(err)
    }
})}

// Adding and editing Tasks in Project Details

const addTaskBtn = document.getElementById("add-task-btn")
const taskContainer = document.getElementById("task-list") as HTMLDivElement
const taskModal = document.getElementById("task-modal")
const taskForm = document.getElementById("task-form") as HTMLFormElement

const cancelTaskAddBtn = document.getElementById("cancel-task-btn") as HTMLButtonElement;

if (addTaskBtn && taskModal) {
  addTaskBtn.addEventListener("click", () => {
    toggleModal("task-modal")
  })
}

if (taskForm && taskForm instanceof HTMLFormElement) {
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const taskFormData = getTaskFormData(taskForm)
    const projectId = projectsManager.activeProjectId
    const project = projectsManager.getProject(projectId)

    if (project && taskFormData)
      try {
        project.newTask(taskFormData, taskContainer)
        console.log(projectsManager.getProjectList())
        toggleModal("task-modal");
        taskForm.reset();
        console.log("done");
      } catch (err) {
        errorPopUp(err)
      }
  })

  cancelTaskAddBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    toggleModal("task-modal");
  })
}

/**
 * START OF COMPONENTS
 */

const viewer = new OBC.Components()

const sceneComponent = new OBC.SimpleScene(viewer)
viewer.scene = sceneComponent
const scene = sceneComponent.get()
sceneComponent.setup()
scene.background = null

const viewerContainer = document.getElementById("viewer-container") as HTMLDivElement
const rendererComponent = new OBC.PostproductionRenderer(viewer, viewerContainer)
viewer.renderer = rendererComponent

const cameraComponent = new OBC.OrthoPerspectiveCamera(viewer)
viewer.camera = cameraComponent

const raycasterComponent = new OBC.SimpleRaycaster(viewer)
viewer.raycaster = raycasterComponent

viewer.init()
cameraComponent.updateAspect()
rendererComponent.postproduction.enabled = true

function exportProperties(model: FragmentsGroup) {
  const fragmentProperties = JSON.stringify(model.getLocalProperties())
  const blob = new Blob ([fragmentProperties], {type: 'application/json'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  if (model.name) {
    a.download = `${model.name.replace(".ifc", "")}.json`
  } else {
    a.download = `model`
  }
  a.click()
  URL.revokeObjectURL(url)
}

const fragmentManager = new OBC.FragmentManager(viewer)
function exportFragments(model: FragmentsGroup) {
  const fragmentBinary = fragmentManager.export(model)
  const blob = new Blob ([fragmentBinary])
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  if (model.name) {
    a.download = `${model.name.replace(".ifc", "")}.frag`
  } else {
    a.download = `model.frag`
  }
  a.click()
  URL.revokeObjectURL(url)
}

const ifcLoader = new OBC.FragmentIfcLoader(viewer)
ifcLoader.settings.wasm = {
  path: "https://unpkg.com/web-ifc@0.0.53/",
  absolute: true,
}

const highlighter = new OBC.FragmentHighlighter(viewer)
highlighter.setup()

const propertiesProcessor = new OBC.IfcPropertiesProcessor(viewer)
highlighter.events.select.onClear.add(() => {
  propertiesProcessor.cleanPropertiesList()
})

const classifier = new OBC.FragmentClassifier(viewer)
const classificationWindow = new OBC.FloatingWindow(viewer)
classificationWindow.visible = false
viewer.ui.add(classificationWindow)
classificationWindow.title = "Model Groups"

const classificationsBtn = new OBC.Button(viewer)
classificationsBtn.materialIcon = "account_tree"
classificationsBtn.onClick.add(() => {
  classificationWindow.visible = !classificationWindow.visible
  classificationWindow.active = classificationWindow.visible
})

async function createModelTree() {
  const fragmentTree = new OBC.FragmentTree(viewer)
  fragmentTree.init()
  await fragmentTree.update(["model", "storeys", "entities"])
  fragmentTree.onHovered.add((fragmentMap) => {
    highlighter.highlightByID("hover", fragmentMap.items)
  })
  fragmentTree.onSelected.add((fragmentMap) => {
    highlighter.highlightByID("select", fragmentMap.items)
  })
  const tree = fragmentTree.get().uiElement.get("tree")
  return tree
}

const culler = new OBC.ScreenCuller(viewer)
culler.setup()
cameraComponent.controls.addEventListener("sleep", () => {
  culler.elements.needsUpdate = true
})

async function onModelLoaded(model: FragmentsGroup) {
  highlighter.updateHighlight()
  for (const fragment of model.items) {
    culler.elements.add(fragment.mesh)
  }
  culler.elements.needsUpdate = true


  try {
    classifier.byModel(model.name, model)
    classifier.byStorey(model)
    classifier.byEntity(model)
    const tree = await createModelTree()
    await classificationWindow.slots.content.dispose(true)
    classificationWindow.addChild(tree)

    propertiesProcessor.process(model)
    highlighter.events.select.onHighlight.add((fragmentMap) => {
      const expressID = [...Object.values(fragmentMap)[0]][0]
      const Bauteil = model.getObjectByProperty("expressID", expressID)
      propertiesProcessor.renderProperties(model, Number(expressID))
    })
  } catch (error) {
    alert(error)
  }  
}

ifcLoader.onIfcLoaded.add(async (model) => {
  exportProperties(model)
  exportFragments(model)
  onModelLoaded(model)
})

let tempProperties : IfcProperties = {}

const importFragmentBtn = new OBC.Button(viewer)
importFragmentBtn.materialIcon = "upload"
importFragmentBtn.tooltip = "Load FRAG"

fragImportHandler(importFragmentBtn, fragmentManager, tempProperties, (properties) => {
  tempProperties = properties
  console.log("Properties updated: ", properties)
})

fragmentManager.onFragmentsLoaded.add((model) => {
  setTimeout(() => {
    console.log("Fragments loaded: ", model)
    if (tempProperties) {
      model.setLocalProperties(tempProperties)
    } else {
      alert("No properties loaded")
    }
    onModelLoaded(model)
  }, 1000)
})

const todoCreator = new TodoCreator(viewer)
todoCreator.setup()

const simpleQto = new SimpleQTO(viewer)
simpleQto.setup()

const propsFinder = new OBC.IfcPropertiesFinder(viewer)
propsFinder.init()
propsFinder.uiElement.get("queryWindow").get().style.justifyContent = "flex-start"
propsFinder.onFound.add((fragmentIDMap) => {
  highlighter.highlightByID("select", fragmentIDMap)
})


const toolbar = new OBC.Toolbar(viewer)
toolbar.addChild(
  ifcLoader.uiElement.get("main"),
  importFragmentBtn,
  classificationsBtn,
  propertiesProcessor.uiElement.get("main"),
  fragmentManager.uiElement.get("main"),
  propsFinder.uiElement.get("main"),
  todoCreator.uiElement.get("activationButton"),
  simpleQto.uiElement.get("activationBtn")
)
viewer.ui.addToolbar(toolbar)