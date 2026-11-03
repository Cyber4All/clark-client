import { BuilderStore } from "./builder-store.service";

describe("BuilderStore.removeEmptyOutcomes", () => {
    function createStore(learningObject: any) {
        const store = Object.create(BuilderStore.prototype);
        const uriRetriever = { getLearningObject: jest.fn() };
        store.uriRetriever = uriRetriever;
        store.fetch = jest.fn().mockResolvedValue(undefined);
        // learningObject is exposed via accessors on the prototype, so define
        // an own property to bypass them for this isolated test
        Object.defineProperty(store, "learningObject", {
            value: learningObject,
            writable: true,
        });
        return { store, uriRetriever };
    }

    it("does not request a learning object when the cuid is empty", async () => {
        const { store, uriRetriever } = createStore({ cuid: "", version: 0 });

        await store.removeEmptyOutcomes();

        expect(store.fetch).not.toHaveBeenCalled();
        expect(uriRetriever.getLearningObject).not.toHaveBeenCalled();
    });

    it("does not request a learning object when none is loaded", async () => {
        const { store, uriRetriever } = createStore(undefined);

        await store.removeEmptyOutcomes();

        expect(store.fetch).not.toHaveBeenCalled();
        expect(uriRetriever.getLearningObject).not.toHaveBeenCalled();
    });
});
