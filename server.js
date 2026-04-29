const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

// Allows frontend to communicate with backend without being blocked
app.use(cors());
// Allows the server to understand incoming JSON data (when a user creates an event)
app.use(express.json());

// MongoDB connection string
const uri = "mongodb+srv://unievent_admin_db_user:fPrC0aBOV7AUT2na@unievent-cluster.5mv11ea.mongodb.net/?appName=UniEvent-Cluster";
const client = new MongoClient(uri);

// We name our database "UniEventDB" and the collection of events "events"
const dbName = "UniEventDB";
const collectionName = "events";

// ROUTE 1: GET (Send all events to the frontend)
app.get('/api/events', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const events = await db.collection(collectionName).find({}).toArray();
        
        // Sends the events back as JSON
        res.json(events); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching events from the database.");
    }
});

// ROUTE 2: POST (Receive a new event and save it)
app.post('/api/events', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        
        // The data the user filled out in the frontend form
        const newEvent = req.body; 
        const result = await db.collection(collectionName).insertOne(newEvent);
        
        res.status(201).json({ message: "Event successfully saved to the database!", data: result });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error saving the event to the database.");
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running locally on http://localhost:${port}`);
    console.log(`Ready to communicate with MongoDB.`);
});

// LOGIN ROUTE: Checks if the user exists in MongoDB
app.post('/api/login', async (req, res) => {
    try {
       // Establishes a live connection to your MongoDB Cluster (the cloud database)
        await client.connect();
        const db = client.db("UniEventDB");
        /**
          DATA RETRIEVAL: 
          We extract the email and password from 'req.body', which contains the data 
          sent from your frontend login form.
          .trim() is used to remove any accidental spaces, ensuring the login 
          doesn't fail due to a simple typing error.
         */
        const email = req.body.email.trim();
        const password = req.body.password.trim();
       // Logs the attempt to your terminal so you can monitor who is trying to log in, and just to se if it works!
        console.log("Checking DB for:", email);
        /*
          DATABASE QUERY:
         'findOne' searches for exactly one document in the "users" collection 
          where BOTH the email and password match the user's input.
         */
        const user = await db.collection("users").findOne({ 
            email: email, 
            password: password 
        });
        // Checks if the database successfully returned a user object
        if (user) {
            /**
             SUCCESS CASE:
             If a user is found, we log it on the server and send a 200 (OK) status.
             We return a JSON object containing 'success: true', the unique 'userId', 
             and the 'userName' retrieved from the database.
             The 'return' keyword ensures the code stops here and sends the response immediately.
             */
            console.log("MATCH FOUND:", user.email);
            return res.status(200).json({ 
                success: true, 
                userId: user._id,
                userName: user.name,
                userSemester: user.semester
            });
        } else {
            /**
             FAILURE CASE:
             If no matching user is found, we send a 401 (Unauthorized) status.
             This tells your frontend that the login credentials were incorrect.
             */
            console.log("NO MATCH FOUND in MongoDB.");
            return res.status(401).json({ success: false });
        }
    } catch (error) {
        /**
         ERROR HANDLING:
         If a critical error occurs (e.g., database connection loss), 
         the 'catch' block prevents the server from crashing.
         We log the error for the developer and send a 500 (Server Error) status to the user.
         */
        console.error("CRITICAL LOGIN ERROR:", error);
        return res.status(500).send("Server Error");
    }
});

