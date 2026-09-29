# Roadmap and business model

## Where it stands today

FHIN FARM is a working testnet MVP: two-stage AI verification, on-chain escrow, and a public ledger,
deployed on opBNB Testnet (chain 5611). The contract is immutable once a grade is posted, and the
whole decision trail is publicly auditable.

## Roadmap

**Phase 1 — Testnet MVP (now).** Two-stage AI verification live, escrow released on a verified match,
public ledger readable without a wallet.

**Phase 2 — Field pilots.** Partner with one or two cooperatives to grade real harvests. Measure
agreement between the AI grade and a human grader. Tune the criteria and the confidence threshold
against real photos, not synthetic ones.

**Phase 3 — Mainnet + economics.** Deploy to opBNB mainnet. Introduce a small per-verification fee
paid by the buyer at escrow funding, which covers inference cost and a dispute-bond. Keep dispute
resolution transparent.

**Phase 4 — Multi-party assurance.** Allow more than one oracle so a single compromised key cannot
forge a result. Add reputation history per grower address.

## Business model

* **Verification fee.** A small fee per escrow, paid by the buyer. This is the primary revenue line —
  it scales with trade volume, not with software seats.
* **Grower reputation.** Every completed, verified trade builds an on-chain history a grower can show
  to any future buyer. Reputation is the retention mechanism.
* **Credit access.** A verified, auditable trade history lets a grower approach lenders or insurers
  with evidence instead of claims.

## Why this can be funded

The cost per verification is an AI inference call — near-zero marginal cost and falling. The value it
replaces is a manual quality dispute, which is expensive, slow, and often ends in no trade at all.
The unit economics improve as inference gets cheaper and as each new verified trade strengthens the
reputation graph.
