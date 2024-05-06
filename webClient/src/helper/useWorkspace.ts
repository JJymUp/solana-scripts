import { computed } from "vue";
import { useAnchorWallet } from "solana-wallets-vue";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
import idl from "./idl.json";

const preflightCommitment = "processed";
const commitment = "confirmed";
const programID = new PublicKey('6xidCvepboWenAafuqUWSn3irxdAcK1z8dVcdjRxk36f');

let workspace = null;
export const useWorkspace = () => workspace;

export const initWorkspace = () => {
  const wallet = useAnchorWallet();
  console.log(wallet.value);
  const connection = new Connection(clusterApiUrl("devnet"), commitment);
  const provider = computed(
    () =>
      new AnchorProvider(connection, wallet.value, {
        preflightCommitment,
        commitment,
      })
  );
  const program = computed(() => new Program(idl, programID, provider.value));

  console.log(program.value);
  workspace = {
    wallet,
    connection,
    provider,
    program,
  };
};

initWorkspace()
/**
 * 
 * "accounts": [
      {
        "name": "BaseAccount",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "count",
              "type": "u64"
            }
          ]
        }
      }
    ],
 */