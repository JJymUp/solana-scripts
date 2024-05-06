
import { RouteRecordRaw } from 'vue-router'
export const constantRouterMap: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Home/Home.vue'),
        meta: {
            title: 'Solana Home Page'
        }
    },
    {
        path: '/mint',
        name: 'Mint',
        component: () => import('@/views/Mint/Mint.vue'),
        meta: {
            title: 'Mint'
        }
    },
    {
        path: '/transfer',
        name: 'Transfer',
        component: () => import('@/views/Transfer/Transfer.vue'),
        meta: {
            title: 'Transfer'
        }
    },
]