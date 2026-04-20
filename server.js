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

