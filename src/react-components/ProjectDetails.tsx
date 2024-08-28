import * as React from 'react';
import { Project } from '../classes/Project';

interface Props {
    project: Project
}

export function ProjectDetails(props: Props) {
  return (
    <div className="dashboard-card" style={{ padding: "20px 0" }}>
        <div className="dashboard-header" style={{ alignItems: "center" }}>
            <div
            data-project-info="logoColor"
            className="card-logo"
            style={{ height: 60, borderRadius: "100%" }}
            >
            <p data-project-info="acronym" />
            </div>
            <button id="edit-project-button">
            <span style={{ scale: "0.7" }} className="material-icons-sharp">
                edit{" "}
            </span>
            Edit
            </button>
        </div>
        <div style={{ flexDirection: "column" }}>
            <h5 data-project-info="name">{props.project.name}</h5>
            <p data-project-info="description">{props.project.description}</p>
        </div>
        <div
            style={{
            display: "grid",
            gridTemplateColumns: "55px 90px 95px 65px"
            }}
        >
            <div>
            <p style={{ color: "var(--primary-grey-300)" }}>Status</p>
            <p data-project-info="projectStatus">{props.project.projectStatus}</p>
            </div>
            <div>
            <p style={{ color: "var(--primary-grey-300)" }}>Business Unit</p>
            <p data-project-info="businessUnit">{props.project.businessUnit}</p>
            </div>
            <div>
            <p style={{ color: "var(--primary-grey-300)" }}>Contact Person</p>
            <p data-project-info="contactPerson">{props.project.contactPerson}</p>
            </div>
            <div>
            <p style={{ color: "var(--primary-grey-300)" }}>Finish date</p>
            <p data-project-info="finishDate">{props.project.finishDate.toDateString()}</p>
            </div>
        </div>
        <div style={{ marginBottom: 0, color: "var(--primary-grey-300)" }}>
            <p>Progress:</p>
        </div>
        <div style={{ display: "flex", flexDirection: "row", marginTop: 5 }}>
            <div
            data-project-info="progressBar"
            style={{
                backgroundColor: "rgba(36, 218, 60, 0.795)",
                backgroundClip: "content-box",
                border: "2px solid var(--primary-green-100)",
                borderRight: "none",
                borderRadius: "8px 0 0 8px",
                width: `${props.project.progress}%`,
                height: 25,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center"
            }}
            >{props.project.progress}%</div>
            <div
            data-project-info="progressContainer"
            style={{
                backgroundColor: "var(--primary-green-400)",
                backgroundClip: "content-box",
                border: "2px solid var(--primary-green-100)",
                borderLeft: "none",
                borderRadius: "0 8px 8px 0",
                width: `${100 - props.project.progress}%`,
                height: 25,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                color: "var(--primary-black)"
            }}
            />
        </div>
    </div>
  )
}