import { LearningObject } from "@entity";

export function getLearningObjectStatusLabel(status: string): string {
    switch (status) {
        case LearningObject.Status.UNRELEASED:
            return "Draft";
        case LearningObject.Status.WAITING:
            return "Waiting for Review";
        case LearningObject.Status.REVIEW:
            return "Under Review";
        case LearningObject.Status.RELEASED:
            return "Released";
        case LearningObject.Status.REJECTED:
            return "Rejected";
        default:
            return status
                .replace(/_/g, " ")
                .replace(/\b\w/g, (letter) => letter.toUpperCase());
    }
}

export function getLearningObjectStatusIcon(status: string): string {
    switch (status) {
        case LearningObject.Status.UNRELEASED:
            return "fa-eye-slash";
        case LearningObject.Status.WAITING:
            return "fa-hourglass";
        case LearningObject.Status.REVIEW:
        case LearningObject.Status.RELEASED:
            return "fa-eye";
        case LearningObject.Status.REJECTED:
            return "fa-ban";
        default:
            return "fa-question";
    }
}
