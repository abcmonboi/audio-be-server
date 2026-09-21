import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import express from "express";
import { Genre, Instrument, License, Mood, VideoTheme } from "../src/models/index.ts";
import { initRoutes } from "../src/routes/index.ts";

for (const [resource, model] of [
  ["genre", Genre],
  ["instrument", Instrument],
  ["license", License],
  ["mood", Mood],
  ["video-theme", VideoTheme],
]) {
  test(`GET ${resource} by id`, async (t) => {
    const app = express();
    initRoutes(app);
    app.use((_error, _req, res, _next) => res.status(500).json({ success: false }));
    const server = app.listen(0, "127.0.0.1");
    t.after(() => new Promise((resolve) => server.close(resolve)));
    await once(server, "listening");
    const base = `http://127.0.0.1:${server.address().port}/api/${resource}`;
    const id = "507f1f77bcf86cd799439011";
    const findById = t.mock.method(model, "findById");

    await t.test("invalid ids return 400 without querying the database", async () => {
      for (const invalid of ["invalid", "abcdefghijkl", "g".repeat(24), "1".repeat(23)]) {
        const res = await fetch(`${base}/${invalid}`);
        assert.equal(res.status, 400);
        assert.deepEqual(await res.json(), {
          success: false,
          msg: "id must be a valid ObjectId",
        });
      }
      assert.equal(findById.mock.callCount(), 0);
    });

    await t.test("missing resource returns 404", async () => {
      findById.mock.mockImplementation(async () => null);
      const res = await fetch(`${base}/${id}`);
      assert.equal(res.status, 404);
      assert.deepEqual(await res.json(), { success: false, msg: "Resource not found" });
      assert.equal(findById.mock.calls.at(-1).arguments[0], id);
    });

    await t.test("found resource returns resolved data", async () => {
      const data = { _id: id, title: "Jazz" };
      findById.mock.mockImplementation(async () => data);
      const res = await fetch(`${base}/${id}`);
      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), { success: true, data, msg: "Fetched successfully" });
    });

    await t.test("database failure reaches error middleware", async () => {
      findById.mock.mockImplementation(async () => {
        throw new Error("Database unavailable");
      });
      const res = await fetch(`${base}/${id}`);
      assert.equal(res.status, 500);
      await res.json();
    });
  });
}
