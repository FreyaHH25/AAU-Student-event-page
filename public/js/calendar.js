// ===== GLOBAL STATE =====
let displayedDate = new Date(); // The month/week currently shown on the calendar
let currentView = "monthly"; // Tracks whether the user is in monthly or weekly view
window.allEvents = []; // All events fetched from the server
let selectedCategories = JSON.parse(localStorage.getItem("selectedCategories")) || ["All"];
let searchText = "";

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// References to the event details modal and its action buttons
const modal = document.getElementById("event_info");
const closeButton = document.getElementById("modal-close-button");
const attendBtn = document.getElementById("attend-button");


// ===== DATA FETCHING =====

// Fetches all events from the server and triggers the initial calendar render
async function fetchEventsFromServer() {
  try {
    const response = await fetch("http://localhost:3000/api/events");
    window.allEvents = await response.json();
    renderCalendar();
  } catch (error) {
    console.error("Error loading events:", error);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  fetchEventsFromServer();
});


// ===== FILTERING =====

// Returns events filtered by the active category selection and current search text
function getFilteredEvents() {
  const selectedLower = selectedCategories.map((cat) => cat.toString().toLowerCase());

  return allEvents.filter((event) => {
    const categories = Array.isArray(event.categories)
      ? event.categories
      : event.category
        ? [event.category]
        : [];

    const eventCatsLower = categories.map((cat) => cat.toString().toLowerCase());

    const matchesCategory =
      selectedLower.includes("all") ||
      selectedLower.length === 0 ||
      selectedLower.some((cat) => eventCatsLower.includes(cat));

    const matchesSearch =
      searchText === "" ||
      (event.title || "").toLowerCase().includes(searchText) ||
      (event.description || "").toLowerCase().includes(searchText) ||
      (event.location || "").toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });
}


// ===== CALENDAR RENDER =====

// Decides which view to render based on the current view state
function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  const monthYearLabel = document.getElementById("display-month-year");

  if (currentView === "monthly") {
    renderMonthly(grid, monthYearLabel);
  } else {
    renderWeekly(grid, monthYearLabel);
  }
}


// ===== MONTHLY VIEW =====

// Renders a full month grid with up to 5 events per day, sorted by start time
function renderMonthly(grid, monthYearLabel) {
  grid.classList.remove("weekly-view");
  grid.innerHTML = "";

  const year = displayedDate.getFullYear();
  const month = displayedDate.getMonth();
  const realToday = new Date();

  document.getElementById("dynamic-date-display").innerText =
    `${monthNames[realToday.getMonth()]} ${realToday.getDate()}`;

  monthYearLabel.innerText = `${monthNames[month]} ${year}`;

  // Render day name headers
  dayNames.forEach((name) => {
    const header = document.createElement("div");
    header.classList.add("day-name");
    header.innerText = name;
    grid.appendChild(header);
  });

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Add empty cells before the first day of the month
  for (let i = 0; i < firstDayIndex; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.classList.add("day-cell", "not-current-month");
    grid.appendChild(emptyCell);
  }

  // Render each day cell with its events
  for (let day = 1; day <= daysInMonth; day++) {
    const dayCell = document.createElement("div");
    dayCell.classList.add("day-cell");

    if (
      day === realToday.getDate() &&
      month === realToday.getMonth() &&
      year === realToday.getFullYear()
    ) {
      dayCell.classList.add("is-today");
    }

    const dateString = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

    // Filter events for this day, sort by start time, limit to 5
    const todaysEvents = getFilteredEvents()
      .filter((event) => event.date === dateString)
      .sort((a, b) => {
        if (a.startTime < b.startTime) return -1;
        if (a.startTime > b.startTime) return 1;
        return 0;
      })
      .slice(0, 5);

    dayCell.innerHTML = `<span class="day-number">${day}</span>`;

    // Render each event as a clickable pill
    todaysEvents.forEach((event) => {
      const category = Array.isArray(event.categories)
        ? event.categories[0]
        : event.category;

      const categoryClass = `cat-${category || "default"}`;
      const pill = document.createElement("button");
      pill.type = "button";
      pill.classList.add("event-pill", categoryClass, "read-more-btn");
      pill.innerText = event.title;
      pill.setAttribute("data-id", event._id || event.id);

      dayCell.appendChild(pill);
    });

    grid.appendChild(dayCell);
  }
}


// ===== WEEKLY VIEW =====

// Renders a week grid with hourly time slots from 06:00 to 23:00, sorted by start time
function renderWeekly(grid, monthYearLabel) {
  grid.classList.add("weekly-view");
  grid.innerHTML = "";

  const startOfWeek = new Date(displayedDate);
  startOfWeek.setDate(displayedDate.getDate() - displayedDate.getDay());

  monthYearLabel.innerText = `Week of ${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()}`;

  // Empty corner cell to align time labels with day columns
  const corner = document.createElement("div");
  corner.classList.add("time-corner");
  grid.appendChild(corner);

  // Render day name headers with date numbers
  for (let i = 0; i < 7; i++) {
    const dayHeader = document.createElement("div");
    dayHeader.classList.add("day-name");
    const currentDay = new Date(startOfWeek);
    currentDay.setDate(startOfWeek.getDate() + i);
    dayHeader.innerHTML = `${dayNames[i]}<br><small>${currentDay.getDate()}</small>`;
    grid.appendChild(dayHeader);
  }

  // Render one row per hour
  for (let hour = 6; hour < 24; hour++) {
    const timeLabel = document.createElement("div");
    timeLabel.classList.add("time-cell");
    timeLabel.innerText = `${hour.toString().padStart(2, "0")}:00`;
    grid.appendChild(timeLabel);

    // Render a slot cell for each day in this hour row
    for (let day = 0; day < 7; day++) {
      const slot = document.createElement("div");
      slot.classList.add("slot-cell");

      const cellDate = new Date(startOfWeek);
      cellDate.setDate(startOfWeek.getDate() + day);
      const dateString = cellDate.toISOString().split("T")[0];

      // Get events starting in this hour slot, sorted by start time
      const hourlyEvents = getFilteredEvents()
        .filter((e) => {
          const startHour = parseInt(e.startTime.split(":")[0]);
          return e.date === dateString && startHour === hour;
        })
        .sort((a, b) => {
          if (a.startTime < b.startTime) return -1;
          if (a.startTime > b.startTime) return 1;
          return 0;
        });

      // Render each event as a clickable block
      hourlyEvents.forEach((e) => {
        const evEl = document.createElement("div");
        const category = Array.isArray(e.categories) ? e.categories[0] : e.category;
        const catClass = `cat-${(category || "default").toLowerCase()}`;

        evEl.className = `weekly-event-block event-pill ${catClass} read-more-btn`;
        evEl.setAttribute("data-id", e._id || e.id);
        evEl.innerHTML = `<strong>${e.title}</strong><br><small>${e.startTime}-${e.endTime}</small>`;

        slot.appendChild(evEl);
      });

      grid.appendChild(slot);
    }
  }
}


// ===== CONTROLS =====

// Switch between monthly and weekly view
document.querySelectorAll(".view-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".view-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active"); // Highlight current button
    currentView = btn.getAttribute("data-view");
    renderCalendar();
  });
});

// Navigate forward by 1 month or 7 days depending on the current view
document.getElementById("next-month").addEventListener("click", () => {
  currentView === "monthly"
    ? displayedDate.setMonth(displayedDate.getMonth() + 1)
    : displayedDate.setDate(displayedDate.getDate() + 7);
  renderCalendar();
});

// Navigate backward by 1 month or 7 days depending on the current view
document.getElementById("prev-month").addEventListener("click", () => {
  currentView === "monthly"
    ? displayedDate.setMonth(displayedDate.getMonth() - 1)
    : displayedDate.setDate(displayedDate.getDate() - 7);
  renderCalendar();
});

// Jump back to the current date with the "Today" button
document.getElementById("go-to-today").addEventListener("click", () => {
  displayedDate = new Date();
  renderCalendar();
});


// ===== SEARCH =====

// Filters the calendar on every keystroke in the search bar
function startSearch() {
  const searchInput = document.querySelector(".search-input");
  if (!searchInput) return;

  searchInput.addEventListener("input", function () {
    searchText = searchInput.value.toLowerCase();
    renderCalendar();
  });
}

