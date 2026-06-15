import reducer, {setAppContextState, updateCurrentFeatureName} from "./AppContextReducer";
import type {AppContextState} from "./AppContextReducer";

describe("AppContextReducer restore actions", () => {
    it("restores safe persisted fields while forcing loading false", () => {
        const previousState: AppContextState = {
            loading: true,
            currentFeatureName: "Old feature"
        };

        const state = reducer(previousState, setAppContextState({
            loading: true,
            currentFeatureName: "Orders"
        }));

        expect(state.loading).toBe(false);
        expect(state.currentFeatureName).toBe("Orders");
    });

    it("defaults missing safe fields during restore", () => {
        const previousState: AppContextState = {
            loading: true,
            currentFeatureName: "Customers"
        };

        const state = reducer(previousState, setAppContextState({}));

        expect(state.loading).toBe(false);
        expect(state.currentFeatureName).toBe("");
    });

    it("keeps existing feature name updates working", () => {
        const state = reducer(undefined, updateCurrentFeatureName("Dashboard"));

        expect(state.currentFeatureName).toBe("Dashboard");
    });
});
