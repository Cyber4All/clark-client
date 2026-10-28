import { BehaviorSubject, of, throwError, Subject } from "rxjs";
import { LearningObject } from "@entity";
import { BuilderStore, BUILDER_ACTIONS } from "./builder-store.service";

describe("BuilderStore outcome update identity", () => {
    it("resolves the persisted ID when an edit only carries its local UUID", async () => {
        const localId = "eab4bb3a-071a-4a72-a94c-a95aa14ea2d0";
        const databaseId = "507f1f77bcf86cd799439011";
        const saveOutcome = jest.fn(async () => ({}));
        // Exercise the update boundary without starting the store's debounce subscriptions.
        const store = Object.create(BuilderStore.prototype);
        store._outcomesMap = new Map([
            [localId, { id: localId, serviceId: databaseId }],
        ]);
        store.outcomeService = { saveOutcome };
        store.serviceInteraction$ = new BehaviorSubject(false);

        await store.updateLearningOutcome({
            id: localId,
            bloom: "remember and understand",
            verb: "identify",
            text: "model collapse risks",
        });

        expect(saveOutcome).toHaveBeenCalledWith({
            id: databaseId,
            bloom: "remember and understand",
            verb: "identify",
            text: "model collapse risks",
        });
        expect(store._outcomesMap.get(localId).id).toBe(localId);
    });
});

describe("BuilderStore status readiness", () => {
    function setup() {
        const object = {
            id: "existing-id",
            cuid: "existing-cuid",
            displayName: "Existing object",
            status: LearningObject.Status.WAITING,
            outcomes: [],
        };
        const updateLearningObjectStatus = jest
            .fn()
            .mockResolvedValue(undefined);
        const store = Object.create(BuilderStore.prototype);
        Object.assign(store, {
            savedCorrectly: false,
            uriRetriever: {
                getLearningObject: jest.fn().mockReturnValue(of(object)),
            },
            refactoredLearningObjectService: { updateLearningObjectStatus },
            validator: { saveable: true, validateLearningObject: jest.fn() },
            titleService: { setTitle: jest.fn() },
            learningObjectEvent: new BehaviorSubject(undefined),
            outcomeEvent: new BehaviorSubject(new Map()),
            serviceInteraction$: new BehaviorSubject(false),
            objectCache$: new BehaviorSubject(undefined),
            outcomeCache$: new BehaviorSubject(undefined),
            creatingOutcomes: new Map(),
            handleServiceError: jest.fn(),
            toggleBundle: jest.fn(),
        });
        return { store, object, updateLearningObjectStatus };
    }

    it("changes a freshly loaded object's status without an edit or save", async () => {
        const { store, object, updateLearningObjectStatus } = setup();
        expect(await store.fetch(object.cuid)).toBe(object);
        await store.execute(BUILDER_ACTIONS.CHANGE_STATUS, {
            status: LearningObject.Status.REVIEW,
        });
        expect(updateLearningObjectStatus).toHaveBeenCalledWith(
            "existing-id",
            LearningObject.Status.REVIEW,
            undefined,
        );
        expect(store.toggleBundle).not.toHaveBeenCalled();
    });

    it("clears readiness while loading a different object", async () => {
        const { store, object } = setup();
        store.savedCorrectly = true;
        const response = new Subject();
        store.uriRetriever.getLearningObject.mockReturnValue(response);
        const fetched = store.fetch(object.cuid);
        expect(store.savedCorrectly).toBe(false);
        response.next(object);
        response.complete();
        await fetched;
        expect(store.savedCorrectly).toBe(true);
    });

    it("keeps failed fetches blocked rather than reusing the previous saved flag", async () => {
        const { store, updateLearningObjectStatus } = setup();
        store.savedCorrectly = true;
        store.uriRetriever.getLearningObject.mockReturnValue(
            throwError(new Error("Cannot load")),
        );
        expect(await store.fetch("missing-cuid")).toBeNull();
        await expect(
            store.execute(BUILDER_ACTIONS.CHANGE_STATUS, {
                status: LearningObject.Status.REVIEW,
            }),
        ).rejects.toThrow("resolve save errors");
        expect(updateLearningObjectStatus).not.toHaveBeenCalled();
        expect(store.toggleBundle).not.toHaveBeenCalled();
    });

    it.each([
        "failed-save",
        "invalid-data",
        "active-save",
        "failed-outcome",
        "object-cache",
        "outcome-cache",
        "outcome-creation",
    ])(
        "blocks %s without changing status or falling through to bundling",
        async (condition) => {
            const { store, object, updateLearningObjectStatus } = setup();
            await store.fetch(object.cuid);
            switch (condition) {
                case "failed-save":
                    store.savedCorrectly = false;
                    break;
                case "invalid-data":
                    store.validator.saveable = false;
                    break;
                case "active-save":
                    store.serviceInteraction$.next(true);
                    break;
                case "failed-outcome":
                    store.serviceInteraction$.next(null);
                    break;
                case "object-cache":
                    store.objectCache$.next({ name: "Pending" });
                    break;
                case "outcome-cache":
                    store.outcomeCache$.next({ text: "Pending" });
                    break;
                case "outcome-creation":
                    store.creatingOutcomes.set(
                        "new-outcome",
                        Promise.resolve(),
                    );
                    break;
            }
            await expect(
                store.execute(BUILDER_ACTIONS.CHANGE_STATUS, {
                    status: LearningObject.Status.REVIEW,
                }),
            ).rejects.toThrow(/save errors|finish saving/);
            expect(updateLearningObjectStatus).not.toHaveBeenCalled();
            expect(store.toggleBundle).not.toHaveBeenCalled();
        },
    );
});
