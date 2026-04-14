/*Here is the JS for Calendar.HTML IT STARTS HERE*/ 

/* 1. GLOBAL STATE: 
   We move these variables outside the function so the application 
   "remembers" which month the user is currently looking at.
*/
let displayedDate = new Date(); // This starts at today's date

/** * MAIN FUNCTION: renderCalendar
 * This function now uses 'displayedDate' to determine which month to draw.
 **/
function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthYearLabel = document.getElementById('display-month-year');
    const dateDisplay = document.getElementById('dynamic-date-display');
    
    // We clear the grid first (except the weekday names)
    // This removes the days from the previous month we were looking at
    const dayCells = grid.querySelectorAll('.day-cell');
    dayCells.forEach(cell => cell.remove());

    const year = displayedDate.getFullYear();
    const month = displayedDate.getMonth();
    
    // Get actual today's date for the "blue circle" and "Today" display
    const realToday = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
    
    // Set the headers
    monthYearLabel.innerText = `${monthNames[month]} ${year}`;
    dateDisplay.innerText = `${monthNames[realToday.getMonth()]} ${realToday.getDate()}`;

    // Logic to find first day and total days
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 2. Create Padding Cells
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('day-cell', 'not-current-month');
        grid.appendChild(emptyCell);
    }

    // 3. Create Actual Day Cells
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('day-cell');
        
        // Only show the blue circle if we are looking at the REAL current month/year
        if (day === realToday.getDate() && 
            month === realToday.getMonth() && 
            year === realToday.getFullYear()) {
            dayCell.classList.add('is-today');
        }

        dayCell.innerHTML = `<span class="day-number">${day}</span>`;
        
        // Hover effect logic
        dayCell.addEventListener('mouseenter', () => {
            dateDisplay.innerText = `${monthNames[month]} ${day}`;
        });
        dayCell.addEventListener('mouseleave', () => {
            dateDisplay.innerText = `${monthNames[realToday.getMonth()]} ${realToday.getDate()}`;
        });

        grid.appendChild(dayCell);
    }
}

/* 4. NAVIGATION CONTROLS:
   These listeners detect clicks on your arrows and update the 'displayedDate'.
*/

// Next Month Button
document.getElementById('next-month').addEventListener('click', () => {
    // We add 1 to the current month
    displayedDate.setMonth(displayedDate.getMonth() + 1);
    renderCalendar(); // Redraw the calendar with the new month
});

// Previous Month Button
document.getElementById('prev-month').addEventListener('click', () => {
    // We subtract 1 from the current month
    displayedDate.setMonth(displayedDate.getMonth() - 1);
    renderCalendar(); // Redraw the calendar
});

// "Today" Button: Resets the view to the current real date
document.getElementById('go-to-today').addEventListener('click', () => {
    displayedDate = new Date(); // Reset to system date
    renderCalendar();
});

// Initial call to draw the calendar when the page loads
window.onload = renderCalendar;

/*Here is the JS for Calendar.HTML IT ENDS HERE*/ 