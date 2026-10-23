import type { LearningObject } from "@entity";

export const PARSEABLE_FILE_EXTENSIONS = [
    "docx",
    "html",
    "md",
    "pdf",
    "pptx",
    "txt",
    "xlsx",
] as const;

export const FILE_PARSING_TOOLTIP = `Only these file extensions support parsing for AI: ${PARSEABLE_FILE_EXTENSIONS.map((extension) => `.${extension}`).join(", ")}.`;

export function isParseableFile(file: LearningObject.Material.File): boolean {
    const extension = (
        file.extension ||
        file.name?.match(/\.([^.]+)$/)?.[1] ||
        ""
    )
        .trim()
        .replace(/^\./, "")
        .toLowerCase();
    return PARSEABLE_FILE_EXTENSIONS.some(
        (supported) => supported === extension,
    );
}
