import { Network, Alchemy, AlchemySubscription, toHex } from "alchemy-sdk";
import { EmbedBuilder, WebhookClient } from "discord.js";
import PocketBase from "pocketbase";
import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { disperse } from "./operations.js";
import eventsource from "eventsource";
import "cross-fetch/dist/node-polyfill.js";

global.EventSource = eventsource;
dotenv.config();

//pocketbase config
const pb = new PocketBase("http://34.28.48.120:80");
const authData = await pb.admins.authWithPassword(
  "test@test.com",
  "password1234"
);
let records = await pb.collection("wallets").getFullList(200 /* batch size */, {
  sort: "-created",
});

//discord webhook stuff
const disperseClient = new WebhookClient({
  id: "1065262249654108220",
  token: "uIlWmamjpYmU76HKb_1oWD12wpXdDXOtLK7TWZ8hrv51dmwaKPV0cjYbchdX8QAtv8-5",
});
const mintsClient = new WebhookClient({
  id: "1065262424044875896",
  token: "A3OaomiPDQerKvOdwoBIbuoDqWQLWr4J7uE664Zp-vEa_Ox8lTESBWJkQQxXT9hxoeWB",
});
//---------------------------------------------------------------------

//alchemy settings
const wallet_tracker1 = {
  apiKey: `${process.env.ALCHEMY_API_KEY_1}`,
  network: Network.ETH_GOERLI,
};
const wallet_tracker2 = {
  apiKey: `${process.env.ALCHEMY_API_KEY_2}`,
  network: Network.ETH_GOERLI,
};
const wallet_tracker3 = {
  apiKey: `${process.env.ALCHEMY_API_KEY_3}`,
  network: Network.ETH_GOERLI,
};
const wallet_tracker4 = {
  apiKey: `${process.env.ALCHEMY_API_KEY_4}`,
  network: Network.ETH_MAINNET,
};
const wallet_tracker5 = {
  apiKey: `${process.env.ALCHEMY_API_KEY_5}`,
  network: Network.ETH_MAINNET,
};

const alchemy1 = new Alchemy(wallet_tracker1);
const alchemy2 = new Alchemy(wallet_tracker2);
const alchemy3 = new Alchemy(wallet_tracker3);
const alchemy4 = new Alchemy(wallet_tracker4);
const alchemy5 = new Alchemy(wallet_tracker5);
//------------------------------------------------------------------------

//storing disperse contract addresses
const hypno_disperse = "0xfcc926dfef1548a8e74c36d1b0d3c05f13b60918";
const regular_disperse = "0xd152f549545093347a162dce210e7293f1452150";
const regular_disperse_goerli = "0x9CC3Bc6cC9D22679EAd7b37716432881991C6B62";
const ms_disperse = "0x1a90b3dead0113740266b7f7ea1136e8ed1b48c5";

console.log("actions working??");
//tracking disperse
records.map(async (record) => {
  alchemy2.ws.on(
    {
      method: AlchemySubscription.PENDING_TRANSACTIONS,
      fromAddress: record.address,
      includeRemoved: true,
      hashesOnly: false,
    },

    async (tx) => {
      console.log(tx.to);
      if (
        tx.to.toUpperCase() == hypno_disperse.toUpperCase() ||
        tx.to.toUpperCase() == regular_disperse.toUpperCase() ||
        tx.to.toUpperCase() == ms_disperse.toUpperCase() ||
        tx.to.toUpperCase() == regular_disperse_goerli.toUpperCase()
      ) {
        const disperseEmbed = new EmbedBuilder();
        const disperseInfo = await disperse(tx.hash, alchemy1);
        disperseEmbed
          .setTitle(record.name)
          .setDescription(
            `dispersed ${disperseInfo.each_value} ETH to ${disperseInfo.wallets} wallets`
          )
          .setColor("Yellow")
          .addFields({
            name: "Links",
            value: `[Transaction](https://etherscan.io/tx/${tx.hash}) | [Wallet](https://etherscan.io/address/${record.address})`,
            inline: true,
          })
          .addFields({
            name: "Contract",
            value: `[${disperseInfo.disperse_contract}](https://etherscan.io/address/${tx.to})`,
            inline: true,
          })
          .addFields({
            name: "Value",
            value: "`" + `${disperseInfo.total_value} ETH` + "`",
            inline: true,
          });
        await disperseClient.send({
          content: " ",
          username: "Disperse Tracker",
          avatarURL: "https://i.imgur.com/AfFp7pu.png",
          embeds: [disperseEmbed],
        });
        console.log("PENDING");
        console.log(record.name);
        console.log(tx);
      }
    }
  );
  alchemy3.ws.on(
    {
      method: AlchemySubscription.MINED_TRANSACTIONS,
      addresses: [
        {
          from: record.address,
        },
      ],
      includeRemoved: true,
      hashesOnly: false,
    },
    async (tx) => {
      if (
        tx.transaction.to.toUpperCase() == hypno_disperse.toUpperCase() ||
        tx.transaction.to.toUpperCase() == regular_disperse.toUpperCase() ||
        tx.transaction.to.toUpperCase() == ms_disperse.toUpperCase() ||
        tx.transaction.to.toUpperCase() == regular_disperse_goerli.toUpperCase()
      ) {
        const disperseEmbed = new EmbedBuilder();
        const disperseInfo = await disperse(tx.transaction.hash, alchemy1);
        disperseEmbed
          .setTitle(record.name)
          .setDescription(
            `dispersed ${disperseInfo.each_value} ETH to ${disperseInfo.wallets} wallets`
          )
          .setColor("Green")
          .addFields({
            name: "Links",
            value: `[Transaction](https://etherscan.io/tx/${tx.transaction.hash})|[Wallet](https://etherscan.io/address/${record.address})`,
            inline: true,
          })
          .addFields({
            name: "Contract",
            value: `[${disperseInfo.disperse_contract}](https://etherscan.io/address/${tx.transaction.to})`,
            inline: true,
          })
          .addFields({
            name: "Total Value",
            value: "`" + `${disperseInfo.total_value} ETH` + "`",
            inline: true,
          });
        await disperseClient.send({
          content: " ",
          username: "Disperse Tracker",
          avatarURL: "https://i.imgur.com/AfFp7pu.png",
          embeds: [disperseEmbed],
        });
        console.log("MINED");
        console.log(record.name);
        console.log(tx);
      }
    }
  );
});

//realtime connection
pb.collection("wallets").subscribe("*", async function () {
  records = await pb.collection("wallets").getFullList(200 /* batch size */, {
    sort: "-created",
  });
  alchemy2.ws.removeAllListeners();
  alchemy3.ws.removeAllListeners();
  //tracking disperse
  records.map(async (record) => {
    alchemy2.ws.on(
      {
        method: AlchemySubscription.PENDING_TRANSACTIONS,
        fromAddress: record.address,
        includeRemoved: true,
        hashesOnly: false,
      },

      async (tx) => {
        console.log(tx);
        if (
          tx.to.toUpperCase() == hypno_disperse.toUpperCase() ||
          tx.to.toUpperCase() == regular_disperse.toUpperCase() ||
          tx.to.toUpperCase() == ms_disperse.toUpperCase() ||
          tx.to.toUpperCase() == regular_disperse_goerli.toUpperCase()
        ) {
          const disperseEmbed = new EmbedBuilder();
          const disperseInfo = await disperse(tx.hash, alchemy2);
          disperseEmbed
            .setTitle(record.name)
            .setDescription(
              `dispersed ${disperseInfo.each_value} ETH to ${disperseInfo.wallets} wallets`
            )
            .setColor("Yellow")
            .addFields({
              name: "Links",
              value: `[Transaction](https://etherscan.io/tx/${tx.hash}) | [Wallet](https://etherscan.io/address/${record.address})`,
              inline: true,
            })
            .addFields({
              name: "Contract",
              value: `[${disperseInfo.disperse_contract}](https://etherscan.io/address/${tx.to})`,
              inline: true,
            })
            .addFields({
              name: "Value",
              value: "`" + `${disperseInfo.total_value} ETH` + "`",
              inline: true,
            });
          await disperseClient.send({
            content: " ",
            username: "Disperse Tracker",
            avatarURL: "https://i.imgur.com/AfFp7pu.png",
            embeds: [disperseEmbed],
          });
          console.log("PENDING");
          console.log(record.name);
          console.log(tx);
        }
      }
    );
    alchemy3.ws.on(
      {
        method: AlchemySubscription.MINED_TRANSACTIONS,
        addresses: [
          {
            from: record.address,
          },
        ],
        includeRemoved: true,
        hashesOnly: false,
      },
      async (tx) => {
        if (
          tx.transaction.to.toUpperCase() == hypno_disperse.toUpperCase() ||
          tx.transaction.to.toUpperCase() == regular_disperse.toUpperCase() ||
          tx.transaction.to.toUpperCase() == ms_disperse.toUpperCase() ||
          tx.transaction.to.toUpperCase() ==
            regular_disperse_goerli.toUpperCase()
        ) {
          const disperseEmbed = new EmbedBuilder();
          const disperseInfo = await disperse(tx.transaction.hash, alchemy2);
          disperseEmbed
            .setTitle(record.name)
            .setDescription(
              `dispersed ${disperseInfo.each_value} ETH to ${disperseInfo.wallets} wallets`
            )
            .setColor("Green")
            .addFields({
              name: "Links",
              value: `[Transaction](https://etherscan.io/tx/${tx.transaction.hash})|[Wallet](https://etherscan.io/address/${record.address})`,
              inline: true,
            })
            .addFields({
              name: "Contract",
              value: `[${disperseInfo.disperse_contract}](https://etherscan.io/address/${tx.transaction.to})`,
              inline: true,
            })
            .addFields({
              name: "Total Value",
              value: "`" + `${disperseInfo.total_value} ETH` + "`",
              inline: true,
            });
          await disperseClient.send({
            content: " ",
            username: "Disperse Tracker",
            avatarURL: "https://i.imgur.com/AfFp7pu.png",
            embeds: [disperseEmbed],
          });
          console.log("MINED");
          console.log(record.name);
          console.log(tx);
        }
      }
    );
  });
});
