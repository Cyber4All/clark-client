export interface OutageReport {
    name: string;
    accessGroups: string[];
    issues: string[];
    discovered: Date;
    links?: string[];
    resolved?: Date;
}