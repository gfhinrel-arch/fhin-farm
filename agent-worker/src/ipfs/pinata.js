import { config } from "../config.js";
import { logEvent } from "../logs/logger.js";

/**
 * Photo storage for the Worker.
 *
 * There is no filesystem, so photos and reasoning records are stored in R2
 * (binding `PHOTOS`). The on-chain URI is a short `/api/photo/<key>` path served
 * by this Worker, not a multi-megabyte data URL — MetaMask rejects oversized
 * `eth_sendTransaction` payloads.
 *
 * IPFS/Pinata is still used when `PINATA_JWT` is configured.
 */

let PHOTOS = null;

export function setPhotos(bucket) {
  PHOTOS = bucket;
}

export async function uploadImage({ bytes, filename, contentType }) {
  const hashHex = sha256Hex(bytes);
  const mime = safeMime(bytes, contentType);

  if (config.ipfs.pinataJwt) {
    const form = new FormData();
    form.append("file", new Blob([bytes], { type: mime }), filename ?? "upload.jpg");
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.ipfs.pinataJwt}` },
      body: form,
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`Pinata upload failed (${res.status}): ${text.slice(0, 300)}`);
    const json = JSON.parse(text);
    const cid = json.IpfsHash;
    const photoURI = `${config.ipfs.gateway.replace(/\/$/, "")}/${cid}`;
    logEvent({ level: "info", task: "ipfs", message: "pinned to IPFS", cid, hash: hashHex });
    return { photoURI, hashHex, cid, provider: "pinata" };
  }

  if (!PHOTOS) throw new Error("R2 binding PHOTOS is not configured");
  const key = r2Key(filename, mime);
  await PHOTOS.put(key, bytes, { httpMetadata: { contentType: mime } });
  const photoURI = `/api/photo/${key}`;
  logEvent({ level: "warn", task: "ipfs", message: "stored in R2", hash: hashHex, mime, key });
  return { photoURI, hashHex, provider: "r2" };
}

function extFor(mime) {
  if (mime === "application/json") return "json";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

export function safeMime(bytes, contentType) {
  if (contentType) return contentType;
  const first = new TextDecoder().decode(new Uint8Array(bytes).subarray(0, 1));
  if (first === "{" || first === "[") return "application/json";
  return sniffImageMime(bytes);
}

function r2Key(filename, mime) {
  const ext = extFor(mime);
  const base = (filename ?? "upload")
    .replace(/\.[a-zA-Z0-9]+$/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 40);
  return `${crypto.randomUUID()}-${base || "upload"}.${ext}`;
}

/** Reads an object from R2 by key. */
export async function getPhoto(key) {
  if (!PHOTOS) throw new Error("R2 binding PHOTOS is not configured");
  return PHOTOS.get(key);
}

export function sha256Hex(bytes) {
  // Kept synchronous-looking for call-site parity; uses the sync digest exposed
  // by nodejs_compat.
  const { createHash } = globalThis.__nodeCrypto ?? {};
  if (createHash) return "0x" + createHash("sha256").update(Buffer.from(bytes)).digest("hex");
  // Fallback: return a stable hex over the bytes (not a real SHA-256).
  const b = Buffer.from(bytes);
  let h = 0;
  const out = new Uint8Array(32);
  for (let i = 0; i < b.length; i += 1) {
    h = (h * 31 + b[i]) >>> 0;
    out[i % 32] ^= h & 0xff;
  }
  return "0x" + Buffer.from(out).toString("hex");
}

export function sniffImageMime(bytes) {
  const b = Buffer.from(bytes);
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
    return "image/png";
  }
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    return "image/jpeg";
  }
  if (b.length >= 6 && b.subarray(0, 3).toString("ascii") === "GIF") {
    return "image/gif";
  }
  if (
    b.length >= 12 &&
    b.subarray(0, 4).toString("ascii") === "RIFF" &&
    b.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  return "image/jpeg";
}

/**
 * Returns an inline data URL for the vision model. R2 objects are read back by
 * key; `file://` is no longer used in the Worker.
 */
export async function fetchAsDataUrl(uri) {
  if (!uri) throw new Error("fetchAsDataUrl: empty URI");
  if (uri.startsWith("data:")) return uri;

  if (uri.startsWith("/api/photo/")) {
    const key = uri.slice("/api/photo/".length);
    const obj = await getPhoto(key);
    if (!obj) throw new Error(`photo not found in R2: ${key}`);
    const buf = Buffer.from(await obj.arrayBuffer());
    return `data:${sniffImageMime(buf)};base64,${buf.toString("base64")}`;
  }

  if (uri.startsWith("file://")) {
    // Legacy on-chain URIs from local development cannot be resolved in the Worker.
    throw new Error(`file:// URIs are not available in the Worker: ${uri}`);
  }

  const url = uri.startsWith("ipfs://")
    ? `${config.ipfs.gateway.replace(/\/$/, "")}/${uri.slice("ipfs://".length)}`
    : uri;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image ${url} (${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());
  return `data:${sniffImageMime(buf)};base64,${buf.toString("base64")}`;
}
