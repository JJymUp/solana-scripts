import { payer, connection, explorerURL, CLUSTER_URL } from "../libs/helper";

import { PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity, irysStorage } from "@metaplex-foundation/js";

(async () => {
    console.log(payer.publicKey)

    const mintAddress = `D7ANToWf71s5AUW7YTYUmWp8MucohNDvFA87SzcTumML`

    const mint = new PublicKey(mintAddress);

    console.log(explorerURL({ address: mintAddress }));

    const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(payer))
    .use(
        irysStorage({
            // address: "https://devnet.bundlr.network",
            address: "https://devnet.irys.xyz",
            providerUrl: "https://api.devnet.solana.com",
            timeout: 60000,
            identity: payer
        }),
    );

    console.log("Uploading metadata...", metaplex);

    const nfts = await metaplex.nfts().findAllByOwner({
        owner: payer.publicKey,
    });

    console.log(nfts);

    const { uri: newUri } = await metaplex.nfts().uploadMetadata({
        name: "Lazy Cat NFT",
        description: "A Lazy cat",
        image: 'https://cas-staging-test.s3.amazonaws.com/avatar/826_1681114575.png',
    });

    console.log('newUri', newUri);
    await metaplex.nfts().update({ 
        nftOrSft: nfts[0],
        uri: newUri
    });


    console.log('ended');
})()