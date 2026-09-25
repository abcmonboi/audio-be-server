import { connect } from "mongoose";

export async function connectDB() {
  // Replace the uri string with your connection string
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }

  try {
    const conn = await connect(uri);
    if (conn.connection.readyState === 1) {
      console.log("DB", conn.connection.name, "connection is successfully");
    } else {
      console.log("DB connecting");
    }
  } catch (error) {
    console.log("DB connection failed");
    throw new Error("DB connection failed", { cause: error });
  }
}
