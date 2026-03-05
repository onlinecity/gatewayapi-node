import type {
  MessageEventType,
  PhoneMessageWebhookEvent,
  RCSStatus,
  SMSStatus,
} from "./types.js";

const smsEventType: MessageEventType = "message.status.sms";
const rcsEventType: MessageEventType = "message.status.rcs";

export class WebhookParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhookParseError";
  }
}

export function isPhoneMessageWebhookEvent(
  value: unknown,
): value is PhoneMessageWebhookEvent {
  if (!isRecord(value)) {
    return false;
  }

  if (
    typeof value.event_id !== "string" ||
    typeof value.timestamp !== "string" ||
    typeof value.event_type !== "string" ||
    value.event === undefined
  ) {
    return false;
  }

  if (value.event_type === smsEventType) {
    return isSMSStatusEvent(value.event);
  }

  if (value.event_type === rcsEventType) {
    return isRCSStatusEvent(value.event);
  }

  return false;
}

export function parsePhoneMessageWebhookEvent(
  input: unknown,
): PhoneMessageWebhookEvent {
  if (!isPhoneMessageWebhookEvent(input)) {
    throw new WebhookParseError("Invalid PhoneMessageWebhookEvent payload");
  }

  return input;
}

export function isSMSStatusEvent(value: unknown): value is SMSStatus {
  if (!isRecord(value)) {
    return false;
  }

  if (
    typeof value.msg_id !== "string" ||
    typeof value.recipient !== "number" ||
    !isStringOrNull(value.reference) ||
    typeof value.status !== "string" ||
    typeof value.status_at !== "string"
  ) {
    return false;
  }

  const allowedStatuses = new Set([
    "ENROUTE",
    "DELIVERED",
    "EXPIRED",
    "DELETED",
    "UNDELIVERABLE",
    "ACCEPTED",
    "UNKNOWN",
    "REJECTED",
  ]);

  if (!allowedStatuses.has(value.status)) {
    return false;
  }

  if (value.error === null) {
    return true;
  }

  return isErrorDetail(value.error);
}

export function isRCSStatusEvent(value: unknown): value is RCSStatus {
  if (!isRecord(value)) {
    return false;
  }

  if (
    typeof value.msg_id !== "string" ||
    typeof value.recipient !== "number" ||
    !isStringOrNull(value.reference) ||
    typeof value.status !== "string" ||
    typeof value.status_at !== "string"
  ) {
    return false;
  }

  const allowedStatuses = new Set([
    "DELIVERED",
    "READ",
    "ENROUTE",
    "EXPIRED",
  ]);

  if (!allowedStatuses.has(value.status)) {
    return false;
  }

  if (value.error === null || value.error === undefined) {
    return true;
  }

  return isRecord(value.error);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringOrNull(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isErrorDetail(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.hex_code === "string" && typeof value.details === "string";
}
