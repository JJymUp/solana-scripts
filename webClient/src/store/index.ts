import { createPinia, storeToRefs } from "pinia";
const pinia = createPinia()
// import authStore from './module/auth';
import globalStore from './module/global';
export { globalStore, pinia, storeToRefs };
export default pinia