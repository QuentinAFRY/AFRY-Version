import * as OBC from "openbim-components";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import * as Router from "react-router-dom";
import { Sidebar } from "./react-components/Sidebar";
import { ProjectsPage } from "./react-components/projectsPage/ProjectsPage";
import { ProjectsManager } from "./classes/ProjectsManager"
import { ProjectDetailsPage } from "./react-components/projectDetailsPage/ProjectDetailsPage";
import { ViewerProvider } from "./react-components/projectDetailsPage/IFCViewer";

const projectsManager = new ProjectsManager()

const rootElement = document.getElementById("app") as HTMLDivElement
const root = ReactDOM.createRoot(rootElement)

root.render(
    <Router.BrowserRouter>
      <ViewerProvider>
        <Sidebar />
        <Router.Routes>
          <Router.Route path="/" element={<ProjectsPage projectsManager={projectsManager}/>} />
          <Router.Route path="/projects/:id" element={<ProjectDetailsPage projectsManager={projectsManager}/>} />
        </Router.Routes>
      </ViewerProvider>
    </Router.BrowserRouter>
)