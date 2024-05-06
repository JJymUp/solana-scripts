<script lang='ts' setup>
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction, clusterApiUrl, Transaction,  } from '@solana/web3.js';
import { useWallet, useAnchorWallet } from 'solana-wallets-vue';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout, createMintToInstruction, createInitializeMintInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction } from '@solana/spl-token'
import * as anchor from '@project-serum/anchor';

const transferOthers = async () => {
    try {
        let connection = new Connection(clusterApiUrl('devnet'));  //先链接集群网络，我链的devnet
        const { publicKey, sendTransaction } = useWallet()
        const decimals = 2
        const mint = new PublicKey('D7ANToWf71s5AUW7YTYUmWp8MucohNDvFA87SzcTumML')
        const fromPubkey = publicKey.value// 转出的钱包地址
        const toPubkey = new PublicKey('B2V5kYvGyBGyoYvFJzYJh8ighH2Hn6FdM8xxgqMq9cbK')// 转入钱包地址

        // 获取代币地址
        const destinationAssociatedTokenAddress = await getAssociatedTokenAddress(
            mint, // 代币mint地址
            fromPubkey,
            false,
            ASSOCIATED_TOKEN_PROGRAM_ID, // 导包
            TOKEN_PROGRAM_ID, // 导包
        )
        // 查询代币，没有就创建代币  Token.createAssociatedTokenAccountInstruction
        const destination = await connection.getAccountInfo(destinationAssociatedTokenAddress)
        console.log(destination, 'destination', destinationAssociatedTokenAddress.toBase58())

        const tx = new Transaction() // 建一个交易单


        if (!destination) {
            // 给转入地址创建一个代币token account
            const associatedTokenAccountIx = tx.add(
                createAssociatedTokenAccountInstruction(
                    fromPubkey, // 支付租金的账户
                    destinationAssociatedTokenAddress, // ata
                    toPubkey, // Owner of the new account 新帐户的所有者
                    mint,
                    TOKEN_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                )
            )
            tx.add(associatedTokenAccountIx) // 插入创建代币指令
            console.log(tx, '创建token账户 ')
        }

        // 创建交易单采用底层逻辑
        const splTransferIx = await createTransferInstruction(
            mint, // 代币账户地址
            destinationAssociatedTokenAddress, // 查询的代币账户地址
            fromPubkey, // owner: 所属人new PublicKey(puk)发送方的钱包地址
            1,
        )
        tx.add(splTransferIx)
        // 查找最近的区块
        tx.recentBlockhash = (
            await connection.getLatestBlockhash('max')
        ).blockhash
        tx.feePayer = fromPubkey// 付款人

        const signature = await sendTransaction(tx, connection);

        const latestBlockHash = await connection.getLatestBlockhash();

        let result = await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature
        }, 'processed');

        console.log("result", result);

    } catch (error) {
        console.log('error', error);
    }
}   

const transferSol = async () => {
    let connection = new Connection(clusterApiUrl('devnet'));  //先链接集群网络，我链的devnet

    const { publicKey, sendTransaction } = useWallet()

    let payPublicKey = publicKey.value

    let balance = await connection.getBalance(payPublicKey); //查询余额，默认是lamports
    console.log("balance", `${balance / LAMPORTS_PER_SOL}Sol`);  //打印SOL余额（10亿lamports = 1SOL）

    let toPubkey = new PublicKey("B2V5kYvGyBGyoYvFJzYJh8ighH2Hn6FdM8xxgqMq9cbK");
    //生成转账指令
    let instruction = SystemProgram.transfer({
        fromPubkey: payPublicKey,  //转出账户公钥
        toPubkey: toPubkey,   //转入账号公钥
        lamports: 10000000,  //数量（10亿lamports = 1SOL）
    })

    let transaction = new Transaction().add(instruction);

    const signature = await sendTransaction(transaction, connection);

    const latestBlockHash = await connection.getLatestBlockhash();
    console.log('signature', signature);

    let result = await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature
    }, 'processed');

    console.log("result", result);
}


const onTransfer = async (symbol: string) => {
    if (symbol === 'sol') {
        await transferSol()
    } else if (symbol === 'others') {    
        await transferOthers()
    }
}

</script>
<template>
    <div class="main">
        <div class='transfer flex-center' @click="onTransfer('sol')">Transfer Sol</div>
        <div class='transfer flex-center' @click="onTransfer('others')">Transfer other token</div>
    </div>
</template>
<style lang='scss' scoped>
.transfer {
    width: 200px;
    height: 44px;
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    cursor: pointer;
    margin-top: 20px;
}
</style>