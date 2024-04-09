import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import * as THREE from "three"


/**
 * Eine Funktion die einen input call ausführt 
 * und den Input OBJ und MTL als THREE.Roup
 * in die angegeben Scene lädt
 */
export function uploadObjMtl() {
    return new Promise((resolve) => {
        let OBJUrl: string
        let MTLUrl: string
        const input = document.createElement("input")
        input.type = "file"
        input.multiple = true
        input.accept = ".obj, .mtl"
        input.addEventListener("change", () => {
            
            const files = input.files
            if (!files) {return} 
            if (files.length>2) {throw new Error("Invalid number of input files. You can only select a maximum of one .obj, and one .mtl file! ")}
            for (let i=0; i<files.length; i++) {
                let file = files.item(i)
                if (file != null) {
                    let fileType = files.item(i)?.name.split(".").pop()
                    if (fileType === "obj") {
                        const blob = new Blob([file])
                        OBJUrl = URL.createObjectURL( blob )
                    } else if (fileType === "mtl") {
                        const blob = new Blob([file])
                        MTLUrl = URL.createObjectURL( blob )
                    }
                }   
            }
            const objLoader = new OBJLoader()
            const mtlLoader = new MTLLoader()

            if (OBJUrl && MTLUrl) {
                mtlLoader.load(MTLUrl, (materials) => {
                    materials.preload()
                    objLoader.setMaterials(materials)
                    objLoader.load(OBJUrl, (mesh) => {
                        resolve(mesh)
                    })
                })
            }

            if (OBJUrl && !MTLUrl) {
                objLoader.load(OBJUrl, (mesh) => {resolve(mesh)})
            }

            if (!OBJUrl && MTLUrl) {
                throw new Error("You can't add a .mtl file without adding an OBJ!")
            }
        })

        input.click()
    })
}

