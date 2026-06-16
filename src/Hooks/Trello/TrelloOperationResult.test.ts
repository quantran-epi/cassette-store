import {
    createTrelloOperationFailure,
    createTrelloOperationSuccess,
    isTrelloOperationFailure
} from "./TrelloOperationResult";

describe("TrelloOperationResult", () => {
    it("creates success results with operation and data", () => {
        const result = createTrelloOperationSuccess("create-card", {id: "card-1"});

        expect(result).toEqual({
            ok: true,
            operation: "create-card",
            data: {id: "card-1"}
        });
        expect(isTrelloOperationFailure(result)).toBe(false);
    });

    it("creates failure results with retry detail and payload", () => {
        const retryPayload = {orderId: "order-1", idList: "done-list"};
        const cause = new Error("Network down");

        const result = createTrelloOperationFailure({
            operation: "move-card",
            retryable: true,
            message: "Could not move Trello card",
            status: 503,
            cause,
            retryPayload
        });

        expect(result).toEqual({
            ok: false,
            operation: "move-card",
            retryable: true,
            message: "Could not move Trello card",
            status: 503,
            cause,
            retryPayload
        });
        expect(isTrelloOperationFailure(result)).toBe(true);
    });
});
