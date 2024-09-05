import * as React from 'react';
import * as Firestore from 'firebase/firestore';
import { Project } from '../../classes/Project';
import { ProjectTaskCard } from './ProjectTaskCard';
import { ProjectTask } from '../../classes/ProjectTask';
import { getCollection } from '../../firebase';

interface Props {
  project: Project,
  openAddTaskModal: () => void
}

export function ProjectTasks(props: Props) {

  const taskCollection = getCollection<ProjectTask>(`projects/${props.project.id}/tasks`)

  const getFirestoreTasks = async () => {
    const firebaseTasks = await Firestore.getDocs(taskCollection)

    for (const doc of firebaseTasks.docs) {
      const data = doc.data()
      const task: ProjectTask = {
        ...data,
        finishDate: (data.finishDate as unknown as Firestore.Timestamp).toDate(),
        creationDate: (data.creationDate as unknown as Firestore.Timestamp).toDate()
      }
      try {
        props.project.addTask(task)
        console.log(task)
      } catch (error) {
        console.error("Error adding task to project:", error)
      }
    }
  }

  React.useEffect(() => {
    getFirestoreTasks()
  }, [])

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
      {
        props.project.tasks.length > 0 ? <div id="task-list"> Task Placeholder </div> : <p>No tasks found</p>
      }
    </div>
    )
}