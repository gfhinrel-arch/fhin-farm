/**
 * Worker configuration. Unlike the Node agent, there is no `.env` on disk: every
 * value arrives through the Worker `env` binding (vars + secrets). `setEnv(env)`
 * is called once per request from the fetch handler.
 */

let ENV = {};

export function setEnv(env) {
  ENV = env ?? {};
}

function required(name) {
  const value = ENV[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function optional(name, fallback) {
  const value = ENV[name];
  return value === undefined || value === "" ? fallback : value;
}

const MIN_CONFIDENCE_DEFAULT = 70;

/**
 * Parses MIN_CONFIDENCE. The blueprint requires a threshold of 70; only a
 * deliberate override may lower it, and that always warns because it weakens the
 * on-chain guard against low-confidence AI results.
 */
export function resolveMinConfidence(raw = ENV.MIN_CONFIDENCE) {
  if (raw === undefined || raw === "") return MIN_CONFIDENCE_DEFAULT;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    console.warn(`WARNING: MIN_CONFIDENCE="${raw}" is invalid (expected 0-100). Falling back to ${MIN_CONFIDENCE_DEFAULT}.`);
    return MIN_CONFIDENCE_DEFAULT;
  }
  if (value < MIN_CONFIDENCE_DEFAULT) {
    console.warn(
      `WARNING: MIN_CONFIDENCE is below ${MIN_CONFIDENCE_DEFAULT}. ` +
        "This value is intended for demo/testing only and does not match the FHIN FARM blueprint requirement.",
    );
  }
  return value;
}

/** Built per request so it reflects the current env binding. */
export function getConfig() {
  return {
    ai: {
      baseUrl: optional("GLM_BASE_URL", "https://api.thirtystore.com/v1"),
      apiKey: optional("GLM_API_KEY", ""),
      models: optional(
        "GLM_MODELS",
        [
          "thirty/glm-5.1",
          "thirty/qwen3.8-max",
          "thirty/deepseek-v4-flash",
          "thirty/deepseek-v4-pro",
          "thirty/deepseek-v4.1-flash",
          "thirty/gpt-5.5",
          "thirty/kimi-k3",
        ].join(","),
      )
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean),
      temperature: Number(optional("GLM_TEMPERATURE", "0.1")),
      maxRetries: Number(optional("GLM_MAX_RETRIES", "3")),
      backoffMs: Number(optional("GLM_BACKOFF_MS", "1500")),
      timeoutMs: Number(optional("GLM_TIMEOUT_MS", "60000")),
    },

    minConfidence: resolveMinConfidence(),

    chain: {
      rpcUrl: required("BNB_TESTNET_RPC_URL"),
      chainId: Number(optional("CHAIN_ID", "97")),
      contractAddress: optional("CONTRACT_ADDRESS", ""),
      oraclePrivateKey: required("ORACLE_PRIVATE_KEY"),
    },

    ipfs: {
      pinataJwt: optional("PINATA_JWT", ""),
      gateway: optional("IPFS_GATEWAY", "https://gateway.pinata.cloud/ipfs/"),
    },
  };
}

/**
 * Convenience accessor for modules that historically imported `config` directly.
 * It is a getter so each access resolves against the current env.
 */
export const config = new Proxy(
  {},
  {
    get(_target, prop) {
      return getConfig()[prop];
    },
  },
);

export function assertAiConfigured() {
  if (!ENV.GLM_API_KEY) throw new Error("GLM_API_KEY is not set");
}

export function assertChainConfigured() {
  if (!ENV.CONTRACT_ADDRESS) throw new Error("CONTRACT_ADDRESS is not set");
  if (!ENV.ORACLE_PRIVATE_KEY) throw new Error("ORACLE_PRIVATE_KEY is not set");
}
