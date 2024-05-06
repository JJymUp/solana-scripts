import { BASE_RESPONSE } from '@/helper/respTypes'
import instance from '@/utils/request'

// 生成上传文件的url
export const createUploadUrl = (data: { id: number }): Promise<BASE_RESPONSE<{quest_id: string}>> => {
    return instance({
        url: 'v1/account/presignedurl/create',
        method: 'GET',
        params: data
    })
}

// 上传文件
export const uploadFile = (data: { id: number, url: string }) => {
    return instance({
        url: data.url,
        method: 'POST',
        data
    })
}