import express from "express";
import "dotenv/config";
import { connectDB } from "@/config/db-connect";

const app = express();
const port = process.env.BACKEND_SERVER_PORT ?? 1346;

app.get("/", (_req, res) => {
  res.send("Welcome to my world");
});

const bootstrap = async () => {
  await connectDB();

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
