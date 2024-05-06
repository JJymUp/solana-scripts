
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { payer, connection, STATIC_PUBLICKEY, explorerURL } from "../libs/helper";

(async () => {
    console.log('Address', payer.publicKey.toBase58());

    const currentBalance = await connection.getBalance(payer.publicKey);

    console.log('Current balance lamports: ', currentBalance);

    console.log("Current balance of 'payer' (in SOL):", currentBalance / LAMPORTS_PER_SOL);

    // 生成一个新的随机地址
    const keypair = Keypair.generate();

    console.log('New keypair generated', keypair.publicKey.toBase58());

    const space = 0

    // 计算使用此空间需要交付的租金 单位 lamports
    const lamports = await connection.getMinimumBalanceForRentExemption(space);

    console.log('rent lamports: ', lamports);

    const a = new PublicKey("6xidCvepboWenAafuqUWSn3irxdAcK1z8dVcdjRxk36f");
    // 创建指令
    const createAccountIx = SystemProgram.createAccount({
        // 需要签署交易的帐户
        fromPubkey: payer.publicKey,
        // 链上创建的账户地址
        newAccountPubkey: keypair.publicKey,
        lamports,
        space,
        programId: a
    })

    // 获取最新的区块哈希值
    let recentBlockHash = await connection.getLatestBlockhash().then(res => res.blockhash);

    const message = new TransactionMessage({
        payerKey: payer.publicKey,
        recentBlockhash: recentBlockHash,
        instructions: [createAccountIx]
    }).compileToV0Message()

    console.log('message', message);

    const tx = new VersionedTransaction(message);

    console.log('tx1', tx);

    // 签名
    tx.sign([payer, keypair]);

    console.log('tx2', tx);

    const sig = await connection.sendTransaction(tx)

    console.log('completed');
    console.log('sig', sig);

    console.log(explorerURL({ txSignature: sig }));
})()