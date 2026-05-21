// ===== DATABASE CONNECTION =====

const { MongoClient } = require("mongodb");
const config = require("./config");

// Create a single client instance to be reused by the entire application
const client = new MongoClient(config.mongoUri);
let db;

// Connects to the database once when the server starts
async function connectDB() {
  try {
    await client.connect();
    db = client.db(config.dbName);
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1); // Stop the server if the DB cannot be reached
  }
}

// Returns the active database instance (used by controllers)
function getDB() {
  if (!db) throw new Error("Database is not connected yet!");
  return db;
}

module.exports = { connectDB, getDB };
