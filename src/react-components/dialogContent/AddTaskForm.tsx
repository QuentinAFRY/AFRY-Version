import * as React from 'react';

export function AddTaskForm() {
    return (
        <form id="task-form">
            <p className="form-title">Add Task</p>
            <div className="form-main">
                <div className="form-basic-container">
                <div className="form-input">
                    <input
                    type="text"
                    name="name"
                    autoComplete="off"
                    placeholder="Name the taks or give a short description"
                    className="form-input-text"
                    />
                    <label className="form-input-label">
                    <span className="material-icons-sharp"> create </span>Task name{" "}
                    </label>
                </div>
                </div>
                <div className="form-basic-container">
                <div className="form-input">
                    <textarea
                    name="description"
                    cols={30}
                    rows={2}
                    placeholder="If needed, add a more detailed description."
                    autoComplete="off"
                    className="form-input-text"
                    defaultValue={""}
                    />
                    <label className="form-input-label">
                    <span className="material-icons-sharp" style={{ scale: 1 }}>
                        {" "}
                        edit_note{" "}
                    </span>
                    Description
                    <span
                        style={{
                        color: "var(--primary-grey-100)",
                        fontStyle: "italic",
                        paddingLeft: 10,
                        fontSize: 12
                        }}
                    >
                        (optional)
                    </span>
                    </label>
                </div>
                </div>
                <div className="form-basic-container">
                <div className="form-input">
                    <select name="taskLogo" className="form-input-other">
                    <option>Engineering</option>
                    <option>BIM</option>
                    <option>Documentation</option>
                    <option>Sustainability</option>
                    </select>
                    <label className="form-input-label">
                    <span className="material-icons-sharp"> manage_accounts </span>Field
                    of competence{" "}
                    </label>
                </div>
                </div>
                <div className="form-basic-container">
                <div className="form-input">
                    <input name="finishDate" type="date" className="form-input-other" />
                    <label htmlFor="finishDate" className="form-input-label">
                    <span className="material-icons-sharp"> calendar_month </span>
                    Finish Date
                    <span
                        style={{
                        color: "var(--primary-grey-100)",
                        fontStyle: "italic",
                        paddingLeft: 10,
                        fontSize: 12
                        }}
                    >
                        (optional)
                    </span>{" "}
                    </label>
                </div>
                </div>
                <div style={{ borderBottom: "1px solid var(--primary-grey-200)" }} />
                <div className="form-button-container">
                <button type="button" className="form-cancel-btn" id="cancel-task-btn">
                    Cancel
                </button>
                <button type="submit" className="form-accept-btn" id="accept-task-btn">
                    Add task
                </button>
                </div>
            </div>
        </form>
    )
}