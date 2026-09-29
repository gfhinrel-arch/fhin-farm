# Security

## What is protected, and how

| Threat | Defence |
| --- | --- |
| Someone fakes an AI result | `onlyOracle` — only the oracle address can post |
| AI guesses when unsure | Confidence threshold → `MANUAL_REVIEW`, nothing posted on-chain |
| Prompt injection via metadata | Fixed system prompt, user data in an explicit untrusted block, input sanitisation |
| Forged harvest photo | `photoHash` (SHA-256) locked at listing creation |
| Substituted original photo | The original photo is read from the contract state, not from the caller |
| Re-entrancy on payout | OpenZeppelin `ReentrancyGuard` on every value transfer |
| Buyer holds funds forever | 7-day deadline + `claimAfterTimeout` |
| Wrong payment amount | `fundEscrow` requires the exact price |
| Double payment | `Completed` and `Disputed` block every further release path |
| Wrong network | Chain is pinned by config; a frontend preflight blocks a mismatched wallet |

## Oracle key boundary

```
Frontend      ──user / farmer / buyer transaction──>  HarvestEscrow
Agent server  ──ORACLE_PRIVATE_KEY──> postGrade / postDeliveryVerification ──> HarvestEscrow
```

The frontend never holds or signs with the oracle private key. Only the agent's server-side
environment has it. Verified: the frontend source and the built bundle contain no oracle key.

## Trust assumptions

* The oracle is a trust assumption. A compromised oracle key could post false results. The contract
  limits this to "results from the trusted address", nothing more.
* Dispute resolution is owner-controlled in this MVP. There is no decentralised arbitration.
* AI grading is a standardised visual assessment, not a laboratory test, and can misclassify.

## Environment hygiene

No `.env` is tracked in Git; only `.env.example` files. If deployer key, oracle key, `PINATA_JWT`, or
`GLM_API_KEY` were exposed during development, rotate them before submission.
