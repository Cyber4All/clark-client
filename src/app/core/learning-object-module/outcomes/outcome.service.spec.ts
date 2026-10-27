import { HttpClient } from "@angular/common/http";
import { CookieService } from "ngx-cookie-service";
import { of } from "rxjs";
import { OutcomeService } from "./outcome.service";
import { OUTCOME_ROUTES } from "./outcome.routes";

describe("OutcomeService outcome updates", () => {
    const databaseId = "507f1f77bcf86cd799439011";
    let patch: jest.Mock;
    let service: OutcomeService;

    beforeEach(() => {
        patch = jest.fn(() => of({}));
        service = new OutcomeService(
            { patch } as unknown as HttpClient,
            {} as CookieService,
        );
    });

    it("uses the persisted ID in the URL and leaves the caller's data intact", async () => {
        const outcome = Object.freeze({
            id: databaseId,
            bloom: "remember and understand",
            verb: "identify",
            text: "challenges associated with model collapse",
        });

        await service.saveOutcome(outcome);

        expect(patch).toHaveBeenCalledWith(
            OUTCOME_ROUTES.UPDATE_OUTCOME(databaseId),
            {
                bloom: outcome.bloom,
                verb: outcome.verb,
                text: outcome.text,
            },
            expect.objectContaining({ withCredentials: true }),
        );
        expect(outcome.id).toBe(databaseId);
    });

    it.each(["eab4bb3a-071a-4a72-a94c-a95aa14ea2d0", undefined])(
        "does not send a PATCH with an invalid outcome ID: %s",
        async (id) => {
            await expect(
                service.saveOutcome({ id: id as string }),
            ).rejects.toThrow("A persisted MongoDB outcome ID is required");
            expect(patch).not.toHaveBeenCalled();
        },
    );
});
