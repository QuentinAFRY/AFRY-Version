import * as React from 'react';
import * as Router from 'react-router-dom';
import { ProjectsManager } from '../../classes/ProjectsManager';
import { ProjectDetails } from './ProjectDetails';
import { ProjectTasks } from './ProjectTasks';
import { IFCViewer } from './IFCViewer';
import { EditProjectForm } from '../dialog-content/EditProjectForm';
import { deleteDocument } from '../../firebase';
import { AddTaskForm } from '../dialog-content/AddTaskForm';
import useModal from '../dialog-content/useModal';

interface Props {
  projectsManager: ProjectsManager
}


export function ProjectDetailsPage(props: Props) {
  const routeParams = Router.useParams<{id: string}>()        // the generic type "here id: string" should always be the same as <Router.Route path="/projects/:id" 
  if (!routeParams.id) {return <div>Project not found</div>}
  const project = props.projectsManager.getProject(routeParams.id)
  if (!project) {return <div>Project not found</div>}

  const dialogRef = React.useRef<HTMLDialogElement | null>(null)
  const [dialogContent, setDialogContent] = React.useState<React.ReactNode>(null);


  // function toggleDialog(content: React.ReactNode) {
  //     setDialogContent(content)
  //     if(!dialogRef.current) {
  //         return
  //     }
  //     dialogRef.current.hasAttribute("open")
  //       ? dialogRef.current.close()
  //       : dialogRef.current.showModal()
  // }

  const navigateTo = Router.useNavigate()
  props.projectsManager.onProjectDeleted = async (id) => {
    await deleteDocument("/projects", id)
    navigateTo("/")
  }

  const [isShowingModal, toggleModal] = useModal()

  return(
    <>
      <dialog ref={dialogRef}>
        <EditProjectForm project={project} show={isShowingModal} onCloseButtonClick={toggleModal} />
      </dialog>
      <div className="page" id="project-details">
        <header>
          <div>
            <h2 data-project-info="name">Empty</h2>
            <p data-project-info="headerDescription">Kurze Projektbeschreibung</p>
          </div>
          <button onClick={() => {props.projectsManager.deleteProject(project.id)}} style={{backgroundColor: "orange", borderRadius: "5px", height: "50%", padding: "5px", color: "black"}}>Delete Project</button>
        </header>
        <div className="main-page-content">
          <div style={{ display: "flex", flexDirection: "column", rowGap: 30 }}>
            <ProjectDetails project={project} onEditButtonClick={toggleModal}/>
            <ProjectTasks project={project} openAddTaskModal={toggleModal}/>
          </div>
          <IFCViewer />
        </div>
        <dialog ref={dialogRef}>
          {dialogContent}
        </dialog>
      </div>
    </>
  )
}