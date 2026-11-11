# GatewayAPI SDK (Node.js)

Typesafe Node.js SDK for the GatewayAPI Messaging API and Account Management API.

## Install

```bash
npm install @onlinecity/gatewayapi-node
```

## Quickstart

```ts
import { GatewayAPIClient } from "@onlinecity/gatewayapi-node";

const gatewayapi = new GatewayAPIClient({
  token: "YOUR_TOKEN",
});

const response = await gatewayapi.submitSingle({
  sender: "ExampleSMS",
  recipient: 4512345678,
  message: "Hello world!",
});

console.log(response.msg_id);
```

## Documentation

- [Messaging API overview](https://gatewayapi.com/docs/message/overview/)
- [Authentication](https://gatewayapi.com/docs/authentication/)
- [Webhook signature verification](https://gatewayapi.com/docs/message/overview/#webhook-signature-verification)
- [Integration guide](https://gatewayapi.com/docs/guide/)
- [Error codes](https://gatewayapi.com/docs/error-codes/)
- Account Management API reference: [.com](https://manage.gatewayapi.com/redoc) / [.eu](https://manage.gatewayapi.eu/redoc)

## Send multiple messages

```ts
import { GatewayAPIClient } from "@onlinecity/gatewayapi-node";

const gatewayapi = new GatewayAPIClient({
  token: "YOUR_TOKEN",
});

const response = await gatewayapi.submitMultiple({
  messages: [
    {
      sender: "ExampleSMS",
      recipient: 4512345678,
      message: "Hello world!",
    },
  ],
});

console.log(response.responses.map((item) => item.msg_id));
```

## Error handling

```ts
import { GatewayAPIClient, GatewayAPIError } from "@onlinecity/gatewayapi-node";

const gatewayapi = new GatewayAPIClient({
  token: "YOUR_TOKEN",
});

try {
  await gatewayapi.submitSingle({
    sender: "ExampleSMS",
    recipient: 4512345678,
    message: "Hello world!",
  });
} catch (error) {
  if (error instanceof GatewayAPIError) {
    console.error(error.status, error.statusText, error.body);
  }
}
```

## Webhook helpers

```ts
import {
  parsePhoneMessageWebhookEvent,
  isSMSStatusEvent,
  isRCSStatusEvent,
} from "@onlinecity/gatewayapi-node";

const payload = JSON.parse(requestBody);
const event = parsePhoneMessageWebhookEvent(payload);

if (isSMSStatusEvent(event.event)) {
  console.log("SMS status", event.event.status);
} else if (isRCSStatusEvent(event.event)) {
  console.log("RCS status", event.event.status);
}
```

## Account management

`GatewayAPIManagementClient` wraps the Account Management API (account info, credit, pricing and webhook configuration). It uses the same token as the messaging client.

```ts
import { GatewayAPIManagementClient } from "@onlinecity/gatewayapi-node";

const manage = new GatewayAPIManagementClient({
  token: "YOUR_TOKEN",
  // baseUrl: "https://manage.gatewayapi.eu", // for EU accounts
});

const account = await manage.getAccount(); // { id, name }
const { credit, currency } = await manage.getCredit();
const pricing = await manage.getPricing(); // { currency, rates: CountryPrice[] }

// Webhooks
const { webhooks } = await manage.getWebhooks();
const created = await manage.createWebhook({
  label: "delivery-callback",
  url: "https://example.com/webhooks/delivery",
});
console.log(created.secret); // HMAC signing secret, only returned on creation

await manage.updateWebhookUrl(created.id, "https://example.com/new");
await manage.updateWebhookLabel(created.id, "new-label");
await manage.setStatusWebhook(created.id); // receive delivery-status callbacks
await manage.deleteWebhook(created.id);
```

Prices and credit are returned as decimal strings (e.g. `"0.11000"`) to avoid floating-point rounding.

## Configuration

```ts
import { GatewayAPIClient } from "@onlinecity/gatewayapi-node";

const gatewayapi = new GatewayAPIClient({
  token: "your-token",
  baseUrl: "https://messaging.gatewayapi.eu",
  fetch: customFetch,
});
```

- `token` is required.
- `baseUrl` defaults to `https://messaging.gatewayapi.com` (`GatewayAPIClient`) or `https://manage.gatewayapi.com` (`GatewayAPIManagementClient`). Use the `.eu` hosts for EU accounts.
- `fetch` allows custom implementations (useful for older Node versions).

## API surface

- `GatewayAPIClient`
- `GatewayAPIManagementClient`
- `GatewayAPIError`
- `parsePhoneMessageWebhookEvent`
- `isPhoneMessageWebhookEvent`
- `isSMSStatusEvent`
- `isRCSStatusEvent`
- Types: `MobileMessageRequest`, `MobileMessageResponse`, `MultiMobileMessageRequest`, `MultiMobileMessageResponse`, `PhoneMessageWebhookEvent`, `SMSStatus`, `RCSStatus`, `AccountResponse`, `CreditResponse`, `PricingResponse`, `CountryPrice`, `OperatorPrice`, `Webhook`, `WebhooksResponse`, `WebhookKeyword`, `WebhookVirtualNumber`, `CreateWebhookRequest`, `CreateWebhookResponse`, `UpdateWebhookURLRequest`, `UpdateWebhookLabelRequest`

## License

See `LICENSE`
