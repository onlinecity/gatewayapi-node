// Types for the GatewayAPI Account Management API
// (https://manage.gatewayapi.com/redoc).

export interface AccountResponse {
  id: number;
  name: string;
}

export interface CreditResponse {
  /** Current credit as a decimal string, e.g. "123.45000". */
  credit: string;
  /** ISO 4217 currency code. */
  currency: string;
}

export interface OperatorPrice {
  operator_name: string;
  /** Mobile country code. */
  mcc: number;
  /** Mobile network code. */
  mnc: number;
  /** Price as a decimal string in the account currency. */
  price: string;
}

export interface CountryPrice {
  /** Two-letter destination country code, e.g. "DK". */
  country_code: string;
  standard_price: string;
  plus_price: string;
  operator_prices: OperatorPrice[];
}

export interface PricingResponse {
  /** ISO 4217 currency used by every returned price. */
  currency: string;
  rates: CountryPrice[];
}

export interface WebhookKeyword {
  id: number;
  keyword: string;
  active: boolean;
}

export interface WebhookVirtualNumber {
  id: number;
  /** First number in the virtual-number range. */
  number: number;
  /** Last number in the range, or null for a single number. */
  range_end: number | null;
  active: boolean;
}

export interface Webhook {
  id: number;
  label: string;
  url: string;
  /** Whether the webhook is selected for delivery-status callbacks. */
  status: boolean;
  keywords: WebhookKeyword[];
  virtual_numbers: WebhookVirtualNumber[];
  active: boolean;
}

export interface WebhooksResponse {
  webhooks: Webhook[];
}

export interface CreateWebhookRequest {
  /** 3-255 characters. */
  label: string;
  url: string;
  /** Defaults to true. */
  active?: boolean;
}

export interface CreateWebhookResponse {
  id: number;
  label: string;
  url: string;
  active: boolean;
  /** HMAC signing secret. Only returned when the webhook is created. */
  secret: string;
}

export interface UpdateWebhookURLRequest {
  url: string;
}

export interface UpdateWebhookLabelRequest {
  /** 3-255 characters. */
  label: string;
}
