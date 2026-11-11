import { BaseClient, type GatewayAPIClientOptions } from "./client.js";
import type {
  MobileMessageRequest,
  MobileMessageResponse,
  MultiMobileMessageRequest,
  MultiMobileMessageResponse,
} from "./messaging-types.js";

/**
 * Client for the GatewayAPI Messaging API.
 *
 * Defaults to `https://messaging.gatewayapi.com`; pass
 * `baseUrl: "https://messaging.gatewayapi.eu"` for EU accounts.
 */
export class GatewayAPIClient extends BaseClient {
  constructor(options: GatewayAPIClientOptions) {
    super("GatewayAPIClient", "https://messaging.gatewayapi.com", options);
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, { method: "POST", body });
  }

  async submitSingle(
    request: MobileMessageRequest,
  ): Promise<MobileMessageResponse> {
    return this.post<MobileMessageResponse>("/mobile/single", request);
  }

  async submitMultiple(
    request: MultiMobileMessageRequest,
  ): Promise<MultiMobileMessageResponse> {
    return this.post<MultiMobileMessageResponse>("/mobile/multi", request);
  }
}
