import * as React from 'react';
import { ProjectTask } from '../../classes/ProjectTask';

interface Props {
    task: ProjectTask
}

export function ProjectTaskCard(props: Props) {

    const isCollapsed = props.task.collapsed

    return (
        <div className='to-do-card' style={{
            backgroundColor: props.task.taskStatus === "open" ? "var(--task-open)" : props.task.taskStatus === "in-progress" ? "var(--task-in-progress)" : "var(--task-finished)",
            padding: "15px",
            width: "100%",
            borderRadius: "5px",
        }}>
            <div style={{display: "flex", alignItems: "center", alignSelf: "stretch", justifyContent: "space-between"}}>
                <h4>{props.task.name}</h4>
                <span className='material-icons-sharp' style={{scale: "80%"}}>{
                    isCollapsed ? "keyboard_arrow_down" : "keyboard_arrow_up"
                    }
                </span>
            </div>
            <div className='task-description' style={{display: isCollapsed ? "none" : "flex"}}>
                <p>{props.task.description}</p>
                <p>{props.task.finishDate? props.task.finishDate.toLocaleDateString() : ""}</p>
            </div>
            
            
        </div>
    )
}