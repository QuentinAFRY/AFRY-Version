import * as React from 'react';
import { Project } from '../../classes/Project';

interface Props {
  project: Project,
  openAddTaskModal: () => void
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
              backgroundColor: "var(--primary-grey-300)",
              cursor: "zoom-out"
            }}
          />
          <button
            id="add-task-btn"
            onClick={props.openAddTaskModal}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--primary-white)",
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
      <div
        id="task-list"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 15,
          padding: 10
        }}
      ></div>
    </div>
    )
}