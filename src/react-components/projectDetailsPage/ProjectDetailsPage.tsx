import * as React from 'react';
import * as Router from 'react-router-dom';
import { ProjectsManager } from '../../classes/ProjectsManager';
import { ProjectDetails } from './ProjectDetails';
import { ProjectTasks } from './ProjectTasks';
import { IFCViewer } from './IFCViewer';
import { EditProjectForm } from '../dialog-content/EditProjectForm';
import { deleteDocument, updateDocument } from '../../firebase';
import { AddTaskForm } from '../dialog-content/AddTaskForm';
import { IProject, Project } from '../../classes/Project';
import { getDocument } from '../../firebase';
import { sub } from 'three/examples/jsm/nodes/Nodes.js';

interface Props {
  projectsManager: ProjectsManager
}


export function ProjectDetailsPage(props: Props) {
  const routeParams = Router.useParams<{id: string}>()        // the generic type "here id: string" should always be the same as <Router.Route path="/projects/:id" 
  if (!routeParams.id) {return <div>Project not found</div>}
  const currentProject = props.projectsManager.getProject(routeParams.id)
  if (!currentProject) {return <div>Project not found</div>}

  const [projectState, setProject] = React.useState<Project>(currentProject)
  
  const [dialogContent, setDialogContent] = React.useState<React.JSX.Element | null>(null);
  const dialogRef = React.useRef<HTMLDialogElement | null>(null)


  const submitEditProjectForm = async (newProjectData: IProject) => {
    try {
      await props.projectsManager.updateProjectData(newProjectData, projectState.id);
      await updateDocument<Partial<IProject>>("/projects", projectState.id, newProjectData);
      
      const updatedProject = props.projectsManager.getProject(projectState.id);
      if (updatedProject) {
        console.log("State changed")
        setProject({...updatedProject} as Project);
      } else {
        console.error("Project not found");
      }
    
      dialogRef.current?.close();
    } catch (error) {
      console.error("Error updating project:", error);
    }
  }

  const openEditProjectDialog = () => {
    setDialogContent(
      <EditProjectForm 
        project={projectState}
        passFormData={submitEditProjectForm}
      />
    )
    dialogRef.current?.showModal()
  }

  const navigateTo = Router.useNavigate()
  props.projectsManager.onProjectDeleted = async (id) => {
    await deleteDocument("/projects", id)
    navigateTo("/")
  }

  return(
    <>
      <dialog ref={dialogRef}>
        {dialogContent}
      </dialog>
      <div className="page" id="project-details">
        <header>
          <div>
            <h2 data-project-info="name">Empty</h2>
            <p data-project-info="headerDescription">Kurze Projektbeschreibung</p>
          </div>
          <button onClick={() => {props.projectsManager.deleteProject(projectState.id)}} style={{backgroundColor: "orange", borderRadius: "5px", height: "50%", padding: "5px", color: "black"}}>Delete Project</button>
        </header>
        <div className="main-page-content">
          <div style={{ display: "flex", flexDirection: "column", rowGap: 30 }}>
            <ProjectDetails project={projectState} onEditButtonClick={openEditProjectDialog} />
            <ProjectTasks project={projectState} openAddTaskModal={()=>{}}/>
          </div>
          <IFCViewer />
        </div>
      </div>
    </>
  )
}