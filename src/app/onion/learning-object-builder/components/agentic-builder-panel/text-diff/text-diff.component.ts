import { NgFor, NgIf } from "@angular/common";
import { Component, Input } from "@angular/core";
import { diffWordsWithSpace } from "diff";

interface DiffSegment {
    value: string;
    added?: boolean;
    removed?: boolean;
}

@Component({
    selector: "onion-agentic-text-diff",
    templateUrl: "./text-diff.component.html",
    styleUrls: ["./text-diff.component.scss"],
    standalone: true,
    imports: [NgFor, NgIf],
})
export class TextDiffComponent {
    @Input() current = "";
    @Input() suggested = "";

    expanded = false;

    get identical(): boolean {
        return this.current === this.suggested;
    }

    get originalEmpty(): boolean {
        return !this.current;
    }

    get fullSegments(): DiffSegment[] {
        return diffWordsWithSpace(this.current, this.suggested);
    }

    get hasLongComparison(): boolean {
        return this.totalUnchangedLength(this.fullSegments) > 140;
    }

    get displaySegments(): DiffSegment[] {
        const segments = this.fullSegments;
        if (this.expanded || !this.hasLongComparison) {
            return segments;
        }

        const changedIndexes = segments
            .map((segment, index) =>
                segment.added || segment.removed ? index : -1,
            )
            .filter((index) => index >= 0);
        const visible = new Set<number>();
        changedIndexes.forEach((index) => {
            for (
                let contextIndex = Math.max(0, index - 1);
                contextIndex <= Math.min(segments.length - 1, index + 1);
                contextIndex++
            ) {
                visible.add(contextIndex);
            }
        });

        const result: DiffSegment[] = [];
        let hiddenUnchanged = false;
        segments.forEach((segment, index) => {
            if (!visible.has(index) && !segment.added && !segment.removed) {
                hiddenUnchanged = true;
                return;
            }
            if (hiddenUnchanged) {
                result.push({ value: "…" });
                hiddenUnchanged = false;
            }
            result.push(segment);
        });
        if (hiddenUnchanged) result.push({ value: "…" });
        return result;
    }

    toggleExpanded(): void {
        this.expanded = !this.expanded;
    }

    private totalUnchangedLength(segments: DiffSegment[]): number {
        return segments
            .filter((segment) => !segment.added && !segment.removed)
            .reduce((length, segment) => length + segment.value.length, 0);
    }
}
