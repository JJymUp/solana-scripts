import { clusterApiUrl, Connection, Keypair, PublicKey } from '@solana/web3.js';
import path from "path";
export const MY_ADDRESS = `4AhNZPShEaZgCGLza9MxSuF5Qw315FB2zga3CcwaPsA6`;
export const LOCAL_PAYER_JSON_ABSPATH = `/Users/jimmy/.config/solana/id.json`;
export const DEFAULT_CLUSTER = `devnet`;
import fs from 'fs';

// define some default locations
const DEFAULT_KEY_DIR_NAME = ".local_keys";
const DEFAULT_PUBLIC_KEY_FILE = "keys.json";
const DEFAULT_DEMO_DATA_FILE = "demo.json";

export function loadKeypairFromFile(absPath: string) {
    try {
        if (!absPath) throw Error('No path provided');
        if (!fs.existsSync(absPath)) throw Error('File does not exist.');

        // load the keypair from the file
        const keyfileBytes = JSON.parse(
            fs.readFileSync(absPath, { encoding: 'utf-8' })
        );
        // parse the loaded secretKey into a valid keypair
        const keypair = Keypair.fromSecretKey(new Uint8Array(keyfileBytes));
        return keypair;
    } catch (err) {
        // return false;
        throw err;
    }
}

export const payer = loadKeypairFromFile(LOCAL_PAYER_JSON_ABSPATH);
// load cluster RPC url
export const CLUSTER_URL = clusterApiUrl(DEFAULT_CLUSTER);

export const connection = new Connection(CLUSTER_URL, 'single');

// define an address to also transfer lamports too
export const STATIC_PUBLICKEY = new PublicKey(MY_ADDRESS);


// generate a new Keypair for testing, named `wallet`
export const testWallet = loadOrGenerateKeypair("testWallet");

export function explorerURL({
    address,
    txSignature,
    cluster,
}: {
    address?: string;
    txSignature?: string;
    cluster?: 'devnet' | 'testnet' | 'mainnet' | 'mainnet-beta';
}) {
    let baseUrl: string;
    //
    if (address) baseUrl = `https://explorer.solana.com/address/${address}`;
    else if (txSignature)
        baseUrl = `https://explorer.solana.com/tx/${txSignature}`;
    else return '[unknown]';

    // auto append the desired search params
    const url = new URL(baseUrl);
    url.searchParams.append('cluster', cluster || 'devnet');
    return url.toString() + '\n';
}

/*
  Attempt to load a keypair from the filesystem, or generate and save a new one
*/
export function loadOrGenerateKeypair(
    fileName: string,
    dirName: string = DEFAULT_KEY_DIR_NAME
) {
    try {
        // compute the path to locate the file
        const searchPath = path.join(dirName, `${fileName}.json`);
        let keypair = Keypair.generate();

        // attempt to load the keypair from the file
        if (fs.existsSync(searchPath)) keypair = loadKeypairFromFile(searchPath);
        // when unable to locate the keypair, save the new one
        else saveKeypairToFile(keypair, fileName, dirName);

        return keypair;
    } catch (err) {
        console.error('loadOrGenerateKeypair:', err);
        throw err;
    }
}

export function saveKeypairToFile(
    keypair: Keypair,
    fileName: string,
    dirName: string = DEFAULT_KEY_DIR_NAME,
  ) {
    fileName = path.join(dirName, `${fileName}.json`);
  
    // create the `dirName` directory, if it does not exists
    if (!fs.existsSync(`./${dirName}/`)) fs.mkdirSync(`./${dirName}/`);
  
    // remove the current file, if it already exists
    if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
  
    // write the `secretKey` value as a string
    fs.writeFileSync(fileName, `[${keypair.secretKey.toString()}]`, {
      encoding: "utf-8",
    });
  
    return fileName;
  }
  