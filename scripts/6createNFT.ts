import { payer, connection, explorerURL, CLUSTER_URL } from "../libs/helper";

import { PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity, irysStorage } from "@metaplex-foundation/js";

(async () => {
    console.log(payer.publicKey)

    const mintAddress = `D7ANToWf71s5AUW7YTYUmWp8MucohNDvFA87SzcTumML`

    const mint = new PublicKey(mintAddress);

    console.log(explorerURL({ address: mintAddress }));

    const metadata = {
        name: "Lazy Cat NFT",
        symbol: "LAZYCAT",
        description: "A Lazy cat",
        image: "https://www.hostize.com/d/UBke0Xa4yi/file.png",
    };

    const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(payer))
    .use(
        irysStorage({
            address: "https://devnet.irys.xyz",
            providerUrl: "https://api.devnet.solana.com",
            timeout: 60000,
            identity: payer
        }),
    );

    console.log("Uploading metadata...", metaplex);

    const { uri } = await metaplex.nfts().uploadMetadata(metadata);

    console.log("Metadata uploaded:", uri);

    const { nft, response } = await metaplex.nfts().create({
        uri,
        name: metadata.name,
        symbol: metadata.symbol,
        sellerFeeBasisPoints: 500, 
        isMutable: true,
    });
    
    console.log('nft', nft);
    console.log('response', response);
    console.log(explorerURL({ txSignature: response.signature }));
})()