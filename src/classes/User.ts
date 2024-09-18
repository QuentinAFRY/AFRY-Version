import { v4 as uuidv4 } from 'uuid';

export type UserPermissions = "Developer" | "Admin" | "Manager" | "User" | "Guest"
export type UserTeams = "Engineering" | "Design" | "Marketing" | "Sales" | "Management" | "None"

export interface IUser {
    name: string;
    email: string;
    permissions: UserPermissions;
    teams: UserTeams[];
    imgSrc?: string;
}

export class User implements IUser {
    name: string;
    email: string;
    permissions: UserPermissions;
    teams: UserTeams[];
    imgSrc: string;

    ui: HTMLElement;
    id: string;

    constructor(data: IUser) {
        this.imgSrc = `DefaultUser.webp`
        for (const key in data) {
            this[key] = data[key]
        }
        if (this.name.length < 5) { throw new Error(`The name "${this.name}" is invalid. Name must contain at least 5 characters`) }
        if (!this.email.includes("@")) { throw new Error(`The email "${this.email}" is invalid. Email must contain an @-character!`) }
        if (this.teams.length < 1) { this.teams.push("None") }
        this.id = uuidv4()
        this.setUi()
        this.uiAppendTeams()
    }

    uiAppendTeams() {
        const teamsContainer = this.ui.querySelector(".user-teams")
        if (!teamsContainer) { return }
        for (const team of this.teams) {
            const e = document.createElement("p") as HTMLParagraphElement
            e.innerText = team
            teamsContainer.appendChild(e)
        }
    }

    setUi() {
        if (this.ui && this.ui instanceof HTMLDivElement) {return}
        this.ui = document.createElement("div")
        this.ui.className = "user-entry"
        this.ui.id = `user-entry-${this.id}`
        this.ui.innerHTML = `
        <img src="./Assets/${this.imgSrc}" alt="User Pic" />
        <p>${this.name}</p>
        <a href="mailto:${this.email}">${this.email}</a>
        <div class="user-permissions">
        <p>${this.permissions}</p>
        </div>
        <div class="user-teams">
        </div>
        <span class="material-symbols-outlined"> more_vert </span>`
  }
}