import { Component, OnDestroy, OnInit } from "@angular/core";
import { LearningObject } from "@entity";
import { Subject } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { BuilderStore } from "../../builder-store.service";
import { HierarchyTreeComponent } from "../../components/hierarchy-tree/hierarchy-tree.component";
import { HierarchyViewService } from "../../components/hierarchy-tree/hierarchy-view.service";

/**
 * Hierarchy tab page in the Learning Object Builder (sc-40233).
 *
 * Unlike the sibling builder pages, this tab no longer renders the legacy
 * "Children" scaffold in the left column; the hierarchy tree replaces it. The
 * column wrapper renders only the main column so the tree spans the full page
 * width. The tree is driven by mock/local data via {@link HierarchyViewService}.
 *
 * The view service is provided at the page level so its lifetime matches the
 * tab, consistent with how builder state is scoped in this feature.
 */
@Component({
    selector: "clark-hierarchy-page",
    templateUrl: "./hierarchy-page.component.html",
    styleUrls: ["./hierarchy-page.component.scss"],
    standalone: true,
    providers: [HierarchyViewService],
    imports: [HierarchyTreeComponent],
})
export class HierarchyPageComponent implements OnInit, OnDestroy {
    learningObject: LearningObject;
    destroyed$: Subject<void> = new Subject();

    constructor(private store: BuilderStore) {}

    ngOnInit(): void {
        this.store.learningObjectEvent
            .pipe(
                filter((learningObject) => learningObject !== undefined),
                takeUntil(this.destroyed$),
            )
            .subscribe((learningObject: LearningObject) => {
                this.learningObject = learningObject;
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.unsubscribe();
    }
}
