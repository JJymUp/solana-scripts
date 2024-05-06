import { createRouter, createWebHashHistory } from 'vue-router'
import { constantRouterMap } from './basic.router'
// import { permission } from './permission'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        ...constantRouterMap
    ]
})

// 权限校验
// permission(router)
// router.beforeEach(async (to, from, next) => {
//     document.title = to.meta.title as string
//     next()
// })

export default router