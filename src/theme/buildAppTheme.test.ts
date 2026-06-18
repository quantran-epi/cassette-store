import {buildAppTheme} from "./buildAppTheme";

describe("buildAppTheme", () => {
    test("keeps the app on the minimal Ant Design theme override", () => {
        const appTheme = buildAppTheme();

        expect(appTheme.token?.colorPrimary).toBe("rgb(245, 130, 32)");
        expect(appTheme.token?.colorLink).toBe("#3d4195");
        expect(appTheme.token?.colorBorderSecondary).toBe("#d9d9d9");
        expect(appTheme.token?.fontSize).toBe(18);
        expect(appTheme.algorithm).toBeUndefined();
        expect(appTheme.components).toBeUndefined();
    });
});
