import { Network, Alchemy, AlchemySubscription, toHex } from "alchemy-sdk";
import fetch from "node-fetch";
import * as dotenv from "dotenv";
import { ethers } from "ethers";
dotenv.config();

export async function disperse(transaction_hash, alchemy2) {
  //storing contract addresses
  const hypno_disperse = "0xfcc926dfef1548a8e74c36d1b0d3c05f13b60918";
  const regular_disperse = "0xd152f549545093347a162dce210e7293f1452150";
  const ms_disperse = "0x1a90b3dead0113740266b7f7ea1136e8ed1b48c5";
  const regular_disperse_goerli = "0x9CC3Bc6cC9D22679EAd7b37716432881991C6B62";

  const tx = await alchemy2.core.getTransaction(transaction_hash);

  //for hypno disperse
  if (tx.to.toUpperCase() == hypno_disperse.toUpperCase()) {
    const hypno_iface = new ethers.utils.Interface([
      "function multisendETH(address[] _addresses, uint256 _amount) payable",
    ]);
    const parsed = hypno_iface.parseTransaction(tx);
    const output = {
      from: tx.from,
      disperse_contract: "hypno disperse",
      wallets: parsed.args._addresses.length,
      each_value: ethers.utils.formatEther(parsed.args._amount),
      total_value: ethers.utils.formatEther(tx.value),
    };
    console.log(output);
    return output;
  }

  //for regular disperse
  else if (tx.to.toUpperCase() == regular_disperse.toUpperCase()) {
    const regular_iface = new ethers.utils.Interface([
      "function disperseEther(address[] recipients, uint256[] values) external payable",
    ]);
    const parsed = regular_iface.parseTransaction(tx);
    const output = {
      from: tx.from,
      disperse_contract: "regular disperse",
      wallets: parsed.args.recipients.length,
      each_value: ethers.utils.formatEther(parsed.args[1][0]),
      total_value: ethers.utils.formatEther(tx.value),
    };
    console.log(output);
    return output;
  }
  //for regular disperse goerli
  else if (tx.to.toUpperCase() == regular_disperse_goerli.toUpperCase()) {
    const regular_iface = new ethers.utils.Interface([
      "function disperseEther(address[] recipients, uint256[] values) external payable",
    ]);
    const parsed = regular_iface.parseTransaction(tx);
    const output = {
      from: tx.from,
      disperse_contract: "regular disperse goerli",
      wallets: parsed.args.recipients.length,
      each_value: ethers.utils.formatEther(parsed.args[1][0]),
      total_value: ethers.utils.formatEther(tx.value),
    };
    console.log(output);
    return output;
  }

  //for ms disperse
  else if (tx.to.toUpperCase() == ms_disperse.toUpperCase()) {
    const ms_iface = new ethers.utils.Interface([
      "function shareEther(address[] recipients, uint256[] values) payable",
    ]);
    const parsed = ms_iface.parseTransaction(tx);
    const output = {
      from: tx.from,
      disperse_contract: "ms disperse",
      wallets: parsed.args.recipients.length,
      each_value: ethers.utils.formatEther(parsed.args[1][0]),
      total_value: ethers.utils.formatEther(tx.value),
    };
    console.log(output);
    return output;
  }
}