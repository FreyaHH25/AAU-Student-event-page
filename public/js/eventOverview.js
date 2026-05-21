
// ===== CONFIGURATION =====

// Load saved category filters from localStorage, defaulting to All if none are saved
window.selectedCategories = JSON.parse(localStorage.getItem("selectedCategories")) || ["All"];

// Global array holding all events fetched from the server
window.allEvents = [];

// Holds the current search bar input for filtering
let searchText = "";

// References to the event details modal and its action buttons
const modal = document.getElementById("event_info");
const closeButton = document.getElementById("modal-close-button");
const attendBtn = document.getElementById("attend-button");


// ===== INITIALISATION =====

// Fetch all events from the server on page load and distribute them into sections
document.addEventListener("DOMContentLoaded", async () => {
    const currentUserId = localStorage.getItem('userId');
    const userSemester = localStorage.getItem('userSemester');

    try {
        const response = await fetch('http://localhost:3000/api/events');
        const dbEvents = await response.json();

        window.allEvents = dbEvents;
        distributeEvents(dbEvents, userSemester, currentUserId);
    } catch (error) {
        console.error("Error fetching events:", error);
    }
});


// ===== EVENT DISTRIBUTION =====

// Sorts events into sections (attending, upcoming, past etc.) based on date and user info
function distributeEvents(events, userSemester, currentUserId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Returns true if the logged-in user's semester matches the event's visibility setting
    const hasAccess = (event) => {
        if (!userSemester) return true;
        const vis = Array.isArray(event.visibility) ? event.visibility : [event.visibility];
        return vis.some(v => {
            if (!v) return false;
            if (v.toString().toUpperCase() === "ALL") return true;
            return userSemester && v.toString().includes(userSemester);
        });
    };

    // Converts a date string to a Date object, returns a zero date if invalid
    const parseDate = (dateStr) => {
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? new Date(0) : d;
    };

    // Future events the user has signed up for
    const attendingEvents = events
        .filter((e) => Array.isArray(e.attending) && e.attending.includes(currentUserId) && parseDate(e.date) >= today)
        .sort((a, b) => parseDate(a.date) - parseDate(b.date));

    // Future events created by the logged-in user
    const myEvents = events
        .filter((e) => (e.organizerId || e.organizer) === currentUserId && parseDate(e.date) >= today)
        .sort((a, b) => parseDate(a.date) - parseDate(b.date));

    // All future events the user has access to, sorted by date
    const upcoming = events
        .filter((e) => parseDate(e.date) >= today && hasAccess(e))
        .sort((a, b) => parseDate(a.date) - parseDate(b.date));

    // All future events the user has access to, sorted by most recently added
    const newlyAdded = events
        .filter((e) => hasAccess(e) && parseDate(e.date) >= today)
        .slice()
        .reverse();

    // All past events, sorted newest to oldest
    const past = events
        .filter((e) => {
            const eventDate = parseDate(e.date);
            return eventDate < today && eventDate.getTime() !== new Date(0).getTime();
        })
        .sort((a, b) => parseDate(b.date) - parseDate(a.date));

    // Past events created by the logged-in user
    const myPastEvents = events
        .filter((e) => (e.organizerId || e.organizer) === currentUserId && parseDate(e.date) < today)
        .sort((a, b) => parseDate(b.date) - parseDate(a.date));

    // Render each filtered list into its corresponding section on the page
    renderEvents(filterEvents(attendingEvents), "attending-events");
    renderEvents(filterEvents(myEvents), "my-events");
    renderEvents(filterEvents(upcoming), "upcoming-events");
    renderEvents(filterEvents(newlyAdded), "newly-added-events");
    renderEvents(filterEvents(past), "past-events");
    renderEvents(filterEvents(myPastEvents), "my-past-events");
}

// ===== UI =====

// Builds and returns the HTML string for a single event card
function buildEventCardHTML(event) {
    const timeDisplay = event.time || `${event.startTime} - ${event.endTime}`;
    const displayOrganizer = event.organizer || "Student";
    const attendCount = event.attendeeNames
        ? event.attendeeNames.length
        : event.attending
            ? event.attending.length
            : 0;

    // Returns a large string of HTML code filled with the event's data.
    return `
        <div class="event-card">
            <img src="${event.imageUrl || 'public/images/aau-entrance.png'}" alt="${event.title}" class="card-image">
            <div class="card-content">
                <h3 class="card-title">${event.title}</h3>
                <div class="tags-row">
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

// Renders a list of events into the specified section container
function renderEvents(eventList, htmlContainerId) {
    const container = document.getElementById(htmlContainerId);
    if (container) {
        container.innerHTML =
            eventList.length === 0
                ? "<p class='no-events-message'>No events found here.</p>"
                : "";
        eventList.forEach(event => {
            container.innerHTML += buildEventCardHTML(event);
        });
    }
}


// ===== FILTERING =====

// Filters an event list by the active category selection and current search text
function filterEvents(eventList) {
    return eventList.filter(event => {
        const eventCatsLower = (event.categories || []).map(cat => cat.toString().toLowerCase());
        const selectedLower = window.selectedCategories.map(cat => cat.toString().toLowerCase());

        const matchesCategory =
            selectedLower.includes('all') ||
            selectedLower.some(cat => eventCatsLower.includes(cat));

        const matchesSearch =
            searchText === "" ||
            (event.title || "").toLowerCase().includes(searchText) ||
            (event.description || "").toLowerCase().includes(searchText);

        return matchesCategory && matchesSearch;
    });
}


// ===== SCROLL BUTTONS =====

// Adds left/right scroll functionality to each horizontal event section
document.querySelectorAll(".events-wrapper").forEach(wrapper => {
    const grid = wrapper.querySelector(".events-grid");
    const leftBtn = wrapper.querySelector(".scroll-btn.left");
    const rightBtn = wrapper.querySelector(".scroll-btn.right");
    const scrollAmount = 800;

    leftBtn.addEventListener("click", () => {
        grid.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    });

    rightBtn.addEventListener("click", () => {
        grid.scrollBy({ left: scrollAmount, behavior: "smooth" });
    });
});