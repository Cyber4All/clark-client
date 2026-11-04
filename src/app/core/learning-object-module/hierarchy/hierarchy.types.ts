import { LearningObject } from "@entity";

/**
 * A user reference as returned inside a learning object payload.
 * Only the field the hierarchy feature reads is typed.
 */
export interface HierarchyChildUser {
    username: string;
}

/**
 * One direct child of a learning object, as returned by
 * `GET /learning-objects/:learningObjectId/children` (a clark-service
 * `FullLearningObject`). Only the fields the Builder hierarchy reads are typed.
 */
export interface HierarchyChildPayload {
    id: string;
    name: string;
    length: LearningObject.Length;
    status: LearningObject.Status;
    author: HierarchyChildUser;
    contributors?: HierarchyChildUser[];
}
