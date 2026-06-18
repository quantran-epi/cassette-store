import React, { FunctionComponent } from 'react';
import { Card as AntCard, CardProps as AntCardProps } from 'antd';
import { Space } from '@components/Layout/Space';
import { Typography } from '@components/Typography';
import {appTokens} from '../../theme/tokens';
import {useTheme} from '../../Hooks/useTheme';

interface ICardProps extends AntCardProps {
    description?: React.ReactNode;
    noShadow?: boolean;
}

export const Card: FunctionComponent<ICardProps> = ({
    style,
    description,
    title,
    noShadow = false,
    ...props
}) => {
    const { token } = useTheme();

    const _style = (): React.CSSProperties => {
        return {
            borderRadius: token.borderRadius,
            boxShadow: noShadow ? "none" : appTokens.shadow.card,
            ...style
        }
    }

    const _renderTitle = () => {
        if (!title) return;
        return <Space direction='vertical' style={description ? { marginTop: appTokens.space.sm, marginBottom: appTokens.space.sm } : {}}>
            {typeof title === "string" ? <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 0 }}>{title}</Typography.Title> : title}
            {typeof description === "string" ? <Typography.Text type="secondary" style={{ marginTop: appTokens.space.sm, marginBottom: 0 }}>{description}</Typography.Text> : description}
        </Space >
    }

    return <AntCard {...props} title={_renderTitle()} style={_style()} />
}
