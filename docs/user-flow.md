# User flow

FHIN FARM has three roles — **Farmer**, **Buyer**, and a **public ledger** anyone can read without a
wallet.

## Farmer

1. Connect a browser wallet on opBNB Testnet (chain 5611).
2. Open **Farmer**.
3. Attach a harvest photo, enter crop type, weight, and price.
4. Publish — `createListing` writes crop, weight, price, photo hash, and photo URI on-chain.
5. The agent grades the photo; the oracle posts `postGrade`.
6. Once the buyer has funded the escrow, mark the shipment: `markShipped` starts a 7-day deadline.
7. If the buyer goes silent, call `claimAfterTimeout` after the deadline to still get paid.

## Buyer

1. Connect a browser wallet on opBNB Testnet.
2. Open **Buyer** — graded listings appear with their photo, grade, and confidence.
3. Fund the escrow for the exact price: `fundEscrow`.
4. When the goods arrive, upload a photo of what was received.
5. The agent compares it against the original graded photo and the oracle posts
   `postDeliveryVerification`. A match releases the funds to the farmer.
6. Optionally confirm receipt directly (`confirmReceipt`) to release early.

## Public ledger

Anyone — no wallet, no login — can open **Public ledger** and read every listing, every grade, every
confidence value, every delivery check, and the full event timeline straight from the chain.

## What the escrow protects

| Risk | Protection |
| --- | --- |
| Farmer does not get paid | Funds are held in escrow, released on a verified match |
| Buyer gets the wrong goods | Stage 2 compares received vs originally graded photo |
| Buyer stalls forever | 7-day deadline, then `claimAfterTimeout` pays the farmer |
| Wrong payment amount | `fundEscrow` requires the exact price |
| Double payment | `Completed` and `Disputed` block every further release path |
