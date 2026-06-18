import {theme, type ThemeConfig} from "antd";
import {appTokens} from "./tokens";

export const buildAppTheme = (): ThemeConfig => ({
    algorithm: [theme.defaultAlgorithm, theme.compactAlgorithm],
    token: {
        colorPrimary: appTokens.color.primary,
        colorLink: appTokens.color.link,
        colorBorderSecondary: appTokens.color.border,
        colorText: appTokens.color.text,
        colorBgBase: appTokens.color.surface,
        colorBgContainer: appTokens.color.surface,
        colorBgLayout: appTokens.color.secondarySurface,
        colorError: appTokens.color.destructive,
        fontSize: appTokens.font.base,
        fontSizeSM: appTokens.font.label,
        fontSizeLG: appTokens.font.heading,
        fontSizeXL: appTokens.font.display,
        fontWeightStrong: appTokens.font.semibold,
        borderRadius: appTokens.radius.base,
        controlHeight: appTokens.control.height,
        controlHeightSM: appTokens.control.height,
        controlHeightLG: appTokens.control.height,
    },
    components: {
        Button: {
            controlHeight: appTokens.control.height,
        },
        Input: {
            controlHeight: appTokens.control.height,
        },
        Select: {
            controlHeight: appTokens.control.height,
        },
        Card: {
            borderRadiusLG: appTokens.radius.base,
        },
    },
});
