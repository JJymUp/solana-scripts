<script lang='ts' setup>
import { Connection, PublicKey, SystemProgram, Transaction, Keypair, clusterApiUrl, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { Program, Provider, AnchorProvider, web3, Wallet, Idl } from '@project-serum/anchor';
import {  MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, mintTo, createMintToCheckedInstruction, createInitializeMintInstruction} from "@solana/spl-token";
import * as anchor from '@project-serum/anchor';
import safari from '@/helper/safari.json'
import { useWallet, useAnchorWallet } from 'solana-wallets-vue';

const { LAMPORTS_PER_SOL } = web3;

const { wallet, publicKey } = useWallet()

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID);

const walletAnchor = useAnchorWallet();

const CLUSTER_URL = clusterApiUrl('devnet');

const connection = new Connection(CLUSTER_URL, 'single');

const preflightCommitment = "processed";
const commitment = "confirmed";

const programID = new PublicKey(safari.metadata.address);
const provider = new AnchorProvider(connection, walletAnchor.value, {
    preflightCommitment,
    commitment,
})
const program = new Program(safari as Idl, programID, provider); // IDL是合约的JSON接口定义

const signer = provider.wallet

const tokenId = new anchor.BN('263128361823687126');

const metadata = {
    id: tokenId,
    name: "Maxlaeuz #3",
    symbol: "MAXLAEUZ",
    uri: "https://arweave.net/CMQ6B_GLjj6TCXyE6Q9pfOU3_ijkYOKiT9RMh8nIwXY",
    description: "A MAXLAEUZ MAXLAEUZ MAXLAEUZ 3",
    image: "https://arweave.net/06LOWk7pCIoWudUr9atMhZEZu9I7bq0HEhKCSeJeEBc",
};
async function getMintPDA(tokenID: anchor.BN, programId: PublicKey): Promise<PublicKey> {
    try {
        const [publicKey] = await PublicKey.findProgramAddressSync(
        [Buffer.from("mint"), tokenID.toArrayLike(Buffer, 'le')], programId);
        return publicKey;
    }
    catch (e) {
        console.log(e);
    }
}

async function getMetadataPDA(mint: PublicKey): Promise<PublicKey> {
    const [publicKey] = await PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        TOKEN_METADATA_PROGRAM_ID
    );
    return publicKey;
}

async function getMasterEditionPDA(mint: PublicKey): Promise<PublicKey> {
    const [publicKey] = await PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer(), Buffer.from("edition")],
        TOKEN_METADATA_PROGRAM_ID
    );
    return publicKey;
}




async function createNFT(id: anchor.BN, name: string, symbol: string, uri: string) {
    const mintAccount = await getMintPDA(tokenId, program.programId);
    let metadataAccount = await getMetadataPDA(mintAccount);
    console.log(`metadataAccount: ${metadataAccount.toBase58()}`);

    //derive the master edition pda
    let masterEditionAccount = await getMasterEditionPDA(mintAccount);

    console.log(`masterEditionAccount: ${masterEditionAccount.toBase58()}`);
    console.log(`mintAccount: ${mintAccount.toBase58()}`);
    const associatedTokenAccount = await getAssociatedTokenAddress(
        mintAccount,
        signer.publicKey
    );
    try {
        const tx = await program.methods.createSingleNft(
            id,
            name,
            symbol,
            uri,
            0.0, // price
            new anchor.BN("13583497855346290998"),   // cant
        ).accounts({
            authority: signer.publicKey,
            payer: signer.publicKey,
            mint: mintAccount,
            tokenAccount: associatedTokenAccount,
            nftMetadata: metadataAccount,
            masterEditionAccount: masterEditionAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
        }).rpc()
            console.log(
                `mint nft tx: https://explorer.solana.com/tx/${tx}?cluster=devnet`
            );
            console.log(
                `minted nft: https://explorer.solana.com/address/${mintAccount}?cluster=devnet`
            );
    } catch (error) {
        console.error("Transaction failed", error);
    }
}


const mintNft = () => {
    createNFT(metadata.id, metadata.name, metadata.symbol, metadata.uri);
}

const mintToken = async () => {
    const { publicKey, sendTransaction } = useWallet()
    let connection = new Connection(clusterApiUrl('devnet'));  //先链接集群网络，我链的devnet
    const mint = new PublicKey(`D7ANToWf71s5AUW7YTYUmWp8MucohNDvFA87SzcTumML`);

    const payer = Keypair.fromSecretKey(new Uint8Array([132,196,36,17,138,54,200,117,193,154,149,208,253,159,247,152,181,92,175,192,63,74,127,87,69,76,159,2,228,39,119,169,47,14,239,189,97,110,54,207,84,209,82,38,207,139,237,0,91,86,131,153,94,154,76,121,179,170,155,122,84,229,239,151]));

    // get or create the token's ata
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        payer.publicKey,
    ).then(ata => ata.address);

    console.log("Token account address:", tokenAccount.toBase58());

    const amountOfTokensToMint = 1_000;

    // mint some token to the "ata"
    console.log("Minting some tokens to the ata...");

    // console.log(mintSig);
    let tx = new Transaction();
    tx.add(
        createMintToCheckedInstruction(
            mint,
            tokenAccount,
            publicKey.value, // mint auth
            amountOfTokensToMint, // amount
            2 // decimals
        )
    );

    tx.recentBlockhash = (
            await connection.getLatestBlockhash('max')
        ).blockhash
    tx.feePayer = publicKey.value // 付款人

    const signature = await sendTransaction(tx, connection);

    const latestBlockHash = await connection.getLatestBlockhash();
    console.log('signature', signature);

    let result = await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature
    }, 'processed');

    console.log('result' ,result);
}

</script>
<template>
    <div class="main">
        <div class='mint flex-center' @click="mintNft">mint nft with contracts</div>
        <div class="mint flex-center" @click="mintToken">mint token</div>
    </div>
</template>
<style lang='scss' scoped>
.mint {
    width: 200px;
    height: 44px;
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    cursor: pointer;
    margin-top: 20px;
}
</style>