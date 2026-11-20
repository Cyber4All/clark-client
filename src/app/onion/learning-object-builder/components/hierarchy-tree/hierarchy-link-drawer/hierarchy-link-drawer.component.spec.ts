import {
    ComponentFixture,
    fakeAsync,
    flush,
    TestBed,
    tick,
} from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { of, Subject, throwError } from "rxjs";
import { LearningObject } from "@entity";
import { HierarchyService } from "../../../../../core/learning-object-module/hierarchy/hierarchy.service";
import { TopicsService } from "../../../../../core/learning-object-module/topics/topics.service";
import {
    HierarchyLinkDrawerComponent,
    LINK_PAGE_SIZE,
} from "./hierarchy-link-drawer.component";

const { COURSE, UNIT, MODULE, MICROMODULE, NANOMODULE } = LearningObject.Length;

const candidate = (
    id: string,
    length: LearningObject.Length = MODULE,
    over: Record<string, unknown> = {},
): LearningObject =>
    ({
        id,
        name: `Released ${id}`,
        length,
        description: `About ${id}`,
        author: { username: "bob", name: "Bob Builder" },
        ...over,
    }) as unknown as LearningObject;

const page = (ids: string[], total = ids.length) => ({
    learningObjects: ids.map((id) => candidate(id)),
    total,
});

describe("HierarchyLinkDrawerComponent", () => {
    let fixture: ComponentFixture<HierarchyLinkDrawerComponent>;
    let component: HierarchyLinkDrawerComponent;
    let searchLinkCandidates: jest.Mock;
    let getTopics: jest.Mock;

    const el = (): HTMLElement => fixture.nativeElement;
    const names = (): string[] =>
        Array.from(el().querySelectorAll(".link-drawer__name")).map((n) =>
            n.textContent!.trim(),
        );
    const lastQuery = () =>
        searchLinkCandidates.mock.calls[
            searchLinkCandidates.mock.calls.length - 1
        ][0];

    /** Create the component with the first search resolved. */
    function render(inputs: Partial<HierarchyLinkDrawerComponent> = {}): void {
        fixture = TestBed.createComponent(HierarchyLinkDrawerComponent);
        component = fixture.componentInstance;
        Object.assign(component, {
            parentId: "parent-1",
            parentName: "Intro to Security",
            parentLength: UNIT,
            hierarchyRootId: "root-1",
            currentUsername: "alice",
            ...inputs,
        });
        fixture.detectChanges();
        tick();
        fixture.detectChanges();
    }

    /** Type in the search box and let the debounce pass. */
    function typeSearch(text: string): void {
        component.form.controls.text.setValue(text);
        tick(300);
        fixture.detectChanges();
    }

    beforeEach(() => {
        searchLinkCandidates = jest.fn(() => of(page(["a", "b"])));
        getTopics = jest.fn().mockResolvedValue([
            { _id: "t1", name: "Cryptography" },
            { _id: "t2", name: "Networks" },
        ]);
        TestBed.configureTestingModule({
            imports: [HierarchyLinkDrawerComponent],
            providers: [
                {
                    provide: HierarchyService,
                    useValue: { searchLinkCandidates },
                },
                { provide: TopicsService, useValue: { getTopics } },
            ],
        });
    });

    afterEach(fakeAsync(() => {
        fixture?.destroy();
        flush();
    }));

    describe("first search", () => {
        it("searches on open for the parent, in the hierarchy root, limited to lengths shorter than the parent", fakeAsync(() => {
            render();

            expect(searchLinkCandidates).toHaveBeenCalledTimes(1);
            expect(lastQuery()).toEqual({
                parentId: "parent-1",
                hierarchyRootId: "root-1",
                text: undefined,
                topics: undefined,
                length: [NANOMODULE, MICROMODULE, MODULE],
                currPage: 1,
                limit: LINK_PAGE_SIZE,
            });
        }));

        it("lists the results with their length and author", fakeAsync(() => {
            render();

            expect(names()).toEqual(["Released a", "Released b"]);
            const first = el().querySelector(".link-drawer__item")!;
            expect(first.textContent).toContain("Module");
            expect(first.textContent).toContain("by Bob Builder");
            expect(first.textContent).toContain("About a");
            expect(
                el().querySelector(".link-drawer__summary")!.textContent,
            ).toContain("2 released objects can be linked here");
        }));

        it("shows the description as plain text, not markup", fakeAsync(() => {
            searchLinkCandidates.mockReturnValue(
                of({
                    learningObjects: [
                        candidate("html", MODULE, {
                            description:
                                "<p>Learn <strong>C++</strong>&nbsp;basics.</p><script>alert(1)</script>",
                        }),
                    ],
                    total: 1,
                }),
            );
            render();

            const description = el().querySelector(
                ".link-drawer__description",
            )!;
            expect(description.textContent!.trim()).toBe(
                "Learn C++ basics.alert(1)",
            );
            expect(description.querySelector("strong, p, script")).toBeNull();
        }));

        it("hides the description line when there is none", fakeAsync(() => {
            searchLinkCandidates.mockReturnValue(
                of({
                    learningObjects: [
                        candidate("bare", MODULE, { description: "<p> </p>" }),
                    ],
                    total: 1,
                }),
            );
            render();
            expect(el().querySelector(".link-drawer__description")).toBeNull();
        }));

        it("marks the author's own released objects instead of showing a byline", fakeAsync(() => {
            searchLinkCandidates.mockReturnValue(
                of({
                    learningObjects: [
                        candidate("mine", MODULE, {
                            author: { username: "alice", name: "Alice" },
                        }),
                    ],
                    total: 1,
                }),
            );
            render();

            const item = el().querySelector(".link-drawer__item")!;
            expect(item.textContent).toContain("Your object");
            expect(item.textContent).not.toContain("by Alice");
        }));

        it("offers length filters only for lengths shorter than the parent", fakeAsync(() => {
            render({ parentLength: MODULE });

            const labels = Array.from(
                el().querySelectorAll(".link-drawer__chip"),
            ).map((chip) => chip.textContent!.trim());
            expect(labels).toEqual(["Nanomodule", "Micromodule"]);
        }));

        it("offers all four shorter lengths for a Course parent", fakeAsync(() => {
            render({ parentLength: COURSE });
            expect(el().querySelectorAll(".link-drawer__chip").length).toBe(4);
        }));

        it("loads the topics for the topic filter", fakeAsync(() => {
            render();

            const options = Array.from(
                el().querySelectorAll("#link-drawer-topic option"),
            ).map((o) => o.textContent!.trim());
            expect(options).toEqual(["All topics", "Cryptography", "Networks"]);
        }));

        it("says so, and keeps searching, when the topics cannot be loaded", fakeAsync(() => {
            getTopics.mockRejectedValue(new Error("nope"));
            render();

            expect(el().textContent).toContain(
                "Topics could not be loaded, so the topic filter is unavailable.",
            );
            expect(names().length).toBe(2);
        }));

        it("shows a busy skeleton while the first search is running", fakeAsync(() => {
            searchLinkCandidates.mockReturnValue(new Subject());
            render();

            expect(component.state).toBe("loading");
            expect(el().querySelector(".link-drawer__loading")).toBeTruthy();
            expect(
                el().querySelector(".link-drawer")!.getAttribute("aria-busy"),
            ).toBe("true");
        }));
    });

    describe("filtering", () => {
        it("waits for typing to pause, then searches with the text", fakeAsync(() => {
            render();
            searchLinkCandidates.mockClear();

            component.form.controls.text.setValue("fire");
            tick(100);
            component.form.controls.text.setValue("firewall");
            tick(299);
            expect(searchLinkCandidates).not.toHaveBeenCalled();
            tick(1);

            expect(searchLinkCandidates).toHaveBeenCalledTimes(1);
            expect(lastQuery().text).toBe("firewall");
            expect(lastQuery().currPage).toBe(1);
        }));

        it("does not search for 1 or 2 characters and says how many are needed", fakeAsync(() => {
            render();
            searchLinkCandidates.mockClear();

            typeSearch("fi");

            expect(searchLinkCandidates).not.toHaveBeenCalled();
            expect(
                el().querySelector(".link-drawer__summary")!.textContent,
            ).toContain("Type at least 3 characters");
            expect(el().querySelector(".link-drawer__state")).toBeNull();
        }));

        it("searches again when the text is cleared", fakeAsync(() => {
            render();
            typeSearch("fire");
            searchLinkCandidates.mockClear();

            typeSearch("");

            expect(searchLinkCandidates).toHaveBeenCalledTimes(1);
            expect(lastQuery().text).toBeUndefined();
        }));

        it("sends only the chosen lengths", fakeAsync(() => {
            render();
            searchLinkCandidates.mockClear();

            component.onLengthToggle(MICROMODULE, true);
            tick(300);

            expect(lastQuery().length).toEqual([MICROMODULE]);

            component.onLengthToggle(MICROMODULE, false);
            tick(300);
            expect(lastQuery().length).toEqual([
                NANOMODULE,
                MICROMODULE,
                MODULE,
            ]);
        }));

        it("sends the chosen topic", fakeAsync(() => {
            render();
            searchLinkCandidates.mockClear();

            component.form.controls.topic.setValue("t2");
            tick(300);

            expect(lastQuery().topics).toEqual(["t2"]);
        }));

        it("clears every filter with one button, which only shows when a filter is set", fakeAsync(() => {
            render();
            expect(el().querySelector(".link-drawer__clear")).toBeNull();

            component.form.controls.topic.setValue("t1");
            component.onLengthToggle(MODULE, true);
            typeSearch("crypto");
            expect(el().querySelector(".link-drawer__clear")).toBeTruthy();

            searchLinkCandidates.mockClear();
            el()
                .querySelector<HTMLButtonElement>(".link-drawer__clear")!
                .click();
            tick(300);

            expect(component.form.getRawValue()).toEqual({
                text: "",
                topic: "",
                lengths: [],
            });
            expect(searchLinkCandidates).toHaveBeenCalledTimes(1);
        }));

        it("ignores a slow answer to an old search", fakeAsync(() => {
            const slow = new Subject<ReturnType<typeof page>>();
            render();
            searchLinkCandidates.mockReturnValueOnce(slow);
            typeSearch("old");
            searchLinkCandidates.mockReturnValueOnce(of(page(["fresh"])));
            typeSearch("newer");

            slow.next(page(["stale"]));
            fixture.detectChanges();

            expect(names()).toEqual(["Released fresh"]);
        }));
    });

    describe("states", () => {
        it("explains an empty result with filters, and without them", fakeAsync(() => {
            searchLinkCandidates.mockReturnValue(of(page([])));
            render();
            expect(el().textContent).toContain(
                "There are no released objects that can be linked here.",
            );

            typeSearch("zzz");
            expect(el().textContent).toContain("No released objects match.");
        }));

        it("shows an alert with Try again when the search fails, and recovers", fakeAsync(() => {
            searchLinkCandidates.mockReturnValue(
                throwError(() => new Error("down")),
            );
            render();

            expect(component.state).toBe("error");
            expect(
                el().querySelector('.link-drawer__state[role="alert"]')!
                    .textContent,
            ).toContain("could not be loaded");

            searchLinkCandidates.mockReturnValue(of(page(["a"])));
            el()
                .querySelector<HTMLButtonElement>(".link-drawer__state button")!
                .click();
            fixture.detectChanges();

            expect(component.state).toBe("ready");
            expect(names()).toEqual(["Released a"]);
        }));
    });

    describe("paging", () => {
        const ids = (from: number, count: number) =>
            Array.from({ length: count }, (_, i) => `r${from + i}`);

        it("shows 'Show more' only when more results exist", fakeAsync(() => {
            searchLinkCandidates.mockReturnValue(of(page(ids(0, 10), 25)));
            render();
            expect(el().textContent).toContain("Show more");

            component.candidates = [];
            component.total = 0;
            fixture.detectChanges();
            expect(el().textContent).not.toContain("Show more");
        }));

        it("appends the next page", fakeAsync(() => {
            searchLinkCandidates.mockReturnValueOnce(of(page(ids(0, 10), 15)));
            render();
            searchLinkCandidates.mockReturnValueOnce(of(page(ids(10, 5), 15)));

            component.onLoadMore();
            fixture.detectChanges();

            expect(lastQuery().currPage).toBe(2);
            expect(names().length).toBe(15);
            expect(el().textContent).not.toContain("Show more");
        }));

        it("does not repeat or skip results after one was linked", fakeAsync(() => {
            searchLinkCandidates.mockReturnValueOnce(of(page(ids(0, 10), 15)));
            render();
            component.markLinked("r0");
            // The server's list is one shorter now, so page 1 holds r1..r10.
            searchLinkCandidates.mockReturnValueOnce(
                of(page([...ids(1, 10)], 14)),
            );

            component.onLoadMore();
            fixture.detectChanges();

            expect(lastQuery().currPage).toBe(1);
            expect(component.candidates.map((c) => c.id)).toEqual(ids(1, 10));
            // r10 is the one new result, and nothing is shown twice.
            expect(new Set(component.candidates.map((c) => c.id)).size).toBe(
                component.candidates.length,
            );
        }));

        it("keeps the results and says so when a later page fails", fakeAsync(() => {
            searchLinkCandidates.mockReturnValueOnce(of(page(ids(0, 10), 15)));
            render();
            searchLinkCandidates.mockReturnValueOnce(
                throwError(() => new Error("down")),
            );

            component.onLoadMore();
            fixture.detectChanges();

            expect(component.state).toBe("ready");
            expect(names().length).toBe(10);
            expect(
                el().querySelector('.link-drawer__note[role="alert"]')!
                    .textContent,
            ).toContain("More results could not be loaded");
        }));
    });

    describe("linking", () => {
        const linkButtons = () =>
            Array.from(
                el().querySelectorAll<HTMLButtonElement>(
                    ".link-drawer__item button",
                ),
            );

        it("emits the chosen result and locks every Link button while it saves", fakeAsync(() => {
            render();
            const emitted: LearningObject[] = [];
            component.link.subscribe((lo) => emitted.push(lo));

            linkButtons()[1].click();
            fixture.detectChanges();

            expect(emitted.map((lo) => lo.id)).toEqual(["b"]);
            expect(linkButtons().every((b) => b.disabled)).toBe(true);
            expect(linkButtons()[1].textContent).toContain("Linking…");

            linkButtons()[0].click();
            expect(emitted.length).toBe(1);
        }));

        it("labels each button with the object and the parent", fakeAsync(() => {
            render();
            expect(linkButtons()[0].getAttribute("aria-label")).toBe(
                "Link Released a under Intro to Security",
            );
        }));

        it("removes a linked result, counts it, and unlocks the rest", fakeAsync(() => {
            render();
            linkButtons()[0].click();
            component.markLinked("a");
            fixture.detectChanges();

            expect(names()).toEqual(["Released b"]);
            expect(component.total).toBe(1);
            expect(
                el().querySelector(".link-drawer__summary")!.textContent,
            ).toContain("1 linked so far");
            expect(linkButtons()[0].disabled).toBe(false);
        }));

        it("shows why a link failed, keeps the result, and unlocks the buttons", fakeAsync(() => {
            render();
            linkButtons()[0].click();
            component.showLinkError("It could not be linked.");
            fixture.detectChanges();

            expect(names()).toEqual(["Released a", "Released b"]);
            expect(
                el().querySelector('.link-drawer__note[role="alert"]')!
                    .textContent,
            ).toContain("It could not be linked.");
            expect(linkButtons().every((b) => !b.disabled)).toBe(true);
        }));

        it("clears the earlier error when the author tries again", fakeAsync(() => {
            render();
            component.showLinkError("Nope.");
            linkButtons()[0].click();
            fixture.detectChanges();
            expect(component.linkError).toBe("");
        }));
    });

    describe("accessibility", () => {
        it("is a labelled modal dialog with a focus trap", fakeAsync(() => {
            render();
            const dialog = el().querySelector('[role="dialog"]')!;
            expect(dialog.getAttribute("aria-modal")).toBe("true");
            expect(
                el().querySelector(
                    `#${dialog.getAttribute("aria-labelledby")}`,
                )!.textContent,
            ).toContain("Link a released object");
        }));

        it("announces the result count politely", fakeAsync(() => {
            render();
            const status = el().querySelector('[role="status"]')!;
            expect(status.getAttribute("aria-live")).toBe("polite");
        }));

        it("emits close from the close button", fakeAsync(() => {
            render();
            let closed = 0;
            component.close.subscribe(() => closed++);
            fixture.debugElement
                .query(By.css(".link-drawer__close"))
                .nativeElement.click();
            expect(closed).toBe(1);
        }));
    });

    it("stops searching once it is destroyed", fakeAsync(() => {
        render();
        searchLinkCandidates.mockClear();
        fixture.destroy();
        component.form.controls.text.setValue("late");
        tick(300);
        expect(searchLinkCandidates).not.toHaveBeenCalled();
    }));
});
