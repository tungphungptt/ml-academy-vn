import test from "node:test";
import assert from "node:assert/strict";
import net from "node:net";
import { localOptions, checkPort, runProduction } from "../scripts/deploy-local.mjs";

const fixture = { DATABASE_URL: "file:/tmp/deploy-fixture.db", SESSION_SECRET: "test-only-secret-32-characters-minimum" };
test("local production validates configuration and binds only to loopback", () => {
  const options = localOptions(fixture, "24.19.0");
  assert.equal(options.PORT, "3000");
  assert.equal(options.NODE_ENV, "production");
  assert.equal(options.COOKIE_SECURE, "false");
  for (const bad of [{ ...fixture, SESSION_SECRET: "short" }, { ...fixture, DATABASE_URL: "" }, { ...fixture, COOKIE_SECURE: "true" }, { ...fixture, PORT: "0" }, { ...fixture, PORT: "3000;echo unsafe" }, { ...fixture, PORT: "65536" }]) assert.throws(() => localOptions(bad));
  assert.throws(() => localOptions(fixture, "22.0.0"), /Node.js 24/);
});

test("a failed production build never starts the server; success uses the existing npm start", () => {
  const env = { ...localOptions(fixture), npm_execpath: process.execPath };
  const calls: string[][] = [];
  const fail = runProduction(env, (_node, args) => { calls.push(args); return { status: 7 }; });
  assert.equal(fail, 7);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].slice(1), ["run", "build"]);
  calls.length = 0;
  assert.equal(runProduction(env, (node, args, options) => {
    assert.equal(node, process.execPath);
    assert.equal(options.env, env);
    assert.equal(options.stdio, "inherit");
    assert.equal("shell" in options, false, "Windows uses the npm JS CLI, not an interpolated shell");
    calls.push(args); return { status: 0 };
  }), 0);
  assert.deepEqual(calls[1].slice(1), ["run", "start", "--", "--hostname", "127.0.0.1", "--port", "3000"]);
});

test("an occupied loopback port is rejected without starting a build", async () => {
  const server = net.createServer();
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address() as net.AddressInfo;
    await assert.rejects(checkPort(address.port), /is in use/);
  } finally { await new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve())); }
});
