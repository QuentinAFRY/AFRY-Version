import * as React from 'react';
import * as Router from 'react-router-dom';
import { ProjectsManager } from '../classes/ProjectsManager';
import { ProjectDetails } from './ProjectDetails';
import { ProjectTasks } from './ProjectTasks';
import { ProjectCanvas } from './ProjectCanvas';

interface Props {
  projectsManager: ProjectsManager
}


export function ProjectDetailsPage(props: Props) {
  const routeParams = Router.useParams<{id: string}>()        // the generic type "here id: string" should always be the same as <Router.Route path="/projects/:id" 
  if (!routeParams.id) {return <div>Project not found</div>}
  const project = props.projectsManager.getProject(routeParams.id)
  if (!project) {return <div>Project not found</div>}
  return(
    <div className="page" id="project-details">
      <header>
        <div>
          <h2 data-project-info="name">Empty</h2>
          <p data-project-info="headerDescription">Kurze Projektbeschreibung</p>
        </div>
      </header>
      <div className="main-page-content">
        <div style={{ display: "flex", flexDirection: "column", rowGap: 30 }}>
          <ProjectDetails project={project} />
          <ProjectTasks />
        </div>
        <ProjectCanvas />
      </div>
    </div>
  )
}