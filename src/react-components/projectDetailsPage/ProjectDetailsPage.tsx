import * as React from 'react';
import * as Router from 'react-router-dom';
import { ProjectsManager } from '../../classes/ProjectsManager';
import { ProjectDetails } from './ProjectDetails';
import { ProjectTasks } from './ProjectTasks';
import { IFCViewer } from './IFCViewer';
import { EditProjectForm } from '../dialog-content/EditProjectForm';
import { deleteDocument, getCollection, updateDocument } from '../../firebase';
import { IProject, Project } from '../../classes/Project';
import { ProjectTaskCard } from './ProjectTaskCard';
import { NoTasksCard } from './NoTasksCard';
import { IProjectTask, ProjectTask } from '../../classes/ProjectTask';
import * as Firestore from 'firebase/firestore';
import { cameraToFirestore, fragmentMapToFirestore } from '../../lib/utils';

interface Props {
  projectsManager: ProjectsManager
}

export interface IProjectTaskFirestore extends Omit<IProjectTask, 'fragmentMap' | 'camera'> {
  fragmentMap: {
      [key: string]: number[];
  };
  camera: {
      position: number[];
      target: number[];
  };
}

export function ProjectDetailsPage(props: Props) {
  const routeParams = Router.useParams<{id: string}>()        // the generic type "here id: string" should always be the same as <Router.Route path="/projects/:id" 
  if (!routeParams.id) {return <div>Project not found</div>}
  const currentProject = props.projectsManager.getProject(routeParams.id)
  if (!currentProject) {return <div>Project not found</div>}

  const taskPath = `/projects/${routeParams.id}/tasks`
  const taskCollection = getCollection<IProjectTaskFirestore>(`/projects/${routeParams.id}/tasks`)

  const [projectState, setProject] = React.useState<Project>(currentProject)
  console.log("Project state:", projectState)

  const [projectTasks, setProjectTasks] = React.useState<ProjectTask[]>([...projectState.tasks])
  
  const [dialogContent, setDialogContent] = React.useState<React.JSX.Element | null>(null);
  const dialogRef = React.useRef<HTMLDialogElement | null>(null)

  const renderTaskCards = (): React.JSX.Element | React.JSX.Element[] => {
    if (projectState.tasks.length === 0) {
      console.log("Test 2: ", projectState.tasks.length)
      return <NoTasksCard />
      }
      return projectState.tasks.map((projectTask) => {
        return <ProjectTaskCard key={projectTask.id} task={projectTask} />
    })
  }
  const taskCards = renderTaskCards()

  const updateProjectTasks = () => {
    setProjectTasks([...projectState.tasks])
  };

  projectState.onTaskAdded = (task, tempId) => {
    const taskDoc = {
      name: task.name,
      description: task.description,
      priority: task.priority,
      status: task.status,
      todoSubject: task.todoSubject,
      finishDate: task.finishDate,
      creationDate: task.creationDate,
      fragmentMap: fragmentMapToFirestore(task),
      camera: cameraToFirestore(task)
    }

    Firestore.addDoc(taskCollection, taskDoc).then((docRef) => {
      const taskToUpdate = projectState.getTask(tempId)
      taskToUpdate?.updateAndSyncId(docRef.id, tempId)
    })

    updateProjectTasks();
  }
  projectState.onTaskDeleted = async (id) => {
    await deleteDocument(taskPath, id)
    updateProjectTasks()
  }

  projectState.onTaskUpdated = (task) => {
    if (!task.id) {return console.error("Task id is missing")}
    const taskDoc = {
      name: task.name,
      description: task.description,
      priority: task.priority,
      status: task.status,
      todoSubject: task.todoSubject,
      finishDate: task.finishDate,
      creationDate: task.creationDate,
    }
    updateDocument<Partial<IProjectTaskFirestore>>(taskPath, task.id, taskDoc)
    updateProjectTasks()
  }

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
            <ProjectTasks>
              {taskCards}
            </ProjectTasks>
          </div>
          <IFCViewer projectsManager={props.projectsManager} projectID={routeParams.id}/>
        </div>
      </div>
    </>
  )
}