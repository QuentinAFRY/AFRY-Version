import * as React from 'react'
import * as Router from 'react-router-dom'

export function Sidebar() {

    return (
    <aside id="sidebar">
        <img id="company-logo" src="./Assets/AFRY_Logotype_Horizontal (1).svg" alt="Construction Company"/>
        <ul id="nav-buttons">
            <Router.Link to="/">
                <li id="side-bar-projects"><span className="material-icons-sharp"> location_city </span> Projects</li>
            </Router.Link>
            <li><span className="material-icons-sharp"> compost </span> LCA-Data</li>
            <li><span className="material-icons-sharp"> verified </span> Report</li>
            <li><span className="material-icons-sharp"> people_alt </span> Users</li>
        </ul>
    </aside>
    )
}