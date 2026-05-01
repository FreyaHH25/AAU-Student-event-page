/** --- IMPORTING MODULES --- **/
// Import the Express framework to create and manage the web server
const express = require('express'); 
// Import CORS (Cross-Origin Resource Sharing) to let your frontend talk to this backend
const cors = require('cors');
// Import MongoDB tools: MongoClient for connection and ObjectId to handle database IDs
const { MongoClient, ObjectId } = require('mongodb');
// Initialize the Express application
const app = express();
// Define the port number (3000) where the server will listen for requests
const port = 3000;

/** --- MIDDLEWARE SETUP --- **/
// This allows the frontend to communicate with the backend without being blocked by security policies
app.use(cors());
// This tells the server to look for and understand JSON data sent in request bodies
app.use(express.json());

/** --- DATABASE CONFIGURATION --- **/
// The connection string used to securely access your MongoDB Cluster in the cloud
const uri = "mongodb+srv://unievent_admin_db_user:fPrC0aBOV7AUT2na@unievent-cluster.5mv11ea.mongodb.net/?appName=UniEvent-Cluster";
// Create a new client instance to manage the database connection
const client = new MongoClient(uri);

// The specific names of the database and the collection used for events
const dbName = "UniEventDB";
const collectionName = "events";

/** --- ROUTE 1: GET ALL EVENTS --- **/
// This endpoint sends every event in the database to your frontend
app.get('/api/events', async (req, res) => {
    try {
        // Connect to the MongoDB cluster
        await client.connect();
        // Select the "UniEventDB" database
        const db = client.db(dbName);

        // We use an "Aggregate" pipeline to process and combine data from two collections
        const eventsWithNames = await db.collection(collectionName).aggregate([
            {
                // STAGE 1: Fix ID formats
                // We convert the list of user IDs from text strings into official MongoDB ObjectIds
                $addFields: {
                    attendingObjectIds: {
                        $map: {
                            // If the 'attending' array is missing, use an empty list [] instead
                            input: { $ifNull: ["$attending", []] },
                            as: "id",
                            in: { 
                                // Check if the ID is a string; if so, convert it to an ObjectId
                                $cond: [
                                    { $eq: [{ $type: "$$id" }, "string"] },
                                    { $toObjectId: "$$id" }, 
                                    "$$id" 
                                ]
                            }
                        }
                    }
                }
            },
            {
                // STAGE 2: Connect Collections (The "Join")
                // Look into the 'users' collection to find details matching our converted IDs
                $lookup: {
                    from: "users", 
                    localField: "attendingObjectIds",
                    foreignField: "_id",
                    as: "attendeeDetails" // Store the matched user documents here
                }
            },
            {
                // STAGE 3: Filter Results (The "Project")
                // Define exactly which fields to send back to the frontend (1 = include)
                $project: {
                    title: 1, description: 1, date: 1, time: 1, startTime: 1, endTime: 1,
                    location: 1, organizer: 1, organizerId: 1, imageUrl: 1, categories: 1, visibility: 1,
                    attending: 1,
                    // Extract only the 'name' field from the matched user documents
                    attendeeNames: "$attendeeDetails.name" 
                }
            }
        ]).toArray();

        // Send the final list of events with real names back to the frontend
        res.json(eventsWithNames);
    } catch (error) {
        // Log errors to the console and send a 500 error status if the database fails
        console.error("Aggregation Error:", error);
        res.status(500).send("Error fetching events.");
    }
});

/** --- ROUTE 2: POST NEW EVENT --- **/
// Receives data from the "Create Event" form and saves it as a new document
app.post('/api/events', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        
        // Grab the event details sent from the frontend
        const newEvent = req.body; 
        // Save the new event object into the "events" collection
        const result = await db.collection(collectionName).insertOne(newEvent);
        
        // Respond with a 201 (Created) status and a success message
        res.status(201).json({ message: "Event successfully saved to the database!", data: result });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error saving the event to the database.");
    }
});

/** --- ROUTE 3: TOGGLE ATTENDANCE --- **/
// This adds or removes a user from the attendance list based on their current status
app.patch('/api/events/:id/attend', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        // Get the specific event ID from the URL and user ID from the body
        const eventId = req.params.id;
        const { userId } = req.body;

        // Search for the specific event document
        const event = await db.collection(collectionName).findOne({ _id: new ObjectId(eventId) });
        if (!event) return res.status(404).send("Event not found");

        // Ensure the list of attendees exists; if not, start a fresh one
        let attendees = Array.isArray(event.attending) ? event.attending : [];
        // Check if the user is already in the list
        const userIndex = attendees.indexOf(userId);
        
        if (userIndex === -1) {
            // User is not in the list, so we add them (Attend)
            attendees.push(userId);
        } else {
            // User is already in the list, so we remove them (Unattend)
            attendees.splice(userIndex, 1);
        }

        // Save the updated list back into the event document
        await db.collection(collectionName).updateOne(
            { _id: new ObjectId(eventId) },
            { $set: { attending: attendees } }
        );

        // Fetch the actual names of everyone currently in the attendee list
        const userDetails = await db.collection("users").find(
            { _id: { $in: attendees.map(id => new ObjectId(id)) } }
        ).project({ name: 1 }).toArray();

        // Send back the updated event data and attendee name list
        res.json({ 
            ...event, 
            attending: attendees,
            attendeeNames: userDetails.map(u => u.name) 
        });

    } catch (error) {
        console.error("ATTEND ERROR:", error);
        res.status(500).send("Error updating attendance.");
    }
});

/** --- SERVER ACTIVATION --- **/
// This starts the server and makes it ready to handle incoming requests
app.listen(port, () => {
    console.log(`Server is running locally on http://localhost:${port}`);
    console.log(`Ready to communicate with MongoDB.`);
});

/** --- ROUTE 4: LOGIN VALIDATION --- **/
// Checks if the user's email and password exist in the "users" collection
app.post('/api/login', async (req, res) => {
    try {
        await client.connect();
        const db = client.db("UniEventDB");
        
        // Clean the input data by removing extra spaces
        const email = req.body.email.trim();
        const password = req.body.password.trim();
        
        console.log("Checking DB for:", email);

        // Search for a user document that matches BOTH email and password
        const user = await db.collection("users").findOne({ 
            email: email, 
            password: password 
        });

        if (user) {
            // Success: User found. Send back their details to the frontend
            console.log("MATCH FOUND:", user.email);
            return res.status(200).json({ 
                success: true, 
                userId: user._id,
                userName: user.name,
                userSemester: user.semester
            });
        } else {
            // Failure: No match. Send back a 401 (Unauthorized) status
            console.log("NO MATCH FOUND in MongoDB.");
            return res.status(401).json({ success: false });
        }
    } catch (error) {
        // Critical Error: Database connection failure or server crash
        console.error("CRITICAL LOGIN ERROR:", error);
        return res.status(500).send("Server Error");
    }
});