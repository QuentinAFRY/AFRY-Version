import { IfcProperties } from "bim-fragment";
import * as OBC from "openbim-components";


export class FragImportHandler {
    private _properties: IfcProperties;
    private _fragmentBinary?: Uint8Array;

    constructor() {}

    get properties(): IfcProperties {
        return this._properties;
    }

    async loadFragment(fragmentManager: OBC.FragmentManager) {
        if (!this._fragmentBinary) {
            alert("No fragment binary loaded.");
            return;
        }
        await fragmentManager.load(this._fragmentBinary);
    }

    fragImportHandler(button: OBC.Button, fragmentManager: OBC.FragmentManager, tempProperties: IfcProperties | undefined, onPropertiesUpdated: (properties: IfcProperties) => void) {
        button.onClick.add(() => {
            const input = createFileInput();
            input.addEventListener('change', async () => {
                const updatedProperties = await handleFileSelection(input.files, fragmentManager, tempProperties);
                if (updatedProperties) {
                    onPropertiesUpdated(updatedProperties);
                }
            });
            input.click();
        });
    }

    createFileInput(): HTMLInputElement {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.frag, .json';
        input.multiple = true;
        return input;
    }

    handleFileSelection(filesList: FileList | null, fragmentManager: OBC.FragmentManager): Promise<IfcProperties> {
        return new Promise((resolve, reject) => {
            try {
                if (!filesList) throw new Error("No files selected. FileList is null.")
                this.checkFiles(filesList);
                this.processFiles(filesList, fragmentManager);
                resolve(this._properties);
            } catch (error) {
                reject(alert(error.message));
            }
        })
    }

    checkFiles(filesList: FileList) {
        if (filesList.length > 2) {
            throw new Error("Invalid number of files. You can't load more than two files.");
        }
        
        let jsonCount = 0;
        let fragCount = 0;
        for (let i = 0; i < filesList.length; i++) {
            const file = filesList[i];
            if (this.isFragFile(file) && fragCount < 1) {
                fragCount++;
            } else if (this.isJsonFile(file) && jsonCount < 1) {
                jsonCount++;
            } else {
                throw new Error("Only one .frag/.json file can be loaded at a time.");
            }
        }
    }

    async processFiles(filesList: FileList, fragmentManager: OBC.FragmentManager) {
        for (let i = 0; i < filesList.length; i++) {
            const file = filesList[i];
            const reader = new FileReader();
    
            if (this.isFragFile(file)) {
                this._fragmentBinary = await this.readFragFile(file, reader, fragmentManager);
            } else if (this.isJsonFile(file)) {
                this._properties = await this.readJsonFile(file, reader);
            } else {
                throw new Error("An Error occurred while processing the files.");
            }
        }
    }

    isFragFile(file: File): boolean {
        return file.name.endsWith('.frag');
    }

    isJsonFile(file: File): boolean {
        return file.name.endsWith('.json');
    }

    readFragFile(file: File, reader: FileReader, fragmentManager: OBC.FragmentManager): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            reader.readAsArrayBuffer(file);
            reader.addEventListener('load', async () => {
                const binary = reader.result;
                if (!binary || !(binary instanceof ArrayBuffer)) {
                    reject(new Error("Failed to process Frag File."))
                } else {
                    const fragmentBinary = new Uint8Array(binary);
                    resolve(fragmentBinary)
                }
            })
        })
    }

    //await fragmentManager.load(fragmentBinary)


    readJsonFile(file: File, reader: FileReader): Promise<any> {
        return new Promise((resolve, reject) => {
            reader.readAsText(file);
            reader.addEventListener('load', () => {
                const properties = reader.result;
                if (!properties || typeof properties !== "string") {
                    reject(new Error("Failed to process JSON file."));
                } else {
                    try {
                        resolve(JSON.parse(properties));
                    } catch (error) {
                        reject(new Error("Error parsing JSON: " + (error as Error).message));
                    }
                }
            });
        });
    }
}

    










