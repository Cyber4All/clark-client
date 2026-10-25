import { BuilderStore } from "./builder-store.service";

describe("BuilderStore.removeEmptyOutcomes", () => {
    let store: BuilderStore;
    let uriRetriever: { getLearningObject: jest.Mock };

    beforeEach(() => {
        uriRetriever = { getLearningObject: jest.fn() };
        const noop = {} as any;
        store = new BuilderStore(
            noop,
            noop,
            noop,
            noop,
            { setTitle: jest.fn() } as any,
            uriRetriever as any,
            noop,
            noop,
            noop,
            noop,
        );
    });

    it("does nothing when no learning object has been loaded", async () => {
        const fetchSpy = jest.spyOn(store, "fetch");

        await expect(store.removeEmptyOutcomes()).resolves.toBeUndefined();

        expect(fetchSpy).not.toHaveBeenCalled();
        expect(uriRetriever.getLearningObject).not.toHaveBeenCalled();
    });
});
