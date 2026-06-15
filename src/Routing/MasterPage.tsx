import {
    BarChartOutlined,
    CloudDownloadOutlined, CloudUploadOutlined, DollarOutlined, DropboxOutlined,
    MenuOutlined,
    TruckOutlined,CalculatorOutlined,
    UserOutlined,CreditCardOutlined
} from "@ant-design/icons";
import {Button} from "@components/Button";
import {Input} from "@components/Form/Input";
import {Image} from "@components/Image";
import {Box} from "@components/Layout/Box";
import {Content} from "@components/Layout/Content";
import {Header} from "@components/Layout/Header";
import {Space} from "@components/Layout/Space";
import {Stack} from "@components/Layout/Stack";
import {Menu} from "@components/Menu";
import {useMessage} from "@components/Message";
import {Modal} from "@components/Modal";
import {Tooltip} from "@components/Tootip";
import {Typography} from "@components/Typography";
import {useOrder, useTheme, useToggle, useTrello} from "@hooks";
import {setCustomerState} from "@store/Reducers/CustomerReducer";
import {RootState, store} from "@store/Store";
import {Drawer, Flex, FloatButton, Layout} from "antd";
import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {RootRoutes} from "./RootRoutes";
import Logo from "../../assets/icons/radio-cassette.png";
import moment from "moment";
import {setOrderState, test} from "@store/Reducers/OrderReducer";
import {Option, Select} from "@components/Form/Select";
import {CUSTOMER_PROVINCES} from "@common/Constants/AppConstants";
import {Tag} from "@components/Tag";
import {AreaHelpers} from "@common/Helpers/AreaHelper";
import {OrderHelper} from "@common/Helpers/OrderHelper";
import {useModal} from "@components/Modal/ModalProvider";
import {createBackupEnvelope, parseBackupText} from "@common/Helpers/BackupHelper";
import {setAppContextState} from "@store/Reducers/AppContextReducer";

const layoutStyles: React.CSSProperties = {
    height: "100%"
}

const BACKUP_CARD_ID = "68498a4712a808a92bf59b01";
const LAST_CHECK_TIME_KEY = "lastCheckTime";
const LAST_SUCCESSFUL_BACKUP_TIME_KEY = "lastSuccessfulBackupTime";

type OperationStatus = {
    type: "idle" | "loading" | "success" | "empty" | "error";
    text: string;
}

const _formatStatusTime = (time: number | string | Date = Date.now()): string => {
    return moment(time).format("HH:mm DD/MM");
}

const _getInitialBackupStatus = (): OperationStatus => {
    const lastSuccessfulBackup = localStorage.getItem(LAST_SUCCESSFUL_BACKUP_TIME_KEY);
    if (!lastSuccessfulBackup) return {type: "idle", text: ""};

    return {
        type: "success",
        text: `Backup gần nhất ${_formatStatusTime(parseInt(lastSuccessfulBackup, 10))}`
    }
}

const _statusColor = (status: OperationStatus["type"]): string => {
    switch (status) {
        case "loading":
            return "processing";
        case "success":
            return "success";
        case "error":
            return "error";
        default:
            return "default";
    }
}

const OperationStatusLine = (props: { label: string; status: OperationStatus }) => {
    if (!props.status.text) return null;

    return <Stack align="center" gap={6} style={{width: "100%"}}>
        <Tag color={_statusColor(props.status.type)} style={{marginInlineEnd: 0}}>{props.label}</Tag>
        <Typography.Text style={{fontSize: 12}}>{props.status.text}</Typography.Text>
    </Stack>
}

const _createBackupAttachment = (namePrefix: string) => {
    const envelope = createBackupEnvelope(store.getState());
    const fileBlob = new Blob([JSON.stringify(envelope)], {type: 'text/plain'});
    const createdAt = moment(envelope.createdAt).format("YYYY-MM-DD HH:mm:ss");

    return {
        envelope,
        attachment: {
            name: `${namePrefix} v${envelope.schemaVersion} ${createdAt}`,
            mimeType: "text/plain",
            file: fileBlob
        }
    }
}

const _getErrorMessage = (error: any): string => {
    return error?.message || "Không rõ lỗi";
}

export const MasterPage = () => {
    const theme = useTheme();
    const currentFeatureName = useSelector((state: RootState) => state.appContext.currentFeatureName);
    const dispatch = useDispatch();

    useEffect(() => {
        // dispatch(test());
    }, []);

    const
        _featureIcon = () => {
            switch (currentFeatureName) {
                case "Khách hàng":
                    return <UserOutlined style={{fontSize: "1.5em"}}/>;
                case "Đơn hàng":
                    return <TruckOutlined style={{fontSize: "1.5em"}}/>;
                case "Thống kê":
                    return <BarChartOutlined style={{fontSize: "1.5em"}}/>;
                default:
                    return null;
            }
        }

    return <Layout style={layoutStyles}>
        <Header style={{
            height: 60,
            lineHeight: "60px",
            paddingInline: 10,
            backgroundColor: "#fff",
            borderBottom: "0.5px solid " + theme.token.colorBorder
        }}>
            <Stack justify="space-between" align="center">
                <Stack>
                    <SidebarDrawer/>
                    <Tooltip title={currentFeatureName}>
                        <Typography.Paragraph
                            style={{fontFamily: "kanit", fontSize: 24, fontWeight: "500", marginBottom: 0, width: 230}}
                            ellipsis>{currentFeatureName}</Typography.Paragraph>
                    </Tooltip>
                </Stack>
                <Box style={{marginTop: 5}}>
                    {_featureIcon()}
                </Box>
            </Stack>
        </Header>
        <Content>
            <Outlet/>
        </Content>
        <BottomTabNavigator/>
        <AppNoti/>
    </Layout>
}

const SidebarDrawer = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const message = useMessage();
    const trello = useTrello();
    const toggleLoading = useToggle();
    const [linkBackup, setLinkBackup] = useState("https://raw.githubusercontent.com/quantran-epi/cassette-store/refs/heads/main/docs/data");
    const [restoreStatus, setRestoreStatus] = useState<OperationStatus>({type: "idle", text: ""});

    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };

    const onNavigate = (href) => {
        navigate(href);
        setOpen(false);
    }

    const _onRehydrateData = async () => {
        try {
            toggleLoading.show();
            setRestoreStatus({type: "loading", text: "Đang khôi phục dữ liệu"});
            let data = await fetch(linkBackup);
            if (typeof data.ok === "boolean" && !data.ok) {
                throw new Error(`HTTP ${data.status}`);
            }
            let text = await data.text();

            const restoreResult = parseBackupText(text);
            if (restoreResult.ok === false) {
                setRestoreStatus({type: "error", text: restoreResult.message});
                message.error(restoreResult.message);
                return;
            }

            try {
                const preRestoreSnapshot = _createBackupAttachment("Pre-restore backup");
                await trello.createAttachment(preRestoreSnapshot.attachment, BACKUP_CARD_ID);
            } catch (snapshotError) {
                message.warning(`Không thể tạo snapshot trước khi khôi phục: ${_getErrorMessage(snapshotError)}`);
            }

            dispatch(setOrderState(restoreResult.payload.order));
            dispatch(setCustomerState(restoreResult.payload.customer));
            dispatch(setAppContextState(restoreResult.payload.appContext));
            setRestoreStatus({type: "success", text: `Khôi phục thành công ${_formatStatusTime()}`});
            message.success("Đồng bộ thành công");
        } catch (e) {
            setRestoreStatus({type: "error", text: `Lỗi tải backup: ${_getErrorMessage(e)}`});
            message.error(`Không thể tải file backup: ${_getErrorMessage(e)}`);
        } finally {
            toggleLoading.hide();
        }
    }

    return (
        <React.Fragment>
            <Button aria-label="Mở menu" type="primary" onClick={showDrawer} icon={<MenuOutlined/>}/>
            <Drawer placement="left" title={<Typography.Text style={{fontFamily: "kanit", fontSize: 24}}>Cửa hàng
                Cassette</Typography.Text>} onClose={onClose} open={open} styles={{body: {padding: 0}}}>
                <Flex vertical justify="space-between" style={{height: "100%"}}>
                    <Menu
                        items={[
                            {
                                key: "home", label: <Flex align="center" gap={5}>
                                    <BarChartOutlined style={{fontSize: "1.2em"}}/>
                                    {"Home"}
                                </Flex>, onClick: () => onNavigate(RootRoutes.AuthorizedRoutes.Root())
                            },
                            {
                                key: "orders", label: <Flex align="center" gap={5}>
                                    <TruckOutlined style={{fontSize: "1.2em"}}/>
                                    {"Đơn hàng"}
                                </Flex>, onClick: () => onNavigate(RootRoutes.AuthorizedRoutes.OrderRoutes.List())
                            },
                            {
                                key: "customers", label: <Flex align="center" gap={5}>
                                    <UserOutlined style={{fontSize: "1.2em"}}/>
                                    {"Khách hàng"}
                                </Flex>, onClick: () => onNavigate(RootRoutes.AuthorizedRoutes.CustomerRoutes.List())
                            },
                        ]}
                    />
                    <Stack direction="column" align={"center"}>
                        <Input placeholder="Nhập link file dữ liệu" onChange={(e) => setLinkBackup(e.target.value)}
                               value={linkBackup}/>
                        <Button loading={toggleLoading.value} icon={<CloudDownloadOutlined/>}
                                onClick={_onRehydrateData}>Đồng bộ dữ liệu đã lưu trữ</Button>
                        <OperationStatusLine label="Khôi phục" status={restoreStatus}/>
                    </Stack>
                    <Box style={{overflow: "hidden"}}>
                        <Image src={Logo} width={350} preview={false} style={{marginLeft: 90, opacity: 0.4}}/>
                    </Box>
                </Flex>
            </Drawer>
        </React.Fragment>
    );
};

const BottomTabNavigator = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const toggleMoreModal = useToggle();
    const [area, setArea] = useState("");
    const [shippingCost, setShippingCost] = useState<number>(0);

    const _buttonStyles = (): React.CSSProperties => {
        return {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: 70,
            width: 80
        }
    }

    const _containerStyles = (): React.CSSProperties => {
        return {
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            width: "100%",
            backgroundColor: "#fff",
            height: 80,
            borderTop: "0.5px solid " + theme.token.colorBorder
        }
    }

    const _textStyles = (route: string): React.CSSProperties => {
        return {
            color: route === location.pathname ? theme.token.colorPrimary : undefined,
            fontWeight: route === location.pathname ? "bold" : undefined,
            fontSize: 16
        }
    }

    const onNavigate = (href) => {
        navigate(href);
    }

    const _onCalculateShipCost = () => {
        toggleMoreModal.show();
    }

    const _onChangeProvince = (value: string) => {
        let currentArea = AreaHelpers.parseAreaFromProvince(value);
        setArea(currentArea);
        setShippingCost(OrderHelper.getShippingAmountByArea(currentArea));
    }

    const _renderArea = () => {
        return Boolean(area) && <Tag>{area}</Tag>;
    }

    return <React.Fragment>
        <Stack justify="space-around" style={_containerStyles()}>
            <Button type="text" style={_buttonStyles()} icon={<BarChartOutlined style={{fontSize: "1.2em"}}/>}
                    onClick={() => onNavigate(RootRoutes.AuthorizedRoutes.Root())}>
                <Typography.Text style={_textStyles(RootRoutes.AuthorizedRoutes.Root())}>Home</Typography.Text>
            </Button>
            <Button type="text" style={_buttonStyles()}
                    icon={<TruckOutlined style={{fontSize: "1.2em"}}/>}
                    onClick={() => onNavigate(RootRoutes.AuthorizedRoutes.OrderRoutes.List())}>
                <Typography.Text style={_textStyles(RootRoutes.AuthorizedRoutes.OrderRoutes.List())}>Đơn
                    hàng</Typography.Text>
            </Button>
            <Button type="text" style={_buttonStyles()} icon={<UserOutlined style={{fontSize: "1.2em"}}/>}
                    onClick={() => onNavigate(RootRoutes.AuthorizedRoutes.CustomerRoutes.List())}>
                <Typography.Text style={_textStyles(RootRoutes.AuthorizedRoutes.CustomerRoutes.List())}>Khách
                    hàng</Typography.Text>
            </Button>
            <Button type="text" style={_buttonStyles()} icon={<CalculatorOutlined style={{fontSize: "1.2em"}}/>}
                    onClick={_onCalculateShipCost}>
                <Typography.Text>Tính ship</Typography.Text>
            </Button>
        </Stack>

        <Modal open={toggleMoreModal.value} title={
            <Space>
                Tính phí ship theo tỉnh
            </Space>
        } destroyOnClose={true} onCancel={toggleMoreModal.hide} footer={null}>
            <Select
                suffixIcon={_renderArea()}
                showSearch
                placeholder="Chọn tỉnh thành"
                onChange={_onChangeProvince}
                filterOption={(inputValue, option) => {
                    if (!option?.children) return false;
                    return option?.children?.toString().toLowerCase().includes(inputValue.toLowerCase());
                }}
                style={{width: '100%', marginBottom: 7}}
            >
                {CUSTOMER_PROVINCES.map(p => <Option key={p} value={p}>{p}</Option>)}
            </Select>
            <Typography.Text>Phí ship là: <Typography.Text
                type="success">{shippingCost.toLocaleString()}đ</Typography.Text></Typography.Text>
        </Modal>
    </React.Fragment>
}

const AppNoti = () => {
    const theme = useTheme();
    const trello = useTrello();
    const orderUtils = useOrder();
    const message = useMessage();
    const refreshDoneOrderMessageKey = "refreshDoneOrderMessageKey";
    const backupMessageKey = "backupMessageKey";
    const modal = useModal();
    const navigate = useNavigate();
    const [backupStatus, setBackupStatus] = useState<OperationStatus>(_getInitialBackupStatus);
    const [doneRefreshStatus, setDoneRefreshStatus] = useState<OperationStatus>({type: "idle", text: ""});

    useEffect(() => {
        backup();
        _refreshDoneOrder();
    }, [])

    const _refreshDoneOrder = () => {
        setDoneRefreshStatus({type: "loading", text: "Đang kiểm tra đơn đóng hàng"});
        message.loading({
            key: refreshDoneOrderMessageKey,
            content: "Đang kiểm tra đơn đóng hàng"
        });
        orderUtils.refreshDoneOrders().then(doneOrderCount => {
            if (doneOrderCount > 0) {
                const statusText = "Có " + doneOrderCount + " đơn đã đóng hàng";
                setDoneRefreshStatus({type: "success", text: statusText});
                message.warning({
                    key: refreshDoneOrderMessageKey,
                    content: statusText
                });
            }
            else {
                const statusText = "Không có đơn đã đóng hàng";
                setDoneRefreshStatus({type: "empty", text: statusText});
                message.info({
                    key: refreshDoneOrderMessageKey,
                    content: statusText
                });
            }
        })
            .catch(e => {
                setDoneRefreshStatus({type: "error", text: "Lỗi cập nhật đơn đóng hàng"});
                message.error({
                    key: refreshDoneOrderMessageKey,
                    content: "Lỗi cập nhật các đơn đóng hàng"
                })
            });
    }

    const backup = async () => {
        const lastCheck = localStorage.getItem(LAST_CHECK_TIME_KEY);

        if (lastCheck) {
            const lastTime = parseInt(lastCheck, 10);
            const now = Date.now();
            const hoursPassed = (now - lastTime) / (1000 * 60 * 60); // Convert ms to hours

            if (hoursPassed >= 4) {
                await backupNow();
            }
        } else {
            // First time, save the current time
            // const fileBlob = new Blob([JSON.stringify(store.getState())], { type: 'text/plain' });
            // await trello.createAttachment({
            //     name: moment().toLocaleString(),
            //     mimeType: "text/plain",
            //     file: fileBlob
            // }, BACKUP_CARD_ID);
            localStorage.setItem(LAST_CHECK_TIME_KEY, Date.now().toString());
            // message.success("Backup success");
        }
    }

    const backupNow = async () => {
        try {
            setBackupStatus({type: "loading", text: "Đang backup dữ liệu"});
            message.loading({
                key: backupMessageKey,
                content: "Đang đồng bộ dữ liệu lên trello"
            });
            const backupAttachment = _createBackupAttachment("Backup");
            await trello.createAttachment(backupAttachment.attachment, BACKUP_CARD_ID);
            const successTime = Date.now();
            localStorage.setItem(LAST_CHECK_TIME_KEY, successTime.toString()); // Reset the time
            localStorage.setItem(LAST_SUCCESSFUL_BACKUP_TIME_KEY, successTime.toString());
            setBackupStatus({type: "success", text: `Backup thành công ${_formatStatusTime(successTime)}`});
            message.success({
                key: backupMessageKey,
                content: "Đồng bộ lên trello thành công"
            });
        } catch (e) {
            setBackupStatus({type: "error", text: `Backup lỗi: ${_getErrorMessage(e)}`});
            message.error({
                key: backupMessageKey,
                content: "Đồng bộ lên trello thất bại"
            });
        }
    }

    const _onNavigateToOrderPaymentList = () => {
        navigate(RootRoutes.AuthorizedRoutes.OrderRoutes.CodPaymentList());
    }

    return <React.Fragment>
        {(backupStatus.text || doneRefreshStatus.text) && <Box style={{
            position: "fixed",
            right: 24,
            bottom: 132,
            width: 275,
            maxWidth: "calc(100vw - 48px)",
            backgroundColor: "#fff",
            border: "0.5px solid " + theme.token.colorBorder,
            borderRadius: 8,
            padding: 8,
            zIndex: 10,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
        }}>
            <Stack direction="column" gap={4}>
                <OperationStatusLine label="Backup" status={backupStatus}/>
                <OperationStatusLine label="Đóng hàng" status={doneRefreshStatus}/>
            </Stack>
        </Box>}
        <FloatButton.Group
            aria-label="Mở tác vụ nhanh"
            trigger="click"
            type="primary"
            style={{insetInlineEnd: 24, marginBottom: 40}}
            icon={<MenuOutlined/>}
        >
            <FloatButton aria-label="Danh sách COD" icon={<CreditCardOutlined />} onClick={_onNavigateToOrderPaymentList}/>
            <FloatButton aria-label="Sao lưu dữ liệu" icon={<CloudUploadOutlined/>} onClick={backupNow}/>
            <FloatButton aria-label="Làm mới đơn đóng hàng" icon={<DropboxOutlined/>} onClick={_refreshDoneOrder}/>
        </FloatButton.Group>
    </React.Fragment>;
}
