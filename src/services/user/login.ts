import type { RequestOptionsInit } from 'umi-request';
import request from '../request';

/**
 * 用户登录api
 * @param data 用户账号,密码
 * @param options 额外配置
 * @returns
 */
export function userLoginApi(data: API.LoginDataType, options?: RequestOptionsInit) {
    return request<API.CurrentUser>('/signin', {
        data,
        method: 'POST',
        ...(options || {}),
    });
}

/**
 * 获取用户菜单
 * @param data 用户信息
 * @param options
 * @returns
 */
export function fetechMenuDataApi(data: API.MenuDataParams, options?: RequestOptionsInit) {
    return request<API.MeunDataResponse[]>('/userMenu', {
        data,
        method: 'POST',
        ...(options || {}),
    });
}
