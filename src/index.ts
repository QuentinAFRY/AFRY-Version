import { IProject, BusinessUnit, ProjectStatus } from "./classes/Project";
import { ProjectsManager } from "./classes/ProjectsManager";
import { IProjectTask, TaskLogo, TaskStatus } from "./classes/ProjectTask";

const projectsListUI = document.getElementById("projects-list") as HTMLElement;
const projectsManager = new ProjectsManager(projectsListUI);

const defaultProject = projectsManager.defaultProject;
defaultProject();

export function toggleModal(id: string) {
  const modal = document.getElementById(id);
  if (modal && modal instanceof HTMLDialogElement) {
    modal.open? modal.close() : modal.showModal()
  } else {
    console.warn("The provided modal wasn't found in the DOM. ID: ", id);
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
  projectsManager.importFromJSON()
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
const cancelProjectBtn = document.getElementById("cancel-project-btn") as HTMLButtonElement;

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
      toggleModal("error-dialog")
      const errorMessage = document.getElementById("error-message") as HTMLParagraphElement
      errorMessage.textContent = err
    }
  });

  const errorBtn = document.getElementById("error-dialog-btn") as HTMLButtonElement
  errorBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    toggleModal("error-dialog");
  })

  cancelProjectBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    toggleModal("new-project-modal");
  });
} else {
  console.warn("The project form was not found. Check the ID!");
}


// Edit Project in the Details Page
const editProjectBtn = document.getElementById("edit-project-button") as HTMLButtonElement
const editProjectForm = document.getElementById("edit-project-form") as HTMLFormElement

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
} else {
  console.warn("Edit projects button was not found...")
}

if (editProjectForm && editProjectForm instanceof HTMLFormElement) {
  editProjectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = getProjectFormData(editProjectForm)
    const projectId = projectsManager.activeProjectId
    const project = projectsManager.getProject(projectId)

    console.log("1",formData)
    console.log("2", projectId)
    console.log("3", project)

    try {
      projectsManager.updateProjectData(project, formData)
      project?.updateUI()
      toggleModal("edit-project-modal");
      editProjectForm.reset();
      console.log("1",formData)
      console.log("2", projectId)
      console.log("3", project)
    } catch (err) {
      toggleModal("error-dialog")
      const errorMessage = document.getElementById("error-message") as HTMLParagraphElement
      errorMessage.textContent = err
    }
})}

// Adding and editing Tasks in Project Details

const addTaskBtn = document.getElementById("add-task-btn")
const taskContainer = document.getElementById("task-list") as HTMLDivElement
const taskModal = document.getElementById("task-modal")
const taskForm = document.getElementById("task-form") as HTMLFormElement

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
        toggleModal("error-dialog")
        const errorMessage = document.getElementById("error-message") as HTMLParagraphElement
        errorMessage.textContent = err
      }
  })
}