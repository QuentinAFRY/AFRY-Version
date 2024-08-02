import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export function upload3DFile(){
    return new Promise((resolve)=> {
        let mesh
        let fileName: string
        const input = document.createElement("input")
        input.type = "file"
        input.accept = ".gltf, .obj"
        const reader = new FileReader()
        input.click()
        input.addEventListener("change", () => {
            const fileList = input.files
            if(!fileList) {return}
            reader.readAsText(fileList[0])
            fileName = fileList[0].name
        })
        reader.addEventListener("load", () => {
            const importedFile =  reader.result
            console.log(importedFile)
            if (!importedFile) {return}
            if (fileName.split(".").pop()=="gltf") {
                const gltfLoader = new GLTFLoader()
                mesh = gltfLoader.parse(importedFile as string, "", (mesh)=>{
                    resolve({mesh:mesh.scene, fileName:fileName})
                })
            } else if (fileName.split(".").pop()=="obj") {
                const objLoader = new OBJLoader()
                mesh = objLoader.parse(importedFile as string)
                resolve({mesh:mesh, fileName:fileName})
            }
        })
    })
}