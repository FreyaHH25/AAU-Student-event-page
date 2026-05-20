/* 1. GLOBAL STATE */
// These variables store the "memory" of your app while it's running
let displayedDate = new Date(); // The date/month the user is currently looking at
let currentView = "monthly"; // Tracks if we are in 'monthly' or 'weekly' mode
window.allEvents = []; // A big list that holds all events fetched from the database
let selectedCategories = JSON.parse(
  localStorage.getItem("selectedCategories"),
) || ["All"];
let searchText = "";

  const monthNames = ["January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"];
    
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Grabs references to specific HTML elements for the event info popup (modal).
const modal = document.getElementById("event_info");
const closeButton = document.getElementById("modal-close-button");
const attendBtn = document.getElementById("attend-button");


/* 2. FETCH DATA */
async function fetchEventsFromServer() {
  try {
    // Asks the server for the events
    const response = await fetch("http://localhost:3000/api/events");
    // Turns the server's raw data into a JavaScript list (array)
    window.allEvents = await response.json();
    // Now that we have data, draw the calendar
    renderCalendar();
  } catch (error) {
    // If the server is off or the URL is wrong, show an error in the console
    console.error("Error loading events:", error);
  }
}

/* Start calendar and filter when page opens */
window.addEventListener("DOMContentLoaded", () => {
  fetchEventsFromServer();
});

/* 2.5 FILTERING AND SEARCHING */
function getFilteredEvents() {
  const selectedLower = selectedCategories.map((cat) =>
    cat.toString().toLowerCase(),
  );

  return allEvents.filter((event) => {
    const categories = Array.isArray(event.categories)
      ? event.categories
      : event.category
        ? [event.category]
        : [];
    const eventCatsLower = categories.map((cat) =>
      cat.toString().toLowerCase(),
    );

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

/* 3. MAIN RENDER */
function renderCalendar() {
  // Finds the HTML elements where the calendar and the title (Month/Year) go
  const grid = document.getElementById("calendar-grid");
  const monthYearLabel = document.getElementById("display-month-year");

  // Decides which specific drawing function to use based on the current view
  if (currentView === "monthly") {
    renderMonthly(grid, monthYearLabel);
  } else {
    renderWeekly(grid, monthYearLabel);
  }
}

/* 4. MONTHLY VIEW (Max 5, Newest First) */
function renderMonthly(grid, monthYearLabel) {
  grid.classList.remove("weekly-view");
  grid.innerHTML = "";

  const year = displayedDate.getFullYear();
  const month = displayedDate.getMonth();
  const realToday = new Date();

  document.getElementById("dynamic-date-display").innerText =
  `${monthNames[realToday.getMonth()]} ${realToday.getDate()}`;

  monthYearLabel.innerText = `${monthNames[month]} ${year}`;

  dayNames.forEach((name) => {
    const header = document.createElement("div");
    header.classList.add("day-name");
    header.innerText = name;
    grid.appendChild(header);
  });

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDayIndex; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.classList.add("day-cell", "not-current-month");
    grid.appendChild(emptyCell);
  }

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

    // Fixed Logic: Filter by date FIRST, then sort by time
    const todaysEvents = getFilteredEvents()
      .filter((event) => event.date === dateString) // This line was missing!
      .sort((a, b) => {
        // Compare start times (Earliest first)
        if (a.startTime < b.startTime) return -1;
        if (a.startTime > b.startTime) return 1;
        return 0;
      })
      .slice(0, 5); // Take only the 5 earliest events for THIS day

    // 1. Set the day number first
    dayCell.innerHTML = `<span class="day-number">${day}</span>`;

    // 2. Add pills as objects
    todaysEvents.forEach((event) => {
      const category = Array.isArray(event.categories)
        ? event.categories[0]
        : event.category;
      const categoryClass = `cat-${category || "default"}`;

      const pill = document.createElement("button");
      pill.type = "button";
      pill.classList.add("event-pill", categoryClass, "read-more-btn");

      pill.innerText = event.title;
      pill.style.cursor = "pointer";
      pill.setAttribute("data-id", event._id || event.id);

      dayCell.appendChild(pill); // This adds it safely without overwriting the number
    });

    grid.appendChild(dayCell);
  }
}

/* 5. WEEKLY VIEW (Dynamic Height Stacking) */
function renderWeekly(grid, monthYearLabel) {
  grid.classList.add("weekly-view");
  grid.innerHTML = "";

  const startOfWeek = new Date(displayedDate);
  startOfWeek.setDate(displayedDate.getDate() - displayedDate.getDay());

  monthYearLabel.innerText = `Week of ${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()}`;

  const corner = document.createElement("div");
  corner.classList.add("time-corner");
  grid.appendChild(corner);

  for (let i = 0; i < 7; i++) {
    const dayHeader = document.createElement("div");
    dayHeader.classList.add("day-name");
    const currentDay = new Date(startOfWeek);
    currentDay.setDate(startOfWeek.getDate() + i);
    dayHeader.innerHTML = `${dayNames[i]}<br><small>${currentDay.getDate()}</small>`;
    grid.appendChild(dayHeader);
  }

  for (let hour = 6; hour < 24; hour++) {
    const timeLabel = document.createElement("div");
    timeLabel.classList.add("time-cell");
    timeLabel.innerText = `${hour.toString().padStart(2, "0")}:00`;
    grid.appendChild(timeLabel);

    for (let day = 0; day < 7; day++) {
      const slot = document.createElement("div");
      slot.classList.add("slot-cell");
      slot.style.height = "auto";
      slot.style.minHeight = "60px";

      const cellDate = new Date(startOfWeek);
      cellDate.setDate(startOfWeek.getDate() + day);
      const dateString = cellDate.toISOString().split("T")[0];

      // 1. Get events for this hour
      const hourlyEvents = getFilteredEvents()
        .filter((e) => {
          const startHour = parseInt(e.startTime.split(":")[0]);
          return e.date === dateString && startHour === hour;
        })
        // 2. SORT so 12:00 appears before 12:45
        .sort((a, b) => {
          if (a.startTime < b.startTime) return -1;
          if (a.startTime > b.startTime) return 1;
          return 0;
        });

      // 3. Draw the events in the sorted order
      hourlyEvents.forEach((e) => {
        const evEl = document.createElement("div");

        const category = Array.isArray(e.categories)
          ? e.categories[0]
          : e.category;
        const catClass = `cat-${(category || "default").toLowerCase()}`;

        evEl.className = `weekly-event-block event-pill ${catClass} read-more-btn`;
        evEl.setAttribute("data-id", e._id || e.id);

        evEl.style.height = "auto";
        evEl.style.minHeight = "40px";
        evEl.style.padding = "5px";
        evEl.style.cursor = "pointer";
        evEl.style.border = "none";

        evEl.innerHTML = `<strong>${e.title}</strong><br><small>${e.startTime}-${e.endTime}</small>`;

        slot.appendChild(evEl);
      });

      grid.appendChild(slot);
    }
  }
}

/* 6. CONTROLS */
// Handle clicks on "Monthly" or "Weekly" buttons
document.querySelectorAll(".view-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".view-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active"); // Highlight current button
    currentView = btn.getAttribute("data-view");
    renderCalendar();
  });
});

// Handle the "Next" button
document.getElementById("next-month").addEventListener("click", () => {
  // If monthly, move by 1 month. If weekly, move by 7 days.
  currentView === "monthly"
    ? displayedDate.setMonth(displayedDate.getMonth() + 1)
    : displayedDate.setDate(displayedDate.getDate() + 7);
  renderCalendar();
});

// Handle the "Previous" button
document.getElementById("prev-month").addEventListener("click", () => {
  currentView === "monthly"
    ? displayedDate.setMonth(displayedDate.getMonth() - 1)
    : displayedDate.setDate(displayedDate.getDate() - 7);
  renderCalendar();
});

// Handle the "Today" button
document.getElementById("go-to-today").addEventListener("click", () => {
  displayedDate = new Date();
  renderCalendar();
});

// INITIAL BOOTUP: When the page finishes loading, go get the data
// window.onload = fetchEventsFromServer; // Removed duplicate

function startSearch() {
  const searchInput = document.querySelector(".search-input");
  if (!searchInput) return;

  searchInput.addEventListener("input", function () {
    searchText = searchInput.value.toLowerCase();
    console.log(
      "search triggered:",
      searchText,
      "allEvents:",
      allEvents.length,
    );
    renderCalendar();
  });
}

