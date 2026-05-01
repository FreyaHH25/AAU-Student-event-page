/* 1. GLOBAL STATE */
// These variables store the "memory" of your app while it's running
let displayedDate = new Date();  // The date/month the user is currently looking at
let currentView = 'monthly';    // Tracks if we are in 'monthly' or 'weekly' mode
let allEvents = [];             // A big list that holds all events fetched from the database
let selectedCategories = JSON.parse(localStorage.getItem('selectedCategories')) || ['All'];
let searchText = "";
/* 1.5 USER PROFILE */
function loadUserProfile() {
    // Looks for 'userName' in the browser's memory
    const storedName = localStorage.getItem('userName');
    
    // Finds the <p class="user-name"> element in your HTML
    const userNameElement = document.querySelector('.user-name');
    
    // If a name was found in memory, replace "John Doe" with that name
    if (userNameElement && storedName) {
        userNameElement.innerText = storedName;
    }
}

/* 2. FETCH DATA */
async function fetchEventsFromServer() {
    try {
        // Asks the server for the events
        const response = await fetch('http://localhost:3000/api/events');
        // Turns the server's raw data into a JavaScript list (array)
        allEvents = await response.json();
        // Now that we have data, draw the calendar
        renderCalendar(); 
    } catch (error) {
        // If the server is off or the URL is wrong, show an error in the console
        console.error("Error loading events:", error);
    }
}

/* 2.5 FILTERING AND SEARCHING */
function getFilteredEvents() {
    const selectedLower = selectedCategories.map(cat => cat.toString().toLowerCase());
    
    return allEvents.filter(event => {
        const categories = Array.isArray(event.categories)
            ? event.categories
            : event.category ? [event.category] : [];
        const eventCatsLower = categories.map(cat => cat.toString().toLowerCase());

        const matchesCategory =
            selectedLower.includes('all') ||
            selectedLower.length === 0 ||
            selectedLower.some(cat => eventCatsLower.includes(cat));

        const matchesSearch =
            searchText === "" ||
            (event.title || "").toLowerCase().includes(searchText) ||
            (event.description || "").toLowerCase().includes(searchText) ||
            (event.location || "").toLowerCase().includes(searchText);

        return matchesCategory && matchesSearch;
    });
}

/* 3. MAIN RENDER */
function renderCalendar() {
    // Finds the HTML elements where the calendar and the title (Month/Year) go
    const grid = document.getElementById('calendar-grid');
    const monthYearLabel = document.getElementById('display-month-year');
    
    // Decides which specific drawing function to use based on the current view
    if (currentView === 'monthly') {
        renderMonthly(grid, monthYearLabel);
    } else {
        renderWeekly(grid, monthYearLabel);
    }
}

/* 4. MONTHLY VIEW (Max 5, Newest First) */
function renderMonthly(grid, monthYearLabel) {
    grid.classList.remove('weekly-view');
    grid.innerHTML = ""; 

    const year = displayedDate.getFullYear();
    const month = displayedDate.getMonth();
    const realToday = new Date();
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    monthYearLabel.innerText = `${monthNames[month]} ${year}`;

    dayNames.forEach(name => {
        const header = document.createElement('div');
        header.classList.add('day-name');
        header.innerText = name;
        grid.appendChild(header);
    });

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('day-cell', 'not-current-month');
        grid.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('day-cell');

        if (day === realToday.getDate() && month === realToday.getMonth() && year === realToday.getFullYear()) {
            dayCell.classList.add('is-today');
        }

        const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        const todaysEvents = getFilteredEvents()
            .filter(event => event.date === dateString)
            .reverse() 
            .slice(0, 5);

        // 1. Set the day number first
        dayCell.innerHTML = `<span class="day-number">${day}</span>`;

        // 2. Add pills as objects (DO NOT use cellHTML here)
        todaysEvents.forEach(event => {
            const category = Array.isArray(event.categories) ? event.categories[0] : event.category;
            const categoryClass = `cat-${category || 'default'}`;
            
            const pill = document.createElement('div');
            pill.classList.add('event-pill', categoryClass);
            pill.innerText = event.title;
            pill.style.cursor = "pointer";
        
            pill.addEventListener('click', (e) => {
                e.stopPropagation();
                openEventModal(event);
            });
        
            dayCell.appendChild(pill); // This adds it safely without overwriting the number
        });
        
        grid.appendChild(dayCell);
    }
}

/* 5. WEEKLY VIEW (Dynamic Height Stacking) */
function renderWeekly(grid, monthYearLabel) {
    grid.classList.add('weekly-view');
    grid.innerHTML = "";

    const startOfWeek = new Date(displayedDate);
    startOfWeek.setDate(displayedDate.getDate() - displayedDate.getDay());
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    monthYearLabel.innerText = `Week of ${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()}`;

    const corner = document.createElement('div');
    corner.classList.add('time-corner');
    grid.appendChild(corner);

    for (let i = 0; i < 7; i++) {
        const dayHeader = document.createElement('div');
        dayHeader.classList.add('day-name');
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + i);
        dayHeader.innerHTML = `${dayNames[i]}<br><small>${currentDay.getDate()}</small>`;
        grid.appendChild(dayHeader);
    }

    for (let hour = 0; hour < 24; hour++) {
        const timeLabel = document.createElement('div');
        timeLabel.classList.add('time-cell');
        timeLabel.innerText = `${hour.toString().padStart(2, '0')}:00`;
        grid.appendChild(timeLabel);

        for (let day = 0; day < 7; day++) {
            const slot = document.createElement('div');
            slot.classList.add('slot-cell');
            slot.style.height = "auto"; 
            slot.style.minHeight = "60px"; 

            const cellDate = new Date(startOfWeek);
            cellDate.setDate(startOfWeek.getDate() + day);
            const dateString = cellDate.toISOString().split('T')[0];

            const hourlyEvents = getFilteredEvents().filter(e => {
                const startHour = parseInt(e.startTime.split(':')[0]);
                return e.date === dateString && startHour === hour;
            });

            hourlyEvents.forEach((e) => {
                const evEl = document.createElement('div');
                const categoryClass = `cat-${e.category || 'default'}`;
                evEl.classList.add('weekly-event-block', categoryClass);
                evEl.style.cursor = "pointer";
                evEl.style.position = "relative";
                evEl.style.width = '94%'; 
                evEl.style.margin = '2px auto';

                evEl.innerHTML = `<strong>${e.title}</strong><br><small>${e.startTime}-${e.endTime}</small>`;
                
                evEl.addEventListener('click', () => {
                    openEventModal(e);
                });

                slot.appendChild(evEl);
            });

            grid.appendChild(slot);
        }
    }
}

/* 6. CONTROLS */
// Handle clicks on "Monthly" or "Weekly" buttons
document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active'); // Highlight current button
        currentView = btn.getAttribute('data-view');
        renderCalendar();
    });
});

// Handle the "Next" button
document.getElementById('next-month').addEventListener('click', () => {
    // If monthly, move by 1 month. If weekly, move by 7 days.
    currentView === 'monthly' ? displayedDate.setMonth(displayedDate.getMonth() + 1) : displayedDate.setDate(displayedDate.getDate() + 7);
    renderCalendar();
});

// Handle the "Previous" button
document.getElementById('prev-month').addEventListener('click', () => {
    currentView === 'monthly' ? displayedDate.setMonth(displayedDate.getMonth() - 1) : displayedDate.setDate(displayedDate.getDate() - 7);
    renderCalendar();
});

// Handle the "Today" button
document.getElementById('go-to-today').addEventListener('click', () => {
    displayedDate = new Date();
    renderCalendar();
});

// INITIAL BOOTUP: When the page finishes loading, go get the data
// window.onload = fetchEventsFromServer; // Removed duplicate


function startSearch() {
    const searchInput = document.querySelector('.search-input');
    
    searchInput.addEventListener('input', function() {
        searchText = searchInput.value.toLowerCase();
        renderCalendar();
    });
}
/* Start calendar and filter when page opens */
window.addEventListener('DOMContentLoaded', () => {
    fetchEventsFromServer();
    loadUserProfile();
    startSearch(); 
});

function openEventModal(event) {
    const modal = document.getElementById("event_info");
    const modalAttendBtn = document.getElementById("attend-button");
    
    // 1. Tag the modal with the event ID
    modal.setAttribute("data-current-event-id", event._id || event.id);

    // 2. Prepare attendee data
    const attendeesIDs = Array.isArray(event.attending) ? event.attending : [];
    const namesArray = Array.isArray(event.attendeeNames) ? event.attendeeNames : [];

    document.getElementById("modal-attendees").innerText = attendeesIDs.length;

    // 3. Set Attend button state
    const currentUserId = localStorage.getItem('userId');
    const isAlreadyAttending = attendeesIDs.includes(currentUserId);
    
    if (modalAttendBtn) {
        modalAttendBtn.classList.toggle("attending", isAlreadyAttending);
        modalAttendBtn.textContent = isAlreadyAttending ? "Attending ✔️" : "Attend event";
    }
    
    // 4. Update the name list
    updateModalAttendeeList(namesArray.length > 0 ? namesArray : attendeesIDs.map(() => "Student"));
    
    // 5. Fill text fields
    document.getElementById("modal-title").innerText = event.title;
    document.getElementById("modal-description").innerText = event.description || "No description provided.";
    document.getElementById("modal-location").innerText = event.location || "TBA";
    document.getElementById("modal-date").innerText = event.date;
    document.getElementById("modal-time").innerText = `${event.startTime} - ${event.endTime}`;
    document.getElementById("modal-organizer").innerText = event.organizer || "Anonymous";

    const modalImg = document.getElementById("modal-image");
    modalImg.src = event.image || 'images/orangestage.jpg';

    // 6. Delete button setup
    const deleteBtn = document.getElementById("delete-button");
    if (deleteBtn) {
        deleteBtn.setAttribute("data-id", event._id || event.id);
    }

    modal.classList.remove("hidden");
}
// Close modal logic
document.getElementById("modal-close-button").addEventListener("click", () => {
    document.getElementById("event_info").classList.add("hidden");
});

// Close if clicking outside the box
window.addEventListener("click", (event) => {
    const modal = document.getElementById("event_info");
    if (event.target === modal) {
        modal.classList.add("hidden");
    }
});

document.getElementById("delete-button").addEventListener("click", async () => {
    const deleteBtn = document.getElementById("delete-button");
    const eventId = deleteBtn.getAttribute("data-id");

    if (!eventId) return;

    if (confirm("Are you sure you want to delete this event?")) {
        try {
            const response = await fetch(`http://localhost:3000/api/events/${eventId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert("Event deleted successfully!");
                // Refresh data without reloading the whole page
                fetchEventsFromServer(); 
                document.getElementById("event_info").classList.add("hidden");
            } else {
                alert("Failed to delete event.");
            }
        } catch (error) {
            console.error("Error deleting:", error);
        }
    }
});

/* ATTEND BUTTON LOGIC FOR CALENDAR */
const attendBtn = document.getElementById("attend-button");

if (attendBtn) {
    attendBtn.addEventListener("click", async function () {
        const currentUserId = localStorage.getItem('userId');
        const modal = document.getElementById("event_info");
        const eventId = modal.getAttribute("data-current-event-id");

        if (!currentUserId) return alert("Please log in to attend events!");

        try {
            const response = await fetch(`http://localhost:3000/api/events/${eventId}/attend`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId })
            });

            if (response.ok) {
                const updatedData = await response.json();
                const names = updatedData.attendeeNames || [];
                
                // Update the count and the button style immediately
                document.getElementById("modal-attendees").innerText = names.length;
                this.classList.toggle("attending", updatedData.attending.includes(currentUserId));
                this.textContent = updatedData.attending.includes(currentUserId) ? "Attending ✔️" : "Attend event";
                
                // Refresh the list of names shown in the modal
                updateModalAttendeeList(names);

                // IMPORTANT: Update our local 'allEvents' array so the calendar 
                // stays updated without a page reload
                const eventIndex = allEvents.findIndex(ev => (ev._id || ev.id) === eventId);
                if (eventIndex !== -1) {
                    allEvents[eventIndex].attending = updatedData.attending;
                    allEvents[eventIndex].attendeeNames = names;
                }
            }
        } catch (error) {
            console.error("Attend Error:", error);
        }
    });
}
function updateModalAttendeeList(names) {
    const list = document.getElementById("modal-list");
    if (!list) return;
    
    list.innerHTML = ""; // Clear the old list
    
    if (!names || names.length === 0) {
        list.innerHTML = "<li>No one attending yet.</li>";
        return;
    }

    names.forEach(name => {
        const li = document.createElement("li");
        li.style.padding = "5px 0";
        li.innerHTML = `👤 ${name}`;
        list.appendChild(li);
    });
}