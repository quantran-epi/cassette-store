import {
    BarChartOutlined,
    CloudDownloadOutlined,
    MenuOutlined,
    TruckOutlined,
    UnorderedListOutlined,
    UserOutlined
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
import {useTheme, useToggle, useTrello} from "@hooks";
import {setCustomerState} from "@store/Reducers/CustomerReducer";
import {RootState, store} from "@store/Store";
import {Drawer, Flex, Layout} from "antd";
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

const layoutStyles: React.CSSProperties = {
    height: "100%"
}

const BACKUP_CARD_ID = "68498a4712a808a92bf59b01";

export const MasterPage = () => {
    const theme = useTheme();
    const currentFeatureName = useSelector((state: RootState) => state.appContext.currentFeatureName);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(test());
    }, []);

    const
        _featureIcon = () => {
            switch (currentFeatureName) {
                case "Khách hàng":
                    return <UserOutlined style={{ fontSize: "1.5em" }} />;
                case "Đơn hàng":
                    return <TruckOutlined style={{ fontSize: "1.5em" }} />;
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
                    <SidebarDrawer />
                    <Tooltip title={currentFeatureName}>
                        <Typography.Paragraph
                            style={{ fontFamily: "kanit", fontSize: 24, fontWeight: "500", marginBottom: 0, width: 230 }}
                            ellipsis>{currentFeatureName}</Typography.Paragraph>
                    </Tooltip>
                </Stack>
                <Box style={{ marginTop: 5 }}>
                    {_featureIcon()}
                </Box>
            </Stack>
        </Header>
        <Content>
            <Outlet />
        </Content>
        <BottomTabNavigator />
        <BackUpDataTrello />
    </Layout>
}

const SidebarDrawer = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const message = useMessage();
    const toggleLoading = useToggle();
    const [linkBackup, setLinkBackup] = useState("");

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
            let data = await fetch(linkBackup);
            let text = await data.text();

            let state: RootState = JSON.parse(text) as RootState;
            dispatch(setOrderState(state.order));
            dispatch(setCustomerState(state.customer));
            message.success("Đồng bộ thành công");
        } catch (e) {
            message.error(e?.message);
        }
        finally {
            toggleLoading.hide();
        }
    }

    return (
        <React.Fragment>
            <Button type="primary" onClick={showDrawer} icon={<MenuOutlined />} />
            <Drawer placement="left" title={<Typography.Text style={{ fontFamily: "kanit", fontSize: 24 }}>Cửa hàng
                Cassette</Typography.Text>} onClose={onClose} open={open} styles={{ body: { padding: 0 } }}>
                <Flex vertical justify="space-between" style={{ height: "100%" }}>
                    <Menu
                        items={[
                            {
                                key: "home", label: <Flex align="center" gap={5}>
                                    <BarChartOutlined style={{ fontSize: "1.2em" }} />
                                    {"Home"}
                                </Flex>, onClick: () => onNavigate(RootRoutes.AuthorizedRoutes.Root())
                            },
                            {
                                key: "orders", label: <Flex align="center" gap={5}>
                                    <TruckOutlined style={{ fontSize: "1.2em" }} />
                                    {"Đơn hàng"}
                                </Flex>, onClick: () => onNavigate(RootRoutes.AuthorizedRoutes.OrderRoutes.List())
                            },
                            {
                                key: "customers", label: <Flex align="center" gap={5}>
                                    <UserOutlined style={{ fontSize: "1.2em" }} />
                                    {"Khách hàng"}
                                </Flex>, onClick: () => onNavigate(RootRoutes.AuthorizedRoutes.CustomerRoutes.List())
                            },
                        ]}
                    />
                    <Stack direction="column" align={"center"}>
                        <Input placeholder="Nhập link file dữ liệu" onChange={(e) => setLinkBackup(e.target.value)} value={linkBackup} />
                        <Button loading={toggleLoading.value} icon={<CloudDownloadOutlined />} onClick={_onRehydrateData}>Đồng bộ dữ liệu đã lưu trữ</Button>
                    </Stack>
                    <Box style={{ overflow: "hidden" }}>
                        <Image src={Logo} width={350} preview={false} style={{ marginLeft: 90, opacity: 0.4 }} />
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
            <Button type="text" style={_buttonStyles()} icon={<BarChartOutlined style={{ fontSize: "1.2em" }} />} onClick={() => onNavigate(RootRoutes.AuthorizedRoutes.Root())}>
                <Typography.Text style={_textStyles(RootRoutes.AuthorizedRoutes.Root())}>Home</Typography.Text>
            </Button>
            <Button type="text" style={_buttonStyles()}
                icon={<TruckOutlined style={{ fontSize: "1.2em" }} />}
                onClick={() => onNavigate(RootRoutes.AuthorizedRoutes.OrderRoutes.List())}>
                <Typography.Text style={_textStyles(RootRoutes.AuthorizedRoutes.OrderRoutes.List())}>Đơn
                    hàng</Typography.Text>
            </Button>
            <Button type="text" style={_buttonStyles()} icon={<UserOutlined style={{ fontSize: "1.2em" }} />}
                onClick={() => onNavigate(RootRoutes.AuthorizedRoutes.CustomerRoutes.List())}>
                <Typography.Text style={_textStyles(RootRoutes.AuthorizedRoutes.CustomerRoutes.List())}>Khách
                    hàng</Typography.Text>
            </Button>
            <Button type="text" style={_buttonStyles()} icon={<UnorderedListOutlined style={{ fontSize: "1.2em" }} />}
                onClick={_onCalculateShipCost}>
                <Typography.Text>Phí ship</Typography.Text>
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
                style={{ width: '100%', marginBottom: 7 }}
            >
                {CUSTOMER_PROVINCES.map(p => <Option key={p} value={p}>{p}</Option>)}
            </Select>
            <Typography.Text>Phí ship là: <Typography.Text type="success">{shippingCost.toLocaleString()}đ</Typography.Text></Typography.Text>
        </Modal>
    </React.Fragment>
}

const BackUpDataTrello = () => {
    const trello = useTrello();
    const message = useMessage();

    useEffect(() => {
        backup();
    }, [])

    const backup = async () => {
        const lastCheck = localStorage.getItem('lastCheckTime');

        if (lastCheck) {
            const lastTime = parseInt(lastCheck, 10);
            const now = Date.now();
            const hoursPassed = (now - lastTime) / (1000 * 60 * 60); // Convert ms to hours

            if (hoursPassed >= 4) {
                const fileBlob = new Blob([JSON.stringify(store.getState())], { type: 'text/plain' });
                await trello.createAttachment({
                    name: moment().toLocaleString(),
                    mimeType: "text/plain",
                    file: fileBlob
                }, BACKUP_CARD_ID);
                localStorage.setItem('lastCheckTime', now.toString()); // Reset the time
                message.success("Backup success");
            }
        } else {
            // First time, save the current time
            // const fileBlob = new Blob([JSON.stringify(store.getState())], { type: 'text/plain' });
            // await trello.createAttachment({
            //     name: moment().toLocaleString(),
            //     mimeType: "text/plain",
            //     file: fileBlob
            // }, BACKUP_CARD_ID);
            localStorage.setItem('lastCheckTime', Date.now().toString());
            // message.success("Backup success");
        }
    }

    return null;
}