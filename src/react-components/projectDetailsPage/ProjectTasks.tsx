import * as React from 'react';
import * as Firestore from 'firebase/firestore';
import { Project } from '../../classes/Project';
import { ProjectTaskCard } from './ProjectTaskCard';
import { ProjectTask } from '../../classes/ProjectTask';
import { getCollection } from '../../firebase';

interface Props {
  children?: React.ReactNode,
}

export function ProjectTasks(props: Props) {

  return(
    <div
    className="dashboard-card"
    style={{ flexGrow: 1, padding: "20px 0" }}
    >
      <h5 style={{ fontSize: 18, alignSelf: "center" }}>Tasks</h5>
      <div id="top-bar" style={{ display: "flex", padding: "0 10px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            width: "100%"
          }}
        >
          <input
            type="text"
            placeholder="Search tasks..."
            style={{
              height: 5,
              width: 200,
              backgroundColor: "var(--primary-white)",
              cursor: "zoom-out"
            }}
          />
          <button
            id="add-task-btn"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--primary-black)",
              display: "flex"
            }}
          >
            <span
              className="material-icons-sharp"
              style={{ scale: "0.9", marginLeft: 10 }}
            >
              add_task
            </span>
            Add
          </button>
        </div>
      </div>
      <div id='task-list'>
        {props.children}
      </div>
    </div>
    )
}