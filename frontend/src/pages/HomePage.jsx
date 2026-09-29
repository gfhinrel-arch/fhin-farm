import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Plant, Storefront, MagnifyingGlass, ArrowRight, SealCheck } from "@phosphor-icons/react";
import { CONTRACT_ADDRESS, activeChain } from "../config/chain.js";
import { explorerAddress } from "../lib/format.js";

const CARDS = [
  {
    to: "/",
    icon: Plant,
    eyebrow: "farmer",
    title: "Publish a harvest",
    body: "Photograph the crop. An AI agent grades it against fixed visual criteria and writes the grade, plus its confidence, on-chain — before any money moves.",
    cta: "Open farmer view",
  },
  {
    to: "/buyer",
    icon: Storefront,
    eyebrow: "buyer",
    title: "Fund an escrow",
    body: "Read the grade that was locked in before you paid. Fund the escrow, then upload a photo of what actually arrived.",
    cta: "Open buyer view",
  },
  {
    to: "/ledger",
    icon: MagnifyingGlass,
    eyebrow: "anyone",
    title: "Check the record",
    body: "Every listing, grade, confidence value, and delivery check — read straight from the chain. No wallet, no login.",
    cta: "Open public ledger",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Grade, then lock",
    body: "Stage 1 inspects the harvest photo and posts the result on-chain. Once written, it cannot be quietly rewritten — not by the farmer, not by the buyer, not by us.",
  },
  {
    n: "02",
    title: "Money moves only after",
    body: "The buyer funds an escrow contract, not the farmer. The payment sits in the contract while the goods are in transit.",
  },
  {
    n: "03",
    title: "Compare, then settle",
    body: "Stage 2 compares what arrived against the photo that was graded at the start. Match releases the payment. Mismatch locks the funds and opens a dispute.",
  },
];

export function HomePage() {
  return (
    <div className="flex flex-col gap-14 md:gap-20">
      <section className="pt-4 md:pt-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400"
        >
          <SealCheck size={14} weight="fill" className="text-leaf-500" />
          AI-graded agricultural escrow
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 20 }}
          className="max-w-[22ch] text-4xl font-semibold leading-[0.98] tracking-tighter text-ink-950 md:text-6xl"
        >
          The harvest is graded before the money moves.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 20, delay: 0.06 }}
          className="mt-5 max-w-[62ch] text-base leading-relaxed text-ink-500"
        >
          A grower knows their harvest is good. The buyer has no way to confirm it. FHIN FARM turns
          the harvest photo into a grade with an explicit confidence value, records that grade
          on-chain, and holds the payment in escrow until a second check confirms the goods that
          arrived match the goods that were graded.
        </motion.p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {CARDS.map(({ to, icon: Icon, eyebrow, title, body, cta }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 90, damping: 20, delay: 0.1 + i * 0.05 }}
          >
            <Link
              to={to}
              className="group flex h-full flex-col rounded-2xl border border-ink-200/70 bg-white p-6 transition-colors hover:border-leaf-500/60"
            >
              <Icon size={20} weight="duotone" className="text-leaf-600" />
              <p className="mt-4 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-400">
                {eyebrow}
              </p>
              <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-ink-950">{title}</h2>
              <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink-500">{body}</p>
              <span className="mt-5 flex items-center gap-1.5 text-[13px] font-medium text-leaf-600">
                {cta}
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          </motion.div>
        ))}
      </section>

      <section>
        <h2 className="max-w-[24ch] text-2xl font-semibold tracking-tight text-ink-950 md:text-3xl">
          Two verifications, never collapsed into one.
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
          {STEPS.map(({ n, title, body }) => (
            <div key={n} className="border-t border-ink-200/70 pt-5">
              <p className="font-mono text-[11px] tracking-[0.16em] text-leaf-600">{n}</p>
              <h3 className="mt-2 text-base font-semibold tracking-tight text-ink-950">{title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-ink-200/70 bg-white px-6 py-6 md:px-8 md:py-7">
        <h2 className="text-lg font-semibold tracking-tight text-ink-950">
          What the contract actually trusts
        </h2>
        <p className="mt-2 max-w-[70ch] text-[13.5px] leading-relaxed text-ink-500">
          Not the AI. The contract trusts one oracle address, and only that address can post a
          grading result. Swap the model, change the prompt, replace the whole agent — the on-chain
          logic does not move. The record of what was decided stays where it was written.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink-200/70 pt-5">
          <a
            href={explorerAddress(CONTRACT_ADDRESS || "0x0")}
            target="_blank"
            rel="noreferrer"
            className="break-all font-mono text-[12px] text-ink-700 underline decoration-ink-300 underline-offset-2 hover:text-leaf-600"
          >
            {CONTRACT_ADDRESS || "contract not configured"}
          </a>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
            {activeChain.name} · {activeChain.id}
          </span>
        </div>
      </section>

      <section className="flex flex-col items-start gap-4 rounded-2xl bg-ink-950 px-6 py-7 text-white md:flex-row md:items-center md:justify-between md:px-8">
        <p className="max-w-[48ch] text-[14px] leading-relaxed text-white/70">
          Running this locally? The agent and contract need to be up. The hosted app above needs
          neither.
        </p>
        <Link
          to="/ledger"
          className="flex shrink-0 items-center gap-2 rounded-xl bg-leaf-500 px-5 py-2.5 text-[13.5px] font-medium text-ink-950"
        >
          See the live ledger
          <ArrowRight size={14} />
        </Link>
      </section>
    </div>
  );
}
