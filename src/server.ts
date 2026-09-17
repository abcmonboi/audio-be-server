import express from "express";
import "dotenv/config";
import "./config/db-connect";

const app = express();
const port = process.env.BACKEND_SERVER_PORT ?? 1346;

app.get("/", (_req: any, res) => {
  res.send("Welcome to my world");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
