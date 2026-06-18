import React from "react";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {TruncatedText} from "./TruncatedText";

describe("TruncatedText", () => {
    test("renders short text directly without a reveal trigger", () => {
        render(<TruncatedText text="SPX123" />);

        expect(screen.getByText("SPX123")).toBeInTheDocument();
        expect(screen.queryByRole("button", {name: /xem thêm/i})).not.toBeInTheDocument();
    });

    test("reveals long inline text from a tap target", async () => {
        const longText = "Nguyễn Văn A - 123 Đường Nguyễn Trãi, Phường Bến Thành, Quận 1";

        render(<TruncatedText text={longText} />);

        expect(screen.getByText(/Nguyễn Văn A/)).toBeInTheDocument();
        expect(screen.queryByText(longText)).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", {name: /xem thêm/i}));

        expect(await screen.findByText(longText)).toBeInTheDocument();
    });
});
