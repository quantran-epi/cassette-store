import {theme as antdTheme} from "antd";
import {buildAppTheme} from "./buildAppTheme";

describe("buildAppTheme", () => {
    test("maps app tokens into Ant Design theme config", () => {
        const appTheme = buildAppTheme();

        expect(appTheme.token?.colorPrimary).toBe("#f58220");
        expect(appTheme.token?.colorLink).toBe("#3d4195");
        expect(appTheme.token?.colorBorderSecondary).toBe("#d9d9d9");
        expect(appTheme.token?.fontSize).toBe(14);
        expect(appTheme.token?.controlHeight).toBeGreaterThanOrEqual(44);
    });

    test("uses default and compact algorithms", () => {
        const appTheme = buildAppTheme();

        expect(appTheme.algorithm).toEqual([
            antdTheme.defaultAlgorithm,
            antdTheme.compactAlgorithm,
        ]);
    });
});
