import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js"
import { uploadObjMtl } from "./ModelUpload";
import { upload3DFile } from "./test";

/*----------ThreeJs Viewer----------*/


// set up simple cube object
export function createCube() {
  const cubeColor = new THREE.Color( 0xf69104 )
  const boxGeometry = new THREE.BoxGeometry()
  const material = new THREE.MeshStandardMaterial({color: cubeColor, roughness: 0.4, metalness: 0.5, fog: true})
  const cube = new THREE.Mesh(boxGeometry, material)
  return(cube)
}

/**  set up scene and DOMcontainer
const scene = new THREE.Scene()
const viewerContainer = document.getElementById("viewer-container") as HTMLDivElement

// set up camera and controls
const camera = new THREE.PerspectiveCamera(75)
camera.position.z = 5
const cameraControls = new OrbitControls(camera, viewerContainer)

// set up renderer
const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true})
viewerContainer.append(renderer.domElement)

function resizeViewer() {
  const containerDimensions = viewerContainer.getBoundingClientRect()
  renderer.setSize(containerDimensions.width, containerDimensions.height)
  const aspectRatio = containerDimensions.width / containerDimensions.height
  camera.aspect = aspectRatio
  camera.updateProjectionMatrix()
}
window.addEventListener("resize", resizeViewer)
resizeViewer()

const cubeColor = new THREE.Color( 0xf69104 )
const boxGeometry = new THREE.BoxGeometry()
const material = new THREE.MeshStandardMaterial({color: cubeColor, roughness: 0.4, metalness: 0.5, fog: true})
const cube = new THREE.Mesh(boxGeometry, material)
scene.add(cube)

// set up Lighting
const white = new THREE.Color(0xffffff)
const directionalLight = new THREE.DirectionalLight(white, 1)
const ambientLight = new THREE.AmbientLight(white, 1)
directionalLight.position.set(0, 15, 0)
const pointLight = new THREE.PointLight(white, 2, 3, 0.1)
pointLight.position.set(0, 5, 5)
scene.add(directionalLight, ambientLight, pointLight)

// set up render-loop for responsiveness (60fps)
function renderScene() {
  renderer.render(scene, camera)
  requestAnimationFrame(renderScene)
}
renderScene()

// set up helpers
const axesHelper = new THREE.AxesHelper(5)
const grid = new THREE.GridHelper(30, 30)
grid.material.transparent = true
grid.material.opacity = 0.4
grid.material.color = new THREE.Color("#204080")
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight,5)
const pointLightHelper = new THREE.PointLightHelper(pointLight, 1)
scene.add(axesHelper, grid, directionalLightHelper, pointLightHelper)

// set up GUI 
const gui = new GUI()
function addGuiPosition(folder: GUI, targetObject: any,min: number, max: number, step: number) {
  folder.add(targetObject.position, "x", min, max, step)
  folder.add(targetObject.position, "y", min, max, step)
  folder.add(targetObject.position, "z", min, max, step)
}
const gridControls = gui.addFolder("Grid")
gridControls.add(grid.material, "transparent")
gridControls.add(grid.material, "opacity")
gridControls.addColor(grid.material, "color")
const cubeControls = gui.addFolder("Cube")
addGuiPosition(cubeControls, cube, -5, 5, 1)
cubeControls.addColor(cube.material, "color")
cubeControls.add(cube.material, "roughness", 0, 1, 0.1)
cubeControls.add(cube.material, "metalness", 0, 1, 0.1)
const dLightControls = gui.addFolder("Direct Light")
addGuiPosition(dLightControls, directionalLight, -5, 5, 1)
dLightControls.add(directionalLight, "intensity",  0, 10, 1)
dLightControls.addColor(directionalLight, "color")
const pLightControls = gui.addFolder("Point Light")
addGuiPosition(pLightControls, pointLight, -5, 5, 1)
pLightControls.add(pointLight, "intensity", 0, 5, 0.5)
pLightControls.add(pointLight, "decay", 0, 0.5, 0.01)
pLightControls.addColor(pointLight, "color")

const upload3DBtn = document.getElementById("uploadModelBtn")

if (upload3DBtn)  {
  upload3DBtn.addEventListener("click", async () => {
    console.log("test")
    const object = await uploadObjMtl() as any
    scene.add(object)
    const objectControls = gui.addFolder(`${object.name}`)
    addGuiPosition(objectControls, object, -5, 5, 1)
  })
}
*/