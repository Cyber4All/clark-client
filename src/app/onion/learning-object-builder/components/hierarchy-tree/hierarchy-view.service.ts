import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { LearningObject } from "@entity";
import { HierarchyNode } from "./hierarchy-tree.types";
import { canHaveChildren, isValidChildLength } from "./hierarchy-length.util";

/**
 * Feature-local state for the Builder Hierarchy tree (sc-40233).
 *
 * This service holds the hierarchy as a presentation view-model in a
 * BehaviorSubject, mirroring the repo's custom-RxJS store pattern (see
 * `BuilderStore`). For this story it is seeded with MOCK/LOCAL data only and
 * performs NO API calls: it is the component + interaction shell.
 *
 * Later stories replace the seed + persistence seam with real data:
 *   - sc-40236 wires create-new-child and reorder/re-parent persistence
 *   - sc-40237 wires link-existing
 *
 * It is NOT provided in root; the Hierarchy page provides it so its lifetime
 * matches the tab, consistent with how builder state is scoped.
 */
@Injectable()
export class HierarchyViewService {
    private readonly treeSubject = new BehaviorSubject<HierarchyNode[]>([]);

    /** The current hierarchy roots (typically a single root = the current learning object). */
    readonly tree$: Observable<HierarchyNode[]> =
        this.treeSubject.asObservable();

    /** Synchronous snapshot of the current tree. */
    get tree(): HierarchyNode[] {
        return this.treeSubject.value;
    }

    /** Seed the tree with mock data. Replaced by real data wiring in later stories. */
    seedMockData(): void {
        this.treeSubject.next(buildMockHierarchy());
    }

    /** Replace the whole tree (used by tests and, later, real data loads). */
    setTree(tree: HierarchyNode[]): void {
        this.treeSubject.next(tree);
    }

    /** Toggle expand/collapse for the node with the given id. */
    toggleExpanded(id: string): void {
        const next = mapNodes(this.treeSubject.value, (node) =>
            node.id === id ? { ...node, expanded: !node.expanded } : node,
        );
        this.treeSubject.next(next);
    }

    /**
     * Whether `node` may be dropped as a child of `target`.
     *
     * Enforces the hierarchy rules the drag-and-drop predicate relies on:
     *   - the target must be editable (you cannot edit relationships inside a
     *     linked/read-only subtree);
     *   - the target length must be able to have children;
     *   - the dragged node's length must be strictly shorter than the target;
     *   - a node cannot be dropped into itself or its own descendants.
     */
    canDrop(node: HierarchyNode, target: HierarchyNode): boolean {
        if (!target.editable) {
            return false;
        }
        if (!canHaveChildren(target.length)) {
            return false;
        }
        if (node.id === target.id || isDescendant(node, target.id)) {
            return false;
        }

        return isValidChildLength(target.length, node.length);
    }

    /**
     * Whether `nodeId` may be MOVED (relocated within the hierarchy), which is
     * distinct from whether it may be edited.
     *
     * Movable when:
     *   - it is an editable node the author owns, OR
     *   - it is the root of a linked subtree (read-only but owned as a
     *     relationship by the consuming parent);
     * AND it is NOT inside a linked subtree (a descendant of a linked root).
     *
     * Descendants of a linked root are fully immutable: they cannot be moved
     * independently because their relationships are owned by the linked object,
     * not by the current author.
     */
    canMove(nodeId: string): boolean {
        const tree = this.treeSubject.value;
        const node = findNode(tree, nodeId);
        if (!node) {
            return false;
        }
        if (isInsideLinkedSubtree(tree, nodeId)) {
            return false;
        }

        return node.editable || !!node.linkedRoot;
    }

    /**
     * Move `nodeId` to become a child of `targetId` in the local view-model,
     * if the move is valid. Returns true when the move was applied.
     *
     * When `index` is provided, the node is inserted at that position among the
     * target's children (enabling reordering within a parent and precise
     * re-parenting); otherwise it is appended. The index is clamped to the
     * valid range and is interpreted against the target's children AFTER the
     * node has been removed, so reordering within the same parent is stable.
     *
     * A linked root moves together with its entire subtree because the node
     * object (and its `children`) is relocated as a unit; its descendants are
     * never moved independently.
     */
    moveNode(nodeId: string, targetId: string, index?: number): boolean {
        const tree = this.treeSubject.value;
        const node = findNode(tree, nodeId);
        const target = findNode(tree, targetId);

        if (!node || !target) {
            return false;
        }
        // The node must be movable at all (editable node or a linked root, and
        // not buried inside a linked subtree).
        if (!this.canMove(nodeId)) {
            return false;
        }
        // Reordering within the same parent is a move, not a re-parent, so it is
        // allowed even though `canDrop` (a re-parent check) would reject
        // target === the node's own current parent. Distinguish the two intents.
        const sameParent = this.parentIdOf(nodeId) === targetId;
        if (!sameParent && !this.canDrop(node, target)) {
            return false;
        }

        const withoutNode = removeNode(tree, nodeId);
        const inserted = mapNodes(withoutNode, (n) => {
            if (n.id !== targetId) {
                return n;
            }
            const children = [...n.children];
            const at =
                index === undefined
                    ? children.length
                    : Math.max(0, Math.min(index, children.length));
            children.splice(at, 0, node);

            return { ...n, children, expanded: true };
        });
        this.treeSubject.next(inserted);

        return true;
    }

    /** The id of the direct parent of `nodeId`, or undefined if it is a root. */
    parentIdOf(nodeId: string): string | undefined {
        return parentIdOf(this.treeSubject.value, nodeId);
    }
}

/**
 * Mock hierarchy for exercising the Builder Hierarchy tree (sc-40233).
 *
 * This is a deliberately rich seed so the UI and drag-and-drop rules are easy
 * to test manually: a Course root with a mix of Unit and Micromodule children,
 * several levels of depth (Course > Unit > Module > Micromodule > Nanomodule),
 * multiple siblings per level, and a few linked/read-only nodes (one leaf and
 * one whole subtree) to verify the read-only treatment and whole-unit moves.
 *
 * Length rule reminder (child must be strictly SHORTER than parent):
 *   Nanomodule < Micromodule < Module < Unit < Course
 */
function buildMockHierarchy(): HierarchyNode[] {
    const { COURSE, UNIT, MODULE, MICROMODULE, NANOMODULE } =
        LearningObject.Length;

    return [
        {
            id: "root",
            name: "Intro to Cybersecurity",
            length: COURSE,
            editable: true,
            expanded: true,
            children: [
                // ----- Unit branch: deep, fully editable -----
                {
                    id: "unit-foundations",
                    name: "Foundations Unit",
                    length: UNIT,
                    editable: true,
                    expanded: true,
                    children: [
                        {
                            id: "mod-core-concepts",
                            name: "Core Concepts",
                            length: MODULE,
                            editable: true,
                            expanded: true,
                            children: [
                                {
                                    id: "micro-cia-triad",
                                    name: "CIA Triad",
                                    length: MICROMODULE,
                                    editable: true,
                                    expanded: true,
                                    children: [
                                        {
                                            id: "nano-confidentiality",
                                            name: "Confidentiality",
                                            length: NANOMODULE,
                                            editable: true,
                                            children: [],
                                        },
                                        {
                                            id: "nano-integrity",
                                            name: "Integrity",
                                            length: NANOMODULE,
                                            editable: true,
                                            children: [],
                                        },
                                        {
                                            id: "nano-availability",
                                            name: "Availability",
                                            length: NANOMODULE,
                                            editable: true,
                                            children: [],
                                        },
                                    ],
                                },
                                {
                                    id: "micro-threat-models",
                                    name: "Threat Models",
                                    length: MICROMODULE,
                                    editable: true,
                                    children: [],
                                },
                            ],
                        },
                        {
                            id: "mod-cryptography",
                            name: "Cryptography",
                            length: MODULE,
                            editable: true,
                            expanded: true,
                            children: [
                                {
                                    id: "micro-symmetric",
                                    name: "Symmetric Encryption",
                                    length: MICROMODULE,
                                    editable: true,
                                    children: [],
                                },
                                {
                                    id: "micro-asymmetric",
                                    name: "Asymmetric Encryption",
                                    length: MICROMODULE,
                                    editable: true,
                                    children: [],
                                },
                            ],
                        },
                    ],
                },

                // ----- Micromodule branch: editable parent, linked leaf -----
                {
                    id: "network-security",
                    name: "Network Security",
                    length: MICROMODULE,
                    editable: true,
                    expanded: true,
                    children: [
                        {
                            id: "nano-firewalls",
                            name: "Firewalls & ACLs",
                            length: NANOMODULE,
                            editable: true,
                            children: [],
                        },
                        {
                            id: "network-security-lab",
                            name: "Network Security Lab",
                            length: NANOMODULE,
                            // Linked/read-only: released content from another author.
                            editable: false,
                            children: [],
                        },
                    ],
                },

                // ----- Linked SUBTREE: the root is movable (not editable);
                //        its descendants are fully immutable and move with it. -----
                {
                    id: "incident-response",
                    name: "Incident Response (Linked)",
                    length: MODULE,
                    // Read-only (cannot edit name/length/children) ...
                    editable: false,
                    // ... but this is the linked root the author linked in, so it
                    // can be MOVED as a whole unit into any valid parent.
                    linkedRoot: true,
                    expanded: true,
                    children: [
                        {
                            id: "micro-detection",
                            name: "Detection & Triage",
                            length: MICROMODULE,
                            editable: false,
                            children: [
                                {
                                    id: "nano-siem",
                                    name: "SIEM Basics",
                                    length: NANOMODULE,
                                    editable: false,
                                    children: [],
                                },
                            ],
                        },
                        {
                            id: "micro-recovery",
                            name: "Containment & Recovery",
                            length: MICROMODULE,
                            editable: false,
                            children: [],
                        },
                    ],
                },

                // ----- A top-level Nanomodule child (leaf) -----
                {
                    id: "nano-glossary",
                    name: "Security Glossary",
                    length: NANOMODULE,
                    editable: true,
                    children: [],
                },
            ],
        },
    ];
}

/** Immutably map over every node in the forest, preserving structure. */
function mapNodes(
    nodes: HierarchyNode[],
    fn: (node: HierarchyNode) => HierarchyNode,
): HierarchyNode[] {
    return nodes.map((node) => {
        const mapped = fn(node);

        return { ...mapped, children: mapNodes(mapped.children, fn) };
    });
}

/** Find a node by id anywhere in the forest. */
function findNode(
    nodes: HierarchyNode[],
    id: string,
): HierarchyNode | undefined {
    for (const node of nodes) {
        if (node.id === id) {
            return node;
        }
        const found = findNode(node.children, id);
        if (found) {
            return found;
        }
    }

    return undefined;
}

/** Whether `id` is `node` itself or appears anywhere in its subtree. */
function isDescendant(node: HierarchyNode, id: string): boolean {
    return !!findNode(node.children, id);
}

/**
 * Whether the node with `targetId` sits inside a linked subtree — i.e. it has
 * an ANCESTOR marked `linkedRoot`. The linked root itself is NOT "inside" a
 * linked subtree (it is the boundary), so it remains movable; everything below
 * it is immutable.
 */
function isInsideLinkedSubtree(
    nodes: HierarchyNode[],
    targetId: string,
    underLinkedRoot = false,
): boolean {
    for (const node of nodes) {
        if (node.id === targetId) {
            return underLinkedRoot;
        }
        // Descend; once we pass through a linked root, everything beneath it is
        // inside a linked subtree.
        if (
            isInsideLinkedSubtree(
                node.children,
                targetId,
                underLinkedRoot || !!node.linkedRoot,
            )
        ) {
            return true;
        }
    }

    return false;
}

/** Return a new forest with the node of the given id removed. */
function removeNode(nodes: HierarchyNode[], id: string): HierarchyNode[] {
    return nodes
        .filter((node) => node.id !== id)
        .map((node) => ({ ...node, children: removeNode(node.children, id) }));
}

/** Find the id of the direct parent of `childId`, or undefined for a root. */
function parentIdOf(
    nodes: HierarchyNode[],
    childId: string,
    parent?: string,
): string | undefined {
    for (const node of nodes) {
        if (node.id === childId) {
            return parent;
        }
        const found = parentIdOf(node.children, childId, node.id);
        if (found !== undefined) {
            return found;
        }
    }

    return undefined;
}
