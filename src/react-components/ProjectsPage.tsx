import * as React from 'react';
import * as Router from 'react-router-dom';
import * as Firestore from 'firebase/firestore';
import { Project, IProject, BusinessUnit, ProjectStatus } from "../classes/Project"
import { ProjectsManager } from "../classes/ProjectsManager"
import { SearchBar } from './SearchBar';
import { ProjectCard } from './ProjectCard';
import { firebaseDB } from '../firebase';
import { getCollection } from '../firebase';

interface Props {
  projectsManager: ProjectsManager
}

const projectsCollection = getCollection<IProject>("/projects")

export function ProjectsPage(props: Props) {

  // React State, legt fest das die Liste der Projekte als State gespeichert wird
  const [projects, setProjects] = React.useState<Project[]>(props.projectsManager.list)

  // Event Callbacks die eine State-Anderung triggern
  props.projectsManager.onProjectCreated = () => {setProjects([...props.projectsManager.list])}

  const getFirestoreProjects = async () => {
    const firebaseProjects = await Firestore.getDocs(projectsCollection)
    for (const doc of firebaseProjects.docs) {
      const data = doc.data()
      const project: IProject = {
        ...data,
        finishDate: (data.finishDate as unknown as Firestore.Timestamp).toDate()
      }
      try {
        props.projectsManager.newProject(project, doc.id)
      } catch (error) {
        console.log(error)
      }
    }
  }

  React.useEffect(() => {
    getFirestoreProjects()
  }, [])

  // Wert der die aktuellen Projekt Cards enthält - mit dem Key der Projekt ID
  const projectCards = projects.map((project) => {
    return (
      <Router.Link to={`/projects/${project.id}`} key={project.id}>
        <ProjectCard project={project}/>
      </Router.Link>
    )
  })

  // React Event das triggert sobald der State updated wird: Sobald projects sich ändert, wird useEffect{} getriggert
  React.useEffect(() => {
    console.log("Project status updated", projects)
  }, [projects])

  const onNewProjectClick = () => {
      const modal = document.getElementById("new-project-modal")
      if (!(modal && modal instanceof HTMLDialogElement)) {return}
      modal.showModal()
  }

  const getProjectFormData = (form: HTMLFormElement) => {
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

  const onImportProjects = () => {
    try {
      props.projectsManager.importFromJSON()
    } catch (err) {
      console.log(err)
      // errorPopUp(err)
    }
  }

  const onExportProjects = () => {
    try {
      props.projectsManager.exportToJSON()
    } catch (err) {
      console.log(err)
      // errorPopUp(err)
    }
  }

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const newProjectForm = document.getElementById("new-project-form") as HTMLFormElement;
      const projectData = getProjectFormData(newProjectForm)

      try {
          Firestore.addDoc(projectsCollection, projectData)
          const project = props.projectsManager.newProject(projectData);
          console.log()
          const modal = document.getElementById("new-project-modal")
          if (!(modal && modal instanceof HTMLDialogElement)) {return}
          modal.close()
          newProjectForm.reset();
      } catch (err) {
          console.log(err)
      }
  }

  const onProjectSearch = (value: string) => {
    setProjects(props.projectsManager.filterProjects(value))
  }
  
  return (
      <div className="page" id="projects-page">
      <dialog id="new-project-modal">
        <form onSubmit={(e) => onFormSubmit(e)} id="new-project-form">
          <p className="form-title">Create new project</p>
          <div className="form-main">
            <div className="form-basic-container">
              <div className="form-input">
                <input
                  required={true}
                  type="text"
                  name="name"
                  autoComplete="off"
                  placeholder="What's the name of your project?"
                  className="form-input-text"
                />
                <label className="form-input-label">
                  <span className="material-icons-sharp"> apartment </span>Project
                  name{" "}
                </label>
              </div>
            </div>
            <div className="form-basic-container">
              <div className="form-input">
                <input
                  type="text"
                  minLength={4}
                  maxLength={4}
                  name="acronym"
                  placeholder="Choose acronym of 4 letters"
                  autoComplete="off"
                  className="form-input-text"
                />
                <label className="form-input-label">
                  <span className="material-icons-sharp"> abc </span>Project acronym{" "}
                </label>
              </div>
            </div>
            <div className="form-basic-container">
              <div className="form-input">
                <textarea
                  name="description"
                  cols={30}
                  rows={3}
                  placeholder="Give your project a nice description!"
                  autoComplete="off"
                  className="form-input-text"
                  defaultValue={""}
                />
                <label className="form-input-label">
                  <span className="material-icons-sharp" style={{ scale: 1 }}>
                    {" "}
                    edit_note{" "}
                  </span>
                  Description{" "}
                </label>
              </div>
            </div>
            <div className="form-basic-container">
              <div className="form-input">
                <select name="businessUnit" className="form-input-other">
                  <option value="n/a">N/A</option>
                  <option value="transportation">Transportation</option>
                  <option value="sustainability">Sustainability</option>
                  <option value="energy">Energy</option>
                  <option value="industrial">Industrial</option>
                </select>
                <label className="form-input-label">
                  <span className="material-icons-sharp"> manage_accounts </span>
                  Business Unit{" "}
                </label>
              </div>
            </div>
            <div className="form-basic-container">
              <div className="form-input">
                <select name="projectStatus" className="form-input-other">
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="finished">Finished</option>
                </select>
                <label className="form-input-label">
                  <span className="material-icons-sharp"> task_alt </span>Status{" "}
                </label>
              </div>
            </div>
            <div className="form-basic-container">
              <div className="form-input">
                <input name="finishDate" type="date" className="form-input-other" />
                <label className="form-input-label">
                  <span className="material-icons-sharp"> calendar_month </span>
                  Finish Date{" "}
                </label>
              </div>
            </div>
            <div className="form-basic-container">
              <div className="form-input">
                <input
                  name="progress"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Specify the current progress"
                  className="form-input-other"
                  id="form-progress"
                />
                <label className="form-input-label">
                  <span className="material-icons-sharp"> hourglass_bottom </span>{" "}
                  Project progress (%){" "}
                </label>
              </div>
            </div>
            <div style={{ borderBottom: "1px solid var(--primary-grey-200)" }} />
            <div className="form-button-container">
              <button
                type="button"
                className="form-cancel-btn"
                id="cancel-project-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="form-accept-btn"
                id="accept-project-btn"
              >
                Add project
              </button>
            </div>
          </div>
        </form>
      </dialog>
      <header>
        <h2>Projects</h2>
        <SearchBar onChange={(value) => onProjectSearch(value)}/>
        <div style={{ display: "flex", gap: 20 }}>
          <span onClick={onImportProjects}
            style={{ border: "solid 1px var(--primary-grey-200)" }}
            id="import-projects-btn"
            className="material-symbols-outlined"
          >
            upload
          </span>
          <span
            onClick={onExportProjects}
            style={{ border: "solid 1px var(--primary-grey-200)" }}
            id="export-projects-btn"
            className="material-symbols-outlined"
          >
            {" "}
            download{" "}
          </span>
          <button onClick={onNewProjectClick} id="new-project-btn">
            <span className="material-icons-sharp"> upload_file </span>New Project
          </button>
        </div>
      </header>
      {
        projects.length > 0 ? <div id="projects-list">{ projectCards }</div> : <p>No projects found</p>
      }
    </div>      
  )
}