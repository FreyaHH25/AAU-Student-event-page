// 1. TEST DATA
const myEventsData = [
    {
        category: "Sports",
        title: "Basketball Tournament",
        description: "Come play basket in Hafniahallen",
        date: "Thursday, April 19, 2026",
        time: "15:00 - 19:00",
        location: "Hafniahallen, Copenhagen",
        attendees: 30,
        organizer: "Sports Committee",
        image: "images/basket.webp" 
    },
    {
        category: "Party",
        title: "Party at Jap's house",
        description: "First beer is free!",
        date: "Friday, April 26, 2026",
        time: "18:00 - 04:00",
        location: "At Jap's house",
        attendees: 120,
        organizer: "Japjot",
        image: "images/jap.jpg" 
    }
];

const upcomingEventsData = [
    {
        category: "Sports",
        title: "Yoga & Wellness",
        description: "Weekly yoga session for stress relief",
        date: "Saturday, April 21, 2026",
        time: "07:00 - 08:00",
        location: "Recreation Center",
        attendees: 25,
        organizer: "Wellness Club",
        image: "images/yoga.jpg" 
    },
    {
        category: "Party",
        title: "Software party at Hattenbar",
        description: "First beer is free!",
        date: "Friday, April 26, 2026",
        time: "18:00 - 04:00",
        location: "At Hady's house ",
        attendees: 120,
        organizer: "Overflow_SW",
        image: "images/hattenbar.png" 
    },
  
];

// Empty arrays for future events
const newlyAddedEventsData = [];
const pastEventsData = [];

// 2. FUNCTION TO BUILD EVENT CARDS
function createEventCardHTML(event) {
    return `
        <div class="event-card">
            <img src="${event.image}" alt="Image of ${event.title}" class="card-image">
            <div class="card-content">
                <span class="category-tag">${event.category}</span>
                <h3 class="card-title">${event.title}</h3>
                <p class="card-desc">${event.description}</p>
                <div class="card-info">
                    <p>📅 ${event.date}</p>
                    <p>🕒 ${event.time}</p>
                    <p>📍 ${event.location}</p>
                </div>
                <div class="card-footer">
                    <span>👥 ${event.attendees} attending</span>
                    <span>by ${event.organizer}</span>
                </div>
                <button class="read-more-btn">Read More &gt;</button>
            </div>
        </div>
    `;
}

// 3. SHOW EVENTS ON PAGE
function showEventsOnPage(eventList, containerId) {
    const container = document.getElementById(containerId);
    
    if (container) {
        container.innerHTML = ""; // Clear the container first
        
        eventList.forEach(function(singleEvent) {
            container.innerHTML += createEventCardHTML(singleEvent);
        });
    }
}

// Execute the function to display data
showEventsOnPage(myEventsData, "my-events");
showEventsOnPage(upcomingEventsData, "upcoming-events");
showEventsOnPage(newlyAddedEventsData, "newly-added-events");
showEventsOnPage(pastEventsData, "past-events");
