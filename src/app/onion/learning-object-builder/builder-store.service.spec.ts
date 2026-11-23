import { HttpErrorResponse } from "@angular/common/http";
import { LearningObject, User } from "@entity";
import { BehaviorSubject, of, Subject } from "rxjs";
import {
    BUILDER_ACTIONS,
    BUILDER_ERRORS,
    BuilderStore,
} from "./builder-store.service";
import { LearningObjectValidator } from "./validators/learning-object.validator";
import { LearningOutcomeValidator } from "./validators/learning-outcome.validator";

describe("BuilderStore save state", () => {
    const localId = "eab4bb3a-071a-4a72-a94c-a95aa14ea2d0";
    const databaseId = "507f1f77bcf86cd799439011";
    const outcome = {
        id: localId,
        bloom: "remember and understand",
        verb: "identify",
        text: "model collapse risks",
    };
    const saveOutcome = jest.fn();
    const deleteOutcome = jest.fn();
    const addLearningOutcome = jest.fn();
    const getLearningObject = jest.fn();
    const create = jest.fn();
    const persistentError = jest.fn();
    let store: BuilderStore;

    beforeEach(() => {
        // Exercise the save boundaries without starting the debounce subscriptions.
        store = Object.assign(Object.create(BuilderStore.prototype), {
            _learningObject: new LearningObject({
                name: "Model collapse",
                description: "An introduction to model collapse",
                contributors: [new User({ username: "contributor" })],
                status: LearningObject.Status.REVIEW,
            }),
            _outcomesMap: new Map([
                [localId, { ...outcome, serviceId: databaseId }],
            ]),
            newOutcomes: new Map(),
            learningObjectEvent: new BehaviorSubject<LearningObject>(undefined),
            outcomeEvent: new Subject(),
            outcomeCache$: new BehaviorSubject(undefined),
            serviceInteraction$: new BehaviorSubject(false),
            serviceError$: new Subject<BUILDER_ERRORS>(),
            outcomeService: { saveOutcome, deleteOutcome, addLearningOutcome },
            uriRetriever: { getLearningObject },
            refactoredLearningObjectService: { create },
            validator: new LearningObjectValidator(
                new LearningOutcomeValidator(),
            ),
            toaster: { persistentError },
            titleService: { setTitle: jest.fn() },
            savedCorrectly: false,
        });
        saveOutcome.mockReset().mockResolvedValue({});
        deleteOutcome.mockReset().mockResolvedValue(undefined);
        addLearningOutcome.mockReset().mockResolvedValue({ id: databaseId });
        getLearningObject.mockReset().mockReturnValue(of(store.learningObject));
        create
            .mockReset()
            .mockResolvedValue(new LearningObject({ id: databaseId }));
        persistentError.mockClear();
    });

    it("marks an existing learning object as saved after loading it", async () => {
        const learningObject = store.learningObject;
        await expect(store.fetch("learning-object-cuid", 1)).resolves.toBe(
            learningObject,
        );
        expect(store.savedCorrectly).toBe(true);
    });

    it("marks a new learning object as saved when creation needs no follow-up update", async () => {
        store["createLearningObject"]({});
        await Promise.resolve();

        expect(store.learningObject.id).toBe(databaseId);
        expect(store.savedCorrectly).toBe(true);
    });

    it("marks a new outcome as saved after the API assigns its ID", async () => {
        store["_outcomesMap"].set(localId, { ...outcome });
        store["newOutcomes"].set(localId, true);

        await store["createLearningOutcome"](outcome);

        expect(store.currentOutcomes[0].serviceId).toBe(databaseId);
        expect(store.savedCorrectly).toBe(true);
    });

    it("restores the saved state after updating an outcome using its persisted ID", async () => {
        await store["updateLearningOutcome"](outcome);
        expect(saveOutcome).toHaveBeenCalledWith({
            ...outcome,
            id: databaseId,
        });
        expect(store.currentOutcomes[0].id).toBe(localId);
        expect(store.savedCorrectly).toBe(true);
    });

    it("clears the saved state when an outcome update fails", async () => {
        const error = new HttpErrorResponse({ status: 400 });
        saveOutcome.mockRejectedValueOnce(error);
        store.savedCorrectly = true;
        const reportError = jest.fn();
        store.serviceError$.subscribe(reportError);

        await expect(store["updateLearningOutcome"](outcome)).rejects.toBe(
            error,
        );

        expect(store.savedCorrectly).toBe(false);
        expect(reportError).toHaveBeenCalledWith(BUILDER_ERRORS.UPDATE_OUTCOME);
    });

    it("shows a persistent error for invalid outcome text and re-enables saving when corrected", async () => {
        store.savedCorrectly = true;

        await store.execute(BUILDER_ACTIONS.MUTATE_OUTCOME, {
            id: localId,
            params: { text: "" },
        });

        expect(store.savedCorrectly).toBe(false);
        expect(persistentError).toHaveBeenCalledWith(
            "Error!",
            "Text must not be an empty string.\nThese changes will not be saved.",
        );

        await store.execute(BUILDER_ACTIONS.MUTATE_OUTCOME, {
            id: localId,
            params: { text: outcome.text },
        });

        expect(store.savedCorrectly).toBe(true);
        expect(persistentError).toHaveBeenCalledTimes(1);
    });

    it("restores the saved state when deletion of a persisted outcome succeeds", async () => {
        await store.execute(BUILDER_ACTIONS.DELETE_OUTCOME, { id: localId });

        expect(deleteOutcome).toHaveBeenCalledWith(databaseId);
        expect(store.savedCorrectly).toBe(true);
    });

    it("keeps saving blocked after deleting a local outcome if the object is still invalid", async () => {
        store["_outcomesMap"].set(localId, { ...outcome });
        store.savedCorrectly = true;

        await store.execute(BUILDER_ACTIONS.DELETE_OUTCOME, { id: localId });

        expect(deleteOutcome).not.toHaveBeenCalled();
        expect(store.savedCorrectly).toBe(false);
    });

    it("restores the saved state after deleting an invalid local outcome if a valid one remains", async () => {
        const invalidId = "d3562c44-889c-4179-bc91-9b1e3720de17";
        store["_outcomesMap"].set(invalidId, {
            ...outcome,
            id: invalidId,
            text: "",
        });

        await store.execute(BUILDER_ACTIONS.DELETE_OUTCOME, { id: invalidId });

        expect(deleteOutcome).not.toHaveBeenCalled();
        expect(store.savedCorrectly).toBe(true);
    });
});
