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
  test(`DELETE ${resource} validates id and returns the deletion result`, async (t) => {
    const app = express();
    initRoutes(app);
    app.use(errorHandler);
    let receivedError;
    app.use((error, _req, res, _next) => {
      receivedError = error;
      res.status(500).json({ success: false });
    });
    const server = app.listen(0, "127.0.0.1");
    t.after(() => new Promise((resolve) => server.close(resolve)));
    await once(server, "listening");
    const base = `http://127.0.0.1:${server.address().port}/api/${resource}`;
    const id = "507f1f77bcf86cd799439011";
    const data = { _id: id, title: "Jazz", slug: "jazz" };
    const remove = t.mock.method(model, "findByIdAndDelete", async () => data);
    const request = (target) => fetch(`${base}/${target}`, { method: "DELETE" });

    const invalid = await request("invalid");
    assert.equal(invalid.status, 400);
    assert.equal((await invalid.json()).success, false);
    assert.equal(remove.mock.callCount(), 0);

    const deleted = await request(id);
    assert.equal(deleted.status, 200);
    assert.deepEqual(await deleted.json(), {
      success: true,
      data,
      msg: "Data deleted successfully",
    });
    assert.deepEqual(remove.mock.calls[0].arguments, [id]);

    remove.mock.mockImplementation(async () => null);
    const missing = await request(id);
    assert.equal(missing.status, 404);
    assert.deepEqual(await missing.json(), { success: false, msg: "Resource not found" });

    const databaseError = new Error("Database unavailable");
    remove.mock.mockImplementation(async () => {
      throw databaseError;
    });
    const failed = await request(id);
    assert.equal(failed.status, 500);
    assert.equal((await failed.json()).success, false);
    assert.equal(receivedError, databaseError);
  });
}
