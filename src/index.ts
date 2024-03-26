import { IProject, BusinessUnit, ProjectStatus } from "./classes/Project"
import { ProjectsManager } from "./classes/ProjectsManager"
import { IProjectTask, TaskLogo, TaskStatus } from "./classes/ProjectTask"
import * as THREE from "three"
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import {GUI} from "three/examples/jsm/libs/lil-gui.module.min"

const projectsListUI = document.getElementById("projects-list") as HTMLElement
const projectsManager = new ProjectsManager(projectsListUI)

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

function getProjectFormData(form: HTMLFormElement) {
  const formData = new FormData(form);
  const formDate = new Date(formData.get("finishDate") as string)
 

  const projectData: IProject = {
    acronym: formData.get("acronym") as string,
    name: formData.get("name") as string,
    description: String(formData.get("description") || "...add a project description"),
    businessUnit: formData.get("businessUnit") as BusinessUnit,
    projectStatus: formData.get("projectStatus") as ProjectStatus,
    finishDate:  isNaN(formDate.getDate())? new Date() : formDate,
    progress: Number(formData.get("progress") ?? 0)
  }
  return projectData
}

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


// Neues Projekt erstellen

const newProjectBtn = document.getElementById("new-project-btn") as HTMLButtonElement
newProjectBtn? newProjectBtn.addEventListener("click", () => {
    toggleModal("new-project-modal")})
    :console.warn("New projects button was not found...")

const newProjectForm = document.getElementById("new-project-form") as HTMLFormElement;
const cancelProjectAddBtn = document.getElementById("cancel-project-btn") as HTMLButtonElement;

if (newProjectForm && newProjectForm instanceof HTMLFormElement) {
  newProjectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const projectData = getProjectFormData(newProjectForm)

    try {
      const project = projectsManager.newProject(projectData);
      toggleModal("new-project-modal");
      newProjectForm.reset();
      console.log(project);
    } catch (err) {
      errorPopUp(err)
    }
  })

  const errorBtn = document.getElementById("error-dialog-btn") as HTMLButtonElement
  errorBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    toggleModal("error-dialog");
  })

  cancelProjectAddBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    toggleModal("new-project-modal");
  })
} else {
  console.warn("The project form was not found. Check the ID!");
}


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

/*----------ThreeJs Viewer----------*/

// set up scene and DOMcontainer
const scene = new THREE.Scene()
const viewerContainer = document.getElementById("viewer-container") as HTMLDivElement

// set up camera and controls
const camera = new THREE.PerspectiveCamera(75)
camera.position.z = 5
const cameraControls = new OrbitControls(camera, viewerContainer)

// set up renderer
const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true})
viewerContainer.append(renderer.domElement)

function resizeViewer() {
  const containerDimensions = viewerContainer.getBoundingClientRect()
  renderer.setSize(containerDimensions.width, containerDimensions.height)
  const aspectRatio = containerDimensions.width / containerDimensions.height
  camera.aspect = aspectRatio
  camera.updateProjectionMatrix()
}
window.addEventListener("resize", resizeViewer)
resizeViewer()

// set up simple cube object
const cubeColor = new THREE.Color( 0xf69104 )
const boxGeometry = new THREE.BoxGeometry()
const material = new THREE.MeshStandardMaterial({color: cubeColor, roughness: 0.4, metalness: 0.5, fog: true})
const cube = new THREE.Mesh(boxGeometry, material)
scene.add(cube)

// set up Lighting
const white = new THREE.Color(0xffffff)
const directionalLight = new THREE.DirectionalLight(white, 0.5)
const ambientLight = new THREE.AmbientLight(white, 0.7)
directionalLight.position.set(0, 3, 0)
const pointLight = new THREE.PointLight(white, 2, 3, 0.1)
pointLight.position.set(0, 1.5, 1.5)
scene.add(directionalLight, ambientLight, pointLight)

// set up render-loop for responsiveness (60fps)
function renderScene() {
  renderer.render(scene, camera)
  requestAnimationFrame(renderScene)
}
renderScene()

// set up helpers
const axesHelper = new THREE.AxesHelper(5)
const grid = new THREE.GridHelper(10, 10)
grid.material.transparent = true
grid.material.opacity = 0.4
grid.material.color = new THREE.Color("#204080")
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight,5)
const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.5)
scene.add(axesHelper, grid, directionalLightHelper, pointLightHelper)

// set up GUI 
const gui = new GUI()
const gridControls = gui.addFolder("Grid")
gridControls.add(grid.material, "transparent")
gridControls.add(grid.material, "opacity")
gridControls.addColor(grid.material, "color")
const cubeControls = gui.addFolder("Cube")
cubeControls.add(cube.position, "x", -5, 5, 1)
cubeControls.add(cube.position, "y", -5, 5, 1)
cubeControls.add(cube.position, "z", -5, 5, 1)
cubeControls.addColor(cube.material, "color")
cubeControls.add(cube.material, "roughness", 0, 1, 0.1)
cubeControls.add(cube.material, "metalness", 0, 1, 0.1)
const dLightControls = gui.addFolder("Direct Light")
dLightControls.add(directionalLight.position, "x", -3, 3, 0.5)
dLightControls.add(directionalLight.position, "y", -3, 3, 0.5)
dLightControls.add(directionalLight.position, "z", -3, 3, 0.5)
dLightControls.add(directionalLight, "intensity",  0, 1, 0.1)
dLightControls.addColor(directionalLight, "color")
const pLightControls = gui.addFolder("Point Light")
pLightControls.add(pointLight.position, "x", -5, 5, 1)
pLightControls.add(pointLight.position, "y", -5, 5, 1)
pLightControls.add(pointLight.position, "z", -5, 5, 1)
pLightControls.add(pointLight, "intensity", 0, 5, 0.5)
pLightControls.add(pointLight, "decay", 0, 0.5, 0.01)
pLightControls.addColor(pointLight, "color")