# FHIN FARM

**An agent grades your harvest and locks the record on-chain before the money moves — so farmer and
buyer argue from the same evidence instead of from leverage.**

Indonesia Web3 Hackathon 2026 · Track 1 — AI Agents · opBNB Testnet (5611).

| Field | Value |
| --- | --- |
| Contract | [`0xE07e56Af882368bc604F047Ed092A0C139c72809`](https://opbnb-testnet.bscscan.com/address/0xE07e56Af882368bc604F047Ed092A0C139c72809) |
| Network | opBNB Testnet, chain ID `5611` |
| Source | https://github.com/gfhinrel-arch/fhin-farm |

## The problem

A grower knows their harvest is good. The buyer has no way to confirm that independently.
Quality assessment is informal, inconsistent, or mediated by whoever holds the leverage. By the
time goods arrive and a dispute starts, there is no shared reference to argue from.

## The solution

FHIN FARM photographs the harvest, has an AI agent grade it against fixed visual criteria, and
writes that grade — plus its confidence — to BNB Chain before any money moves. When the buyer
receives the goods, a second AI pass compares what arrived against the originally graded photo.
Escrow follows that comparison: match releases payment, mismatch locks it and opens a dispute.

## Why blockchain

Not to make the AI correct. To make the *record* of what the AI decided permanent and readable by
anyone. Once a grade is posted it cannot be quietly rewritten — not by the farmer, not by the
buyer, not by the oracle wallet, not by the contract owner. The timestamp, the value, and the
oracle address that submitted it stay visible forever.

## Why AI

A photograph is the only evidence most smallholders can produce cheaply. An automated inspector
turns that photograph into a comparable signal with an explicit confidence value, in seconds, at
near-zero marginal cost. It is a standardized assessment, not an authority.

> **The distinction that matters:** AI provides a standardized automated assessment. The on-chain
> record makes that result independently auditable. It does **not** guarantee the AI is right.

## Next

* [How it works](how-it-works.md)
* [User flow](user-flow.md)
* [Contract and app](deployment.md)
