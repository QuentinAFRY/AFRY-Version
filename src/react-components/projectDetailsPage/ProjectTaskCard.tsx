import * as React from 'react';
import { ProjectTask } from '../../classes/ProjectTask';
import { TodoItem } from '../../bim-components/TodoCreator/src/TodoItem';
import { To } from 'react-router-dom';

interface Props {
    task: ProjectTask
}

const cardStyle: React.CSSProperties = {
    color: "var(--primary-black)",
    backgroundColor: "var(--primary-white)",
    boxShadow: "0 1px 4px var(--primary-grey-300)",
    padding: "15px",
    width: "100%",
    borderRadius: "5px",
}

const colors = {
    High: "#d56400",
    Normal: "#32b600",
    Low: "#0079e0",
}

export function ProjectTaskCard(props: Props) {

    const [isCollapsed, setIsCollapsed] = React.useState(true)

    const handleCollapseEvent: React.MouseEventHandler<HTMLSpanElement> = (e) => {
        setIsCollapsed(!isCollapsed);
    }

    const headerStyle: React.CSSProperties = {
        fontSize: "var(--font-style-M)",
        width: "50%",
        whiteSpace: isCollapsed ? "nowrap" : "normal",
        overflow: isCollapsed ? "hidden" : "visible",
        textOverflow: isCollapsed ? "ellipsis" : "clip",
    }

    const priorityColor = () => {
        const color = colors[props.task.priority]
        return color ? color : "var(--primary-black)"
    }

    const relatedEl = Object.keys(props.task.fragmentMap).length

    return (
        <div className='to-do-card' style={cardStyle}>
            <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between"}}>
                <h4 style={headerStyle}>{props.task.name}</h4>
                <div style={{display: "flex", alignItems: 'center'}}>
                    <p>{relatedEl }</p>
                    <span 
                        className='material-icons-sharp' 
                        style={{scale: "80%", transform: "translateY(-1px)"}}
                        onClick={handleCollapseEvent}>
                            token
                    </span>
                </div>
                <p style={{color: `${priorityColor()}`}}>{props.task.priority}</p>
                <span 
                    className='material-icons-sharp' 
                    style={{scale: "80%", cursor: "pointer"}}
                    onClick={handleCollapseEvent}>
                        {isCollapsed ? "keyboard_arrow_down" : "keyboard_arrow_up"}
                </span>
            </div>
            <div className='task-description' style={{display: isCollapsed ? "none" : "flex"}}>
                <p>{props.task.description}</p>
                <p>{props.task.finishDate? props.task.finishDate.toLocaleDateString() : ""}</p>
            </div>
            
            
        </div>
    )
}