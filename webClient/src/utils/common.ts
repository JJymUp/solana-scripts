// 生成随机数 返回介于 min（包括）和 max（不包括）之间的随机数：

import { ref } from "vue";

// 生成随机数 返回介于 min（包括）和 max（都包括）之间的随机数： Math.floor(Math.random() * (max - min)) + min;
export const createRandom = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min)) + min;
}

// 获取assets静态资源
export const getAssetsFile = (url: string) => {
    return new URL(`../assets/images/${url}`, import.meta.url).href
}

// 判断是否是移动端
export const IsMobile = () => {
    let plat = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i);
    return plat ? true : false
}

// 判断是Android 还是 ios
export const isAndroidOrIOS = () => {
    const u = navigator.userAgent
    if (u.indexOf('Android') > -1 || u.indexOf('Adr') > -1) {
        // android终端
        return 'android'
    } else if (!!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
        // ios终端
        return 'ios'
    } else {
        return ''
    }
}

// name转写 Queen Idia -> queen_idia
export const getFormatName = (name: string) => {
    const localeLowerCaseName = name.toLocaleLowerCase()
    return localeLowerCaseName.replaceAll(' ', '_')
}

export const scrollAnimation = (currentY: number, targetY: number) => {
    // 获取当前位置方法
    // const currentY = document.documentElement.scrollTop || document.body.scrollTop
    // 计算需要移动的距离
    let needScrollTop = targetY - currentY
    let _currentY = currentY
    setTimeout(() => {
        // 一次调用滑动帧数，每次调用会不一样
        const dist = Math.ceil(needScrollTop / 10)
        _currentY += dist
        window.scrollTo(_currentY, currentY)
        // 如果移动幅度小于十个像素，直接移动，否则递归调用，实现动画效果
        if (needScrollTop > 10 || needScrollTop < -10) {
            scrollAnimation(_currentY, targetY)
        } else {
            window.scrollTo(_currentY, targetY)
        }
    }, 1)
}

/**
* 获取浏览器版本号
* n 传为浏览器类型 或 版本号
* 传 'n' 返回浏览器类型
* 传 'v' 返回浏览器版本
* 传 '' 返回浏览器类型 + 浏览器版本 
*/

export const getBrowser = (n: any) => {
    var ua = navigator.userAgent.toLowerCase(),
        s,
        name = '',
        ver = 0;
    //探测浏览器
    (s = ua.match(/edge\/([\d.]+)/)) ? _set("ie", _toFixedVersion(s[1])) :
        (s = ua.match(/msie ([\d.]+)/)) ? _set("ie", _toFixedVersion(s[1])) :
            (s = ua.match(/firefox\/([\d.]+)/)) ? _set("firefox", _toFixedVersion(s[1])) :
                (s = ua.match(/chrome\/([\d.]+)/)) ? _set("chrome", _toFixedVersion(s[1])) :
                    (s = ua.match(/opera.([\d.]+)/)) ? _set("opera", _toFixedVersion(s[1])) :
                        (s = ua.match(/version\/([\d.]+).*safari/)) ? _set("safari", _toFixedVersion(s[1])) : 0;

    function _toFixedVersion(ver: any, floatLength?: any) {
        ver = ('' + ver).replace(/_/g, '.');
        floatLength = floatLength || 1;
        ver = String(ver).split('.');
        ver = ver[0] + '.' + (ver[1] || '0');
        ver = Number(ver).toFixed(floatLength);
        return ver;
    }
    function _set(bname: any, bver: any) {
        name = bname;
        ver = bver;
    }
    return (n == 'n' ? name : (n == 'v' ? ver : name + ver));
};


// 字符串转数组 isReverse 是否需要翻转数组，默认为true
export const strTransform = (str: string, isReverse?: boolean) => {
    if (isReverse) {
        return str.split(',').reverse()
    }
    return str.split(',')
}

// 获取url中参数
export const getUrlParams = (url: string) => {
    // 通过 ? 分割获取后面的参数字符串
    if (url.indexOf('?') < 0) return {}
    let urlStr = url.split('?')[1]
    // 创建空对象存储参数
    let obj = {};
    // 再通过 & 将每一个参数单独分割出来
    let paramsArr = urlStr.split('&')
    for (let i = 0, len = paramsArr.length; i < len; i++) {
        // 再通过 = 将每一个参数分割为 key:value 的形式
        let arr = paramsArr[i].split('=')
        obj[arr[0]] = arr[1];
    }
    return obj
}

/* 节流 */
export const myThrottle = (fn: () => void, delay: number | undefined) => {
    const isThtottle = ref(true)
    return () => {
        if (!isThtottle.value) return
        isThtottle.value = false
        setTimeout(() => {
            fn()
            isThtottle.value = true
        }, delay)
    }
};

// 数字千位分隔符
export const formatNumber = (num: number | string, bit: number = 0) => {
    if (!num) return num;
    return FloatToFixed(num, bit).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    // ↓不支持截断多余0 ，如果有问题，可以临时替换之前的 2023/05/06
    // return parseFloat(num as string).toFixed(bit).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    // ↓不支持整数 ，如果有问题，可以临时替换之前的 2023/01/19
    // return parseFloat(num as string).toFixed(bit).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
}

// 获取数据类型
export const getType = (x: any) => {
    const type = Object.prototype.toString.call(x) // '[object String]'
    const sapceIndex = type.indexOf(' ') // 找到空格的索引
    const resType = type.slice(sapceIndex + 1, -1) // ‘String'
    return resType.toLowerCase() // 转小写 'string '
}

// 判断对象是否为空
export const isEmptyObj = (obj: object) => {
    // 如果不是对象，则返回false
    if (getType(obj) !== 'object') return false
    return Object.keys(obj).length > 0
}

// Merging multiple objects; It's shallow copy;
export function merge(...args: Record<string, any>[]) {
    return Object.assign({}, ...args);
}

export function formateNumberWithK(num: string | number) {
    const numInt = parseInt(num as string) / 1000;
    if (numInt < 1) return `${num}`;
    else return `${formatNumber(numInt, 1)}K`;
}

// 首字母大写
export const upcaseFisrt = (name: string) => {
    if (!name) return ''
    const lowerName = name.toLocaleLowerCase()
    return lowerName[0].toUpperCase() + lowerName.substring(1)
}

// 列表的数据
export const listDataFormat = (params: object = {}) => {
    return {
        offset: 0,
        limit: 0, // 条目数
        total: 0, // 总数
        list: [], // 数据
        hasMore: false, // 是否有更多数据
        ...params
    }
}

// 对比两个版本号字符串大小
export function compareVersion(v1: string, v2: string): 0 | -1 | 1 {
    const v1l = v1.split('.')
    const v2l = v2.split('.')
    const len = Math.max(v1l.length, v2.length)

    while (v1l.length < len) {
        v1l.push('0')
    }
    while (v2.length < len) {
        v2l.push('0')
    }

    for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1l[i])
        const num2 = parseInt(v2l[i])

        if (num1 > num2) {
            return 1
        } else if (num1 < num2) {
            return -1
        }
    }

    return 0
}


// 将n转换为toFixed格式的字符串,截断多余.000，如果n不是数字，返回isNaNReturn
export function FloatToFixed(n: string | number, fix: number, isNaNReturn: any = 0) {
    n = returnNumber(n, isNaNReturn);
    if (n % 1 === 0) {
        return String(n)
    } else {
        return String(parseFloat(n.toFixed(fix)));
    }
}

// 将n转换为数字，如果n不是数字，返回isNaNReturn
export function returnNumber(n: any, isNaNReturn: number = 0): number {
    if (typeof n !== 'number') n = Number(n);
    if (isNaN(n)) {
        console.warn('returnNumber, n is NaN:', n);
        return isNaNReturn
    } else return n;
}

export function explorerURL({
    address,
    txSignature,
    cluster,
}: {
    address?: string;
    txSignature?: string;
    cluster?: 'devnet' | 'testnet' | 'mainnet' | 'mainnet-beta';
}) {
    let baseUrl: string;
    //
    if (address) baseUrl = `https://explorer.solana.com/address/${address}`;
    else if (txSignature)
        baseUrl = `https://explorer.solana.com/tx/${txSignature}`;
    else return '[unknown]';

    // auto append the desired search params
    const url = new URL(baseUrl);
    url.searchParams.append('cluster', cluster || 'devnet');
    return url.toString() + '\n';
}