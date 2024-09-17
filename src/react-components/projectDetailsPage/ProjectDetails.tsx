import * as React from 'react';
import { Project } from '../../classes/Project';

interface Props {
    project: Project,
    onEditButtonClick: () => void
}

export function ProjectDetails(props: Props) {

    return (
        <div className="dashboard-card" style={{ padding: "0 0 20px 0" }}>
            <div className="dashboard-header" style={{ alignItems: "center", paddingBottom: 0 }}>
                <div
                data-project-info="logoColor"
                className="card-logo"
                style={{ height: 60, borderRadius: "100%"}}
                >
                <p data-project-info="acronym" />
                </div>
                <button id="edit-project-button" onClick={props.onEditButtonClick}>
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
            <div style={{ paddingBottom: 0, color: "var(--primary-black)" }}>
                <p>Progress:</p>
            </div>
            <div style={{ display: "flex", flexDirection: "row", paddingTop: 5 }}>
                <div
                data-project-info="progressBar"
                style={{
                    backgroundColor: "rgba(36, 218, 60, 0.795)",
                    backgroundClip: "content-box",
                    border: "1px solid var(--primary-green-100)",
                    borderWidth: "1px 0 1px 1px",
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
                    border: "1px solid var(--primary-green-100)",
                    borderWidth: "1px 1px 1px 0",
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
            <div
                style={{
                display: "flex",
                padding: "10px 10px",
                justifyContent: "space-between",
                }}
            >
                <div className='detailsProjectStats'>
                    <p style={{ fontWeight: 400}}>Status</p>
                    <p style={{ fontWeight: 600}} data-project-info="projectStatus">{props.project.projectStatus}</p>
                </div>
                <div className='detailsProjectStats'>
                    <p style={{ fontWeight: 400}}>Business Unit</p>
                    <p style={{ fontWeight: 600}} data-project-info="businessUnit">{props.project.businessUnit}</p>
                </div>
                <div className='detailsProjectStats'>
                    <p style={{ fontWeight: 400}}>Contact Person</p>
                    <p style={{ fontWeight: 600}} data-project-info="contactPerson">{props.project.contactPerson}</p>
                </div>
                <div className='detailsProjectStats'>
                    <p style={{ fontWeight: 400}}>Finish date</p>
                    <p style={{ fontWeight: 600}} data-project-info="finishDate">{props.project.finishDate.toDateString()}</p>
                </div>
            </div>
        </div>
    )
}