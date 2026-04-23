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
        titel: "Fest Hos Japot!",
        beskrivelse: "First beer is free! Here the event-organizers will write about the event and what it is all about! Details will include yap yap yap.",
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

];

const newlyAddedEventsData = [
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
const pastEventsData = [
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

// 2. FUNKTIONEN DER BYGGER KORTENE (Vores skabelon)
// Denne funktion tager ét event ad gangen og forvandler det til HTML.
function skabEventKortHTML(event) {
    return `
        <div class="event-card">
            <img src="${event.billede}" alt="Billede af ${event.titel}" class="card-image">
            
            <div class="card-content">
            <h3 class="card-title">${event.titel}</h3>
            
            <div class="tags-row">
                <span class="category-tag">${event.kategori}</span>
                <div class="tag-grid">


            </div>
            </div>

                <p class="card-desc">${event.beskrivelse}</p>
                <div class="card-info">
                    <p><img src="images/icons/date.png" alt="icon" class="info-icons"> ${event.dato}</p>
                    <p><img src="images/icons/time.png" alt="icon" class="info-icons"> ${event.tid}</p>
                    <p><img src="images/icons/location.png" alt="icon" class="info-icons"> ${event.sted}</p>
                </div>
                <div class="card-footer">
                <div class="attending-row">
                <img src="images/icons/attending.png" alt="icon" class="info-icons">
                    <span> ${event.deltagere} attending</span>
                    </div>
                <div class="organizer-row">
                <img src="images/icons/organizer.png" alt="icon" class="info-icons">

                    <span> ${event.arrangoer}</span>
                </div>
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
        eventListe.forEach(function (enkeltEvent) {
            kasse.innerHTML += skabEventKortHTML(enkeltEvent);
        });
    }
}

// vise vores test-data i de rigtige kasser:
visEventsPåSiden(myEventsData, "my-events");
visEventsPåSiden(upcomingEventsData, "upcoming-events");
visEventsPåSiden(newlyAddedEventsData, "newly-added-events");
visEventsPåSiden(pastEventsData, "past-events");




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