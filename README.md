# GatewayAPI Messaging SDK (Node.js)

Typesafe Node.js SDK for the GatewayAPI Messaging API.

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
- `baseUrl` defaults to `https://messaging.gatewayapi.com`.
- `fetch` allows custom implementations (useful for older Node versions).

## API surface

- `GatewayAPIClient`
- `GatewayAPIError`
- `parsePhoneMessageWebhookEvent`
- `isPhoneMessageWebhookEvent`
- `isSMSStatusEvent`
- `isRCSStatusEvent`
- Types: `MobileMessageRequest`, `MobileMessageResponse`, `MultiMobileMessageRequest`, `MultiMobileMessageResponse`, `PhoneMessageWebhookEvent`, `SMSStatus`, `RCSStatus`

## License
