import * as OBC from "openbim-components"
import * as WEBIFC from "web-ifc"
import { FragmentsGroup } from "bim-fragment";

export type QtoUnits = {[unitType: string]: string}


export class UnitGetter extends OBC.Component<QtoUnits> implements OBC.UI, OBC.Disposable {
    static uuid = "df4fff57-254d-4362-824b-ab62c9fafc1b"
    enabled= true
    private _components: OBC.Components
    private _qtoUnits: QtoUnits = {}
    relevantSIUnits = ["VOLUMEUNIT", "LENGTHUNIT", "AREAUNIT"]
    
    uiElement: OBC.UIElement<{ [name: string]: OBC.SimpleUIComponent<HTMLElement>; }>;


    constructor(components: OBC.Components) {
        super(components)
        this._components = components
        components.tools.add(UnitGetter.uuid, this)
    }

    resetUnits() {
        this._qtoUnits = {};
    }

    async getUnits(fragmentIdMap: OBC.FragmentIdMap) {
        console.time("getUnits");
        
        this.resetUnits();

        const fragmentManager = this._components.tools.get(OBC.FragmentManager);
        const propertiesProcessor = this._components.tools.get(OBC.IfcPropertiesProcessor);

        const fragmentID = Object.keys(fragmentIdMap)[0];
        const fragment = fragmentManager.list[fragmentID];
        const model = fragment.mesh.parent;
        if (!(model instanceof FragmentsGroup)) return;

        const modelIndexMap = propertiesProcessor.get()[model.uuid];
        const properties = model.getLocalProperties();
        if (!properties || !modelIndexMap) return;

        let ifcSIUnitIDs = this.extractIfcSIUnitIDs(properties);
        if (ifcSIUnitIDs.length === 0) return;

        this.assignQtoUnits(properties, ifcSIUnitIDs);

        console.timeEnd("getUnits");
    }

    extractIfcSIUnitIDs(properties) {
        for (const key in properties) {
            const entity = properties[key];
            if (entity.type === WEBIFC.IFCUNITASSIGNMENT) {
                return entity.Units.map(handle => handle.value);
            }
        }
        return [];
    }

    assignQtoUnits(properties, ifcSIUnitIDs) {
        for (const unitID of ifcSIUnitIDs) {
            const unit = properties[unitID];
            if (!unit || unit.type !== WEBIFC.IFCSIUNIT) continue;

            const unitType = this.getNestedValue(unit, "UnitType.value");
            if (this.relevantSIUnits.includes(unitType)) {
                const unitName = this.getNestedValue(unit, "Name.value");
                this._qtoUnits[unitType] = unitName;
            }
        }
    }

    getNestedValue(obj, path) {
        const keys = path.split('.');
        let value = obj;
        for (const key of keys) {
            if (value == null) return null; // Safeguard against null or undefined
            value = value[key];
        }
        return value;
    }

    onDisposed: OBC.Event<any>;

    async dispose() {
        this.resetUnits();
    }

    get(): QtoUnits {
        return this._qtoUnits
    }
}