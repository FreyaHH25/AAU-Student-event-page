// ===== EVENT CONTROLLER =====

const { ObjectId } = require("mongodb");
const { getDB } = require("../db");
const config = require("../config");


// ===== GET ALL EVENTS =====
exports.getAllEvents = async (req, res) => {
  try {
    const db = getDB();
    const eventsWithNames = await db
      .collection(config.collections.events)
      .aggregate([
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
                    "$$id",
                  ],
                },
              },
            },
          },
        },
        {
          // STAGE 2: Connect Collections (The "Join")
          // Look into the 'users' collection to find details matching our converted IDs
          $lookup: {
            from: "users",
            localField: "attendingObjectIds",
            foreignField: "_id",
            as: "attendeeDetails", // Store the matched user documents here
          },
        },
        {
          // STAGE 3: Filter Results (The "Project")
          // Define exactly which fields to send back to the frontend (1 = include)
          $project: {
            title: 1,
            description: 1,
            date: 1,
            time: 1,
            startTime: 1,
            endTime: 1,
            location: 1,
            organizer: 1,
            organizerId: 1,
            imageUrl: 1,
            categories: 1,
            visibility: 1,
            attending: 1,
            // Extract only the 'name' field from the matched user documents
            attendeeNames: "$attendeeDetails.name",
          },
        },
      ])
      .toArray();

    // Send the final list of events with real names back to the frontend
    res.json(eventsWithNames);
  } catch (error) {
    // Log errors to the console and send a 500 error status if the database fails
    console.error("Aggregation Error:", error);
    res.status(500).send("Error fetching events.");
  }
};


// ===== GET A SINGLE EVENT BY ID =====

// Fetches a single event's details based on its ID
exports.getEventById = async (req, res) => {
  try {
    const db = getDB();
    // Find the event using the ObjectId format
    const event = await db
      .collection(config.collections.events)
      .findOne({ _id: new ObjectId(req.params.id) });

    if (event) {
      res.json(event);
    } else {
      res.status(404).send("Event not found");
    }
  } catch (error) {
    console.error("Fetch Single Event Error:", error);
    res.status(500).send("Error fetching event details.");
  }
};


// ===== POST NEW EVENT =====

// Receives data from the "Create Event" form and saves it as a new document
exports.createEvent = async (req, res) => {
  try {
    const db = getDB();
    // Save the new event object into the "events" collection
    const result = await db
      .collection(config.collections.events)
      .insertOne(req.body);
    // Respond with a 201 (Created) status and a success message
    res.status(201).json({
      message: "Event successfully saved to the database!",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving the event to the database.");
  }
};


// ===== UPDATE EVENT =====

// This handles the actual saving of the edited event
exports.updateEvent = async (req, res) => {
  try {
    const db = getDB();
    const updatedData = req.body; // Get the new event data sent from the frontend form
    delete updatedData._id; // Remove '_id' since MongoDB doesn't allow overwriting the unique ID

    // Find the document by ID and apply the new data using $set
    const result = await db.collection(config.collections.events).updateOne(
      { _id: new ObjectId(req.params.id) }, // The "filter": find the event with this ID
      { $set: updatedData }, // The "update": only change the fields provided
    );

    // Check if a document with that ID was actually found
    if (result.matchedCount === 0) {
      return res.status(404).send("Event not found");
    }
    // If successful, send a JSON response back to the frontend to confirm the update worked
    res.json({ message: "Update successful!" });
  } catch (error) {
    // If the database connection fails or there's a code error, log it in the terminal
    console.error("Update Error:", error);
    // Send a 500 "Server Error" status so the frontend knows the request failed
    res.status(500).send("Error updating event.");
  }
};


// ===== DELETE EVENT =====

exports.deleteEvent = async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection(config.collections.events).deleteOne({
      _id: new ObjectId(req.params.id),
    });

    if (result.deletedCount === 1) {
      res.json({ message: "Event deleted successfully!" });
    } else {
      res.status(404).send("Event not found in database.");
    }
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).send("Server error during deletion.");
  }
};


// ===== TOGGLE ATTENDANCE =====

// This adds or removes a user from the attendance list based on their current status
exports.toggleAttendance = async (req, res) => {
  try {
    const db = getDB();
    // Get the specific event ID from the URL and user ID from the body
    const eventId = req.params.id;
    const { userId } = req.body;

    // Find the specific event document
    const event = await db
      .collection(config.collections.events)
      .findOne({ _id: new ObjectId(eventId) });
    if (!event) return res.status(404).send("Event not found");

    // Make sure the attendees list exists; if not, start a fresh one
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
    await db
      .collection(config.collections.events)
      .updateOne(
        { _id: new ObjectId(eventId) },
        { $set: { attending: attendees } },
      );

    // Fetch the actual names of all current attendees
    const userDetails = await db
      .collection("users")
      .find({ _id: { $in: attendees.map((id) => new ObjectId(id)) } })
      .project({ name: 1 })
      .toArray();

    // Send back the updated event data and attendee name list
    res.json({
      ...event,
      attending: attendees,
      attendeeNames: userDetails.map((u) => u.name),
    });
  } catch (error) {
    console.error("ATTEND ERROR:", error);
    res.status(500).send("Error updating attendance.");
  }
};
