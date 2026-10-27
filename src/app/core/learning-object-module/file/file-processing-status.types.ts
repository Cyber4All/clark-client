/** Serialized processing states returned by the file metadata status endpoint. */
export type FileContentProcessingStatus =
    | "not_started"
    | "queued"
    | "processing"
    | "success"
    | "partial_success"
    | "failure"
    | "cancelled";

export interface FileProcessingStatusResponse {
    fileId: string;
    storageRevision: number;
    processingStatus: FileContentProcessingStatus;
    lastUpdatedDate?: string;
}
