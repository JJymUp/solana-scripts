import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
    findMetadataPda,
    createMetadataAccountV3,
    MPL_TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import {
    fromWeb3JsPublicKey,
    toWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import {
    MINT_SIZE,
    TOKEN_PROGRAM_ID,
    createInitializeMint2Instruction,
    getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
import {
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
    TransactionInstruction,
    clusterApiUrl,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import { payer } from "../libs/helper";
import { createNoopSigner, signerIdentity } from "@metaplex-foundation/umi";

(async () => {
    // 使用现有密钥对或生成新密钥对（如果不存在）
    const wallet_1 = payer;
    const mySigner = createNoopSigner(fromWeb3JsPublicKey(wallet_1.publicKey));

    //Connection and Umi instance
    const endpoint = clusterApiUrl("devnet");
    const umi = createUmi(endpoint, "confirmed");
    umi.use(signerIdentity(mySigner));
    const connection = new Connection(endpoint, "confirmed");

    // Generate keypair to use as address of token account
    const mintKeypair = new Keypair();
    const mint = fromWeb3JsPublicKey(mintKeypair.publicKey);

    // Calculate minimum lamports for space required by mint account
    const lamports = await getMinimumBalanceForRentExemptMint(connection);

    // Instruction to create new account with space for new mint account
    const createAccountInstruction = SystemProgram.createAccount({
        fromPubkey: wallet_1.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
    });

    // Instruction to initialize mint account
    const initializeMintInstruction = createInitializeMint2Instruction(
        mintKeypair.publicKey, // mint address
        2, // decimals
        wallet_1.publicKey, // mint authority
        wallet_1.publicKey // freeze authority
    );

    const metadataAccountAddress = await findMetadataPda(umi, {
        mint: mint,
    });


    // Metadata for the Token
    const tokenMetadata = {
        name: "Solana Gold",
        symbol: "GOLDSOL",
        uri: "https://raw.githubusercontent.com/solana-developers/program-examples/new-examples/tokens/tokens/.assets/spl-token.json",
    };

    // Create the Metadata account for the Mint
    const transactionBuilder = createMetadataAccountV3(umi, {
        metadata: metadataAccountAddress,
        mint: mint,
        mintAuthority: mySigner,
        payer: mySigner,
        updateAuthority: mySigner.publicKey,
        data: {
            creators: null,
            name: tokenMetadata.name,
            symbol: tokenMetadata.symbol,
            uri: tokenMetadata.uri,
            sellerFeeBasisPoints: 0, // 将支付给创建者的每笔交易的总百分比版税输入到 Mint NFT 端点的 sellerFeeBasisPoints 字段中。例如，如果 sellerFeeBasisPoints 值为“1000”，这意味着每次出售 NFT 时，NFT 购买价格的 10% 将转移给创建者。 要完全禁用 NFT 的版税，请将 sellerFeeBasisPoints 设置为 0。
            collection: null,
            uses: null,
        },
        collectionDetails: null,
        isMutable: true,
    });

    const ix: any = transactionBuilder.getInstructions()[0];

    ix.keys = ix.keys.map((key: any) => {
        const newKey = { ...key };
        newKey.pubkey = toWeb3JsPublicKey(key.pubkey);
        return newKey;
    });

    // Build transaction with instructions to create new account and initialize mint account
    const transaction = new Transaction().add(
        createAccountInstruction,
        initializeMintInstruction,
        ix
    );

    const transactionSignature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [
            wallet_1, // payer
            mintKeypair, // mint address keypair
        ]
    );

    console.log(
        "Transaction Signature:",
        `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
    );

    console.log(
        "Mint Account:",
        `https://explorer.solana.com/address/${mintKeypair.publicKey.toString()}?cluster=devnet`
    );
})()