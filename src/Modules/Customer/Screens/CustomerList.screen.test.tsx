import React from "react";
import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {Provider} from "react-redux";
import {combineReducers, configureStore} from "@reduxjs/toolkit";
import {CustomerListScreen} from "./CustomerList.screen";
import customerReducer from "@store/Reducers/CustomerReducer";
import appContextReducer from "@store/Reducers/AppContextReducer";
import type {Customer} from "@store/Models/Customer";

jest.mock("@hooks", () => {
    const React = require("react");

    return {
        useScreenTitle: jest.fn(),
        useToggle: (props?: {defaultValue?: boolean}) => {
            const [value, setValue] = React.useState(props?.defaultValue || false);

            return {
                value,
                show: () => setValue(true),
                hide: () => setValue(false),
                toggle: setValue
            };
        }
    };
});

const buildCustomer = (overrides: Partial<Customer> = {}): Customer => ({
    id: "customer-1",
    name: "An Nguyen",
    province: "TP. Hồ Chí Minh",
    area: "Miền nam",
    address: "12 Nguyen Hue",
    mobile: "0901111222",
    buyCount: 2,
    buyAmount: 240000,
    isVIP: false,
    isInBlacklist: false,
    difficulty: "Dễ",
    note: "",
    ...overrides
});

const mockMatchMedia = () => {
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        })),
    });
}

const defaultCustomers = (): Customer[] => [
    buildCustomer(),
    buildCustomer({
        id: "customer-2",
        name: "Binh Tran",
        address: "45 Le Loi",
        mobile: "0919999000",
        buyCount: 0
    }),
    buildCustomer({
        id: "customer-3",
        name: "Chi Pham",
        address: "88 Pasteur",
        mobile: "0933333444",
        isVIP: true
    })
];

const renderCustomerList = (customers: Customer[] = defaultCustomers()) => {
    const store = configureStore({
        reducer: combineReducers({
            appContext: appContextReducer,
            customer: customerReducer
        }),
        preloadedState: {
            appContext: {
                loading: false,
                currentFeatureName: "",
                codImportIssueCount: 0,
                lastCodImportIssueText: ""
            },
            customer: {
                customers
            }
        } as any
    });

    return render(<Provider store={store}>
        <CustomerListScreen/>
    </Provider>);
}

describe("CustomerListScreen", () => {
    beforeEach(() => {
        mockMatchMedia();
    });

    it("filters customers by name, mobile, and address", async () => {
        renderCustomerList();
        const searchInput = screen.getByLabelText("Tìm kiếm khách hàng");

        await userEvent.type(searchInput, "Binh");
        await waitFor(() => expect(screen.queryByTestId("customer-row-customer-1")).not.toBeInTheDocument());
        expect(screen.getByTestId("customer-row-customer-2")).toHaveTextContent("Binh Tran");

        await userEvent.clear(searchInput);
        await userEvent.type(searchInput, "0933333444");
        await waitFor(() => expect(screen.queryByTestId("customer-row-customer-2")).not.toBeInTheDocument());
        expect(screen.getByTestId("customer-row-customer-3")).toHaveTextContent("Chi Pham");

        await userEvent.clear(searchInput);
        await userEvent.type(searchInput, "Nguyen Hue");
        await waitFor(() => expect(screen.queryByTestId("customer-row-customer-3")).not.toBeInTheDocument());
        expect(screen.getByTestId("customer-row-customer-1")).toHaveTextContent("An Nguyen");
    });

    it("shows the empty state when no customers exist", () => {
        renderCustomerList([]);

        expect(screen.getByText("Chưa có khách hàng nào")).toBeInTheDocument();
    });

    it("opens the add customer modal from the mobile header action", async () => {
        renderCustomerList();

        await userEvent.click(screen.getByRole("button", {name: /Thêm khách hàng/i}));

        const dialog = await screen.findByRole("dialog");
        expect(dialog).toHaveTextContent("Thêm khách hàng");
        expect(within(dialog).getByText("Tên khách hàng")).toBeInTheDocument();
    });

    it("deletes a customer through the row confirmation action", async () => {
        renderCustomerList();

        const row = screen.getByTestId("customer-row-customer-2");
        await userEvent.click(within(row).getByRole("button", {name: "Xóa khách hàng"}));
        await userEvent.click(await screen.findByRole("button", {name: "Đồng ý"}));

        await waitFor(() => expect(screen.queryByText("Binh Tran")).not.toBeInTheDocument());
        expect(screen.getByText("An Nguyen")).toBeInTheDocument();
    });
});
