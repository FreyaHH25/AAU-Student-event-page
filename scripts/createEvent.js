// test to see if js is loaded
console.log("JS loaded!");

/* code explanation
  document: retrieves the entire form data from the HTML page
  value: retrieves what the user wrote in the field
  getElementById: retrieves an element by its ID (from HTML)
  addEventListener: attaches an event handler to an element/lytter efter en handling
  */

//EVENTHANDLER
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

// FUNCTION THAT SENDS DATA TO SERVER
// async makes it possible to use await inside the function
async function saveEvent(event) {
  try {
    // Sends a POST request to backend (the server)
    const res = await fetch("http://..", {
      //MANGLER
      method: "POST", // we want to create (send) data
      headers: {
        "Content-Type": "application/json",
        // tells the server that we are sending JSON data
      },
      body: JSON.stringify(event),
      // converts JavaScript object → JSON string
    });
    // Waits for a response from the server and converts it to JSON
    const data = await res.json();
    console.log(data);
    // shows the saved event (which comes back from the database)
  } catch (err) {
    console.error(err);
    // if something goes wrong (e.g. server down), show the error in console
  }
}
