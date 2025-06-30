import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already connected to the database");
    return;
  }

  try {
    const db = await mongoose.connect(
      (process.env.MONGODB_URI as string) || "",
      {}
    );

    console.log("this is DB = ", db);

    connection.isConnected = db.connections[0].readyState;

    console.log("Connected to the database successfully");
  } catch (error) {
    console.log("Error connecting to the database:", error);

    process.exit(1);
  }
}

export default dbConnect;
