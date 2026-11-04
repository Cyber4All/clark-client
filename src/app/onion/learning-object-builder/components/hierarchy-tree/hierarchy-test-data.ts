import { LearningObject } from "@entity";
import { HierarchyNode } from "./hierarchy-tree.types";

/** Detailed service fixture kept separate from the smaller demo hierarchy. */
export function buildHierarchyTestFixture(): HierarchyNode[] {
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
