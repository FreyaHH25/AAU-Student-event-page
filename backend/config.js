/** --- CONFIGURATION --- **/
// Load the .env file so process.env can access the variables
// (dotenv loades in server.js, so it is not needed here)

module.exports = {
  // process.env.XXX retrieves the value from the .env file
  port: process.env.PORT || 3000, // || 3000 = fallback if the variable is missing
  mongoUri: process.env.MONGO_URI,
  dbName: process.env.DB_NAME || "UniEventDB",
  collections: {
    events: "events",
    users: "users",
  },
};
