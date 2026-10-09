export const WINDOWS_EXTRACTION_PATH_LIMIT = 160;

export const WINDOWS_EXTRACTION_WARNING =
    "Long paths may cause Windows File Explorer to fail during extraction. Shorten folder or file names where possible, or use 7-Zip or another archive utility.";

/**
 * Returns the upload-relative path used to identify a file in a learning
 * object or while it is being selected for upload.
 */
export function getFilePath(file: {
    fullPath?: string;
    webkitRelativePath?: string;
    name?: string;
}): string {
    return file.fullPath || file.webkitRelativePath || file.name || "";
}

export function hasLongWindowsExtractionPath(path: string): boolean {
    return path.length > WINDOWS_EXTRACTION_PATH_LIMIT;
}

export function hasLongWindowsExtractionPathForFile(file: {
    fullPath?: string;
    webkitRelativePath?: string;
    name?: string;
}): boolean {
    return hasLongWindowsExtractionPath(getFilePath(file));
}
