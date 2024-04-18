//Imports
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { createMetadataAccountV3, CreateMetadataAccountV3InstructionAccounts, CreateMetadataAccountV3InstructionArgs } from '@metaplex-foundation/mpl-token-metadata'
import { clusterApiUrl, PublicKey, Keypair, Transaction, Connection, sendAndConfirmTransaction } from '@solana/web3.js';
import { fromWeb3JsPublicKey, toWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters'

//Connection and Umi instance
const endpoint = clusterApiUrl("devnet");
const umi = createUmi(endpoint)
const connection = new Connection(endpoint);
const keypair: Keypair = Keypair.fromSecretKey(Uint8Array.from(secret));

//Constants
const mplProgramId = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
const mint = new PublicKey("8Lw2vWmtXbHGj6PYEnRXtFwrnjz2sS7CtoRdHGRq9ndA");

const [metadata] = PublicKey.findProgramAddressSync([
    Buffer.from("metadata"),
    mplProgramId.toBytes(),
    mint.toBytes()
], mplProgramId);

//Metadata Account IX Args
const args: CreateMetadataAccountV3InstructionArgs = {
    data: {
        name: "My Token",
        symbol: "TOKN",
        uri: "",
        sellerFeeBasisPoints: 0,
        collection: null,
        creators: [
            {address: fromWeb3JsPublicKey(keypair.publicKey), verified: true, share: 100}
        ],
        uses: null
    },
    isMutable: true,
    collectionDetails: null
}

//The tx builder expects the type of mint authority and signer to be `Signer`, so built a dummy Signer instance
const signer = {
    publicKey: fromWeb3JsPublicKey(keypair.publicKey),
    signTransaction: null,
    signMessage: null,
    signAllTransactions: null
}

//Metadata account IX Accounts
const accounts: CreateMetadataAccountV3InstructionAccounts = {
    metadata: fromWeb3JsPublicKey(metadata),
    mint: fromWeb3JsPublicKey(mint), 
    payer: signer,
    mintAuthority: signer,
    updateAuthority: fromWeb3JsPublicKey(keypair.publicKey)
}

//Arguments merged to match the parameter required by the method
const fullArgs = {...accounts, ...args}

const metadataBuilder = createMetadataAccountV3(umi, fullArgs);

(async() => {
    const ix: any = metadataBuilder.getInstructions()[0];
    ix.keys = ix.keys.map(key => {
        const newKey = {...key};
        newKey.pubkey = toWeb3JsPublicKey(key.pubkey);
        return newKey;
    });

    const tx = new Transaction().add(ix);
    const sig = await sendAndConfirmTransaction(connection, tx, [keypair]);

    console.log(sig)
})()