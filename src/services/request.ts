import type { RequestOptionsInit } from 'umi-request';
import { extend } from 'umi-request';

export interface ResponseType<T = object> {
    code: number;
    message: string;
    data: T;
}

const request = extend({
    prefix: '/gateway/admin',
    // errorHandler,
    // 默认错误处理
    credentials: 'include', // 默认请求是否带上cookie
});

request.interceptors.request.use((url, options) => {
    const tokenStr = localStorage.getItem('userInfo');
    let tokenType = '';
    let token = '';
    if (tokenStr) {
        token = JSON.parse(tokenStr).token;
        tokenType = JSON.parse(tokenStr).tokenType;
    }
    const headers = {
        Accept: options.isForm ? 'application/json' : '*',
        Authorization: `${tokenType} ${token}`,
    };
    if (!options.isForm) headers['Content-Type'] = 'application/json';
    return {
        url: url,
        options: { ...options, headers },
    };
});

const requestInstance = <T extends object>(
    url: string,
    options: RequestOptionsInit,
): Promise<ResponseType<T>> => {
    const method = options.method || 'GET';
    switch (method) {
        case 'GET':
            return request.get(url, options);
        case 'POST':
            return request.post(url, options);
        case 'PUT':
            return request.put(url, options);
        case 'DELETE':
            return request.delete(url, options);
        default:
            throw new Error('RESULTFUL ERROR: INVALID METHOED');
    }
};

export default requestInstance;
