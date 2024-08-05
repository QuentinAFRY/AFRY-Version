import * as React from 'react';
import { IProject, BusinessUnit, ProjectStatus } from "../classes/Project"
import { ProjectsManager } from "../classes/ProjectsManager"
import { errorPopUp } from '..';

export function ProjectsPage() {
    const projectsManager = new ProjectsManager();

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

    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newProjectForm = document.getElementById("new-project-form") as HTMLFormElement;
        const projectData = getProjectFormData(newProjectForm)

        try {
            const project = projectsManager.newProject(projectData);
            console.log()
            const modal = document.getElementById("new-project-modal")
            if (!(modal && modal instanceof HTMLDialogElement)) {return}
            modal.close()
            newProjectForm.reset();
        } catch (err) {
            errorPopUp(err)
        }
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
          <div style={{ display: "flex", gap: 20 }}>
            <span
              style={{ border: "solid 1px var(--primary-grey-200)" }}
              id="import-projects-btn"
              className="material-symbols-outlined"
            >
              upload
            </span>
            <span
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
        <div id="projects-list" />
      </div>      
    )
}