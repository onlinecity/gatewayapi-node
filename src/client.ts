export type FetchLike = typeof fetch;

export interface GatewayAPIClientOptions {
  token: string;
  baseUrl?: string;
  fetch?: FetchLike;
}

export class GatewayAPIError extends Error {
  status: number;
  statusText: string;
  body: unknown;

  constructor(status: number, statusText: string, body: unknown) {
    super(`GatewayAPI request failed: ${status} ${statusText}`);
    this.name = "GatewayAPIError";
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

export class GatewayAPIClient {
  private token: string;
  private baseUrl: string;
  private fetchImpl: FetchLike;

  constructor(options: GatewayAPIClientOptions) {
    if (!options.token || options.token.trim().length === 0) {
      throw new Error("GatewayAPIClient requires a non-empty token");
    }

    this.token = options.token;
    this.baseUrl = options.baseUrl ?? "https://messaging.gatewayapi.com";
    this.fetchImpl = options.fetch ?? fetch;
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, { method: "POST", body });
  }

  async request<T>(
    path: string,
    options: {
      method: string;
      body?: unknown;
      headers?: Record<string, string>;
    },
  ): Promise<T> {
    const url = new URL(path, this.baseUrl);
    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Token ${this.token}`,
      ...options.headers,
    };

    let body: string | undefined;
    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(options.body);
    }

    const response = await this.fetchImpl(url.toString(), {
      method: options.method,
      headers,
      body,
    });

    const responseBody = await this.parseResponse(response);

    if (!response.ok) {
      throw new GatewayAPIError(
        response.status,
        response.statusText,
        responseBody,
      );
    }

    return responseBody as T;
  }

  private async parseResponse(response: Response): Promise<unknown> {
    if (response.status === 204) {
      return undefined;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return response.json();
    }

    const text = await response.text();
    return text.length > 0 ? text : undefined;
  }
}
