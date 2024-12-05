import express from "express";
const app = express();
const port = 3000;

import dotenv from "dotenv";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { PumpFunSDK } from "pumpdotfun-sdk";
// import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { AnchorProvider } from "@coral-xyz/anchor";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import {
  fetchDigitalAssetWithTokenByMint,
  findMetadataPda,
} from "@metaplex-foundation/mpl-token-metadata";
// Use the RPC endpoint of your choice.
import * as borsh from "borsh";

dotenv.config();

const connection = new Connection(process.env.HELIUS_RPC_URL || "");
const getProvider = () => {
  if (!process.env.HELIUS_RPC_URL) {
    throw new Error("Please set HELIUS_RPC_URL in .env file");
  }

  const wallet = new Keypair();

  return new AnchorProvider(connection, wallet, { commitment: "finalized" });
};

const eventArray = [];
const setupEventListeners = async (sdk, umi) => {
  // const createEventId = sdk.addEventListener("createEvent", (event, slot, signature) => {
  //   console.log("createEvent", event, slot, signature);
  // });
  // console.log("Subscribed to createEvent with ID:", createEventId);

  const tradeEventId = sdk.addEventListener(
    "tradeEvent",
    (event, slot, signature) => {
      console.log("tradeEvent", event, slot, signature);
      // eventArray.push({ event, slot, signature });
    }
  );
  console.log("Subscribed to tradeEvent with ID:", tradeEventId);

  setTimeout(() =>  sdk.removeEventListener(tradeEventId), 1000);

  // console.log("EVENT ARRAY DATA", eventArray);


  const owner = await fetchDigitalAsset(umi, new PublicKey("AkpR43pT1r4czFr8Wn8rSotWx22g8d2taCvpPz5apump"))

console.log('METADATA', owner?.metadata);

  //   console.log("Subscribed to completeEvent with ID:", completeEventId);
};

const main = async () => {
  try {
    const provider = getProvider();
    const sdk = new PumpFunSDK(provider);
    // Set up event listeners
    // sdk.getBondingCurvePDA
    // sdk.getBondingCurvePDA()
    sdk.connection.getAccountInfoAndContext;
    const umi = createUmi(connection).use(mplTokenMetadata());

    await setupEventListeners(sdk, umi);
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

// setTimeout(await main(), 500);
main();

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(port, () => {
  console.log("Listening to...", port);
});
