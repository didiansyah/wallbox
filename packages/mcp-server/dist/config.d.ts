import { WallboxClient } from "@wallbox/sdk";
export type WallboxMcpConfig = {
    baseUrl: string;
    apiKey?: string;
};
export declare function loadConfig(env?: NodeJS.ProcessEnv): WallboxMcpConfig;
export declare function createClient(config?: WallboxMcpConfig): WallboxClient;
export declare function asJsonText(data: unknown): {
    content: {
        type: "text";
        text: string;
    }[];
};
export declare function redactConfig(config: WallboxMcpConfig): {
    baseUrl: string;
    apiKeyConfigured: boolean;
};
