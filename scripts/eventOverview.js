// wait for page to load
// 'DOMContentLoaded' ensures this script only runs AFTER the HTML page is completely loaded.
document.addEventListener("DOMContentLoaded", async () => {
    
    // Find the container in the HTML where we want to insert the event cards
    const container = document.getElementById('newly-added-events');

    try {
        // Fetch data from backend (GET REQUEST):
        // We ask our Express server for all the events stored in the database.
        // Fetch defaults to a get request, so we don't need to specify the method.
        const response = await fetch('http://localhost:3001/api/events');

        // Convert the JSON text response back into a readable JavaScript array
        const events = await response.json();

        // clear previous content:         MUST BE ACTIVATED BY HADY WHEN IT'S ALL UP AND RUNNING
        // Empty the container to remove any hardcoded HTML or loading messages
       // container.innerHTML = '';

        // Loop through events:
        // We go through each event we got from the database, one by one.
        events.forEach(event => {
            // Create a new empty <div> element for the event card
            const eventCard = document.createElement('div');
            // Add a CSS class so it gets the styling 
            eventCard.className = 'event-card'; 

            // Inject HTML content:
            // fill the <div> with HTML, inserting the data from our database using ${...}
            eventCard.innerHTML = `
                <img src="${event.imageUrl}" alt="${event.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px;">
                <h3>${event.title}</h3>
                <p><strong>Organizer ID:</strong> ${event.organizerId || 'N/A'}</p> 
                <p><strong>Location:</strong> ${event.location}</p>
                <p>${event.description}</p>
            `;
            
            // Add to page:
            // Attach the finished event card to the container on the webpage
            container.appendChild(eventCard);
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
        kategori: "Sports",
        titel: "Basketball Tournament",
        beskrivelse: "Come play basket in Hafniahallen",
        dato: "Thursday, april 19, 2026",
        tid: "15:00 - 19:00",
        sted: "Hafniahallen, Copenhagen",
        deltagere: 30,
        arrangoer: "sportsudvalget",
        billede: "images/basket.webp" // her pager vi på basket-billefet 
    },
    
];

const upcomingEventsData = [
    {
        kategori: "Sports",
        titel: "Yoga & Wellness",
        beskrivelse: "Weekly yoga session for stress relief",
        dato: "Saturday, april 21, 2026",
        tid: "07:00 - 08:00",
        sted: "Recreation Center",
        deltagere: 25,
        arrangoer: "Wellness Club",
        billede: "images/yoga.jpg" // her peger vi på yoga-billedet
    },
   
]

// (tilføje events manual til 'newly added' og past senere)
const newlyAddedEventsData = [
    {
        kategori: "Party",
        titel: "fest hos Japot",
        beskrivelse: "First beer is free!",
        dato: "Friday, april 26, 2026",
        tid: "18:00 - 04:00",
        sted: "Hos Jap ",
        deltagere: 120,
        arrangoer: "Japjot",       
        billede: "images/jap.jpg"   // her pager vi på jap's-billedet
    },
    
];
const pastEventsData = [
    {
        kategori: "Party",
        titel: "Software party at Hattenbar",
        beskrivelse: "First beer is free!",
        dato: "Friday, april 26, 2026",
        tid: "18:00 - 04:00",
        sted: "hos hady",
        deltagere: 120,
        arrangoer: "Overflow_SW",
        billede: "images/hattenbar.png" // her pager vi på hattenbar-billedet
    },
];

// 2. FUNKTIONEN DER BYGGER KORTENE (Vores skabelon)
// Denne funktion tager ét event ad gangen og forvandler det til HTML.
function skabEventKortHTML(event) {
    return `
        <div class="event-card">
            
            <img src="${event.billede}" alt="Billede af ${event.titel}" class="card-image">
            
            <div class="card-content">
                <span class="category-tag">${event.kategori}</span>
                <h3 class="card-title">${event.titel}</h3>
                <p class="card-desc">${event.beskrivelse}</p>
                <div class="card-info">
                    <p>📅 ${event.dato}</p>
                    <p>🕒 ${event.tid}</p>
                    <p>📍 ${event.sted}</p>
                </div>
                <div class="card-footer">
                    <span>👥 ${event.deltagere} attending</span>
                    <span>by ${event.arrangoer}</span>
                </div>
                <button class="read-more-btn">Read More &gt;</button>
            </div>
        </div>
    `;
}

// Denne funktion går igennem en liste med events og sætter dem ind i den rigtige kasse.
function visEventsPåSiden(eventListe, htmlKasseId) {
    const kasse = document.getElementById(htmlKasseId);
    
    // Hvis kassen findes på siden
    if (kasse) {
        // Tøm kassen først (så vi ikke får dubletter)
        kasse.innerHTML = ""; 
        
        // Gå igennem hvert event i listen og tilføj dets HTML til kassen
        eventListe.forEach(function(enkeltEvent) {
            kasse.innerHTML += skabEventKortHTML(enkeltEvent);
        });
    }
}

// vise vores test-data i de rigtige kasser:
visEventsPåSiden(myEventsData, "my-events");
visEventsPåSiden(upcomingEventsData, "upcoming-events");
visEventsPåSiden(newlyAddedEventsData, "newly-added-events");
visEventsPåSiden(pastEventsData, "past-events");