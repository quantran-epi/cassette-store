import React, {useEffect} from "react";
import {act, render} from "@testing-library/react";
import {Provider} from "react-redux";
import {useOrder} from "./useOrder";
import {store} from "@store/Store";
import {removeAllDoneOrder, setOrderState} from "@store/Reducers/OrderReducer";

const mockGetCardsByList = jest.fn();

jest.mock("idb-keyval", () => ({
    get: jest.fn(() => Promise.resolve(null)),
    set: jest.fn(() => Promise.resolve()),
    del: jest.fn(() => Promise.resolve())
}));

jest.mock("nanoid", () => ({
    nanoid: jest.fn(() => "test-id")
}));

jest.mock("./Trello/useTrello", () => ({
    useTrello: () => ({
        TRELLO_LIST_IDS: {
            TODO_LIST: "todo-list"
        },
        TRELLO_LIST_LABEL_IDS: {},
        getCardsByList: mockGetCardsByList
    })
}));

type UseOrderResult = ReturnType<typeof useOrder>;

const UseOrderHarness = (props: { onReady: (result: UseOrderResult) => void }) => {
    const orderUtils = useOrder();

    useEffect(() => {
        props.onReady(orderUtils);
    }, [orderUtils, props]);

    return null;
}

const renderUseOrder = (): { getOrderUtils: () => UseOrderResult } => {
    let orderUtils: UseOrderResult;

    render(React.createElement(
        Provider,
        {
            store,
            children: React.createElement(UseOrderHarness, {
                onReady: (result) => {
                    orderUtils = result;
                }
            })
        }
    ));

    return {
        getOrderUtils: () => orderUtils
    }
}

const seedDoneOrders = (doneOrders: string[]) => {
    store.dispatch(setOrderState({
        orders: [],
        lastSequence: 0,
        doneOrders,
        codPayments: []
    }));
}

beforeEach(() => {
    seedDoneOrders([]);
    mockGetCardsByList.mockReset();
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe("useOrder.refreshDoneOrders", () => {
    it("replaces done order ids after Trello success", async () => {
        seedDoneOrders(["old-done"]);
        mockGetCardsByList.mockResolvedValue([
            {id: "done-card-1", dueComplete: true},
            {id: "open-card", dueComplete: false},
            {id: "done-card-2", dueComplete: true}
        ]);
        const {getOrderUtils} = renderUseOrder();

        let count: number;
        await act(async () => {
            count = await getOrderUtils().refreshDoneOrders();
        });

        expect(mockGetCardsByList).toHaveBeenCalledWith("todo-list");
        expect(count).toBe(2);
        expect(store.getState().order.doneOrders).toEqual(["done-card-1", "done-card-2"]);
    });

    it("treats empty Trello success as a non-error empty state", async () => {
        seedDoneOrders(["old-done"]);
        mockGetCardsByList.mockResolvedValue([
            {id: "open-card", dueComplete: false}
        ]);
        const {getOrderUtils} = renderUseOrder();

        let count: number;
        await act(async () => {
            count = await getOrderUtils().refreshDoneOrders();
        });

        expect(count).toBe(0);
        expect(store.getState().order.doneOrders).toEqual([]);
    });

    it("preserves previous done order ids when Trello fails", async () => {
        seedDoneOrders(["old-done"]);
        mockGetCardsByList.mockRejectedValue(new Error("Trello down"));
        const dispatchSpy = jest.spyOn(store, "dispatch");
        const {getOrderUtils} = renderUseOrder();

        await expect(getOrderUtils().refreshDoneOrders()).rejects.toThrow("Trello down");

        expect(store.getState().order.doneOrders).toEqual(["old-done"]);
        expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({
            type: removeAllDoneOrder.type
        }));
    });
});
