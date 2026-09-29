import { setEnv, getConfig } from "./config.js";
import { setPhotos, getPhoto } from "./ipfs/pinata.js";
import { runGrading, runDeliveryVerification } from "./flows.js";
import { logEvent } from "./logs/logger.js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(payload, status = 200) {
  return new Response(
    JSON.stringify(payload, (_k, v) => (typeof v === "bigint" ? v.toString() : v)),
    { status, headers: { "Content-Type": "application/json", ...CORS } },
  );
}

function dataUrlToBytes(dataUrl) {
  const match = /^data:([^;]+);base64,(.*)$/s.exec(dataUrl || "");
  if (!match) throw new Error("Expected a base64 data URL");
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return { bytes, mime: match[1] };
}

export default {
  async fetch(request, env) {
    setEnv(env);
    setPhotos(env.PHOTOS);

    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    try {
      if (request.method === "GET" && pathname === "/api/health") {
        const c = getConfig();
        return json({
          ok: true,
          model: c.ai.models[0],
          models: c.ai.models.length,
          minConfidence: c.minConfidence,
          contract: c.chain.contractAddress || null,
          ipfs: c.ipfs.pinataJwt ? "pinata" : "r2",
        });
      }

      if (request.method === "GET" && pathname.startsWith("/api/photo/")) {
        const key = decodeURIComponent(pathname.slice("/api/photo/".length));
        const obj = await getPhoto(key);
        if (!obj) return json({ error: "photo not found" }, 404);
        return new Response(obj.body, {
          status: 200,
          headers: {
            "Content-Type": obj.httpMetadata?.contentType ?? "application/octet-stream",
            ...CORS,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }

      if (request.method === "POST") {
        const body = await request.json().catch(() => {
          throw new Error("Invalid JSON body");
        });

        if (pathname === "/api/upload") {
          const { bytes, mime } = dataUrlToBytes(body.photoDataUrl);
          const { uploadImage } = await import("./ipfs/pinata.js");
          const up = await uploadImage({ bytes, filename: body.filename, contentType: mime });
          return json({ photoURI: up.photoURI, hashHex: up.hashHex, provider: up.provider });
        }

        if (pathname === "/api/grade") {
          const result = await runGrading({
            listingId: Number(body.listingId),
            cropType: body.cropType,
            weightKg: body.weightKg,
            photoDataUrl: body.photoDataUrl,
            photoFilename: body.photoFilename,
            postOnChain: body.postOnChain !== false,
          });
          return json(result);
        }

        if (pathname === "/api/verify-delivery") {
          const result = await runDeliveryVerification({
            listingId: Number(body.listingId),
            deliveryPhotoDataUrl: body.deliveryPhotoDataUrl,
            deliveryFilename: body.deliveryFilename,
            postOnChain: body.postOnChain !== false,
          });
          return json(result);
        }
      }

      return json({ error: `No route for ${request.method} ${pathname}` }, 404);
    } catch (err) {
      logEvent({ level: "error", task: "http", message: `${request.method} ${pathname}`, error: err.message });
      return json({ error: err.message }, 500);
    }
  },
};
