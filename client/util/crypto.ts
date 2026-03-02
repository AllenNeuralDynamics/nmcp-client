// Browser equivalents of Node.js crypto utilities.

// Equivalent to crypto.randomBytes(size)
export function randomBytes(size: number): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(size));
}

// Equivalent to buffer.toString("base64url")
export function toBase64Url(bytes: Uint8Array): string {
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
