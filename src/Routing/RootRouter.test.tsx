import React from "react";
import { render, screen } from "@testing-library/react";
import fs from "fs";
import path from "path";
import { RootRouter } from "./RootRouter";

jest.mock("idb-keyval", () => ({
    get: jest.fn(() => Promise.resolve(null)),
    set: jest.fn(() => Promise.resolve()),
    del: jest.fn(() => Promise.resolve()),
}));

jest.mock("nanoid", () => ({
    nanoid: jest.fn(() => "test-id"),
}));

jest.mock("./MasterPage", () => ({
    MasterPage: () => {
        const React = require("react");
        const { Outlet } = require("react-router-dom");

        return React.createElement("main", { "data-testid": "master-page" }, React.createElement(Outlet));
    },
}));

jest.mock("@modules/Order/Routing/OrderRouter", () => ({
    OrderRouter: () => {
        const React = require("react");
        const { Outlet } = require("react-router-dom");

        return React.createElement("section", { "data-testid": "order-router" }, React.createElement(Outlet));
    },
}));

jest.mock("@modules/Customer/Routing/CustomerRouter", () => ({
    CustomerRouter: () => {
        const React = require("react");
        const { Outlet } = require("react-router-dom");

        return React.createElement("section", { "data-testid": "customer-router" }, React.createElement(Outlet));
    },
}));

jest.mock("@modules/Order/Screens/OrderList.screen", () => ({
    OrderListScreen: () => <div data-testid="order-list-screen">Order list</div>,
}));

jest.mock("@modules/Order/Screens/OrderCreate/OrderCreate.screen", () => ({
    OrderCreateScreen: () => <div data-testid="order-create-screen">Order create</div>,
}));

jest.mock("@modules/Order/Screens/OrderCodPayment/OrderCodPaymentList.screen", () => ({
    OrderCodPaymentListScreen: () => <div data-testid="order-cod-payment-list-screen">Order COD payment list</div>,
}));

jest.mock("@modules/Customer/Screens/CustomerList.screen", () => ({
    CustomerListScreen: () => <div data-testid="customer-list-screen">Customer list</div>,
}));

jest.mock("@modules/Home/Screens/Dashboard.screen", () => ({
    DashboardScreen: () => <div data-testid="dashboard-screen">Dashboard</div>,
}));

beforeEach(() => {
    global.fetch = jest.fn(() => Promise.resolve({
        json: () => Promise.resolve([]),
        text: () => Promise.resolve(""),
    } as Response));
});

afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
});

const renderOrderPath = async (routePath: string) => {
    window.history.pushState({}, "", routePath);

    render(<RootRouter />);

    expect(await screen.findByTestId("order-router")).toBeInTheDocument();
    expect(screen.queryByTestId("customer-router")).not.toBeInTheDocument();
}

test("renders the order list path through the order router", async () => {
    await renderOrderPath("/cassette-store/order/list");
    expect(screen.getByTestId("order-list-screen")).toBeInTheDocument();
});

test("renders the order create path through the order router", async () => {
    await renderOrderPath("/cassette-store/order/create");
    expect(screen.getByTestId("order-create-screen")).toBeInTheDocument();
});

test("renders the order COD payment path through the order router", async () => {
    await renderOrderPath("/cassette-store/order/cod-payment-list");
    expect(screen.getByTestId("order-cod-payment-list-screen")).toBeInTheDocument();
});

test("uses order-specific route config symbols", () => {
    const orderRouteConfig = fs.readFileSync(
        path.join(process.cwd(), "src/Modules/Order/Routing/OrderRouteConfig.ts"),
        "utf8"
    );

    expect(orderRouteConfig).not.toContain("const CustomerRoutes");
    expect(orderRouteConfig).not.toContain("export default CustomerRoutes");
    expect(orderRouteConfig).toContain("const OrderRoutes");
    expect(orderRouteConfig).toContain("export default OrderRoutes");
});
