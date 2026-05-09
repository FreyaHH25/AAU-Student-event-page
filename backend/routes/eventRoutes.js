/** --- EVENT ROUTES --- **/
// Defines which URLs exist for events - the actual logic lives in the controller
const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

router.get("/", eventController.getAllEvents); // GET    /api/events
router.get("/:id", eventController.getEventById); // GET    /api/events/:id
router.post("/", eventController.createEvent); // POST   /api/events
router.patch("/:id", eventController.updateEvent); // PATCH  /api/events/:id
router.delete("/:id", eventController.deleteEvent); // DELETE /api/events/:id
router.patch("/:id/attend", eventController.toggleAttendance); // PATCH /api/events/:id/attend

module.exports = router;
