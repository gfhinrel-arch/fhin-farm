# Contract and app

## Contract

| Field | Value |
| --- | --- |
| Network | opBNB Testnet |
| Chain ID | `5611` |
| Contract | `0xE07e56Af882368bc604F047Ed092A0C139c72809` |
| Owner | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` |
| Oracle | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` |
| Explorer | https://opbnb-testnet.bscscan.com/address/0xE07e56Af882368bc604F047Ed092A0C139c72809 |

**Testnet only. No mainnet deployment.**

## App

The frontend is a React app served by Vite. There is no public web host at submission time — review
the contract directly on the explorer, or run the app from source (see below).

## Run locally

```bash
# 1. Local chain (for development)
anvil

# 2. Deploy the contract
cd contract
forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast

# 3. Agent
cd ../agent
npm install
npm start            # HTTP API on :8787

# 4. Frontend
cd ../frontend
npm install
npm run dev          # http://localhost:5173
```

## Environment

Each package ships a `.env.example`. Copy it to `.env` and fill it in. Never commit `.env`.

* `contract/.env` — `PRIVATE_KEY`, `ORACLE_ADDRESS`, `BNB_TESTNET_RPC_URL`, `OPBNB_TESTNET_RPC_URL`
* `agent/.env` — `GLM_API_KEY`, `ORACLE_PRIVATE_KEY`, `CONTRACT_ADDRESS`, `BNB_TESTNET_RPC_URL`,
  `CHAIN_ID`, `MIN_CONFIDENCE`, `PINATA_JWT`
* `frontend/.env` — `VITE_CONTRACT_ADDRESS`, `VITE_BNB_TESTNET_RPC_URL`, `VITE_CHAIN_ID`,
  `VITE_AGENT_URL`, `VITE_WALLETCONNECT_PROJECT_ID`

For the opBNB Testnet deployment, set `VITE_CHAIN_ID=5611` in the frontend. If it is unset with a
non-localhost RPC, the app resolves to chain 97 and every write fails with a chain mismatch.

## Deploy to opBNB Testnet

```bash
cd contract
PRIVATE_KEY=<funded-deployer-key> \
ORACLE_ADDRESS=<oracle-address> \
forge script script/Deploy.s.sol --rpc-url opbnb_testnet --broadcast
```

Then point both `.env` files at the printed address and chain 5611.
