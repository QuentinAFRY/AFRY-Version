import clsx, {ClassValue} from "clsx";
import { twMerge } from "tailwind-merge"
import * as THREE from "three";
import * as OBC from "openbim-components"
import { IProjectTask } from "../classes/ProjectTask";
import { IProjectTaskFirestore } from "../react-components/projectDetailsPage/ProjectDetailsPage";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(...inputs))
}

export function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export async function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

export function dateToReact(date: Date): string {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0")
    const formatedDate = `${year}-${month}-${day}`
    return formatedDate
}

export function formatColorToHex(color: any) {
    const hexColor = new THREE.Color(color)
    const stringColor = hexColor.getHexString()
    return "#" + stringColor
}

export function fragmentMapToFirestore(task: IProjectTask) {
    const element = Object.fromEntries(Object.entries(task.fragmentMap).map(([key, set]) => [key, Array.from(set)]))
    return element
} 
  
export  function cameraToFirestore(task: IProjectTask) {
    const element = Object.fromEntries(Object.entries(task.camera).map(([key, value]) => [key, Array.from(value.toArray())]))
    return element
}

export function fragmentMapToProject(fragmentMapDoc: IProjectTaskFirestore["fragmentMap"]) {
    if (!fragmentMapDoc) {return {}}
    const fragmentMap = Object.fromEntries(Object.entries(fragmentMapDoc).map(([key, value]) => [key, new Set(value)]))
    return fragmentMap as OBC.FragmentIdMap
}

export function cameraToProject(cameraDoc: IProjectTaskFirestore["camera"]) {
    // if (!cameraDoc) {return {}}
    const position = new THREE.Vector3().fromArray(cameraDoc.position)
    const target = new THREE.Vector3().fromArray(cameraDoc.target)
    const camera = {position, target}
    return camera
}
