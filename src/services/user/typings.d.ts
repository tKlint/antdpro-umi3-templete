declare namespace API {
    type CurrentUser = {
        /**
         * 是否为根节点
         */
        belongRootNode?: boolean;
        /**
         * 企业id list
         */
        orgIdSet?: number[];
        /**
         * token 令牌
         */
        token?: string;
        /**
         * token 类型
         */
        tokenType?: 'Bearer';
        /**
         * 用户名
         */
        userFullNameCn?: string;
        /**
         * 用户id
         */
        userNo?: string;
    };
    type LoginDataType = {
        userName: string;
        userPassword: string;
    };
    type MenuDataParams = {
        userNo: string;
    };
    type MeunDataResponse = {
        component: string;
        exact: boolean;
        first: number;
        hideInMenu: boolean;
        icon: string;
        id: number;
        name: string | null;
        orderNum: number;
        parentId: number | null;
        path: string;
        routes: Menu[];
        second: number;
        title: string;
        type: number;
    };
}
