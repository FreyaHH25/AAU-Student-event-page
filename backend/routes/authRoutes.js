// ===== AUTH ROUTES =====

// Defines which URLs exist for authentication
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.login); // POST /api/login

module.exports = router;
