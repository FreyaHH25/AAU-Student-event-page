/* 1. KONFIGURATION OG INITIALISERING (Setup and Startup) */

// Sets up selected categories by loading them from the browser's storage (localStorage). 
// If nothing is stored, it defaults to a full list of categories.
window.selectedCategories = JSON.parse(localStorage.getItem('selectedCategories')) || ['All', 'Sports', 'Party', 'Free', 'Wellness', 'Food', 'Music', 'Outdoors', 'Academic', 'Social'];

// A global container (array) to keep track of all event data retrieved from the server.
window.allEvents = [];

// A global string variable to hold whatever the user types into the search bar.
let searchText = "";

// Grabs references to specific HTML elements for the event info popup (modal).
const modal = document.getElementById("event_info");
const closeButton = document.getElementById("modal-close-button");
const attendBtn = document.getElementById("attend-button");

// This runs as soon as the website finishes loading its basic structure.
document.addEventListener("DOMContentLoaded", async () => {
    // Retrieves the unique ID and semester of the logged-in user from storage.
    const currentUserId = localStorage.getItem('userId');
    const userSemester = localStorage.getItem('userSemester');

    try {
        // --- COMMUNICATION WITH SERVER ---
        // Sends a request to the backend server to get the list of events.
        const response = await fetch('http://localhost:3000/api/events');
        // Converts the server's response into a usable JavaScript list (JSON).
        const dbEvents = await response.json();

        // Saves the fetched events into our global variable.
        window.allEvents = dbEvents;
        
        // Calls the logic to sort these events into 'Upcoming', 'Past', etc., based on user info.
        distributeEvents(dbEvents, userSemester, currentUserId);
        
        // Starts the "listening" process for the search bar.
        startSearch();

    } catch (error) {
        // If the server is down or there is a bug in the fetch, it logs the error here.
        console.error("Error fetching events:", error);
    }
});

/* 2. DISTRIBUTION LOGIK (Sorting events into categories) */

function distributeEvents(events, userSemester, currentUserId) {
    // Gets the current date/time and resets the clock to midnight for accurate day-to-day comparison.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Internal check: determines if the user is allowed to see an event based on their semester.
    const hasAccess = (event) => {
        if (!userSemester) return true; // If no user semester is set, show everything.
        const vis = Array.isArray(event.visibility) ? event.visibility : [event.visibility];
        return vis.some(v => {
            if (!v) return false;
            if (v.toString().toUpperCase() === "ALL") return true; // Accessible to everyone.
            return userSemester && v.toString().includes(userSemester); // Accessible if semester matches.
        });
    };

    // Helper: Turns a date string from the database into a real JavaScript Date object.
    const parseDate = (dateStr) => {
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? new Date(0) : d; // Returns a "zero date" if the date is broken.
    };

    // Filter: Events where the current user ID exists in the attending array
    const attendingEvents = events.filter(e => Array.isArray(e.attending) && e.attending.includes(currentUserId));
    // Filter: Finds events where the logged-in user is listed as the creator/organizer.
    const myEvents = events.filter(e => (e.organizerId || e.organizer) === currentUserId);
    
    // Filter: Finds future events that the user has permission to see, sorted by date (closest first).
    const upcoming = events.filter(e => parseDate(e.date) >= today && hasAccess(e))
                           .sort((a, b) => parseDate(a.date) - parseDate(b.date));
    
    // Filter: Takes events the user can see and reverses the order to show the most recently added first.
    const newlyAdded = events.filter(e => hasAccess(e)).slice().reverse();
    
    // Filter: Finds events that have already happened, sorted newest to oldest.
    const past = events.filter(e => {
        const eventDate = parseDate(e.date);
        return eventDate < today && eventDate.getTime() !== new Date(0).getTime();
    }).sort((a, b) => parseDate(b.date) - parseDate(a.date));

    // Displays the filtered and sorted lists into the correct sections on the webpage.
    visEventsPåSiden(filtrerEvents(attendingEvents), "attending-events");
    visEventsPåSiden(filtrerEvents(myEvents), "my-events");
    visEventsPåSiden(filtrerEvents(upcoming), "upcoming-events");
    visEventsPåSiden(filtrerEvents(newlyAdded), "newly-added-events");
    visEventsPåSiden(filtrerEvents(past), "past-events");
}

/* 3. UI FUNKTIONER (Building the visuals) */

// This function creates the actual HTML code for one event card.
function skabEventKortHTML(event) {
    // Decides whether to show a specific time or a start/end range.
    const timeDisplay = event.time || `${event.startTime} - ${event.endTime}`;
    // Defaults to "Student" if no specific organizer name is found.
    const displayOrganizer = event.organizer || "Student";
    // Calculates how many people are attending (counts the items in the attendee list).
    const attendCount = event.attendeeNames ? event.attendeeNames.length : (event.attending ? event.attending.length : 0);

    // Returns a large string of HTML code filled with the event's data.
    return `
        <div class="event-card">
            <img src="${event.imageUrl || 'images/basket.webp'}" alt="${event.title}" class="card-image">
            <div class="card-content">
                <h3 class="card-title">${event.title}</h3>
                <div class="tags-row" style="display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 10px;">
                    ${(event.categories || ["General"]).map(cat => `<span class="tag-visuel tag-${cat.toLowerCase()}">${cat}</span>`).join('')}
                </div>
                <p class="card-desc">${event.description}</p>
                <div class="card-info">
                    <p><img src="images/icons/date.png" class="info-icons"> ${event.date}</p>
                    <p><img src="images/icons/time.png" class="info-icons"> ${timeDisplay}</p>
                    <p><img src="images/icons/location.png" class="info-icons"> ${event.location}</p>
                    <p><img src="images/icons/organizer.png" class="info-icons"> ${displayOrganizer}</p>
                    <p><img src="images/icons/attending.png" class="info-icons"> ${attendCount} attending</p>
                </div>
            </div>
            <button class="read-more-btn" data-id="${event._id || event.id}">Read More &gt;</button>
        </div>`;
}

// Injects the generated HTML into a specific container on the webpage.
function visEventsPåSiden(eventListe, htmlKasseId) {
    const kasse = document.getElementById(htmlKasseId);
    if (kasse) {
        // If the list is empty, show a grey message. Otherwise, clear the box and add cards.
        kasse.innerHTML = eventListe.length === 0 ? "<p style='padding: 20px; color: grey;'>No events found here.</p>" : "";
        eventListe.forEach(event => { kasse.innerHTML += skabEventKortHTML(event); });
    }
}

/* 4. FILTRERING (The Search and Category Filter) */

function filtrerEvents(eventListe) {
    return eventListe.filter(event => {
        // Converts all categories to lowercase so the search isn't picky about capital letters.
        const eventCatsLower = (event.categories || []).map(cat => cat.toString().toLowerCase());
        const selectedLower = window.selectedCategories.map(cat => cat.toString().toLowerCase());
        
        // Logic: matches if 'All' is picked OR if the event's category matches one of the user's picks.
        const matchesCategory = selectedLower.includes('all') || selectedLower.some(cat => eventCatsLower.includes(cat));
        
        // Logic: matches if search is empty OR if the title/description contains the search text.
        const matchesSearch = searchText === "" || 
            (event.title || "").toLowerCase().includes(searchText) || 
            (event.description || "").toLowerCase().includes(searchText);

        // Returns true only if the event passes both the category AND search tests.
        return matchesCategory && matchesSearch;
    });
}

async function loadModal() {
    const res = await fetch("components/modal.html");
    const html = await res.text();
    document.body.insertAdjacentHTML("beforeend", html);
}

window.addEventListener("DOMContentLoaded", loadModal);