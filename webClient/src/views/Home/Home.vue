<script setup lang="ts">
import { ref } from 'vue'
import { WalletMultiButton, useWallet } from 'solana-wallets-vue';
// import { Connection, clusterApiUrl, Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import { Connection, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl, Keypair, TransactionInstruction, Transaction, sendAndConfirmTransaction, SystemProgram, } from '@solana/web3.js';

import { TOKEN_PROGRAM_ID, MintLayout, createMintToInstruction, createInitializeMintInstruction, AccountLayout } from '@solana/spl-token'
import { Metaplex, keypairIdentity, irysStorage } from "@metaplex-foundation/js";
import * as SPLToken from "@solana/spl-token";



const nfts = ref<any[]>([])

const balanceRal = ref(0)

const onGetNfts = async () => {
    // const connection = new Connection(clusterApiUrl('devnet'))
    console.log(useWallet());
    const { publicKey,  } = useWallet();
    console.log(publicKey.value.toBase58());
    console.log(TOKEN_PROGRAM_ID);
    const CLUSTER_URL = clusterApiUrl('devnet');

    const connection = new Connection(CLUSTER_URL, 'single');

    const balance = await connection.getBalance(publicKey.value);

    console.log(balance / LAMPORTS_PER_SOL + 'SOL');

    balanceRal.value = balance / LAMPORTS_PER_SOL

    // 1. 抓取所有onwer所有擁有的代幣帳戶
    let response = await connection.getTokenAccountsByOwner(
        publicKey.value, // owner here
        {
            programId: TOKEN_PROGRAM_ID,
        }
    );
    console.log(response);
    response.value.forEach((e) => {
        console.log(`pubkey: ${e.pubkey.toBase58()}`);
        const accountInfo = SPLToken.AccountLayout.decode(e.account.data);
        console.log('accountInfo', accountInfo);
        console.log(`mint: ${new PublicKey(accountInfo.mint)}`);
        // console.log(`amount: ${SPLToken.u64.fromBuffer(accountInfo.amount)}`);
    });
    

    // 获取账户下的所有的NFT
    const wallet = new Keypair()

    const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(wallet))
    .use(
        irysStorage({
            // address: "https://devnet.bundlr.network",
            address: "https://devnet.irys.xyz",
            providerUrl: "https://api.devnet.solana.com",
            timeout: 60000,
            identity: wallet
        }),
    );

    console.log("Uploading metadata...", metaplex);

    const nftsFind = await metaplex.nfts().findAllByOwner({
        owner: publicKey.value,
    });

    console.log(nftsFind);
    nfts.value = nftsFind
};

const onGetTokens = async () => {
    console.log(useWallet());
    const { publicKey } = useWallet();
    console.log(publicKey.value.toBase58());

    const CLUSTER_URL = clusterApiUrl('devnet');

    const connection = new Connection(CLUSTER_URL, 'single');

    const account = await connection.getAccountInfo(publicKey.value);
    // const account1 = await getAccount(connection, publicKey.value);
    console.log(account);

    // 将传入的地址转换为PublicKey格式
    const ownerPublicKey = publicKey.value

    // 获取所有Token账户
    const accounts = await connection.getTokenAccountsByOwner(ownerPublicKey, {
        programId: TOKEN_PROGRAM_ID
    });

    console.log(accounts);

    // 遍历并输出每个Token账户的详细信息
    accounts.value.forEach(async account => {
        const accountData = AccountLayout.decode(Buffer.from(account.account.data));
        // console.log(accountData);
        

        const tokens = await checkIfNFTAndFetchMetadata(new PublicKey(accountData.mint), connection)

        if (tokens.length) {
            console.log(`Account Address: ${account.pubkey.toBase58()}`);
            console.log(`Token Amount: ${accountData.amount}`);
            console.log(`Token Mint: ${new PublicKey(accountData.mint).toBase58()}`);
        }
    });
}

async function checkIfNFTAndFetchMetadata(mintAddress, connection) {
    const mintAccountInfo = await connection.getParsedAccountInfo(mintAddress);
    const mintAccountData = mintAccountInfo.value.data;

    const tokens = []

    if (mintAccountData.parsed.info.decimals === 0 && mintAccountData.parsed.info.supply === "1") {
        // It's likely an NFT (one supply token)
        try {
            // 获取metadata 来判断是否是nft
        } catch (err) {
            console.log("Error fetching metadata:", err);
        }
    } else {
        console.log("This token is not an NFT.");
        tokens.push(mintAccountData)
    }
    return tokens
}

</script>

<template>
    <div class="home">
        <div class="connect">
            <wallet-multi-button :dark="false"></wallet-multi-button>
            <div v-if="balanceRal">Balance: {{ balanceRal }}</div>
        </div>

        <div class="getTokens">
            <button class="btn" @click="onGetTokens">get tokens</button>
        </div>

        <div class="nftContainer">
            <button class="btn" @click="onGetNfts">get nfts</button>
            <div class="nfts">
                <div v-for="nft in nfts" :key="nft.symbol">
                    <img :src="nft.uri" />
                    <p>{{ nft.symbol }}</p>
                    <p>{{ nft.name }}</p>
                    <p>{{ nft.description }}</p>
                    <div class="address">token address: {{ nft.address.toBase58() }}</div>
                    <div class="address">mint address: {{ nft.mintAddress.toBase58() }}</div>
                    <div class="address" v-if="nft.creators.length">creators address: {{ nft.creators[0].address.toBase58() }}</div>
                </div>
            </div>
        </div>
    </div>
    
</template>

<style lang="scss" scoped>
.home {
    min-height: 800px;
    width: 100%;
    padding: 60px;
}
.btn {
    width: 200px;
    height: 50px;
    background-color: #f0f0f0;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    outline: none;
    cursor: pointer;
    margin-top: 20px;
}
</style>


