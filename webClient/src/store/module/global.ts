import { defineStore } from 'pinia'
const globalStore = defineStore('global', { // Public项目唯一id
    state: () => {
        return {
            navList: [],
        }
    },
    getters: {
        getNavList: (state) => {
            return state.navList
        },
    },
    actions: {
        setNavList(nav) {
            console.log('1231231231231231');
            localStorage.setItem('navList', JSON.stringify(nav))
            this.navList = nav
        }
    }
})

export default globalStore