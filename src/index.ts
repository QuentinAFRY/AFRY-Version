import { IProject, BusinessUnit, ProjectStatus } from "./classes/Project";
import { ProjectsManager } from "./classes/ProjectsManager";

function toggleModal(id: string) {
  const modal = document.getElementById(id);
  if (modal && modal instanceof HTMLDialogElement) {
    modal.open? modal.close() : modal.showModal()
  } else {
    console.warn("The provided modal wasn't found in the DOM. ID: ", id);
  }
}

const projectsListUI = document.getElementById("projects-list") as HTMLElement;
const projectsManager = new ProjectsManager(projectsListUI);

const newProjectBtn = document.getElementById("new-project-btn");
if (newProjectBtn) {
  newProjectBtn.addEventListener("click", () => {
    toggleModal("new-project-modal");
  });
} else {
  console.warn("New projects button was not found...");
}

const defaultProject = projectsManager.defaultProject;
defaultProject();

const projectForm = document.getElementById("new-project-form") as HTMLFormElement;
const cancelProjectBtn = document.getElementById("cancel-project-btn") as HTMLButtonElement;

if (projectForm && projectForm instanceof HTMLFormElement) {
  projectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(projectForm);

    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      businessUnit: formData.get("businessUnit") as BusinessUnit,
      projectStatus: formData.get("projectStatus") as ProjectStatus,
      finishDate: new Date(formData.get("finishDate") as string),
    };

    try {
      const project = projectsManager.newProject(projectData);
      toggleModal("new-project-modal");
      projectForm.reset();
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