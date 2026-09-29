import { DownloadSimple } from "@phosphor-icons/react";

const SAMPLES = [
  {
    href: "/samples/beras-bagus.jpg",
    filename: "beras-bagus.jpg",
    label: "Good rice",
  },
  {
    href: "/samples/beras-rusak.jpg",
    filename: "beras-rusak.jpg",
    label: "Damaged rice",
  },
];

/**
 * Lets a visitor grab the two bundled sample photos so they can try the
 * grading flow without hunting for a harvest image of their own.
 */
export function SamplePhotos({ disabled }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-ink-400">
        No photo handy? Download a sample
      </p>
      <div className="flex flex-wrap gap-2">
        {SAMPLES.map((s) => (
          <a
            key={s.filename}
            href={s.href}
            download={s.filename}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            className={[
              "inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-[12px] font-medium text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-100",
              disabled ? "pointer-events-none opacity-50" : "",
            ].join(" ")}
          >
            <DownloadSimple size={14} weight="bold" className="text-ink-500" />
            {s.label}
          </a>
        ))}
      </div>
    </div>
  );
}
