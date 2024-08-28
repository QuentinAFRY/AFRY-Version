import * as React from 'react';
import * as Router from 'react-router-dom';
import { Project } from '../classes/Project';

interface Props {
    project: Project
}

export function ProjectCard(props: Props) {

    return (
            <div className='project-card'>
            <div className="card-header">
                <div className="card-logo" style={{ backgroundColor: "${this.logoColor}" }}>
                <p>{props.project.acronym}</p>
                </div>
                <div>
                <h5>{props.project.name}</h5>
                <p>{props.project.description}</p>
                </div>
            </div>
            <div className="card-content">
                <div className="card-property">
                <p style={{ color: "#969696" }}>Status</p>
                <p>{props.project.projectStatus}</p>
                </div>
                <div className="card-property">
                <p style={{ color: "#969696" }}>Business Unit</p>
                <p>{props.project.businessUnit}</p>
                </div>
                <div className="card-property">
                <p style={{ color: "#969696" }}>Cost</p>
                <p>${props.project.cost}</p>
                </div>
                <div className="card-property">
                <p style={{ color: "#969696" }}>Contact Person</p>
                <a href="#">{props.project.contactPerson}</a>
                </div>
                <div className="card-property">
                <p style={{ color: "#969696" }}>Estimated Progress</p>
                <p>{props.project.progress}%</p>
                </div>
            </div>
        </div>
    )
}