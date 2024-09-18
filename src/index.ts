import { IUser, UserPermissions, UserTeams } from './classes/User';
import { User } from './classes/User';
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
    console.log(`The Modal ${modal} was toggled`)
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
const usersButton = document.getElementById('side-bar-users') as HTMLLIElement;

const projectsPage = document.getElementById("projects-page") as HTMLDivElement;
const detailsPage = document.getElementById("project-details") as HTMLDivElement;
const usersPage = document.getElementById('project-users') as HTMLDivElement;


if (sidebarProjectsBtn) {
  sidebarProjectsBtn.addEventListener("click", () => {
    if (!projectsPage || !detailsPage ||!usersPage) {
      console.log(`Projects Page" not found!`)
      return
    } 
    detailsPage.style.display = "none"
    usersPage.style.display = "none"
    projectsPage.style.display = "flex"
  })
}

if (usersButton) {
  usersButton.addEventListener('click', () => {
    if (!projectsPage || !detailsPage ||!usersPage) {
      console.log(`Some Pages are missing!`)
      return
    }
    detailsPage.style.display = "none"
    projectsPage.style.display = "none"
    usersPage.style.display = "flex"
  });
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

const newUsersBtn = document.getElementById('new-user-btn') as HTMLButtonElement;
const usersTable = document.getElementById('users-table') as HTMLTableElement;
const newUserForm = document.getElementById('new-user-form') as HTMLFormElement;
const cancelUserBtn = document.getElementById('cancel-user-btn') as HTMLButtonElement;
const userCount = document.getElementById('p-user-count') as HTMLParagraphElement;
const userList: User[] = [];

const defaultUser3: IUser = {
  name: "Jenna Müller",
  email: "jennamüller@test.com",
  permissions: "Developer",
  teams: ["Engineering", "Design"],
  imgSrc: "testicon3.jpg"
}

const defaultUser2: IUser = {
  name: "Jeff Lincoln",
  email: "jefflincoln@test.com",
  permissions: "Manager",
  teams: ["Marketing", "Management"],
  imgSrc: "TestIcon2.jpg"
}

const defaultUser1: IUser = {
  name: "Quentin Hamm",
  email: "quentinhamm@test.com",
  permissions: "Admin",
  teams: ["Engineering", "Design", "Marketing", "Sales"],
  imgSrc: "TestIcon.jpg"
}

function defaultUsers() {
  const users = [defaultUser1, defaultUser2, defaultUser3]
  users.forEach(user => {
    const newUser = new User(user);
    usersTable.appendChild(newUser.ui);
    userList.push(newUser);
  })
  userCount.textContent = `(${userList.length})`
}
defaultUsers();

if (newUsersBtn) {
  newUsersBtn.addEventListener('click', () => {
    toggleModal('new-user');
  })
}

function getUserFormData(form: HTMLFormElement) {
  const formData = new FormData(form);

  let teams: string[] = []
  const Checkboxes = document.getElementsByName("checkBoxOption")
  for (const option of Checkboxes) {
    if (option instanceof HTMLInputElement && option.checked) {
      teams.push(option.value)
  }
}
 
  const userData: IUser = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    permissions: formData.get("permissions") as UserPermissions,
    teams: teams as UserTeams[],
  }
  return userData
}

if (newUserForm && newUserForm instanceof HTMLFormElement) {
  newUserForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const userFormData = getUserFormData(newUserForm)
    try {
      const newUser = new User(userFormData)
      usersTable.appendChild(newUser.ui);
      userList.push(newUser);
      userCount.textContent = `(${userList.length})`
      toggleModal("new-user");
    } catch (err) {
      errorPopUp(err)
    }
  })
  cancelUserBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    toggleModal("new-user");
  })
}

