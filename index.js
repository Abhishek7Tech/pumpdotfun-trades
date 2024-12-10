import express from "express";
const app = express();
const port = 3000;

import dotenv from "dotenv";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { PumpFunSDK } from "pumpdotfun-sdk";
// import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { AnchorProvider } from "@coral-xyz/anchor";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

dotenv.config();
const myAddress = new PublicKey("C9SgyktZqQCPNmANkABSaKUWcHB6qoKLnHeDrXmZoJHB");
const connection = new Connection(process.env.HELIUS_RPC_URL || "");
const getProvider = () => {
  if (!process.env.HELIUS_RPC_URL) {
    throw new Error("Please set HELIUS_RPC_URL in .env file");
  }

  const wallet = new Keypair();

  return new AnchorProvider(connection, wallet, { commitment: "finalized" });
};

let eventArray = [];
let tokensArray = [];
const setupEventListeners = async (sdk, umi) => {
  // const createEventId = sdk.addEventListener("createEvent", (event, slot, signature) => {
  //   console.log("createEvent", event, slot, signature);
  // });
  // console.log("Subscribed to createEvent with ID:", createEventId);

  const tradeEventId = sdk.addEventListener(
    "tradeEvent",
    async (event, slot, signature) => {
      // console.log("User",myAddress === myAddress);

      if (event.user === myAddress) {
        console.log(
          "Catched............................................................................................."
        );
      }

      const isMyAddress = event?.user === myAddress ? true : false;

      // if (isMyAddress) {

      console.log("FOund my address");
      // console.log("tradeEvent", event, slot, signature);
      if (eventArray.find((tokens) => tokens.signature === signature)) {
        console.log("ARR", eventArray);
        return;
      }
      eventArray.push({ ...event, signature });
      setInterval(async () => {
        // console.log("Map", eventArray);
        // eventArray[0].map(async (trade) => {
        const mintAddress = eventArray[0]?.mint;
        const buyerAddress = eventArray[0]?.user;
        const solAmount = Number(eventArray[0]?.solAmount) / LAMPORTS_PER_SOL;
        // if (!mintAddress) {
        //   console.log("No mints");
        //   return;
        // }
        const tokenData = await fetchDigitalAsset(umi, mintAddress);
        const tokenMetaData = tokenData?.metadata;
        const tokenName = tokenMetaData?.name;
        const tokenSymbol = tokenMetaData?.symbol;
        const tokenUri = tokenMetaData?.uri;
        const tokenUriData = await fetch(tokenUri, {
          method: "GET",
        });
        const tokenUriData2 = await tokenUriData?.json();
        const tokenImageUrl = tokenUriData2?.image;
        const tokenTwitterHandle = tokenUriData2?.twitter;
        const tokenDescription = tokenUriData2?.description;

        console.log("\nTOKEN");
        console.log("Token name:", tokenName);
        console.log("Token mint addess", mintAddress?.toString());
        console.log("Buyer Address", buyerAddress?.toString());
        console.log("Amount of token bought", solAmount);
        console.log("Token symbol:", tokenSymbol);
        console.log("Token image url:", tokenImageUrl);
        console.log("Token Twitter:", tokenTwitterHandle);
        console.log("Token Description", tokenDescription);
        console.log("\n");
        const tokenDetails = {
          name: tokenName,
          mintAddress: mintAddress?.toString(),
          amountBought: `${solAmount} SOL`,
          symbol: tokenSymbol,
          imageUrl: tokenImageUrl,
          x: tokenTwitterHandle,
          description: tokenDescription,
          signature: signature,
        };
        console.log("TokenDetails", tokenDetails);
        tokensArray.push(tokenDetails);
        console.log("ARRAY", tokensArray);
        eventArray = [];
        // sdk.removeEventListener(0);
        // });
      });
      // console.log('Event', eventArray);
    }
    // eventArray.push({ event, slot, signature });
    // }
  );
  console.log("Subscribed to tradeEvent with ID:", tradeEventId);

  setTimeout(
    () =>
      sdk.removeEventListener(tradeEventId) &&
      console.log("EVENT ARRAY DATA", eventArray),
    2200
  );
  // console.log("EVENT ARRAY DATA", eventArray);

  // const owner = await fetchDigitalAsset(
  //   umi,
  //   new PublicKey("AkpR43pT1r4czFr8Wn8rSotWx22g8d2taCvpPz5apump")
  // );

  // console.log("METADATA", owner);

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
// main();

const createWebhook = async () => {
  try {
    const response = await fetch(process.env.HELIUS_RPC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        webhookURL: `${process.env.SWAPS_WEB_HOOK_URL}/swaps`,
        transactionTypes: ["SWAP"],
        accountAddresses: ["C9SgyktZqQCPNmANkABSaKUWcHB6qoKLnHeDrXmZoJHB"],
        webhookType: "enhanced",
        txnStatus: "all", // success/failed
      }),
    });
    const data = await response.json();
    console.log("WEB HOOK DATA", { data });
  } catch (e) {
    console.error("error", e);
  }
};
// createWebhook();

const getWebhook = async () => {
  try {
    const response = await fetch(process.env.SWAPS_WEB_HOOK_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log({ data });
  } catch (e) {
    console.error("error", e);
  }
};
// getWebhook();

app.get("/", (req, res) => {
  res.send("Hello world");

  res.status(200).send("Event received");
});

app.post("/swaps", (req, res) => {
  console.log("Req", req.body);
});
app.listen(port, () => {
  console.log("Listening to...", port);
});
