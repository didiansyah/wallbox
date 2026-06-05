import { WallboxClient } from "@wallbox/sdk";

export type WallboxMcpConfig = {
  baseUrl: string;
  apiKey?: string;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): WallboxMcpConfig {
  return {
    baseUrl: env.WALLBOX_BASE_URL || env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3075",
    apiKey: env.WALLBOX_API_KEY,
  };
}

export function createClient(config = loadConfig()) {
  return new WallboxClient({ baseUrl: config.baseUrl, apiKey: config.apiKey });
}

export function asJsonText(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

export function redactConfig(config: WallboxMcpConfig) {
  return {
    baseUrl: config.baseUrl,
    apiKeyConfigured: Boolean(config.apiKey),
  };
}
