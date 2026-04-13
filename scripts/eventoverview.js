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
    }
    
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
   
]

// (tilføje events manual til 'newly added' og past senere)
const newlyAddedEventsData = [];
const pastEventsData = [];

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