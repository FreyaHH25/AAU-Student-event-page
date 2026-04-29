/* 1. GLOBAL STATE */
// These variables store the "memory" of your app while it's running
let displayedDate = new Date();  // The date/month the user is currently looking at
let currentView = 'monthly';    // Tracks if we are in 'monthly' or 'weekly' mode
let allEvents = [];             // A big list that holds all events fetched from the database
let selectedCategories = ['All']; // Selected categories for filtering

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

/* 2.5 FILTERING */
function getFilteredEvents() {
    if (selectedCategories.includes('All') || selectedCategories.length === 0) {
        return allEvents;
    }
    return allEvents.filter(event => {
        const category = Array.isArray(event.categories) ? event.categories[0] : event.category;
        return selectedCategories.includes(category);
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
    grid.classList.remove('weekly-view'); // Reset CSS to monthly layout
    grid.innerHTML = "";                   // Clear the grid to start fresh

    const year = displayedDate.getFullYear();
    const month = displayedDate.getMonth();
    const realToday = new Date(); // To check which day is "Today"
    
    // Arrays for naming months and days
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Update the top label (e.g., "April 2026")
    monthYearLabel.innerText = `${monthNames[month]} ${year}`;

    // Step 1: Draw the day headers (Sun, Mon, etc.)
    dayNames.forEach(name => {
        const header = document.createElement('div');
        header.classList.add('day-name');
        header.innerText = name;
        grid.appendChild(header);
    });

    // Step 2: Calculate empty spaces for the start of the month
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Fill in blanks for days from the previous month
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('day-cell', 'not-current-month');
        grid.appendChild(emptyCell);
    }

    // Step 3: Draw each actual day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('day-cell');

        // Highlight the cell if it's the actual current date
        if (day === realToday.getDate() && month === realToday.getMonth() && year === realToday.getFullYear()) {
            dayCell.classList.add('is-today');
        }

        // Format the date so we can find matching events in our data
        const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        // Filter: Only keep events for this date, reverse them, and keep only 5
        const todaysEvents = getFilteredEvents()
            .filter(event => event.date === dateString)
            .reverse() 
            .slice(0, 5);

        // Put the day number at the top of the cell
        let cellHTML = `<span class="day-number">${day}</span>`;

        // Create the small colored "pills" for each event
        todaysEvents.forEach(event => {
            const category = Array.isArray(event.categories)
            ? event.categories[0]
            : event.category;
            const categoryClass = `cat-${category || 'default'}`;
            cellHTML += `<div class="event-pill ${categoryClass}">${event.title}</div>`;
        });
        

        dayCell.innerHTML = cellHTML;
        grid.appendChild(dayCell);
    }
}

/* 5. WEEKLY VIEW (Dynamic Height Stacking) */
function renderWeekly(grid, monthYearLabel) {
    grid.classList.add('weekly-view'); // Use weekly CSS layout
    grid.innerHTML = "";               // Clear grid

    // Calculate the Sunday that started the current week
    const startOfWeek = new Date(displayedDate);
    startOfWeek.setDate(displayedDate.getDate() - displayedDate.getDay());
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    monthYearLabel.innerText = `Week of ${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()}`;

    // Create the top-left empty corner
    const corner = document.createElement('div');
    corner.classList.add('time-corner');
    grid.appendChild(corner);

    // Draw the 7 day headers for the week
    for (let i = 0; i < 7; i++) {
        const dayHeader = document.createElement('div');
        dayHeader.classList.add('day-name');
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + i);
        dayHeader.innerHTML = `${dayNames[i]}<br><small>${currentDay.getDate()}</small>`;
        grid.appendChild(dayHeader);
    }

    // Draw the 24 hour rows
    for (let hour = 0; hour < 24; hour++) {
        // Left-side time label (e.g., "09:00")
        const timeLabel = document.createElement('div');
        timeLabel.classList.add('time-cell');
        timeLabel.innerText = `${hour.toString().padStart(2, '0')}:00`;
        grid.appendChild(timeLabel);

        // Draw the 7 day-slots for this specific hour
        for (let day = 0; day < 7; day++) {
            const slot = document.createElement('div');
            slot.classList.add('slot-cell');
            
            // Allow the box to get taller if many events happen at once
            slot.style.height = "auto"; 
            slot.style.minHeight = "60px"; 

            const cellDate = new Date(startOfWeek);
            cellDate.setDate(startOfWeek.getDate() + day);
            const dateString = cellDate.toISOString().split('T')[0];

            // Filter: Find events that happen on this day AND start during this hour
            const hourlyEvents = getFilteredEvents().filter(e => {
                const startHour = parseInt(e.startTime.split(':')[0]);
                return e.date === dateString && startHour === hour;
            });

            // Create the event boxes
            hourlyEvents.forEach((e) => {
                const evEl = document.createElement('div');
                const categoryClass = `cat-${e.category || 'default'}`;
                evEl.classList.add('weekly-event-block', categoryClass);
                
                // Styling so they stack neatly on top of each other
                evEl.style.position = "relative";
                evEl.style.width = '94%'; 
                evEl.style.margin = '2px auto';
                evEl.style.height = 'auto'; 
                evEl.style.top = '0';

                evEl.innerHTML = `<strong>${e.title}</strong><br><small>${e.startTime}-${e.endTime}</small>`;
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

/* Filter button */
function startFilter() {
    const filterBtn = document.getElementById('open-filter-btn');
    const saveBtn = document.getElementById('save-filter-btn');
    const filterBox = document.getElementById('filter-panel');

    /* Open and close the filter box */
    filterBtn.addEventListener('click', () => {
        if (filterBox.style.display === 'block') {
            filterBox.style.display = 'none';
        } else {
            filterBox.style.display = 'block';
        }
    });

    /* Close the box when user clicks save and apply filter */
    saveBtn.addEventListener('click', () => {
        // Collect selected categories
        const checkboxes = filterBox.querySelectorAll('input[type="checkbox"]:checked');
        selectedCategories = Array.from(checkboxes).map(cb => cb.value);
        
        // Re-render the calendar with new filters
        renderCalendar();
        
        // Close the filter panel
        filterBox.style.display = 'none';
    });
}

/* Start calendar and filter when page opens */
window.onload = function () {
    fetchEventsFromServer();
    startFilter();
};