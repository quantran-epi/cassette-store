import { COMMON_MESSAGE } from "@common/Constants/CommonMessage";
import { message } from "antd";
import { JointContent } from "antd/es/message/interface";
import React, { useContext } from "react";

type MessageProviderContextData = {
    error: (content?: JointContent, duration?: number | VoidFunction, onClose?: VoidFunction) => Function;
    success: (content?: JointContent, duration?: number | VoidFunction, onClose?: VoidFunction) => Function;
    info: (content: JointContent, duration?: number | VoidFunction, onClose?: VoidFunction) => Function;
    warning: (content: JointContent, duration?: number | VoidFunction, onClose?: VoidFunction) => Function;
    loading: (content: JointContent, duration?: number | VoidFunction, onClose?: VoidFunction) => Function;
}

type MessageProviderProps = {
    children: React.ReactNode;
}

const MessageContext = React.createContext<MessageProviderContextData>({
    error: () => () => { },
    success: () => () => { },
    info: () => () => { },
    warning: () => () => { },
    loading: () => () => { },
});

export const MessageProvider: React.FunctionComponent<MessageProviderProps> = (props) => {
    const [messageApi, contextHolder] = message.useMessage();

    const error = (content?: JointContent, duration?: number | VoidFunction, onClose?: VoidFunction) => {
        content = content || COMMON_MESSAGE.ERROR;
        return messageApi.error(content, duration, onClose);
    }

    const success = (content?: JointContent, duration?: number | VoidFunction, onClose?: VoidFunction) => {
        content = content || COMMON_MESSAGE.SUCCESS;
        return messageApi.success(content, duration, onClose);
    }

    const info = (content: JointContent, duration?: number | VoidFunction, onClose?: VoidFunction) => {
        return messageApi.info(content, duration, onClose);
    }

    const warning = (content: JointContent, duration?: number | VoidFunction, onClose?: VoidFunction) => {
        return messageApi.warning(content, duration, onClose);
    }

    const loading = (content: JointContent, duration?: number | VoidFunction, onClose?: VoidFunction) => {
        return messageApi.loading(content, duration, onClose);
    }

    return <MessageContext.Provider value={{
        error,
        success,
        info,
        warning,
        loading
    }}>
        {props.children}
        {contextHolder}
    </MessageContext.Provider>
}

export const useMessage = () => {
    const context = useContext(MessageContext);
    return context;
}