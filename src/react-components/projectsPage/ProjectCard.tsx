import * as React from 'react';
import * as Router from 'react-router-dom';
import { Project } from '../../classes/Project';
import { color } from 'three/examples/jsm/nodes/Nodes.js';

interface Props {
    project: Project
}

const keyStyle: React.CSSProperties = {
    fontWeight: 300,
    fontSize: "var(--font-style-S)",
    color: "var(--primary-white)"
}

const valueStyle: React.CSSProperties = {
    fontWeight: 500,
    fontSize: "var(--font-style-S)",
    color: "var(--primary-beige)"
}

const colorPicker = [
    "#931621",
    "#D4962C",
    "#317B22",
    "#2E2836",
    "#370031",
    "#0B0033",
    "#8E6DAF",
    "#96C722",
    "#4F3824",
    "#285943",
    "#6DAF90",
]

const getRandomValue = (array: string[]) => {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
};

const getUniqueRandomValue = (array) => {
  let newValue;
  do {
    newValue = getRandomValue(array);
  } while (newValue === prevColor);
  prevColor = newValue;
  return newValue;
};
let prevColor = "";

export function ProjectCard(props: Props) {

    const logoColor = getUniqueRandomValue(colorPicker)

    return (
        <div className='project-card' style={{padding: "10px"}}>
            <div className="card-header">
                <div className="card-logo" style={{ backgroundColor: logoColor }}>
                <p>{props.project.acronym}</p>
                </div>
                <div style={{paddingLeft: "5px"}}>
                <h5>{props.project.name}</h5>
                <p>{props.project.description}</p>
                </div>
            </div>
            <div className="card-content">
                <div className="card-property">
                <p style={keyStyle}>Status</p>
                <p style={valueStyle}>{props.project.projectStatus}</p>
                </div>
                <div className="card-property">
                <p style={keyStyle}>Business Unit</p>
                <p style={valueStyle}>{props.project.businessUnit}</p>
                </div>
                <div className="card-property">
                <p style={keyStyle}>Cost</p>
                <p style={valueStyle}>${props.project.cost}</p>
                </div>
                <div className="card-property">
                <p style={keyStyle}>Contact Person</p>
                <p style={valueStyle}>Quentin Thurow</p>
                </div>
                <div className="card-property" style={{borderBottom: 0}}>
                <p style={keyStyle}>Estimated Progress</p>
                <p style={valueStyle}>{props.project.progress}%</p>
                </div>
            </div>
        </div>
    )
}