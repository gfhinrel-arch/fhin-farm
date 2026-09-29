import { createWalletClient, createPublicClient, http, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getConfig, assertChainConfigured } from "../config.js";
import { logEvent } from "../logs/logger.js";

// The Worker sets its env per request, so the chain object cannot be built at
// module load time. Build it lazily and cache by RPC + chain id.
let cachedChain = null;
let cachedKey = "";

function chain() {
  const c = getConfig();
  const isLocal = /^https?:\/\/(127\.0\.0\.1|localhost)/.test(c.chain.rpcUrl);
  const chainId = isLocal ? 31337 : c.chain.chainId;
  const key = `${chainId}|${c.chain.rpcUrl}`;
  if (cachedChain && cachedKey === key) return cachedChain;

  const name =
    chainId === 31337 ? "Anvil Local" : chainId === 5611 ? "opBNB Testnet" : "BNB Smart Chain Testnet";
  const explorer =
    chainId === 31337
      ? { name: "Local", url: "http://127.0.0.1:8545" }
      : chainId === 5611
        ? { name: "opBNB Testnet", url: "https://opbnb-testnet.bscscan.com" }
        : { name: "BscScan Testnet", url: "https://testnet.bscscan.com" };

  cachedChain = defineChain({
    id: chainId,
    name,
    nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
    rpcUrls: { default: { http: [c.chain.rpcUrl] } },
    blockExplorers: { default: explorer },
    testnet: true,
  });
  cachedKey = key;
  return cachedChain;
}

export const HARVEST_ESCROW_ABI = [
  {
    type: "function",
    name: "postGrade",
    stateMutability: "nonpayable",
    inputs: [
      { name: "listingId", type: "uint256" },
      { name: "grade", type: "string" },
      { name: "reasonURI", type: "string" },
      { name: "confidence", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "postDeliveryVerification",
    stateMutability: "nonpayable",
    inputs: [
      { name: "listingId", type: "uint256" },
      { name: "matched", type: "bool" },
      { name: "confidence", type: "uint256" },
      { name: "reasonURI", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getListing",
    stateMutability: "view",
    inputs: [{ name: "listingId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "listingId", type: "uint256" },
          { name: "farmer", type: "address" },
          { name: "buyer", type: "address" },
          { name: "cropType", type: "string" },
          { name: "weightKg", type: "uint256" },
          { name: "priceWei", type: "uint256" },
          { name: "photoHash", type: "bytes32" },
          { name: "photoURI", type: "string" },
          { name: "grade", type: "string" },
          { name: "gradeReasonURI", type: "string" },
          { name: "gradeConfidence", type: "uint256" },
          { name: "deliveryVerified", type: "bool" },
          { name: "deliveryMatched", type: "bool" },
          { name: "deliveryReasonURI", type: "string" },
          { name: "deliveryConfidence", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "deliveryDeadline", type: "uint256" },
        ],
      },
    ],
  },
  {
    type: "event",
    name: "GradePosted",
    inputs: [
      { name: "listingId", type: "uint256", indexed: true },
      { name: "grade", type: "string", indexed: false },
      { name: "confidence", type: "uint256", indexed: false },
      { name: "reasonURI", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "DeliveryVerified",
    inputs: [
      { name: "listingId", type: "uint256", indexed: true },
      { name: "matched", type: "bool", indexed: false },
      { name: "confidence", type: "uint256", indexed: false },
      { name: "reasonURI", type: "string", indexed: false },
    ],
  },
];

function clients() {
  assertChainConfigured();
  const c = getConfig();
  const account = privateKeyToAccount(c.chain.oraclePrivateKey);
  const publicClient = createPublicClient({ chain: chain(), transport: http(c.chain.rpcUrl) });
  const walletClient = createWalletClient({
    account,
    chain: chain(),
    transport: http(c.chain.rpcUrl),
  });
  return { account, publicClient, walletClient };
}

export function getOracleAddress() {
  return privateKeyToAccount(getConfig().chain.oraclePrivateKey).address;
}

export async function readListing(listingId) {
  const { publicClient } = clients();
  return publicClient.readContract({
    address: getConfig().chain.contractAddress,
    abi: HARVEST_ESCROW_ABI,
    functionName: "getListing",
    args: [BigInt(listingId)],
  });
}

export async function postGradeOnChain({ listingId, grade, reasonURI, confidence }) {
  const { account, publicClient, walletClient } = clients();
  return writeAndWait(walletClient, publicClient, account, {
    functionName: "postGrade",
    args: [BigInt(listingId), grade, reasonURI, BigInt(confidence)],
    listingId,
    task: "postGrade",
  });
}

export async function postDeliveryOnChain({ listingId, matched, confidence, reasonURI }) {
  const { account, publicClient, walletClient } = clients();
  return writeAndWait(walletClient, publicClient, account, {
    functionName: "postDeliveryVerification",
    args: [BigInt(listingId), matched, BigInt(confidence), reasonURI],
    listingId,
    task: "postDeliveryVerification",
  });
}

async function writeAndWait(walletClient, publicClient, account, { functionName, args, listingId, task }) {
  const hash = await walletClient.writeContract({
    address: getConfig().chain.contractAddress,
    abi: HARVEST_ESCROW_ABI,
    functionName,
    args,
    account,
    chain: chain(),
  });

  logEvent({ level: "info", task, message: "tx submitted", listingId, txHash: hash });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") {
    logEvent({ level: "error", task, message: "tx reverted", listingId, txHash: hash });
    throw new Error(`${task} tx reverted: ${hash}`);
  }

  logEvent({
    level: "info",
    task,
    message: "tx confirmed",
    listingId,
    txHash: hash,
    blockNumber: receipt.blockNumber.toString(),
  });

  return { txHash: hash, blockNumber: receipt.blockNumber };
}
