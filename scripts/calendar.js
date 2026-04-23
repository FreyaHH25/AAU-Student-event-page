/* 1. The brain GLOBAL STATE */
/* This keeps track of what the user is looking at, even when we switch functions */
let displayedDate = new Date(); 
let currentView = 'monthly'; // Tracks if we are in 'monthly' or 'weekly'

/**
 * MAIN FUNCTION: renderCalendar
 * Decides whether to draw the Month or the Week based on currentView.
 **/
function renderCalendar() {
    /* Grab the actual HTML boxes where we want to draw stuff */
    const grid = document.getElementById('calendar-grid');
    const monthYearLabel = document.getElementById('display-month-year');
    
    // Clear the grid (except the weekday names)
    const dayCells = grid.querySelectorAll('.day-cell');
    dayCells.forEach(cell => cell.remove());
/* Simple logic: Are we in month mode or week mode? Call the right helper. */
    if (currentView === 'monthly') {
        renderMonthly(grid, monthYearLabel);
    } else {
        renderWeekly(grid, monthYearLabel);
    }
}

function renderMonthly(grid, monthYearLabel) {
    /* Reset the grid style and clear all HTML inside it to start fresh */
    grid.classList.remove('weekly-view');
    grid.innerHTML = ""; // Clear everything (including old headers)
/* Get the numbers we need: what year is it? what month? */
    const year = displayedDate.getFullYear();
    const month = displayedDate.getMonth();
    const realToday = new Date();// We need "right now" to highlight today's date
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    /* Set the big title at the top (e.g., "October 2026") */
    monthYearLabel.innerText = `${monthNames[month]} ${year}`;

    /* Draw the headers: Sun, Mon, Tue... at the top of the grid */
    dayNames.forEach(name => {
        const header = document.createElement('div');
        header.classList.add('day-name');
        header.innerText = name;
        grid.appendChild(header);
    });
/* CALENDAR MATH: 
       firstDayIndex: What day of the week does the 1st fall on? (0 for Sunday, 1 for Monday...)
       daysInMonth: A trick to get the last day of the month by asking for "day 0" of the next month. */
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

/* Padding: If the month starts on a Tuesday, we need 2 empty boxes for Sun/Mon 
       so the "1st" aligns correctly under Tuesday. */
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('day-cell', 'not-current-month');
        grid.appendChild(emptyCell);
    }
/* Loop through every day of the month (1 to 31) and create a box for it */
    // Actual day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('day-cell');
        /* If this box is actually 'today', give it a special CSS class to make it glow or change color */
        if (day === realToday.getDate() && month === realToday.getMonth() && year === realToday.getFullYear()) {
            dayCell.classList.add('is-today');
        }
/* Put the number inside the box */
        dayCell.innerHTML = `<span class="day-number">${day}</span>`;
        
        /* HOVER Logic: When mouse enters a box, update a tiny display somewhere 
           to show the date. When it leaves, set it back to "Today". */
        dayCell.addEventListener('mouseenter', () => {
            document.getElementById('dynamic-date-display').innerText = `${monthNames[month]} ${day}`;
        });
        dayCell.addEventListener('mouseleave', () => {
            document.getElementById('dynamic-date-display').innerText = `${monthNames[realToday.getMonth()]} ${realToday.getDate()}`;
        });
/* Put the finished day box into the grid */
        grid.appendChild(dayCell);
    }
}
function renderWeekly(grid, monthYearLabel) {
    const realToday = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    /* Change the grid to 8 columns (1 for time labels + 7 for days) */
    // 1. Setup the grid for 8 columns
    grid.classList.add('weekly-view');
    grid.innerHTML = ""; 
/* MATH: Find the Sunday that started this current week */
    // Calculate start of the week
    const startOfWeek = new Date(displayedDate);
    startOfWeek.setDate(displayedDate.getDate() - displayedDate.getDay());
    monthYearLabel.innerText = `Week of ${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()}`;

    // 2. Create the Header Row (Empty corner + 7 Day Names)
    const corner = document.createElement('div');
    corner.classList.add('time-corner');
    grid.appendChild(corner);
/* Create the 7 day headers at the top (e.g., "Mon 14") */
    for (let i = 0; i < 7; i++) {
        const dayHeader = document.createElement('div');
        dayHeader.classList.add('day-name');
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + i);
        dayHeader.innerHTML = `${dayNames[i]}<br><small>${currentDay.getDate()}</small>`;
        grid.appendChild(dayHeader);
    }

    // 3. Create the Time Rows (00:00 to 23:00)
    for (let hour = 0; hour < 24; hour++) {
        // Add Time Label (e.g., 08:00)
        const timeLabel = document.createElement('div');
        timeLabel.classList.add('time-cell');
        timeLabel.innerText = `${hour.toString().padStart(2, '0')}:00`;
        grid.appendChild(timeLabel);

        // Add 7 Slots for that hour
        for (let day = 0; day < 7; day++) {
            const slot = document.createElement('div');
            slot.classList.add('slot-cell');
            
            // Check if this slot is "Today" to highlight the column
            /* If this column belongs to "Today", give it a super faint background 
               so the user can see which column is the current day */
            const checkDay = new Date(startOfWeek);
            checkDay.setDate(startOfWeek.getDate() + day);
            if (checkDay.toDateString() === realToday.toDateString()) {
                slot.style.backgroundColor = "rgba(59, 130, 246, 0.03)";
            }

            grid.appendChild(slot);
        }
    }
}
/* NAVIGATION & VIEW CONTROLS/ BUTTON CONTROLS */

// Switch between Monthly and Weekly
document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        /* visual: remove 'active' color from old button, add to new one */
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        /* Update the view mode and redraw the whole thing */
        currentView = btn.getAttribute('data-view');
        renderCalendar();
    });
});

// Next Button logic
document.getElementById('next-month').addEventListener('click', () => {
    if (currentView === 'monthly') {
        /* Move 1 month ahead */
        displayedDate.setMonth(displayedDate.getMonth() + 1);
    } else {
        /* Move 7 days ahead */
        displayedDate.setDate(displayedDate.getDate() + 7);
    }
    renderCalendar();
});
//test
// Previous Button Logic
document.getElementById('prev-month').addEventListener('click', () => {
    if (currentView === 'monthly') {
        /* Go back 1 month */
        displayedDate.setMonth(displayedDate.getMonth() - 1);
    } else {
        /* Go back 7 days */
        displayedDate.setDate(displayedDate.getDate() - 7);
    }
    renderCalendar();
});

// Today Button( The "Today" button: Just resets everything to the current real-time date )
document.getElementById('go-to-today').addEventListener('click', () => {
    displayedDate = new Date();
    renderCalendar();
});

/* Start the app for the first time when the page finishes loading */
window.onload = renderCalendar;
