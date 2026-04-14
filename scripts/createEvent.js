// test to see if js is loaded
console.log("JS loaded!");

/* code explanation
  document: retrieves the entire form data from the HTML page
  value: retrieves what the user wrote in the field
  getElementById: retrieves an element by its ID (from HTML)
  addEventListener: attaches an event handler to an element/lytter efter en handling
  */

// retrieve event data
document.getElementById("event-form").addEventListener("submit", function (e) {
  //e means information about the submit-action
  e.preventDefault(); // stops page reload

  const eventData = {
    title: document.getElementById("event-title").value,
    description: document.getElementById("event-description").value,
    category: document.getElementById("event-category").value,
    organizer: document.getElementById("event-organizer").value,
    date: document.getElementById("event-date").value,
    startTime: document.getElementById("event-starttime").value,
    endTime: document.getElementById("event-endtime").value,
    location: document.getElementById("event-location").value,
    visibility: document.getElementById("event-visibility").value,
    image: document.getElementById("event-image").value,
  };

  console.log(eventData); // for testing if the data is being captured correctly

  saveEvent(eventData);
});

// save event data to localStorage (the data can therefore be retrieved from localStorage in eventoverview.js to create the cards)
function saveEvent(event) {
  // Retrieve existing events from localStorage
  // JSON.parse: converts string back to array
  // || []: if nothing exists yet, start with empty array
  let events = JSON.parse(localStorage.getItem("events")) || [];

  // Add the new event to the array
  events.push(event);

  // Save the updated array back to localStorage
  // JSON.stringify: converts array to string (localStorage can only store strings)
  localStorage.setItem("events", JSON.stringify(events));
}
