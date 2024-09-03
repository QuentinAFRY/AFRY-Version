import * as React from 'react';
import { IProject, Project } from '../../classes/Project';
import { updateDocument } from '../../firebase';

function dateToReact(date: Date): string {
    const year = date.getFullYear()
    const month = date.getMonth().toString().padStart(2, "0")
    const day = date.getDay().toString().padStart(2, "0")
    const formatedDate = `${year}-${month}-${day}`
    return formatedDate
}

interface Props {
    project: Project,
    onCloseButtonClick: () => void,
    show: any
}

export function EditProjectForm(props: Props) {
    if(!props.show) {return null}

    const [formValues, setFormValues] = React.useState({
        name: props.project.name,
        acronym: props.project.acronym,
        description: props.project.description,
        businessUnit: props.project.businessUnit,
        projectStatus: props.project.projectStatus,
        finishDate: props.project.finishDate,
        progress: props.project.progress
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormValues({
            ...formValues,
            [name]: value
        })
    }

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(formValues)
        updateDocument<Partial<IProject>>("/projects", props.project.id, formValues)
        props.onCloseButtonClick()
    }

    return(
        <form id="edit-project-form" onSubmit={onSubmit}>
            <p className="form-title">Edit Project</p>
            <div className="form-main">
            <div className="form-basic-container">
                <div className="form-input">
                <input
                    type="text"
                    name="name"
                    autoComplete="off"
                    placeholder="What's the name of your project?"
                    className="form-input-text"
                    value={formValues.name}
                    onChange={handleChange}
                />
                <label className="form-input-label">
                    <span className="material-icons-sharp"> apartment </span>Project
                    name{" "}
                </label>
                </div>
            </div>
            <div className="form-basic-container">
                <div className="form-input">
                <input
                    type="text"
                    minLength={4}
                    maxLength={4}
                    name="acronym"
                    placeholder="Choose acronym of 4 letters"
                    autoComplete="off"
                    className="form-input-text"
                    value={formValues.acronym}
                    onChange={handleChange}
                />
                <label className="form-input-label">
                    <span className="material-icons-sharp"> abc </span>Project acronym{" "}
                </label>
                </div>
            </div>
            <div className="form-basic-container">
                <div className="form-input">
                <textarea
                    name="description"
                    cols={30}
                    rows={3}
                    placeholder="Give your project a nice description!"
                    autoComplete="off"
                    className="form-input-text"
                    value={formValues.description}
                    onChange={handleChange}
                />
                <label className="form-input-label">
                    <span className="material-icons-sharp" style={{ scale: 1 }}>
                    {" "}
                    edit_note{" "}
                    </span>
                    Description{" "}
                </label>
                </div>
            </div>
            <div className="form-basic-container">
                <div className="form-input">
                <select 
                    name="businessUnit" 
                    className="form-input-other" 
                    value={formValues.businessUnit}
                    onChange={handleChange}>
                        <option>N/A</option>
                        <option>Transportation</option>
                        <option>Sustainability</option>
                        <option>Energy</option>
                        <option>Industrial</option>
                </select>
                <label className="form-input-label">
                    <span className="material-icons-sharp"> manage_accounts </span>
                    Business Unit{" "}
                </label>
                </div>
            </div>
            <div className="form-basic-container">
                <div className="form-input">
                <select 
                    name="projectStatus" 
                    className="form-input-other" 
                    value={formValues.projectStatus} 
                    onChange={handleChange}>
                        <option>Pending</option>
                        <option>Active</option>
                        <option>Finished</option>
                </select>
                <label className="form-input-label">
                    <span className="material-icons-sharp"> task_alt </span>Status{" "}
                </label>
                </div>
            </div>
            <div className="form-basic-container">
                <div className="form-input">
                <input 
                    name="finishDate" 
                    type="date" 
                    className="form-input-other" 
                    value={dateToReact(formValues.finishDate)}
                    onChange={handleChange}/>
                <label className="form-input-label">
                    <span className="material-icons-sharp"> calendar_month </span>
                    Finish Date{" "}
                </label>
                </div>
            </div>
            <div className="form-basic-container">
                <div className="form-input">
                <input
                    name="progress"
                    type="number"
                    min={0}
                    max={100}
                    placeholder="Specify the current progress"
                    className="form-input-other"
                    id="form-progress"
                    value={formValues.progress}
                    onChange={handleChange}
                />
                <label className="form-input-label">
                    <span className="material-icons-sharp"> hourglass_bottom </span>{" "}
                    Project progress (%){" "}
                </label>
                </div>
            </div>
            <div style={{ borderBottom: "1px solid var(--primary-grey-200)" }} />
            <div className="form-button-container">
                <button
                type="button"
                onClick={() => {}} // Add onClick event
                className="form-cancel-btn"
                id="cancel-project-edit-btn"
                >
                Cancel
                </button>
                <button
                type="submit"
                className="form-accept-btn"
                id="accept-project-edit-btn"
                >
                Edit project
                </button>
            </div>
            </div>
        </form>
    )
}