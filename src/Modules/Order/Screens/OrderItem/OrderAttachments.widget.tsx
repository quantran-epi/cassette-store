import React, {FunctionComponent, useEffect, useMemo, useState} from "react";
import {Order} from "@store/Models/Order";
import {useOrder, useToggle, useTrello} from "@hooks";
import {Modal} from "@components/Modal";
import {Stack} from "@components/Layout/Stack";
import {Button} from "@components/Button";
import {SmartForm} from "@components/SmartForm";
import {DeleteOutlined} from "@ant-design/icons";
import {message} from "antd";
import {TrelloAttachment} from "../../../../Hooks/Trello/Models/TrelloAttachment";
import {RcFile} from "antd/es/upload";
import {Divider} from "@components/Layout/Divider";
import {Space} from "@components/Layout/Space";
import {Typography} from "@components/Typography";
import {Upload} from "@components/Form/Upload";
import {UploadOutlined} from "@ant-design/icons";
import {Image} from "@components/Image";
import {Spin} from "@components/Spin";
import {Popconfirm} from "@components/Popconfirm";
import {List} from "@components/List";

type OrderAttachmentsWidgetProps = {
    order: Order;
    open: boolean;
    onClose: () => void;
}

export const OrderAttachmentsWidget: FunctionComponent<OrderAttachmentsWidgetProps> = props => {
    const trello = useTrello();
    const orderUtils = useOrder();
    const toggleLoading = useToggle();
    const toggleFetchingAttachments = useToggle();
    const [currentAttachments, setCurrentAttachments] = useState<TrelloAttachment[]>([]);
    const [deleteAttachments, setDeleteAttachments] = useState<TrelloAttachment[]>([]);
    const [addAttachments, setAddAttachments] = useState<RcFile[]>([]);

    const addFilePreviewUrls = useMemo(() => {
        return addAttachments.map(file => URL.createObjectURL(file));
    }, [addAttachments])

    const currentFilePreviewUrls = useMemo(() => {
        return currentAttachments.map(file => file.previews[file.previews.length-1].url);
    }, [currentAttachments])

    useEffect(() => {
        if (!props.open) return;
        toggleFetchingAttachments.show();
        trello.getAttachmentsOfCard(props.order.trelloCardId).then(attachments => setCurrentAttachments(attachments))
            .catch(e => message.error("Lỗi khi lấy danh sách ảnh đính kèm"))
            .finally(() => toggleFetchingAttachments.hide());
    }, [props.order, props.open])

    const _reset = () => {
        setAddAttachments([]);
        setDeleteAttachments([]);
        setCurrentAttachments([]);
    }

    const _onSave = async () => {
        try {
            toggleLoading.show();
            let deletePromises = deleteAttachments.map(e => trello.deleteAttachment({idAttachment: e.id}, props.order.trelloCardId));
            let addPromises = orderUtils.attachImagesToOrderOnTrello(props.order, addAttachments);
            await Promise.all([deletePromises, addPromises]);
            toggleLoading.hide();
            _reset();
            message.success("Lưu Ảnh đính kèm thành công");
            props.onClose();
        } catch (e) {
            message.error("Lỗi lưu Ảnh đính kèm")
        }
    }

    const _onBeforeUpload = (file: RcFile, fileList: RcFile[]) => {
        setAddAttachments(fileList);
        return false;
    }

    const _onRemoveAttachment = (url: string) => {
        setDeleteAttachments([...deleteAttachments, currentAttachments.find(e => e.previews[e.previews.length-1].url === url
            && !deleteAttachments.map(e => e.previews[e.previews.length-1].url).includes(url))]);
        setCurrentAttachments(currentAttachments.filter(e => e.previews[e.previews.length-1].url !== url));
    }

    const _renderCurrentPreviewUploadFiles = () => {
        return currentFilePreviewUrls.length > 0 ? <List>
            {currentFilePreviewUrls.map(e => <List.Item>
                <Image width={100} height={100} preview
                       src={e}/>
                <Popconfirm title={"Xóa ảnh đính kèm này?"} onConfirm={() => _onRemoveAttachment(e)}>
                    <Button danger icon={<DeleteOutlined/>}/>
                </Popconfirm>
            </List.Item>)}
        </List> : <Typography.Text type={"secondary"}>Chưa có ảnh đính kèm</Typography.Text>
    }

    const _renderAddPreviewUploadFiles = () => {
        return addFilePreviewUrls.length > 0 ? <Stack fullwidth={true} gap={5}>
            {addFilePreviewUrls.map(e => <Image width={100} height={100} preview
                                                src={e}/>)}
        </Stack> : <Typography.Text type={"secondary"}>Chưa có ảnh đính kèm</Typography.Text>
    }

    return <Modal open={props.open} destroyOnClose={true} onCancel={props.onClose}
                  footer={<Stack fullwidth justify="flex-end">
                      <Button loading={toggleLoading.value} type="primary" onClick={_onSave}>Lưu</Button>
                  </Stack>}>
        <Divider orientation="left"> <Typography.Text>Ảnh đính kèm hiện có</Typography.Text></Divider>
        <SmartForm.Item>
            <Spin spinning={toggleFetchingAttachments.value}>
                {_renderCurrentPreviewUploadFiles()}
            </Spin>
        </SmartForm.Item>
        <Divider orientation="left"><Space>
            <Typography.Text>Thêm ảnh đính kèm</Typography.Text>
            <Upload showUploadList={false} beforeUpload={_onBeforeUpload} multiple={true}
                    style={{marginBottom: 5}}>
                <Button icon={<UploadOutlined/>} size="small"/>
            </Upload>
        </Space></Divider>
        <SmartForm.Item>
            {_renderAddPreviewUploadFiles()}
        </SmartForm.Item>
    </Modal>
}