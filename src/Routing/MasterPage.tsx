import {
    CloudDownloadOutlined,
    ExportOutlined,
    ImportOutlined,
    MenuOutlined,
    UserOutlined,
    TruckOutlined
} from "@ant-design/icons";
import { ObjectPropertyHelper } from "@common/Helpers/ObjectProperty";
import { Button } from "@components/Button";
import { TextArea } from "@components/Form/Input";
import { Image } from "@components/Image";
import { Box } from "@components/Layout/Box";
import { Content } from "@components/Layout/Content";
import { Header } from "@components/Layout/Header";
import { Space } from "@components/Layout/Space";
import { Stack } from "@components/Layout/Stack";
import { Menu } from "@components/Menu";
import { useMessage } from "@components/Message";
import { Modal } from "@components/Modal";
import { SmartForm, useSmartForm } from "@components/SmartForm";
import { Tooltip } from "@components/Tootip";
import { Typography } from "@components/Typography";
import { useTheme, useToggle } from "@hooks";
import { addCustomer, resetCustomer } from "@store/Reducers/CustomerReducer";
import { RootState } from "@store/Store";
import { Drawer, Flex, Layout } from "antd";
import React, { useState } from "react";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import LogoIcon from "../../assets/icons/logo.png";
import MealsIcon from "../../assets/icons/meals.png";
import DishesIcon from "../../assets/icons/noodles.png";
import ShoppingListIcon from "../../assets/icons/shoppingList.png";
import IngredientIcon from "../../assets/icons/vegetable.png";
import { RootRoutes } from "./RootRoutes";

const layoutStyles: React.CSSProperties = {
    height: "100%"
}

export const MasterPage = () => {
    const theme = useTheme();
    const currentFeatureName = useSelector((state: RootState) => state.appContext.currentFeatureName);

    const
        _featureIcon = () => {
            switch (currentFeatureName) {
                case "Khách hàng":
                    return <UserOutlined style={{ fontSize: "1.5em" }} />;
                case "Đơn hàng":
                    return <TruckOutlined style={{ fontSize: "1.5em" }} />;
                case "Thống kê":
                    return ShoppingListIcon;
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
    </Layout>
}

const SidebarDrawer = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

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

    return (
        <React.Fragment>
            <Button type="primary" onClick={showDrawer} icon={<MenuOutlined />} />
            <Drawer placement="left" title={<Typography.Text style={{ fontFamily: "kanit", fontSize: 24 }}>Cửa hàng
                Cassette</Typography.Text>} onClose={onClose} open={open} styles={{ body: { padding: 0 } }}>
                <Flex vertical justify="space-between" style={{ height: "100%" }}>
                    <Menu
                        items={[
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
                    <Box style={{ overflow: "hidden" }}>
                        <Image src={LogoIcon} width={350} preview={false} style={{ marginLeft: 90, opacity: 0.4 }} />
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

    const _buttonStyles = (): React.CSSProperties => {
        return {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: 64,
            width: 95
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
            height: 70,
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

    return <Stack justify="space-evenly" style={_containerStyles()}>
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
        {/*<Button type="text" style={_buttonStyles()} icon={<Image src={MealsIcon} preview={false} width={28} style={{ marginLeft: 2 }} />} onClick={() => onNavigate(RootRoutes.AuthorizedRoutes.ScheduledMealRoutes.List())}>*/}
        {/*    <Typography.Text style={_textStyles(RootRoutes.AuthorizedRoutes.ScheduledMealRoutes.List())}>Thực đơn</Typography.Text>*/}
        {/*</Button>*/}
    </Stack>
}