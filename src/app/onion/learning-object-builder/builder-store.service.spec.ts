import { BehaviorSubject } from "rxjs";
import { BuilderStore } from "./builder-store.service";

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

describe("BuilderStore removeEmptyOutcomes", () => {
    it("does nothing when no learning object has been loaded", async () => {
        const store = Object.create(BuilderStore.prototype);
        store.fetch = jest.fn();
        store.uriRetriever = { getLearningObject: jest.fn() };

        await expect(store.removeEmptyOutcomes()).resolves.toBeUndefined();

        expect(store.fetch).not.toHaveBeenCalled();
        expect(store.uriRetriever.getLearningObject).not.toHaveBeenCalled();
    });

    it("stops when refreshing the learning object fails", async () => {
        const store = Object.create(BuilderStore.prototype);
        store._learningObject = { cuid: "abc", version: 0 };
        store.fetch = jest.fn(async () => null);
        store.uriRetriever = { getLearningObject: jest.fn() };

        await expect(store.removeEmptyOutcomes()).resolves.toBeUndefined();

        expect(store.fetch).toHaveBeenCalledWith("abc", 0);
        expect(store.uriRetriever.getLearningObject).not.toHaveBeenCalled();
    });
});
