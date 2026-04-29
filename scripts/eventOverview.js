// wait for page to load
// 'DOMContentLoaded' ensures this script only runs AFTER the HTML page is completely loaded.
document.addEventListener("DOMContentLoaded", async () => {
    const userSemester = localStorage.getItem('userSemester');

    // Find the container in the HTML where we want to insert the event cards
    const container = document.getElementById('newly-added-events');

    try {
        // Fetch data from backend (GET REQUEST):
        // We ask our Express server for all the events stored in the database.
        // Fetch defaults to a get request, so we don't need to specify the method.
        const response = await fetch('http://localhost:3000/api/events');

        // Convert the JSON text response back into a readable JavaScript array
        const events = await response.json();

        // clear previous content:         MUST BE ACTIVATED BY HADY WHEN IT'S ALL UP AND RUNNING
        // Empty the container to remove any hardcoded HTML or loading messages
        // container.innerHTML = '';

        // Loop through events:
        // We go through each event we got from the database, one by one.
        // Loop through events from server:
        events.forEach(event => {
            const userSemester = localStorage.getItem('userSemester');
             /*1. Normalize visibility to always be an array
             If it's a string like "ALL", it becomes ["ALL"] */
            const visibilityArray = Array.isArray(event.visibility)
            ? event.visibility
            : [event.visibility];

            const canSee = visibilityArray.some(visGroup => {
                // Safety check: skip if visGroup is null/undefined
                if (!visGroup) return false;
                // Convert to string in case of weird data types
                const value = visGroup.toString();
                // Check for ALL
                if (value.toUpperCase() === "ALL") {
                    return true;
                }
                // Check for semester match (handling comma-separated lists)
                if (userSemester) {
                    const allowedSemesters = value.split(',').map(s => s.trim());
                    return allowedSemesters.includes(userSemester);
                }
                return false;    
    });
            if (canSee) {
             // Map server field names to the names used in your HTML template function

            const mappedEvent = {
                imageUrl: event.imageUrl || "images/basket.webp",
                title: event.title,
                // Ensure this matches the key 'categories' you sent from createEvent.js
                categories: event.categories || ["General"],
                description: event.description,
                date: event.date,
                time: `${event.startTime} - ${event.endTime}`,
                location: event.location,
                attending: 0,
                organizer: event.organizer || "Student"
            };

            // Use your existing "skabEventKortHTML" function to get the nice HTML
            const cardHTML = skabEventKortHTML(mappedEvent);

            // Create a temporary div to turn the string into an actual element
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = cardHTML;

            // Append the first child (the .event-card) to your container
            container.appendChild(tempDiv.firstElementChild);
            }
        });
        // If the database successfully answered, but there were 0 events inside:
        if (events.length === 0) {
            container.innerHTML = '<p>No events found. Create one to get started!</p>';
        }

    } catch (error) {          /// MUST BE ACTIVATED BY HADY WHEN IT'S ALL UP AND RUNNING
        // ERROR HANDLING:
        // If the fetch fails e.g., server is down, show a helpful error message on the page.
        //console.error("Error fetching events:", error);
        //container.innerHTML = '<p>Could not load events. Is your Express server running in the terminal?</p>';
    }
});

//*************************************************** */
// TEST EVENTS MUST BE DELETED AFTER WE FINISH DESIGN
/**************************************************** */
const myEventsData = [
    {
        categories: ["Social"],
        title: "Jumping contest",
        description: "Come play basket in Hafniahallen",
        date: "Thursday, april 19, 2026",
        time: "15:00 - 19:00",
        location: "Hafniahallen, Copenhagen",
        attending: 30,
        organizer: "sportsudvalget",
        imageUrl: "images/betaboulders.jpg"
    },
    {
        categories: ["Sports"],
        title: "Basketball Tournament",
        description: "Come play basket in Hafniahallen",
        date: "Thursday, april 19, 2026",
        time: "15:00 - 19:00",
        location: "Hafniahallen, Copenhagen",
        attending: 30,
        organizer: "sportsudvalget",
        imageUrl: "images/basket.webp" // her pager vi på basket-billefet 
    },
    {
        categories: ["Party"],
        title: "Fest hos Japot",
        description: "First beer is free! Come join the biggest, baddest party to ever have been hosted on AAU CPH! Jap will personally bring the beers to each guest, while dressed as a minion!",
        date: "Friday, april 26, 2026",
        time: "18:00 - 04:00",
        location: "Hos Jap ",
        attending: 120,
        organizer: "Japjot",
        imageUrl: "images/jap.jpg"
    }

];

const upcomingEventsData = [
    {
        categories: ["Sports"],
        title: "Yoga & Wellness",
        description: "Weekly yoga session for stress relief",
        date: "Saturday, april 21, 2026",
        time: "07:00 - 08:00",
        location: "Recreation Center",
        attending: 25,
        organizer: "Wellness Club",
        imageUrl: "images/yoga.jpg"
    },

]

// (tilføje events manual til 'newly added' og past senere)
const newlyAddedEventsData = [
    {
        categories: ["Sports"],
        title: "fest hos Japot",
        description: "First beer is free!",
        date: "Friday, april 26, 2026",
        time: "18:00 - 04:00",
        location: "Hos Jap ",
        attending: 120,
        organizer: "Japjot",
        imageUrl: "images/jap.jpg"
    },

];
const pastEventsData = [
    {
        categories: ["Sports"],
        title: "Software party at Hattenbar",
        description: "First beer is free!",
        date: "Friday, april 26, 2026",
        time: "18:00 - 04:00",
        location: "hos hady",
        attending: 120,
        organizer: "Overflow_SW",
        imageUrl: "images/hattenbar.png"
    },
];

let valgtKategori = "All";

// 2. FUNKTIONEN DER BYGGER KORTENE (Vores skabelon)
// Denne funktion tager ét event ad gangen og forvandler det til HTML.
function skabEventKortHTML(event) {
    return `
        <div class="event-card">
            <img src="${event.imageUrl}" alt="Billede af ${event.title}" class="card-image">
            
            <div class="card-content">
            <h3 class="card-title">${event.title}</h3>
            
            <div class="tags-row" style="display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 10px;">
                ${event.categories ? event.categories.map(cat => `<span class="tag-visuel tag-${cat.toLowerCase()}">${cat}</span>`).join('') : `<span class="tag-visuel tag-general">General</span>`}
            </div>

                <p class="card-desc">${event.description}</p>
                <div class="card-info">
                    <p><img src="images/icons/date.png" alt="icon" class="info-icons"> ${event.date}</p>
                    <p><img src="images/icons/time.png" alt="icon" class="info-icons"> ${event.time}</p>
                    <p><img src="images/icons/location.png" alt="icon" class="info-icons"> ${event.location}</p>
                    <p><img src="images/icons/organizer.png" alt="icon" class="info-icons"> ${event.organizer}</p>
                    <p><img src="images/icons/attending.png" alt="icon" class="info-icons"> ${event.attending} attending</p>
                </div>
                </div>
                <button class="read-more-btn">Read More &gt;</button>
        </div>
    `;
}
/* This function checks which category is chosen and only keeps those events */
function filtrerEvents(eventListe) {
    if (valgtKategori === "All") {
        return eventListe;
    }

    return eventListe.filter(function (event) {
        return event.categories.includes(valgtKategori);
    });
}

// Denne funktion går igennem en liste med events og sætter dem ind i den rigtige kasse.
function visEventsPåSiden(eventListe, htmlKasseId) {
    const kasse = document.getElementById(htmlKasseId);

    // Hvis kassen findes på siden
    if (kasse) {
        // Tøm kassen først (så vi ikke får dubletter)
        kasse.innerHTML = "";

        // Gå igennem hvert event i listen og tilføj dets HTML til kassen
        eventListe.forEach(function (enkeltEvent) {
            kasse.innerHTML += skabEventKortHTML(enkeltEvent);
        });
    }
}

// vise vores test-data i de rigtige kasser:
function visAlleEvents() {
    visEventsPåSiden(filtrerEvents(myEventsData), "my-events");
    visEventsPåSiden(filtrerEvents(upcomingEventsData), "upcoming-events");
    visEventsPåSiden(filtrerEvents(newlyAddedEventsData), "newly-added-events");
    visEventsPåSiden(filtrerEvents(pastEventsData), "past-events");
}

visAlleEvents();



/*Function for click-scrolling like on netflix*/
document.querySelectorAll(".events-wrapper").forEach(wrapper => {
    const grid = wrapper.querySelector(".events-grid");
    const leftBtn = wrapper.querySelector(".left");
    const rightBtn = wrapper.querySelector(".right");

    const scrollAmount = 330; // card width + gap

    rightBtn.addEventListener("click", () => {
        grid.scrollBy({ left: scrollAmount * 2, behavior: "smooth" });
    });

    leftBtn.addEventListener("click", () => {
        grid.scrollBy({ left: -scrollAmount * 2, behavior: "smooth" });
    });
});

/* Filter button */
function startFilter() {
    const filterBtn = document.getElementById('open-filter-btn');
    const saveBtn = document.getElementById('save-filter-btn');
    const filterBox = document.getElementById('filter-panel');

    /* open and close filter */
    filterBtn.addEventListener('click', () => {
        if (filterBox.style.display === 'block') {
            filterBox.style.display = 'none';
        } else {
            filterBox.style.display = 'block';
        }
    });

    /* save and close */
    saveBtn.addEventListener('click', () => {
        const checkedBox = document.querySelector('#filter-panel input[type="checkbox"]:checked');

        if (checkedBox) {
            valgtKategori = checkedBox.value;
        } else {
            valgtKategori = "All";
        }

        visAlleEvents();
        filterBox.style.display = 'none';
    });
}

startFilter();