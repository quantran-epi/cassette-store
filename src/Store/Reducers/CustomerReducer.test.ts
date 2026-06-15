import reducer, {setCustomerState} from "./CustomerReducer";
import type {CustomerState} from "./CustomerReducer";
import type {Customer} from "@store/Models/Customer";

const buildCustomer = (id: string): Customer => ({
    id,
    name: `Customer ${id}`,
    province: "TP. Ho Chi Minh",
    area: "Mien nam",
    address: "123 Test Street",
    mobile: "0900000000",
    buyCount: 3,
    buyAmount: 450000,
    isVIP: true,
    isInBlacklist: false,
    difficulty: "De",
    note: ""
});

describe("CustomerReducer restore actions", () => {
    it("replaces customers from backup state", () => {
        const previousState: CustomerState = {
            customers: [buildCustomer("old")]
        };
        const backupState: CustomerState = {
            customers: [buildCustomer("new-1"), buildCustomer("new-2")]
        };

        const state = reducer(previousState, setCustomerState(backupState));

        expect(state.customers).toEqual(backupState.customers);
    });
});
