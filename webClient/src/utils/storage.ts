import storage from 'store'

// 保存到本地 token
export const storageToken = {
    set(val: string) {
        storage.set('token', val)
    },
    get() {
        return storage.get('token')
    },
    remove() {
        storage.remove('token')
    }
}