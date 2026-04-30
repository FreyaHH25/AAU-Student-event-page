/* 1. KONFIGURATION OG INITIALISERING */

/* Variabel til at holde styr på hvilke kategorier der er valgt i filteret. Standard er alle */
window.selectedCategories = JSON.parse(localStorage.getItem('selectedCategories')) || ['All', 'Sports', 'Party', 'Free', 'Wellness', 'Food', 'Music', 'Outdoors', 'Academic', 'Social'];
/* Global variabel til at holde events */
window.allEvents = [];
let searchText = "";

/* Lytter efter hvornår HTML-dokumentet er helt indlæst, før koden kører */
document.addEventListener("DOMContentLoaded", async () => {
    /* Henter den loggede brugers unikke ID fra browserens lokale lager */
    const currentUserId = localStorage.getItem('userId'); 
    
    /* Henter brugerens semester (f.eks. "2 semester") for at tjekke adgangskrav */
    const userSemester = localStorage.getItem('userSemester');

    try {
        /* Forsøger at hente alle events fra databasen via API'et */
        const response = await fetch('http://localhost:3000/api/events');
        
        /* Omdanner serverens svar fra JSON til et læsbart JavaScript objekt (array) */
        const dbEvents = await response.json();

        /* Gemmer evenats globalt */
        window.allEvents = dbEvents;

        /* Sender de hentede events videre til sorterings-funktionen */
        distributeEvents(dbEvents, userSemester, currentUserId);

    } catch (error) {
        /* Hvis der sker en fejl i forbindelsen til serveren, logges den her */
        console.error("Error fetching events:", error);
    }
});

/* 2. DISTRIBUTION LOGIK (Sortering af events i rækker) */

function distributeEvents(events, userSemester, currentUserId) {
    window.allEvents = events;
    /* Opretter et dato-objekt for i dag og nulstiller tiden for nem sammenligning */
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    /* En indre funktion (helper), der tjekker om en bruger har lov til at se et specifikt event */
    const hasAccess = (event) => {
        /* Hvis brugeren ikke er logget ind, vises alle events for at sikre at gruppen kan se dem */
        if (!userSemester) {
            return true;
        }

        /* Sørger for at visibility altid er en liste (array), selvom det kun er én værdi */
        const vis = Array.isArray(event.visibility) ? event.visibility : [event.visibility];
        return vis.some(v => {
            if (!v) return false;
            /* Hvis eventet er sat til "ALL", har alle adgang */
            if (v.toString().toUpperCase() === "ALL") return true;
            /* Ellers tjekker den om brugerens semester er nævnt i adgangslisten */
            return userSemester && v.toString().includes(userSemester);
        });
    };

    /* En hjælpefunktion der sikkert omdanner en tekststreng til en brugbar JavaScript dato */
    const parseDate = (dateStr) => {
        const d = new Date(dateStr);
        /* Returnerer en meget gammel dato (år 1970) hvis datoen er ugyldig, for at undgå fejl */
        return isNaN(d.getTime()) ? new Date(0) : d;
    };

    /* RÆKKE 1: MINE EVENTS - Filtrerer events baseret på om ID'et matcher den loggede bruger */
    const myEvents = events.filter(e => {
        /* Tjekker om ID'et ligger i 'organizerId' eller 'organizer' feltet */
        const creatorId = e.organizerId || e.organizer; 
        return creatorId === currentUserId;
    });

    /* RÆKKE 2: KOMMENDE - Finder events der sker i dag eller fremover, som brugeren har adgang til */
    const upcoming = events.filter(e => parseDate(e.date) >= today && hasAccess(e))
                           .sort((a, b) => parseDate(a.date) - parseDate(b.date));

    /* RÆKKE 3: NYESTE - Viser de nyeste events i databasen først ved at vende listen om */
    const newlyAdded = events.filter(e => hasAccess(e)).slice().reverse();

    /* RÆKKE 4: TIDLIGERE - Finder events hvor datoen er før i dag */
    const past = events.filter(e => {
        const eventDate = parseDate(e.date);
        return eventDate < today && eventDate.getTime() !== new Date(0).getTime();
    }).sort((a, b) => parseDate(b.date) - parseDate(a.date));

    /* Kører visnings-funktionen for hver række og anvender det aktive kategori-filter */
    visEventsPåSiden(filtrerEvents(myEvents), "my-events");
    visEventsPåSiden(filtrerEvents(upcoming), "upcoming-events");
    visEventsPåSiden(filtrerEvents(newlyAdded), "newly-added-events");
    visEventsPåSiden(filtrerEvents(past), "past-events");
}

/* 3. UI FUNKTIONER (Generering af HTML) */

function skabEventKortHTML(event) {
    /* Samler start- og sluttid til én tekststreng. Bruger event.time hvis det findes */
    const timeDisplay = event.time || `${event.startTime} - ${event.endTime}`;
    
     /*Checks if it has a organizer name if not it just adds student*/
    const displayOrganizer = event.organizer || event.organizerName || "Student";

    /* Returnerer en stor blok HTML-kode med eventets data indsat de rigtige steder */
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
                    
                    <p><img src="images/icons/attending.png" class="info-icons"> ${event.attending || 0} attending</p>
                </div>
            </div>
            <button class="read-more-btn">Read More &gt;</button>
        </div>`;
}

/* 4. VIS PÅ SIDEN (Indsættelse i HTML) */

function visEventsPåSiden(eventListe, htmlKasseId) {
    /* Finder den specifikke række/kasse i HTML'en via dens ID */
    const kasse = document.getElementById(htmlKasseId);
    if (kasse) {
        /* Tømmer kassen for eksisterende indhold (f.eks. statiske test-kort) */
        kasse.innerHTML = ""; 
        /* Hvis listen er tom, viser vi en lille besked i stedet for et kort */
        if (eventListe.length === 0) {
            kasse.innerHTML = "<p style='padding: 20px; color: grey;'>No events found here.</p>";
            return;
        }
        /* Gennemgår hvert event i listen og tilføjer det genererede HTML til kassen */
        eventListe.forEach(event => {
            kasse.innerHTML += skabEventKortHTML(event);
        });
    }
}

/* 5. FILTRERING (Kategori-logik) */

function filtrerEvents(eventListe) {
    return eventListe.filter(event => {
        const eventCats = event.categories || [];
        const eventTitle = (event.title || "").toLowerCase();
        const eventDescription = (event.description || "").toLowerCase();
        const eventLocation = (event.location || "").toLowerCase();

        const selectedLower = window.selectedCategories.map(cat => cat.toString().toLowerCase());
        const eventCatsLower = eventCats.map(cat => cat.toString().toLowerCase());

        const matchesCategory =
            selectedLower.includes('all') ||
            selectedLower.length === 0 ||
            selectedLower.some(cat => eventCatsLower.includes(cat));

        const matchesSearch =
            searchText === "" ||
            eventTitle.includes(searchText) ||
            eventDescription.includes(searchText) ||
            eventLocation.includes(searchText);

        return matchesCategory && matchesSearch;
    });
}

/* 6. NAVIGATION OG FILTRE (Interaktion) */

/* Opsætter venstre/højre scroll-knapper for alle event-rækker på siden */
document.querySelectorAll(".events-wrapper").forEach(wrapper => {
    const grid = wrapper.querySelector(".events-grid");
    const scrollAmount = 330; /* Bredden på et kort inklusiv gap */
    
    /* Ruller rækken til højre ved klik */
    wrapper.querySelector(".right").addEventListener("click", () => grid.scrollBy({ left: scrollAmount * 2, behavior: "smooth" }));
    
    /* Ruller rækken til venstre ved klik */
    wrapper.querySelector(".left").addEventListener("click", () => grid.scrollBy({ left: -scrollAmount * 2, behavior: "smooth" }));
});

function startSearch() {
    const searchInput = document.querySelector('.search-input');

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener('input', () => {
        searchText = searchInput.value.toLowerCase();

        const currentUserId = localStorage.getItem('userId');
        const userSemester = localStorage.getItem('userSemester');

        distributeEvents(window.allEvents, userSemester, currentUserId);
    });
}

