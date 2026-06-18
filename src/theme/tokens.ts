export const appTokens = {
    space: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
        xxxl: 64,
    },
    font: {
        label: 12,
        base: 14,
        heading: 18,
        display: 24,
        regular: 400,
        semibold: 600,
    },
    color: {
        surface: "#ffffff",
        secondarySurface: "#f5f5f5",
        border: "#d9d9d9",
        primary: "#f58220",
        primaryFade: "#ffefe0",
        link: "#3d4195",
        text: "rgba(0, 0, 0, 0.65)",
        destructive: "#990505",
    },
    radius: {
        base: 8,
    },
    control: {
        height: 44,
    },
    shadow: {
        card: "0 0 15px 0 rgb(34 41 47 / 5%)",
        notification: "0 5px 25px rgb(34 41 47 / 10%)",
    },
} as const;

export type AppTokens = typeof appTokens;
