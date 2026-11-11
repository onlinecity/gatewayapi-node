import { test } from "node:test";
import assert from "node:assert/strict";
import {
  GatewayAPIClient,
  GatewayAPIError,
  GatewayAPIManagementClient,
} from "../dist/index.js";

function mockFetch(status, body) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, init });
    if (status === 204) return new Response(null, { status });
    return new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    });
  };
  fn.calls = calls;
  return fn;
}

test("requires a token", () => {
  assert.throws(
    () => new GatewayAPIManagementClient({ token: " " }),
    /GatewayAPIManagementClient requires a non-empty token/,
  );
});

test("defaults to manage.gatewayapi.com with token auth", async () => {
  const fetch = mockFetch(200, { credit: "10.00000", currency: "EUR" });
  const client = new GatewayAPIManagementClient({ token: "t0k", fetch });
  const res = await client.getCredit();
  assert.deepEqual(res, { credit: "10.00000", currency: "EUR" });
  const [{ url, init }] = fetch.calls;
  assert.equal(url, "https://manage.gatewayapi.com/credit");
  assert.equal(init.method, "GET");
  assert.equal(init.headers.Authorization, "Token t0k");
  assert.equal(init.body, undefined);
});

test("honours an EU baseUrl", async () => {
  const fetch = mockFetch(200, { id: 1, name: "Acme" });
  const client = new GatewayAPIManagementClient({
    token: "t",
    baseUrl: "https://manage.gatewayapi.eu",
    fetch,
  });
  assert.deepEqual(await client.getAccount(), { id: 1, name: "Acme" });
  assert.equal(fetch.calls[0].url, "https://manage.gatewayapi.eu/account");
});

test("GET endpoints hit the right paths", async () => {
  const fetch = mockFetch(200, {});
  const client = new GatewayAPIManagementClient({ token: "t", fetch });
  await client.getPricing();
  await client.getWebhooks();
  assert.deepEqual(
    fetch.calls.map((c) => [c.init.method, new URL(c.url).pathname]),
    [
      ["GET", "/pricing"],
      ["GET", "/webhooks"],
    ],
  );
});

test("createWebhook posts the request body", async () => {
  const created = { id: 7, label: "lbl", url: "https://x", active: true, secret: "s" };
  const fetch = mockFetch(201, created);
  const client = new GatewayAPIManagementClient({ token: "t", fetch });
  assert.deepEqual(
    await client.createWebhook({ label: "lbl", url: "https://x" }),
    created,
  );
  const { url, init } = fetch.calls[0];
  assert.equal(url, "https://manage.gatewayapi.com/webhooks");
  assert.equal(init.method, "POST");
  assert.equal(init.headers["Content-Type"], "application/json");
  assert.deepEqual(JSON.parse(init.body), { label: "lbl", url: "https://x" });
});

test("webhook mutations use the right method, path and body", async () => {
  const fetch = mockFetch(204);
  const client = new GatewayAPIManagementClient({ token: "t", fetch });
  assert.equal(await client.updateWebhookUrl(5, "https://new"), undefined);
  await client.updateWebhookLabel(5, "new-label");
  await client.deleteWebhook(5);
  await client.setStatusWebhook(5);
  assert.deepEqual(
    fetch.calls.map((c) => [
      c.init.method,
      new URL(c.url).pathname,
      c.init.body && JSON.parse(c.init.body),
    ]),
    [
      ["PATCH", "/webhooks/5/url", { url: "https://new" }],
      ["PATCH", "/webhooks/5/label", { label: "new-label" }],
      ["DELETE", "/webhooks/5", undefined],
      ["POST", "/webhooks/5/status", undefined],
    ],
  );
});

test("rejects non-integer webhook ids before sending", async () => {
  const fetch = mockFetch(204);
  const client = new GatewayAPIManagementClient({ token: "t", fetch });
  await assert.rejects(client.deleteWebhook("1/../account"), TypeError);
  assert.equal(fetch.calls.length, 0);
});

test("non-2xx responses throw GatewayAPIError", async () => {
  const body = { detail: [{ loc: ["body", "label"], msg: "too short", type: "x" }] };
  const client = new GatewayAPIManagementClient({ token: "t", fetch: mockFetch(422, body) });
  await assert.rejects(client.updateWebhookLabel(1, "a"), (err) => {
    assert.ok(err instanceof GatewayAPIError);
    assert.equal(err.status, 422);
    assert.deepEqual(err.body, body);
    return true;
  });
});

test("messaging client still defaults to messaging.gatewayapi.com", async () => {
  const fetch = mockFetch(200, { msg_id: "m", recipient: 1, reference: null });
  const client = new GatewayAPIClient({ token: "t", fetch });
  await client.submitSingle({ sender: "s", recipient: 1, message: "hi" });
  assert.equal(fetch.calls[0].url, "https://messaging.gatewayapi.com/mobile/single");
  assert.throws(() => new GatewayAPIClient({ token: "" }), /GatewayAPIClient requires/);
});
