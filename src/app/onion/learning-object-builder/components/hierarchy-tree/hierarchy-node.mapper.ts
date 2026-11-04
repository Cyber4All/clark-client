import { LearningObject } from "@entity";
import { HierarchyNode, HierarchyViewer } from "./hierarchy-tree.types";

/**
 * Whether the viewer may edit a child: they are its author or a contributor,
 * or they are an admin/editor. This mirrors the existing Builder access rule;
 * hierarchy permissions are unchanged (sc-40640).
 */
export function canViewerEdit(
    payload: LearningObject,
    viewer: HierarchyViewer,
): boolean {
    if (viewer.isAdminOrEditor) {
        return true;
    }
    if (!viewer.username) {
        return false;
    }

    return (
        payload.author?.username === viewer.username ||
        !!payload.contributors?.some((c) => c.username === viewer.username)
    );
}

/**
 * Map one API child into the tree view-model (without its children).
 *
 * `key` is the unique occurrence key for this appearance in the tree (see
 * {@link HierarchyNode.id}); it defaults to the learning object id.
 *
 * A child the viewer cannot edit becomes a linked/read-only ROOT
 * (`editable: false, linkedRoot: true`). Anything under a read-only node is
 * fully immutable (`insideReadOnly`), so it is never marked as a linked root.
 */
export function toHierarchyNode(
    payload: LearningObject,
    viewer: HierarchyViewer,
    insideReadOnly = false,
    key: string = payload.id,
): HierarchyNode {
    if (insideReadOnly) {
        return {
            id: key,
            learningObjectId: payload.id,
            name: payload.name,
            length: payload.length,
            editable: false,
            children: [],
        };
    }
    const editable = canViewerEdit(payload, viewer);

    return {
        id: key,
        learningObjectId: payload.id,
        name: payload.name,
        length: payload.length,
        editable,
        ...(editable ? {} : { linkedRoot: true }),
        children: [],
    };
}
