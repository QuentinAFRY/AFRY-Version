import { IfcProperties } from "bim-fragment";
import * as OBC from "openbim-components";

export function fragImportHandler(button: OBC.Button, fragmentManager: OBC.FragmentManager, tempProperties: IfcProperties | undefined, onPropertiesUpdated: (properties: IfcProperties) => void) {
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

function createFileInput(): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.frag, .json';
    input.multiple = true;
    return input;
}

async function handleFileSelection(filesList: FileList | null, fragmentManager: OBC.FragmentManager, tempProperties: IfcProperties | undefined): Promise<IfcProperties | undefined> {
    if (!filesList) {
        alert("No files selected.");
        return tempProperties;
    }

    try {
        checkFiles(filesList);
        return await processFiles(filesList, fragmentManager, tempProperties);
    } catch (error) {
        alert((error as Error).message);
        return tempProperties;
    }
}

function checkFiles(filesList: FileList) {
    if (filesList.length > 2) {
        throw new Error("Invalid number of files. You need at least one and can't load more than two.");
    }

    let jsonCount = 0;
    let fragCount = 0;

    for (const file of filesList) {
        if (file.name.endsWith('.frag')) {
            if (fragCount >= 1) throw new Error("Only one .frag file can be loaded at a time.");
            fragCount++;
        } else if (file.name.endsWith('.json')) {
            if (jsonCount >= 1) throw new Error("Only one .json file can be loaded at a time.");
            jsonCount++;
        } else {
            throw new Error("Invalid file type. Please load a .frag or .json file.");
        }
    }
}

function isFragFile(file: File): boolean {
    return file.name.endsWith('.frag');
}

function isJsonFile(file: File): boolean {
    return file.name.endsWith('.json');
}

async function processFiles(filesList: FileList, fragmentManager: OBC.FragmentManager, tempProperties: IfcProperties | undefined): Promise<IfcProperties | undefined> {
    for (const file of filesList) {
        const reader = new FileReader();

        if (file.name.endsWith('.frag')) {
            const fragmentBinary = await processFragFile(file, reader, fragmentManager);
            await fragmentManager.load(fragmentBinary);
        } else if (file.name.endsWith('.json')) {
            tempProperties = await processJsonFile(file, reader);
        }
    }
    return tempProperties;
}

function processFragFile(file: File, reader: FileReader, fragmentManager: OBC.FragmentManager): Promise<any> {
    return new Promise((resolve, reject) => {
        reader.readAsArrayBuffer(file);
        reader.addEventListener('load', async () => {
            const binary = reader.result;
            if (!binary || !(binary instanceof ArrayBuffer)) {
                reject(new Error("Failed to process Frag file."));
            } else {
                const fragmentBinary = new Uint8Array(binary);
                resolve(fragmentBinary)
            }
        });
    });
}

function processJsonFile(file: File, reader: FileReader): Promise<IfcProperties[]> {
    return new Promise((resolve, reject) => {
        reader.readAsText(file);
        reader.addEventListener('load', () => {
            const properties = reader.result;
            if (!properties || typeof properties !== "string") {
                reject(new Error("Failed to process JSON file."));
            } else {
                resolve(JSON.parse(properties));
            }
        });
    });
}
    










