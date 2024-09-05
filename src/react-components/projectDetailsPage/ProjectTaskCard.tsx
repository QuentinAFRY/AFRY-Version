import * as React from 'react';
import { ProjectTask } from '../../classes/ProjectTask';

interface Props {
    task: ProjectTask
}
export function ProjectTaskCard(props: Props) {
    return (
        <div className='to-do-card'>
            {props.task.name}
        </div>
    )
}