import { update } from 'three/examples/jsm/libs/tween.module.js';
import * as OBC from "openbim-components"
import { QtoResult } from "../index"
import { QtoUnits } from "../../UnitGetter"

export class QtoCard extends OBC.SimpleUIComponent {

    slots: {
        quantitiesContainer: OBC.SimpleUIComponent
    }

    constructor(components: OBC.Components) {
        const template = `
        <div>
            <div data-tooeen-slot="quantitiesContainer"></div>
        </div>`
        super(components, template)

        this.setSlot("quantitiesContainer", new OBC.SimpleUIComponent(this._components))
    }

    setup(qtoResult: QtoResult, qtoUnits: QtoUnits) {
        this.clearSlots()

        for (const setName in qtoResult) {
            const tree = new OBC.TreeView(this._components, setName)
            tree.name = setName
            tree.expanded = true
            const qtoSet = qtoResult[setName]
            
            for (const qtoName in qtoSet) {
                const value = qtoResult[setName][qtoName]
                const nameValueElement = this.createSubTree(qtoName, value, qtoUnits)
                tree.addChild(nameValueElement)
            }
            this.slots.quantitiesContainer.addChild(tree)
        }
    }

    clearSlots() {
        const content = this.slots.quantitiesContainer
        if (!(content.children.length > 0)) {return}
        content.children.forEach(child => content.removeChild(child))
    }

    createSubTree(qtoName: string, value: number, qtoUnits: QtoUnits): OBC.SimpleUIComponent {
        const qtoRecord = new OBC.SimpleUIComponent(this._components)
        qtoRecord.get().style.fontSize = "var(--font-style-XS)"
        qtoRecord.get().style.display = "flex"
        qtoRecord.get().style.justifyContent = "flex-start"
        qtoRecord.get().style.gap = "10px"
        let uType: string = ""
        if (qtoUnits["LENGTHUNIT"] === "METRE") {
            switch (true) {
                case qtoName.endsWith("Volume"): {
                    uType = "m³"
                    break
                }
                case qtoName.endsWith("Area"): {
                    uType = "m²"
                    break
                }
                case (qtoName.endsWith("Length") || qtoName.endsWith("Width") || qtoName.endsWith("Height")): {
                    uType = "m"
                    break
                }
                default: {
                    uType = ""
                    new Error(`The Unit of the Qantity with the name: ", ${qtoName}, "is unknown!`)
                    console.log(Error)
                }
            }
        }
        if (qtoUnits["LENGTHUNIT"] === "MILLIMETRE") {
            switch (true) {
                case qtoName.endsWith("Volume"): {
                    uType = "mm³"
                    break
                }
                case qtoName.endsWith("Area"): {
                    uType = "mm²"
                    break
                }
                case (qtoName.endsWith("Length") || qtoName.endsWith("Width") || qtoName.endsWith("Height")): {
                    uType = "mm"
                    break
                }
                default: {
                    uType = ""
                    new Error(`The Unit of the Qantity with the name: ", ${qtoName}, "is unknown!`)
                    console.log(Error)
                }
            }
        }
        qtoRecord.get().innerHTML = `<p>${qtoName}: </p><p>${value} ${uType}</p>`
        
        return qtoRecord
    }
}