/**
 * Worker logger. There is no filesystem, so the append-only JSONL audit log of
 * the Node agent is replaced by structured console output (visible in
 * `wrangler tail` and Cloudflare Workers Logs).
 */

export function logEvent(event) {
  const record = { ts: new Date().toISOString(), ...event };
  const marker = record.level === "error" ? "ERR" : record.level === "warn" ? "WRN" : "INF";
  const line = `[${marker}] ${record.task ?? "-"} ${record.message ?? ""}`;
  if (record.level === "error") console.error(line, record);
  else if (record.level === "warn") console.warn(line, record);
  else console.log(line, record);
}

export function logManualReview(record) {
  const enriched = { ts: new Date().toISOString(), level: "warn", status: "MANUAL_REVIEW", ...record };
  console.warn(`[WRN] ${record.task ?? "-"} MANUAL_REVIEW`, enriched);
  logEvent({ level: "warn", task: record.task, message: "MANUAL_REVIEW", ...record });
}
