import { BaseClient, type GatewayAPIClientOptions } from "./client.js";
import type {
  AccountResponse,
  CreateWebhookRequest,
  CreateWebhookResponse,
  CreditResponse,
  PricingResponse,
  WebhooksResponse,
} from "./management-types.js";

/**
 * Client for the GatewayAPI Account Management API.
 *
 * Defaults to `https://manage.gatewayapi.com`; pass
 * `baseUrl: "https://manage.gatewayapi.eu"` for EU accounts.
 */
export class GatewayAPIManagementClient extends BaseClient {
  constructor(options: GatewayAPIClientOptions) {
    super(
      "GatewayAPIManagementClient",
      "https://manage.gatewayapi.com",
      options,
    );
  }

  /** Return the authenticated account. */
  async getAccount(): Promise<AccountResponse> {
    return this.request<AccountResponse>("/account", { method: "GET" });
  }

  /** Return the account's current credit and currency. */
  async getCredit(): Promise<CreditResponse> {
    return this.request<CreditResponse>("/credit", { method: "GET" });
  }

  /** Return active SMS prices for every available destination country. */
  async getPricing(): Promise<PricingResponse> {
    return this.request<PricingResponse>("/pricing", { method: "GET" });
  }

  /** Return all webhooks configured for the account. */
  async getWebhooks(): Promise<WebhooksResponse> {
    return this.request<WebhooksResponse>("/webhooks", { method: "GET" });
  }

  /** Create a webhook. The response includes its HMAC signing secret. */
  async createWebhook(
    request: CreateWebhookRequest,
  ): Promise<CreateWebhookResponse> {
    return this.request<CreateWebhookResponse>("/webhooks", {
      method: "POST",
      body: request,
    });
  }

  /** Change a webhook's destination URL. */
  async updateWebhookUrl(webhookId: number, url: string): Promise<void> {
    await this.request<void>(`${webhookPath(webhookId)}/url`, {
      method: "PATCH",
      body: { url },
    });
  }

  /** Change a message webhook's label. */
  async updateWebhookLabel(webhookId: number, label: string): Promise<void> {
    await this.request<void>(`${webhookPath(webhookId)}/label`, {
      method: "PATCH",
      body: { label },
    });
  }

  /** Delete a webhook. */
  async deleteWebhook(webhookId: number): Promise<void> {
    await this.request<void>(webhookPath(webhookId), { method: "DELETE" });
  }

  /**
   * Select a webhook as the account's delivery-status callback. Any
   * previously selected status webhook is deselected.
   */
  async setStatusWebhook(webhookId: number): Promise<void> {
    await this.request<void>(`${webhookPath(webhookId)}/status`, {
      method: "POST",
    });
  }
}

function webhookPath(webhookId: number): string {
  if (!Number.isInteger(webhookId)) {
    throw new TypeError(`webhookId must be an integer, got ${webhookId}`);
  }
  return `/webhooks/${webhookId}`;
}
