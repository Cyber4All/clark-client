import {
    Component,
    ElementRef,
    AfterViewInit,
    ViewChild,
    OnDestroy,
    Input,
} from "@angular/core";
import { NgClass, NgIf } from "@angular/common";

// prettier-ignore
@Component({
    selector: "clark-column-wrapper",
    templateUrl: "./column-wrapper.component.html",
    styleUrls: ["./column-wrapper.component.scss"],
    standalone: true,
    imports: [NgClass, NgIf],
})
export class ColumnWrapperComponent implements AfterViewInit, OnDestroy {
    @ViewChild("columnWrapper") columnWrapper: ElementRef;

    @Input() columns = "lmr";

    private resizeObserver?: ResizeObserver;

    ngAfterViewInit() {
        // TODO check for right column and adjust mobile threshold here
        // TODO collapse left panel on smaller screens

        const scrollWrapper = (
            this.columnWrapper.nativeElement as HTMLElement
        ).querySelector(".scroll-wrapper") as HTMLElement;
        if (typeof ResizeObserver !== "undefined") {
            this.resizeObserver = new ResizeObserver(() =>
                this.updateBodyOverflow(scrollWrapper),
            );
            this.resizeObserver.observe(scrollWrapper);
        } else {
            setTimeout(() => this.updateBodyOverflow(scrollWrapper));
        }
    }

    private updateBodyOverflow(scrollWrapper: HTMLElement): void {
        // Keep the outcomes sidebar visible when the available height is small.
        document.body.style.overflowY =
            scrollWrapper.offsetHeight >= 560 ? "hidden" : "";
        document.body.style.overflowX =
            scrollWrapper.offsetHeight >= 560 ? "auto" : "";
    }

    get rightColumn(): boolean {
        return this.columns.indexOf("r") >= 0;
    }

    get leftColumn(): boolean {
        return this.columns.indexOf("l") >= 0;
    }

    showColumn(value: "l" | "m" | "r"): boolean {
        return this.columns.indexOf(value) >= 0;
    }

    ngOnDestroy() {
        this.resizeObserver?.disconnect();
        // remove any lingering styles from the document body
        document.body.style.overflow = "visible";
    }
}
