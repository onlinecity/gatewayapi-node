export interface ErrorDetail {
  hex_code: string;
  details: string;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}

export interface ValidationError {
  loc: Array<string | number>;
  msg: string;
  type: string;
  input?: unknown;
  ctx?: Record<string, unknown>;
}

export type MessagePriority = "normal" | "urgent";

export interface MobileMessageRequest {
  sender: string;
  recipient: number;
  message: string;
  reference?: string | null;
  expiration?: string;
  priority?: MessagePriority;
  label?: string | null;
}

export interface MobileMessageResponse {
  msg_id: string;
  recipient: number;
  reference: string | null;
}

export interface MultiMobileMessageRequest {
  messages: MobileMessageRequest[];
}

export interface MultiMobileMessageResponse {
  responses: MobileMessageResponse[];
}

export type SMSEventStatus =
  | "ENROUTE"
  | "DELIVERED"
  | "EXPIRED"
  | "DELETED"
  | "UNDELIVERABLE"
  | "ACCEPTED"
  | "UNKNOWN"
  | "REJECTED";

export interface SMSStatus {
  msg_id: string;
  recipient: number;
  reference: string | null;
  status: SMSEventStatus;
  status_at: string;
  error: ErrorDetail | null;
}

export type RCSEventStatus = "DELIVERED" | "READ" | "ENROUTE" | "EXPIRED";

export interface RCSStatus {
  msg_id: string;
  recipient: number;
  reference: string | null;
  status: RCSEventStatus;
  status_at: string;
  error: Record<string, unknown> | null;
}

export type MessageEventType = "message.status.sms" | "message.status.rcs";

export interface PhoneMessageWebhookEvent {
  event_id: string;
  timestamp: string;
  event_type: MessageEventType;
  event: SMSStatus | RCSStatus;
}
