import type { MenuDataItem, Settings as LayoutSettings } from '@ant-design/pro-layout';
import { SettingDrawer } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import type { RunTimeLayoutConfig } from 'umi';
import { history, Link } from 'umi';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import { BookOutlined, LinkOutlined } from '@ant-design/icons';
import defaultSettings from '../config/defaultSettings';
import { fetechMenuDataApi } from './services/user/login';
import { message } from 'antd';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
    loading: <PageLoading />,
};

/**
 * 递归菜单item
 * @param menuData
 * @returns
 */
const pollMenuItem = (menuData: API.MeunDataResponse[]): MenuDataItem[] => {
    return menuData.map((item) => ({
        path: item.path,
        name: item.name || item.title,
        exact: true,
        icon: item.icon,
        children: item.routes.length > 0 ? pollMenuItem(item.routes || []) : undefined,
        hideInMenu: item.hideInMenu,
        // routes: item.routes.length > 0 && pollMenuItem(item.routes || []),
    }));
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
    settings?: Partial<LayoutSettings>;
    currentUser?: API.CurrentUser;
    loading?: boolean;
    fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
    menuData?: MenuDataItem[];
}> {
    /**
     * 从session中获取用户信息
     * @returns 用户信息
     */
    const fetchUserInfo = (): Promise<API.CurrentUser> => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            return Promise.resolve(JSON.parse(userInfo));
        }
        history.push(loginPath);
        return Promise.resolve({});
    };

    /**
     * 获取菜单配置
     * @param userInfo 用户信息
     * @returns
     */
    const fetchUserMenu = async (userInfo: { userNo: string }): Promise<MenuDataItem[]> => {
        const { userNo } = userInfo;
        const { code, data, message: errMsg } = await fetechMenuDataApi({ userNo });
        if (code === 200) {
            return pollMenuItem(data);
        }
        message.error(errMsg);
        return [];
    };

    // 如果不是登录页面，执行

    const currentUser = await fetchUserInfo();
    if (currentUser.userNo) {
        const menuData = await fetchUserMenu({ userNo: currentUser.userNo });
        if (history.location.pathname === loginPath) {
            window.location.pathname = '/';
        }
        return {
            fetchUserInfo,
            currentUser,
            settings: defaultSettings,
            menuData: menuData,
        };
    }
    return {
        fetchUserInfo,
        currentUser,
        settings: defaultSettings,
    };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
    return {
        rightContentRender: () => <RightContent />,
        disableContentMargin: false,
        waterMarkProps: {
            content: initialState?.currentUser?.userFullNameCn,
        },
        footerRender: () => <Footer />,
        onPageChange: () => {
            const { location } = history;
            console.log('page chaned', initialState);
            // 如果没有登录，重定向到 login
            if (!initialState?.currentUser?.userNo && location.pathname !== loginPath) {
                history.push(loginPath);
            }
            if (initialState?.currentUser?.userNo && location.pathname == loginPath) {
                history.push('/');
            }
        },
        links: isDev
            ? [
                  <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
                      <LinkOutlined />
                      <span>OpenAPI 文档</span>
                  </Link>,
                  <Link to="/~docs" key="docs">
                      <BookOutlined />
                      <span>业务组件文档</span>
                  </Link>,
              ]
            : [],
        menuHeaderRender: undefined,
        // 自定义 403 页面
        // unAccessible: <div>unAccessible</div>,
        // 增加一个 loading 的状态
        childrenRender: (children, props) => {
            // if (initialState?.loading) return <PageLoading />;
            return (
                <>
                    {children}
                    {!props.location?.pathname?.includes('/login') && (
                        <SettingDrawer
                            disableUrlParams
                            enableDarkTheme
                            settings={initialState?.settings}
                            onSettingChange={(settings) => {
                                setInitialState((preInitialState) => ({
                                    ...preInitialState,
                                    settings,
                                }));
                            }}
                        />
                    )}
                </>
            );
        },
        menuDataRender: () => initialState?.menuData || [],
        ...initialState?.settings,
    };
};
