// import store from '../store';
// import storage from 'store';
// import router from '../router';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
// import Message from '@/components/common/Message/Message';

// 创建axios实例
let instance: any = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_URL,
    timeout: 30000,
});
/**
 * @desc: 异常拦截处理器
 * @param { Object } error 错误信息
 */
const errorHandler = async (
    error: AxiosError<any>
): Promise<AxiosError> => {
    console.error('response,', error);
    const { response } = error;
    if (response) {
        const code = response?.data?.code?.toLocaleUpperCase();
        if (code === 'RECORD_NOT_FOUND') {
            return Promise.reject(error);
        }

        // Message({ text: response.data.msg, type: 'error' });
    }
    return Promise.reject(error);
};

/**
 * @desc: 请求发送前拦截
 * @param { Object } config 配置参数
 */
instance.interceptors.request.use(
    (
        config: AxiosRequestConfig
    ): AxiosRequestConfig | Promise<AxiosRequestConfig> => {
        return new Promise((_resolve, _reject) => {
            const unixTime = parseInt(new Date().getTime() / 1000 + '');

            config = {
                ...config,
                headers: {
                    'Content-Type': 'application/json',
                    'x-cassava-ver': '1.0', // 请求的api版本
                    'x-cassava-dev': 'web', // 请求的设备，如android、ios
                    'x-cassava-ts': unixTime, // 请求发起的unix time
                    'x-cassava-language': 'en', // 请求需要的语言。
                },
            };

            // store.dispatch('user/getToken', config.url).then((token) => {
            //     if (token !== null) {
            //         config.headers!['x-cassava-token'] = token;
            //     } else {
            //         // TODO unipass configpage
            //         store.commit('user/clearState');
            //     }
            //     resolve(config);
            // });
        });
    },
    errorHandler
);

/**
 * @desc: 服务端响应后拦截
 * @param { Object } response 返回的数据
 */
instance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse | Promise<AxiosResponse> => {
        if (response.data.code === 'OK' || response.data.code === 'ACCEPTED') {
            return response;
        } else {
            // Message({ text: response.data.msg, type: 'error' });
            return Promise.reject(response);
        }
    },
    errorHandler
);

export default instance;
