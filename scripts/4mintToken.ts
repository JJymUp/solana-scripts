import { payer, connection, explorerURL } from "../libs/helper";

import { PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

(async () => {
    console.log("Payer address:", payer.publicKey.toBase58());

    const mintAddress = `D7ANToWf71s5AUW7YTYUmWp8MucohNDvFA87SzcTumML`

    const mint = new PublicKey(mintAddress);

    console.log(explorerURL({ address: mintAddress }));

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

    const mintSig = await mintTo(
        connection,
        payer,
        mint,
        tokenAccount,
        payer,
        amountOfTokensToMint,
    );

    console.log(explorerURL({ txSignature: mintSig }));
})()