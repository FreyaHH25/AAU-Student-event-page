// Listen for the "submit" event on the form with the ID 'event-form'
document.getElementById('event-form').addEventListener('submit', async function(event) {
    // Preavent default
    // Forms normally refresh the whole page when submitted. 
    // This line stops that so we can handle the data in the background using JavaScript.
    event.preventDefault();

    // Get user id:
    // Retrieve the logged-in user's ID from local storage (saved during login).
    // This helps us connect the event to a specific user in the database.
    const loggedInUserId = localStorage.getItem('userId');

    // collect form data:
    // We create a JavaScript object containing all the values the user typed into the form.
    const newEventData = {
        title: document.getElementById('event-title').value,
        description: document.getElementById('event-description').value,
        category: document.getElementById('event-category').value,
        organizer: document.getElementById('event-organizer').value,
        organizerId: loggedInUserId, // Links to the user's ID in the 'users' collection
        date: document.getElementById('event-date').value,
        startTime: document.getElementById('event-starttime').value,
        endTime: document.getElementById('event-endtime').value,
        location: document.getElementById('event-location').value,
        visibility: document.getElementById('event-visibility').value,
        imageUrl: document.getElementById('event-image').value || "images/basket.jpg.webp" // can change to a balck image basket iamge just for test
    };

    try {
        // SEND DATA TO BACKEND:
        // We use fetch() to send the data to our Express server. 
        const response = await fetch('http://localhost:3000/api/events', {
            method: 'POST', // POST means we are sending new data to be created
            headers: {
                'Content-Type': 'application/json' // Tells the server we are sending JSON formatted data
            },
            // We must convert our javascript object into a JSON text string before sending it over the internet
            body: JSON.stringify(newEventData)
        });

        // handle server resopnse:
        // If the server replies with status 200/201 (OK)
        if (response.ok) {
            alert("Success! Your event has been saved to the UniEvent database.");
            document.getElementById('event-form').reset(); // Clear the input fields
            
            // Automatically redirect the user to the event overview page to see their new event
            window.location.href = "event_overview.html";
        } else {
            alert("Something went wrong on the server. Could not save the event.");
        }
        
    } catch (error) {
        // error handling:
        // If the fetch fails entirely (e.g., the server is not running)
        console.error("Connection error:", error);
        alert("Could not connect to the server. Please ensure your backend is running.");
    }
});
 