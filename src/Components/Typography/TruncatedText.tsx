import React from "react";
import {Popover} from "@components/Popover";
import {appTokens} from "../../theme/tokens";
import {Typography} from "./Typography";

type TruncatedTextProps = {
    text?: string | null;
    icon?: React.ReactNode;
    copyable?: boolean;
    mode?: "inline" | "note";
    revealLabel?: string;
    maxLength?: number;
    className?: string;
    style?: React.CSSProperties;
}

const DEFAULT_MAX_LENGTH = 32;

const getDisplayText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength).trim()}...`;
}

export const TruncatedText: React.FC<TruncatedTextProps> = ({
    text,
    icon,
    copyable = false,
    mode = "inline",
    revealLabel = "xem thêm",
    maxLength = DEFAULT_MAX_LENGTH,
    className,
    style,
}) => {
    const normalizedText = text || "";

    if (!normalizedText) return null;

    if (mode === "note") {
        return <Typography.Paragraph
            className={className}
            copyable={copyable}
            ellipsis={{rows: 2, expandable: true, symbol: revealLabel}}
            style={{marginBottom: 0, ...style}}
        >
            {normalizedText}
        </Typography.Paragraph>
    }

    const isLong = normalizedText.length > maxLength;
    const visibleText = getDisplayText(normalizedText, maxLength);

    const content = <Typography.Text copyable={copyable}>{normalizedText}</Typography.Text>;

    return <span
        className={className}
        style={{
            alignItems: "center",
            display: "inline-flex",
            gap: appTokens.space.xs,
            minWidth: 0,
            ...style,
        }}
    >
        {icon}
        <Typography.Text style={{maxWidth: "100%"}}>{visibleText}</Typography.Text>
        {isLong && <Popover content={content} trigger="click" placement="topLeft">
            <button
                aria-label={revealLabel}
                type="button"
                style={{
                    background: "transparent",
                    border: 0,
                    color: appTokens.color.link,
                    cursor: "pointer",
                    font: "inherit",
                    minHeight: appTokens.control.height,
                    padding: `0 ${appTokens.space.xs}px`,
                }}
            >
                {revealLabel}
            </button>
        </Popover>}
    </span>
}
