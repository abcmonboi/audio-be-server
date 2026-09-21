import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import express from "express";
import { Genre, Instrument, License, Mood, VideoTheme } from "../src/models/index.ts";
import { initRoutes } from "../src/routes/index.ts";
import { errorHandler } from "../src/middlewares/error-handler.ts";

for (const [resource, model] of [
  ["genre", Genre],
  ["instrument", Instrument],
  ["license", License],
  ["mood", Mood],
  ["video-theme", VideoTheme],
]) {
  test(`PUT ${resource} validates input and returns the update result`, async (t) => {
    const app = express();
    app.use(express.json());
    initRoutes(app);
    app.use(errorHandler);
    const server = app.listen(0, "127.0.0.1");
    t.after(() => new Promise((resolve) => server.close(resolve)));
    await once(server, "listening");
    const base = `http://127.0.0.1:${server.address().port}/api/${resource}`;
    const id = "507f1f77bcf86cd799439011";
    const data = { _id: id, title: "Jazz", description: "Music", slug: "jazz" };
    const update = t.mock.method(model, "findByIdAndUpdate", async () => data);
    const put = (target, body) =>
      fetch(`${base}/${target}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

    for (const [target, body] of [
      ["invalid", { title: "Jazz" }],
      [id, { title: " " }],
    ]) {
      const res = await put(target, body);
      assert.equal(res.status, 400);
      assert.equal((await res.json()).success, false);
    }
    assert.equal(update.mock.callCount(), 0);

    const res = await put(id, { title: " Jazz ", description: "Music", slug: "ignored" });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { success: true, data, msg: "Data updated successfully" });
    assert.deepEqual(update.mock.calls[0].arguments, [
      id,
      { title: "Jazz", description: "Music", slug: "jazz" },
      { returnDocument: "after", runValidators: true },
    ]);

    update.mock.mockImplementation(async () => null);
    const missing = await put(id, { title: "Jazz" });
    assert.equal(missing.status, 404);
    assert.deepEqual(await missing.json(), { success: false, msg: "Resource not found" });
  });
}
