// ===== AUTH CONTROLLER =====
const { getDB } = require("../db");


// ===== LOGIN VALIDATION =====

// Checks if the user's email and password exist in the "users" collection
exports.login = async (req, res) => {
  try {
    const db = getDB();
    // Clean the input data by removing extra spaces
    const email = req.body.email.trim();
    const password = req.body.password.trim();

    console.log("Checking DB for:", email);

    // Search for a user document that matches BOTH email and password
    const user = await db.collection("users").findOne({
      email: email,
      password: password,
    });

    if (user) {
      // Success: User found. Send their details back to the frontend
      console.log("MATCH FOUND:", user.email);
      return res.status(200).json({
        success: true,
        userId: user._id,
        userName: user.name,
        userSemester: user.semester,
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
};
