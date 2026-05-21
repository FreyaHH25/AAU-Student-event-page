// Load environment variables FIRST
require("dotenv").config();


// ===== IMPORTING MODULES =====

// Import the Express framework to create and manage the web server
const express = require("express");

console.log("MONGO_URI er:", process.env.MONGO_URI);
console.log("PORT er:", process.env.PORT);

// Import CORS (Cross-Origin Resource Sharing) to let the frontend talk to this backend
const cors = require("cors");

// Import our own configuration and database modules
const config = require("./config");
const { connectDB } = require("./db");

// Import routes
const eventRoutes = require("./routes/eventRoutes");
const authRoutes = require("./routes/authRoutes");

// Initialize the Express application
const app = express();


// ===== MIDDLEWARE SETUP =====

// Allows the frontend to communicate with the backend without being blocked by security policies
app.use(cors());
// Tells the server to look for and understand JSON data sent in request bodies
app.use(express.json());


// ===== ROUTE REGISTRATION =====

// Attach routes with their URL prefix
app.use("/api/events", eventRoutes);
app.use("/api", authRoutes);


// ===== SERVER ACTIVATION =====

// Connect to the DB FIRST, then start the server
connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`Server is running locally on http://localhost:${config.port}`);
    console.log(`Ready to communicate with MongoDB.`);
  });
});
