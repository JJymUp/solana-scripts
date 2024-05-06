import { updateMetadataAccountV2 } from '@metaplex-foundation/mpl-token-metadata'
import { payer, connection, explorerURL, CLUSTER_URL } from "../libs/helper";
import {
    findMetadataPda,
    createMetadataAccountV3,
    MPL_TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import { PublicKey, Transaction, clusterApiUrl, sendAndConfirmTransaction } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createNoopSigner, signerIdentity } from "@metaplex-foundation/umi";
import {
    fromWeb3JsPublicKey,
    toWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
(async () => {
    // Metadata for the Token
    const newTokenMetadata = {
        name: "Lazy Cat",
        symbol: "LAZYCAT",
        uri: "https://www.hostize.com/d/kC3VEWEsQC/file.json",
    };

    console.log("Payer address:", payer.publicKey.toBase58());

    const mySigner = createNoopSigner(fromWeb3JsPublicKey(payer.publicKey));

    const umi = createUmi(CLUSTER_URL, "confirmed");
    umi.use(signerIdentity(mySigner));

    const mintAddress = `D7ANToWf71s5AUW7YTYUmWp8MucohNDvFA87SzcTumML`

    const mint = new PublicKey(mintAddress);

    console.log(explorerURL({ address: mintAddress }));

    const metadataAccountAddress = await findMetadataPda(umi, {
        mint: fromWeb3JsPublicKey(mint),
    });


    const transactionBuilder = await updateMetadataAccountV2(umi, {
        metadata: metadataAccountAddress,
        updateAuthority: mySigner,
        data: {
            creators: null,
            name: newTokenMetadata.name,
            symbol: newTokenMetadata.symbol,
            uri: newTokenMetadata.uri,
            sellerFeeBasisPoints: 0, // 将支付给创建者的每笔交易的总百分比版税输入到 Mint NFT 端点的 sellerFeeBasisPoints 字段中。例如，如果 sellerFeeBasisPoints 值为“1000”，这意味着每次出售 NFT 时，NFT 购买价格的 10% 将转移给创建者。 要完全禁用 NFT 的版税，请将 sellerFeeBasisPoints 设置为 0。
            collection: null,
            uses: null,
        }
    })  

    const ix: any = transactionBuilder.getInstructions()[0];

    ix.keys = ix.keys.map((key: any) => {
        const newKey = { ...key };
        newKey.pubkey = toWeb3JsPublicKey(key.pubkey);
        return newKey;
    });

    // Build transaction with instructions to create new account and initialize mint account
    const transaction = new Transaction().add(
        ix
    );

    const transactionSignature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [
            payer, // payer
        ]
    );

    console.log(
        "Transaction Signature:",
        `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
    );
})()
