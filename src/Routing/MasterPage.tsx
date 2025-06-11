import {
    CloudDownloadOutlined,
    ExportOutlined,
    ImportOutlined,
    MenuOutlined,
    UserOutlined,
    TruckOutlined
} from "@ant-design/icons";
import {ObjectPropertyHelper} from "@common/Helpers/ObjectProperty";
import {Button} from "@components/Button";
import {TextArea} from "@components/Form/Input";
import {Image} from "@components/Image";
import {Box} from "@components/Layout/Box";
import {Content} from "@components/Layout/Content";
import {Header} from "@components/Layout/Header";
import {Space} from "@components/Layout/Space";
import {Stack} from "@components/Layout/Stack";
import {Menu} from "@components/Menu";
import {useMessage} from "@components/Message";
import {Modal} from "@components/Modal";
import {SmartForm, useSmartForm} from "@components/SmartForm";
import {Tooltip} from "@components/Tootip";
import {Typography} from "@components/Typography";
import {useTheme, useToggle} from "@hooks";
import {addCustomer, resetCustomer} from "@store/Reducers/CustomerReducer";
import {RootState, store} from "@store/Store";
import {Drawer, Flex, Layout} from "antd";
import React, {useEffect, useRef, useState} from "react";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {useDispatch, useSelector} from "react-redux";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {RootRoutes} from "./RootRoutes";
import Logo from "../../assets/icons/radio-cassette.png";

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
                    return <UserOutlined style={{fontSize: "1.5em"}}/>;
                case "Đơn hàng":
                    return <TruckOutlined style={{fontSize: "1.5em"}}/>;
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
        <BackUpGoogleDrive/>
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
            <Button type="primary" onClick={showDrawer} icon={<MenuOutlined/>}/>
            <Drawer placement="left" title={<Typography.Text style={{fontFamily: "kanit", fontSize: 24}}>Cửa hàng
                Cassette</Typography.Text>} onClose={onClose} open={open} styles={{body: {padding: 0}}}>
                <Flex vertical justify="space-between" style={{height: "100%"}}>
                    <Menu
                        items={[
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
        {/*<Button type="text" style={_buttonStyles()} icon={<Image src={MealsIcon} preview={false} width={28} style={{ marginLeft: 2 }} />} onClick={() => onNavigate(RootRoutes.AuthorizedRoutes.ScheduledMealRoutes.List())}>*/}
        {/*    <Typography.Text style={_textStyles(RootRoutes.AuthorizedRoutes.ScheduledMealRoutes.List())}>Thực đơn</Typography.Text>*/}
        {/*</Button>*/}
    </Stack>
}

const BackUpGoogleDrive = () => {
    const CLIENT_ID = '1094219427182-93j2l5olha9457a8kikup3klickn6150.apps.googleusercontent.com';
    const SCOPES = 'https://www.googleapis.com/auth/drive.file';
    const TOKEN_REFRESH_INTERVAL_MS = 55 * 60 * 1000;
    const FILE_NAME = 'autosave-note.txt';
    const UPLOAD_INTERVAL_MS = 20 * 1000;

    const tokenClientRef = useRef(null);
    const uploadIntervalRef = useRef(null);
    const fileIdRef = useRef(null); // Store file ID if it already exists

    // Simulated text content — replace with your app state
    const getFileContent = () => JSON.stringify(store.getState());

    const handleTokenReceived = (token) => {
        localStorage.setItem('accessToken', token);
        (window as any).gapi.client.setToken({ access_token: token });
        startUploadCycle();
    };

    const initGapi = async () => {
        await new Promise((res) => (window as any).gapi.load('client', res));
        await (window as any).gapi.client.init({
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });

        tokenClientRef.current = (window as any).google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            prompt: '',
            callback: (response) => {
                if (response?.access_token) handleTokenReceived(response.access_token);
            },
        });

        const saved = localStorage.getItem('accessToken');
        if (saved) {
            (window as any).gapi.client.setToken({ access_token: saved });
            startUploadCycle();
            setInterval(refreshTokenSilently, TOKEN_REFRESH_INTERVAL_MS);
        } else {
            tokenClientRef.current.requestAccessToken();
        }
    };

    useEffect(() => {
        if ((window as any).google && (window as any).gapi) initGapi();
    }, []);

    const refreshTokenSilently = () => {
        if (tokenClientRef.current) {
            tokenClientRef.current.requestAccessToken({ prompt: '' });
        }
    };

    const startUploadCycle = () => {
        // Start periodic uploads
        if (uploadIntervalRef.current) return;

        uploadIntervalRef.current = setInterval(() => {
            uploadOrUpdateFile();
        }, UPLOAD_INTERVAL_MS);

        // Upload on tab close or refresh
        (window as any).addEventListener('beforeunload', handleUnload);
    };

    const handleUnload = (e) => {
        uploadOrUpdateFileSync(); // best-effort upload before unload
    };

    const uploadOrUpdateFile = async () => {
        if (!localStorage.getItem('accessToken')) return;

        const content = getFileContent();
        const metadata = {
            name: FILE_NAME,
            mimeType: 'text/plain',
        };

        const fileBlob = new Blob([content], { type: 'text/plain' });

        // If we already know file ID, just update
        if (fileIdRef.current) {
            await updateFile(fileIdRef.current, fileBlob);
            return;
        }

        // Otherwise: search if it exists by name
        const res = await (window as any).gapi.client.drive.files.list({
            q: `name='${FILE_NAME}' and trashed=false`,
            fields: 'files(id, name)',
        });

        if (res.result.files.length > 0) {
            const existingFile = res.result.files[0];
            fileIdRef.current = existingFile.id;
            await updateFile(fileIdRef.current, fileBlob);
        } else {
            await createFile(metadata, fileBlob);
        }
    };

    const uploadOrUpdateFileSync = () => {
        // Use Fetch API for sync call during unload
        if (!localStorage.getItem('accessToken')) return;

        const content = getFileContent();
        const metadata = {
            name: FILE_NAME,
            mimeType: 'text/plain',
        };

        const form = new FormData();
        form.append(
            'metadata',
            new Blob([JSON.stringify(metadata)], { type: 'application/json' })
        );
        form.append('file', new Blob([content], { type: 'text/plain' }));

        // If we have a file ID, use PUT to update
        const url = fileIdRef.current
            ? `https://www.googleapis.com/upload/drive/v3/files/${fileIdRef.current}?uploadType=multipart`
            : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;

        navigator.sendBeacon(
            url,
            form
        ); // No headers for sendBeacon; won't always work — fallback only
    };

    const createFile = async (metadata, fileBlob) => {
        const form = new FormData();
        form.append(
            'metadata',
            new Blob([JSON.stringify(metadata)], { type: 'application/json' })
        );
        form.append('file', fileBlob);

        const res = await fetch(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: form,
            }
        );

        const json = await res.json();
        fileIdRef.current = json.id;
    };

    const updateFile = async (fileId, fileBlob) => {
        const form = new FormData();
        form.append(
            'metadata',
            new Blob([JSON.stringify({ mimeType: 'text/plain' })], { type: 'application/json' })
        );
        form.append('file', fileBlob);

        await fetch(
            `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: form,
            }
        );
    };
    
    return null;
}