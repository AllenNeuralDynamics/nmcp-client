import {ExportFormat} from "../models/neuron";

export async function requestExport(ids: string[], format: ExportFormat): Promise<boolean> {
    try {
        const response = await fetch("/export", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ids,
                format
            })
        });

        if (response.status !== 200) {
            return false;
        }

        const data: any = await response.json();

        let contents = data.contents;

        contents = dataToBlob(contents);

        const mime = "application/zip";

        saveFile(contents, `${data.filename}`, mime);

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

function saveFile(data: any, filename: string, mime: string = null) {
    const blob = new Blob([data], {type: mime || "text/plain;charset=utf-8"});

    const blobURL = window.URL.createObjectURL(blob);
    const tempLink = document.createElement("a");
    tempLink.href = blobURL;
    tempLink.setAttribute("download", filename);
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
}

function dataToBlob(encoded: string) {
    const byteString = atob(encoded);

    const ab = new ArrayBuffer(byteString.length);

    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return ab;
}

