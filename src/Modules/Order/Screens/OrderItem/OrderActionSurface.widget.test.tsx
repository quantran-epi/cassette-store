import React from "react";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {OrderActionModel} from "@common/Helpers/OrderActionHelper";
import {OrderActionSurfaceWidget} from "./OrderActionSurface.widget";

const buildModel = (overrides: Partial<OrderActionModel> = {}): OrderActionModel => {
    const actions = [
        {key: "mark-as-done", label: "Đã giao hàng", group: "delivery", isPrimary: true},
        {key: "input-shipping-code", label: "Mã vận đơn", group: "delivery", disabled: true, disabledReason: "Cần tạo thẻ Trello trước"},
        {key: "place-items", label: "Danh sách hàng", group: "details"},
        {key: "customer-info", label: "Thông tin khách hàng", group: "customer"},
        {key: "delete", label: "Xoá đơn hàng", group: "danger", danger: true, requiresConfirmation: true}
    ] as OrderActionModel["actions"];

    return {
        primaryAction: actions[0],
        actions,
        groups: {
            delivery: actions.filter(action => action.group === "delivery"),
            details: actions.filter(action => action.group === "details"),
            customer: actions.filter(action => action.group === "customer"),
            danger: actions.filter(action => action.group === "danger")
        },
        ...overrides
    };
}

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

beforeEach(() => {
    mockMatchMedia();
});

it("renders a promoted primary action and calls onAction with its key", async () => {
    const onAction = jest.fn();
    render(<OrderActionSurfaceWidget model={buildModel()} onAction={onAction}/>);

    await userEvent.click(screen.getByRole("button", {name: /Đã giao hàng/i}));

    expect(onAction).toHaveBeenCalledWith("mark-as-done");
});

it("renders grouped secondary and danger menu labels", async () => {
    render(<OrderActionSurfaceWidget model={buildModel()} onAction={jest.fn()}/>);

    await userEvent.click(screen.getByRole("button", {name: /Tác vụ khác/i}));

    expect(await screen.findByText("Giao hàng")).toBeInTheDocument();
    expect(screen.getByText("Chi tiết")).toBeInTheDocument();
    expect(screen.getByText("Khách hàng")).toBeInTheDocument();
    expect(screen.getByText("Nguy hiểm")).toBeInTheDocument();
    expect(screen.getByText("Danh sách hàng")).toBeInTheDocument();
    expect(screen.getByText("Xoá đơn hàng")).toBeInTheDocument();
});

it("shows disabled action reason copy in the menu", async () => {
    render(<OrderActionSurfaceWidget model={buildModel()} onAction={jest.fn()}/>);

    await userEvent.click(screen.getByRole("button", {name: /Tác vụ khác/i}));

    expect(await screen.findByText("Mã vận đơn")).toBeInTheDocument();
    expect(screen.getByText("Cần tạo thẻ Trello trước")).toBeInTheDocument();
});

it("routes dangerous action clicks through the provided action callback", async () => {
    const onAction = jest.fn();
    render(<OrderActionSurfaceWidget model={buildModel()} onAction={onAction}/>);

    await userEvent.click(screen.getByRole("button", {name: /Tác vụ khác/i}));
    await userEvent.click(await screen.findByText("Xoá đơn hàng"));

    expect(onAction).toHaveBeenCalledWith("delete");
});
