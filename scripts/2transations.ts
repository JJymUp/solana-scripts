import { Keypair, LAMPORTS_PER_SOL, SystemProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { payer, connection, STATIC_PUBLICKEY, explorerURL, testWallet } from "../libs/helper";

(async () => {
    console.log('Address', payer.publicKey.toBase58());

    console.log('testWallet', testWallet.publicKey.toBase58());

    const currentBalance = await connection.getBalance(payer.publicKey);

    console.log('Current balance lamports: ', currentBalance);

    console.log("Current balance of 'payer' (in SOL):", currentBalance / LAMPORTS_PER_SOL);

    const space = 0

    // 计算使用此空间需要交付的租金 单位 lamports
    const lamports = await connection.getMinimumBalanceForRentExemption(space);

    console.log('rent lamports: ', lamports);

    // 创建第一个指令，创建一个账户
    const createTestAccountIx = SystemProgram.createAccount({
        // 需要签署交易的帐户
        fromPubkey: payer.publicKey,
        // 链上创建的账户地址
        newAccountPubkey: testWallet.publicKey,
        lamports: lamports + 2_000_000,
        space,
        programId: SystemProgram.programId
    })

    // 创建一个指令转移lamports
    const transferToTestWalletIx = SystemProgram.transfer({
        lamports: lamports + 100_000,
        // 必须签署交易的帐户
        fromPubkey: payer.publicKey,
        // 不要签名的交易的账户
        toPubkey: testWallet.publicKey,
        programId: SystemProgram.programId
    })

    // 创建一个其它的指令转移lamports
    const transferToStaticWalletIx = SystemProgram.transfer({
        lamports: 100_000,
        // 必须签署交易的帐户
        fromPubkey: payer.publicKey,
        // 不要签名的交易的账户
        toPubkey: STATIC_PUBLICKEY,
        programId: SystemProgram.programId
    })

    // 获取最近的交易区块hash
    const blockHash = await connection.getLatestBlockhash().then(res => res.blockhash);

    const message = new TransactionMessage({
        payerKey: payer.publicKey,
        recentBlockhash: blockHash,
        instructions: [createTestAccountIx, transferToStaticWalletIx, transferToTestWalletIx, transferToStaticWalletIx]
    }).compileToV0Message()

    const tx = new VersionedTransaction(message);

    tx.sign([payer, testWallet])

    const sig = await connection.sendTransaction(tx)

    
    console.log("Transaction completed.");
    console.log(explorerURL({ txSignature: sig }));

})()