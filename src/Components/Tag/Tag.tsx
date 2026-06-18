import React from 'react';
import { Tag as AntTag, TagProps } from 'antd';

export const Tag: React.FC<TagProps> = ({style, ...props}) => {
    return <AntTag
        {...props}
        style={{
            borderRadius: 999,
            fontWeight: 600,
            marginInlineEnd: 0,
            paddingInline: 9,
            ...style,
        }}/>
}
