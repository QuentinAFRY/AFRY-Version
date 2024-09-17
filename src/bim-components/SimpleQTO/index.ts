import * as OBC from "openbim-components"
import * as WEBIFC from "web-ifc";
import { FragmentsGroup } from "bim-fragment";
import { QtoCard } from "./src/QtoCard.ts";
import { UnitGetter} from "../UnitGetter/index.ts";


export type QtoResult = {[setName: string]: {[qtoName: string]: number}}
export class SimpleQTO extends OBC.Component<QtoResult> implements OBC.UI, OBC.Disposable {
    static uuid = "d455bfa2-e92e-4473-8bb4-64014e6f5b2d"
    enabled= true
    private _components: OBC.Components
    private _qtoResult: QtoResult = {}
    private _elementSelection: number [] = []
    relevantSIUnits = ["VOLUMEUNIT", "LENGTHUNIT", "AREAUNIT"]
    
    uiElement = new OBC.UIElement<{
        activationBtn: OBC.Button
        qtoList: OBC.FloatingWindow
    }>()


    constructor(components: OBC.Components) {
        super(components)
        this._components = components
        components.tools.add(SimpleQTO.uuid, this)
        this.setUI()
    }

    setup() {
        const unitGetter = new UnitGetter(this._components)
        const qtoCard = new QtoCard(this._components) 

        const highlighter = this._components.tools.get(OBC.FragmentHighlighter)
        highlighter.events.select.onHighlight.add(async (fragmentIdMap) => {
            await this.sumQuantities(fragmentIdMap)

            await unitGetter.getUnits(fragmentIdMap)
            const qtoUnits = unitGetter.get()

            qtoCard.setup(this._qtoResult, qtoUnits)
            this.uiElement.get("qtoList").addChild(qtoCard)
        })

        highlighter.events.select.onClear.add(() => {
            qtoCard.clearSlots()
            this.resetQuantities()
        })
    }

    resetQuantities() {
        this._qtoResult = {}
        this._elementSelection = []
    }

    private setUI() {
        const activationBtn = new OBC.Button(this._components)
        activationBtn.materialIcon = "functions"

        const qtoList = new OBC.FloatingWindow(this._components)
        qtoList.title = "Quantification"
        qtoList.get().style.justifyContent = "flex-start"
        this._components.ui.add(qtoList)
        qtoList.visible = false
        qtoList.get().style.width = "fit-content"
        qtoList.get().style.height = "fit-content"

        activationBtn.onClick.add(() => {
            activationBtn.active = !activationBtn.active
            qtoList.visible = activationBtn.active
        })

        this.uiElement.set({activationBtn, qtoList})
    }

    // Logic for getting the EntityNames and their Quantities + Values
    async sumQuantities(fragmentIdMap: OBC.FragmentIdMap) {

        console.log("fragmentIdMap", fragmentIdMap)

        const fragmentManager = this._components.tools.get(OBC.FragmentManager)
        const propertiesProcessor = this._components.tools.get(OBC.IfcPropertiesProcessor)

        for (const fragmentID in fragmentIdMap) {
            const fragment = fragmentManager.list[fragmentID]
            console.log("fragment", fragment)
            if (!fragment) {
                console.error("Fragment not found. Aborting Quantity extraction. - Load the matching model first.")
                continue
            }
            const model = fragment.mesh.parent

            if (!(model instanceof FragmentsGroup)) {continue}
            const properties = model.getLocalProperties()
            
            const modelIndexMap = propertiesProcessor.get()[model.uuid]

            if (!(properties) || (!modelIndexMap)) {continue}

            const expressIDs = fragmentIdMap[fragmentID]

            for (const expressID of expressIDs) {

                const entityMap = modelIndexMap[Number(expressID)]

                if (!entityMap || this._elementSelection.includes(expressID)) {continue}

                this._elementSelection.push(expressID)

                for (const mapID of entityMap) {
                    const entity = properties[mapID]
                    if (!(entity.type === WEBIFC.IFCELEMENTQUANTITY)) { continue }
                    await this.processQuantities(model, mapID)
                }
            }
        }
    }

    async processQuantities(model: FragmentsGroup, mapID: number) {
        const { name: setName } = await OBC.IfcPropertiesUtils.getEntityName(model, mapID)
        if (!setName) { return }
        if (!(setName in this._qtoResult)) { this._qtoResult[setName] = {} }

        // Promisify the getQsetQuantities method to ensure that the method is completed before resolving the promise
        const qsetQuantities = (): Promise<void> => {
            return new Promise((resolve) => {
                OBC.IfcPropertiesUtils.getQsetQuantities(model, mapID, async (qtoID) => {
                    const { name: qtoName } = await OBC.IfcPropertiesUtils.getEntityName(model, qtoID)
                    const { value: qtoValue } = await OBC.IfcPropertiesUtils.getQuantityValue(model, qtoID)
                    if (!qtoName || !qtoValue) { return }
                    if (!(qtoName in this._qtoResult[setName])) { this._qtoResult[setName][qtoName] = 0 }
                    this._qtoResult[setName][qtoName] += qtoValue
                    resolve(); // Resolve the promise after processing each qtoID
                })
            });
        }

        await qsetQuantities(); // Wait for the promisified method to complete
    }

    async dispose() {
        this.resetQuantities()
        this.uiElement.dispose()
    }
    
    onDisposed = new OBC.Event<void>()
    
    get(): QtoResult {
        return this._qtoResult
    }
}