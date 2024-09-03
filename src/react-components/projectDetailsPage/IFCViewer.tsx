import * as React from 'react';
import * as OBC from 'openbim-components';
import { FragmentsGroup, IfcProperties } from "bim-fragment";
import { fragImportHandler } from "../../classes/fragImport/fragImporter";
import { TodoCreator } from "../../bim-components/TodoCreator";
import { SimpleQTO } from '../../bim-components/SimpleQTO/index';

interface IViewerContext {
  viewer: OBC.Components | null
  setViewer: (viewer: OBC.Components | null) => void
}

export const ViewerContext = React.createContext<IViewerContext>({
  viewer: null,
  setViewer: () => {}
})

export function ViewerProvider( props: { children: React.ReactNode }) {
  const [viewer, setViewer] = React.useState<OBC.Components | null>(null)
  return (
    <ViewerContext.Provider value={{viewer, setViewer}}>
      {props.children}
    </ViewerContext.Provider>
  )
}

export function IFCViewer() {

  const { setViewer } = React.useContext(ViewerContext)

  let viewer: OBC.Components

  const createViewer = async () => {
    viewer = new OBC.Components()
    setViewer(viewer)

    const sceneComponent = new OBC.SimpleScene(viewer)
    viewer.scene = sceneComponent
    const scene = sceneComponent.get()
    sceneComponent.setup()
    scene.background = null

    const viewerContainer = document.getElementById("viewer-container") as HTMLDivElement
    const rendererComponent = new OBC.PostproductionRenderer(viewer, viewerContainer)
    viewer.renderer = rendererComponent

    const cameraComponent = new OBC.OrthoPerspectiveCamera(viewer)
    viewer.camera = cameraComponent

    const raycasterComponent = new OBC.SimpleRaycaster(viewer)
    viewer.raycaster = raycasterComponent

    viewer.init()
    cameraComponent.updateAspect()
    rendererComponent.postproduction.enabled = true

    function exportProperties(model: FragmentsGroup) {
      const fragmentProperties = JSON.stringify(model.getLocalProperties())
      const blob = new Blob ([fragmentProperties], {type: 'application/json'})
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      if (model.name) {
        a.download = `${model.name.replace(".ifc", "")}.json`
      } else {
        a.download = `model`
      }
      a.click()
      URL.revokeObjectURL(url)
    }

    const fragmentManager = new OBC.FragmentManager(viewer)
    function exportFragments(model: FragmentsGroup) {
      const fragmentBinary = fragmentManager.export(model)
      const blob = new Blob ([fragmentBinary])
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      if (model.name) {
        a.download = `${model.name.replace(".ifc", "")}.frag`
      } else {
        a.download = `model.frag`
      }
      a.click()
      URL.revokeObjectURL(url)
    }

    const ifcLoader = new OBC.FragmentIfcLoader(viewer)
    ifcLoader.settings.wasm = {
      path: "https://unpkg.com/web-ifc@0.0.53/",
      absolute: true,
    }

    const highlighter = new OBC.FragmentHighlighter(viewer)
    highlighter.setup()

    const propertiesProcessor = new OBC.IfcPropertiesProcessor(viewer)
    highlighter.events.select.onClear.add(() => {
      propertiesProcessor.cleanPropertiesList()
    })

    const classifier = new OBC.FragmentClassifier(viewer)
    const classificationWindow = new OBC.FloatingWindow(viewer)
    classificationWindow.visible = false
    viewer.ui.add(classificationWindow)
    classificationWindow.title = "Model Groups"

    const classificationsBtn = new OBC.Button(viewer)
    classificationsBtn.materialIcon = "account_tree"
    classificationsBtn.onClick.add(() => {
      classificationWindow.visible = !classificationWindow.visible
      classificationWindow.active = classificationWindow.visible
    })

    async function createModelTree() {
      const fragmentTree = new OBC.FragmentTree(viewer)
      fragmentTree.init()
      await fragmentTree.update(["model", "storeys", "entities"])
      fragmentTree.onHovered.add((fragmentMap) => {
        highlighter.highlightByID("hover", fragmentMap.items)
      })
      fragmentTree.onSelected.add((fragmentMap) => {
        highlighter.highlightByID("select", fragmentMap.items)
      })
      const tree = fragmentTree.get().uiElement.get("tree")
      return tree
    }

    const culler = new OBC.ScreenCuller(viewer)
    culler.setup()
    cameraComponent.controls.addEventListener("sleep", () => {
      culler.elements.needsUpdate = true
    })

    async function onModelLoaded(model: FragmentsGroup) {
      highlighter.updateHighlight()
      for (const fragment of model.items) {
        culler.elements.add(fragment.mesh)
      }
      culler.elements.needsUpdate = true


      try {
        classifier.byModel(model.name, model)
        classifier.byStorey(model)
        classifier.byEntity(model)
        const tree = await createModelTree()
        await classificationWindow.slots.content.dispose(true)
        classificationWindow.addChild(tree)

        propertiesProcessor.process(model)
        highlighter.events.select.onHighlight.add((fragmentMap) => {
          const expressID = [...Object.values(fragmentMap)[0]][0]
          const Bauteil = model.getObjectByProperty("expressID", expressID)
          propertiesProcessor.renderProperties(model, Number(expressID))
        })
      } catch (error) {
        alert(error)
      }  
    }

    ifcLoader.onIfcLoaded.add(async (model) => {
      exportProperties(model)
      exportFragments(model)
      onModelLoaded(model)
    })

    let tempProperties : IfcProperties = {}

    const importFragmentBtn = new OBC.Button(viewer)
    importFragmentBtn.materialIcon = "upload"
    importFragmentBtn.tooltip = "Load FRAG"

    fragImportHandler(importFragmentBtn, fragmentManager, tempProperties, (properties) => {
      tempProperties = properties
      console.log("Properties updated: ", properties)
    })

    fragmentManager.onFragmentsLoaded.add((model) => {
      setTimeout(() => {
        console.log("Fragments loaded: ", model)
        if (tempProperties) {
          model.setLocalProperties(tempProperties)
        } else {
          alert("No properties loaded")
        }
        onModelLoaded(model)
      }, 1000)
    })

    const todoCreator = new TodoCreator(viewer)
    todoCreator.setup()

    const simpleQto = new SimpleQTO(viewer)
    simpleQto.setup()

    const propsFinder = new OBC.IfcPropertiesFinder(viewer)
    propsFinder.init()
    propsFinder.uiElement.get("queryWindow").get().style.justifyContent = "flex-start"
    propsFinder.onFound.add((fragmentIDMap) => {
      highlighter.highlightByID("select", fragmentIDMap)
    })


    const toolbar = new OBC.Toolbar(viewer)
    toolbar.addChild(
      ifcLoader.uiElement.get("main"),
      importFragmentBtn,
      classificationsBtn,
      propertiesProcessor.uiElement.get("main"),
      fragmentManager.uiElement.get("main"),
      propsFinder.uiElement.get("main"),
      todoCreator.uiElement.get("activationButton"),
      simpleQto.uiElement.get("activationBtn")
    )
    viewer.ui.addToolbar(toolbar)
  }

  React.useEffect(() => {
    createViewer()
    return () => {
      viewer.dispose()
      setViewer(null)
    }
  }, [])

  return(
      <div
        id="viewer-container"
        className="dashboard-card"
        style={{ minWidth: 0, position: "relative" }}
      >  
      </div>
  )
}