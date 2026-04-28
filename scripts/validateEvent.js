function validateEvent(event) {
  const errors = [];

  if (!event.title || event.title.trim() === "") {
    errors.push("Title is required");
  }
  if (event.title && event.title.length > 100) {
    errors.push("Title is too long (max 100 characters)");
  }
  if (event.organizer && event.organizer.length > 30) {
  errors.push("Organizer name is too long (max 30 characters)");
  }
  if (!event.date) {
    errors.push("Date is required");
  }

  // Check that the date is from tomorrow or later
  if (event.date) {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (eventDate < tomorrow) {
      errors.push("Event date must be in the future (from tomorrow)");
    }
  }

  if (!event.startTime || !event.endTime) {
    errors.push("Start and end time are required");
  }
  if (event.startTime && event.endTime && event.endTime <= event.startTime) {
    errors.push("End time must be after start time");
  }
  if (!event.categories || event.categories.length === 0) {
    errors.push("Please select at least one category");
  }
  if (event.categories && event.categories.length > 3) {
    errors.push("You can select a maximum of 3 categories");
  }

  return {
    valid: errors.length === 0,
    errors: errors,
  };
}

// Allows the function to be imported by Jest in Node.js,
// while still working in the browser
if (typeof module !== "undefined" && module.exports) {
  module.exports = validateEvent;
}
