import reducer, {
    clearCodImportIssueStatus,
    setAppContextState,
    setCodImportIssueStatus,
    updateCurrentFeatureName
} from "./AppContextReducer";
import type {AppContextState} from "./AppContextReducer";

describe("AppContextReducer restore actions", () => {
    it("restores safe persisted fields while forcing loading false", () => {
        const previousState: AppContextState = {
            loading: true,
            currentFeatureName: "Old feature",
            codImportIssueCount: 4,
            lastCodImportIssueText: "Old issue"
        };

        const state = reducer(previousState, setAppContextState({
            loading: true,
            currentFeatureName: "Orders",
            codImportIssueCount: 2,
            lastCodImportIssueText: "Some rows need review"
        }));

        expect(state.loading).toBe(false);
        expect(state.currentFeatureName).toBe("Orders");
        expect(state.codImportIssueCount).toBe(2);
        expect(state.lastCodImportIssueText).toBe("Some rows need review");
    });

    it("defaults missing safe fields during restore", () => {
        const previousState: AppContextState = {
            loading: true,
            currentFeatureName: "Customers",
            codImportIssueCount: 4,
            lastCodImportIssueText: "Old issue"
        };

        const state = reducer(previousState, setAppContextState({}));

        expect(state.loading).toBe(false);
        expect(state.currentFeatureName).toBe("");
        expect(state.codImportIssueCount).toBe(0);
        expect(state.lastCodImportIssueText).toBe("");
    });

    it("keeps existing feature name updates working", () => {
        const state = reducer(undefined, updateCurrentFeatureName("Dashboard"));

        expect(state.currentFeatureName).toBe("Dashboard");
    });

    it("sets and clears COD import issue status", () => {
        const issueState = reducer(undefined, setCodImportIssueStatus({count: 3, text: "Some rows need review"}));

        expect(issueState.codImportIssueCount).toBe(3);
        expect(issueState.lastCodImportIssueText).toBe("Some rows need review");

        const clearedState = reducer(issueState, clearCodImportIssueStatus());
        expect(clearedState.codImportIssueCount).toBe(0);
        expect(clearedState.lastCodImportIssueText).toBe("");
    });
});
