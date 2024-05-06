import { createApp} from 'vue'
import './style.css'
import 'normalize.css/normalize.css'
import router from './router'
import store from '@/store'
import "solana-wallets-vue/styles.css";
import SolanaWallets from "solana-wallets-vue";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

import {
    CloverWalletAdapter,
    SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import App from './App.vue'

const walletOptions = {
    wallets: [
        new CloverWalletAdapter(),
        new SolflareWalletAdapter({ network: WalletAdapterNetwork.Devnet }),
    ],
    autoConnect: true,
};


const app = createApp(App)

app.use(router)
app.use(store)
app.use(SolanaWallets, walletOptions)

app.mount('#app')
