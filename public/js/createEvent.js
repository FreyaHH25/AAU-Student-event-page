// ===== CATEGORY TAGS =====

// Stores the categories the user has selected (max 3)
let selectedCategories = [];

const categorySelect = document.getElementById("event-category");
const tagsDisplay = document.getElementById("selected-tags-display");
const userSemester = localStorage.getItem('userSemester');


// ===== EDIT MODE =====

// Check if the page was opened in edit mode via a URL parameter (e.g. ?edit=abc123)
const urlParams = new URLSearchParams(window.location.search);
const editEventId = urlParams.get('edit');

if (editEventId) {
  // Update page text to reflect edit mode
  document.querySelector('.title_with_icon').innerHTML = `
    <img src="images/icons/create_icon.png" alt="icon" class="title-icon" />
    Edit Event`;
  document.querySelector('.create_description').innerText = "Fill in the details to update the event.";
  document.querySelector('button[type="submit"]').innerText = "Save Changes";

  loadEventDataForEditing(editEventId);
}

// Fetches the existing event data from the server and pre-fills the form fields
async function loadEventDataForEditing(id) {
  try {
    const response = await fetch(`http://localhost:3000/api/events/${id}`);
    if (!response.ok) throw new Error("Failed to fetch event data");

    const eventData = await response.json();

    // Fill in basic text inputs
    document.getElementById("event-title").value = eventData.title;
    document.getElementById("event-description").value = eventData.description;
    document.getElementById("event-organizer").value = eventData.organizer;
    document.getElementById("event-date").value = eventData.date;
    document.getElementById("event-starttime").value = eventData.startTime;
    document.getElementById("event-endtime").value = eventData.endTime;
    document.getElementById("event-location").value = eventData.location;
    document.getElementById("event-image").value = eventData.imageUrl || "";

    // Restore selected categories and re-render tags
    selectedCategories = eventData.categories || [];
    updateTagDisplay();

    // Restore selected visibility options by mapping values back to their display text
    if (eventData.visibility) {
      selectedVisibility = eventData.visibility.map(val => {
        const option = Array.from(visibilitySelect.options).find(opt => opt.value === val);
        return { val: val, text: option ? option.text : val };
      });
      updateVisibilityTagDisplay();
    }
  } catch (error) {
    console.error("Error loading event:", error);
    alert("Could not load event data.");
  }
}


// ===== CATEGORY SELECTION =====

// Adds a category to the list when selected from the dropdown (max 3)
categorySelect.addEventListener("change", function () {
  const val = this.value;

  if (val && !selectedCategories.includes(val)) {
    if (selectedCategories.length < 3) {
      selectedCategories.push(val); // Add to our list
      updateTagDisplay(); // Refresh the visual tags on screen
    } else {
      alert("You can only choose up to 3 categories.");
    }
  }

  // Reset dropdown to "Select a category" so they can pick again
  this.value = "";
});


// Re-renders the category tag list based on the current selectedCategories array
function updateTagDisplay() {
  tagsDisplay.innerHTML = ""; 
  selectedCategories.forEach((cat) => {
    const tag = document.createElement("span"); 
    tag.className = `tag-${cat}`; 
    tag.style.padding = "5px 10px";
    tag.style.borderRadius = "12px";
    tag.style.cursor = "pointer";
    tag.style.fontSize = "12px";
    tag.innerText = cat + " ✕";

    // Logic to remove a category when the tag itself is clicked
    tag.onclick = () => {
      selectedCategories = selectedCategories.filter((c) => c !== cat);
      updateTagDisplay(); // Refresh the list again
    };

    tagsDisplay.appendChild(tag);
  });
}


// ===== VISIBILITY SELECTION =====

// Stores the selected semester visibility options as objects with value and display text
let selectedVisibility = [];

const visibilitySelect = document.getElementById("event-visibility");
const visibilityTagsDisplay = document.getElementById("visibility-tags-display");

// Adds a visibility option when selected from the dropdown
visibilitySelect.addEventListener("change", function () {
  const selectedText = this.options[this.selectedIndex].text;
  const selectedValue = this.value;

  if (selectedValue && !selectedVisibility.some(v => v.val === selectedValue)) {
    if (selectedValue === "ALL") {
      // If a semester is selected, remove "ALL".
      selectedVisibility = [{ val: "ALL", text: "ALL" }];
    } else {
      // If a specific semester is picked, remove "ALL" from the list (can't have both)
      selectedVisibility = selectedVisibility.filter(v => v.val !== "ALL");
      selectedVisibility.push({ val: selectedValue, text: selectedText });
    }
    updateVisibilityTagDisplay();
  }

  this.value = "";
});

// Re-renders the visibility tag list based on the current selectedVisibility array
function updateVisibilityTagDisplay() {
  visibilityTagsDisplay.innerHTML = "";
  selectedVisibility.forEach((vis) => {
    const tag = document.createElement("span");
    tag.style.backgroundColor = "#211951";
    tag.style.color = "white";
    tag.style.padding = "5px 10px";
    tag.style.borderRadius = "12px";
    tag.style.cursor = "pointer";
    tag.style.fontSize = "12px";
    tag.innerText = vis.text + " ✕";

    // Remove the visibility option when the tag is clicked
    tag.onclick = () => {
      selectedVisibility = selectedVisibility.filter((v) => v.val !== vis.val);
      updateVisibilityTagDisplay();
    };

    visibilityTagsDisplay.appendChild(tag);
  });
}

// ===== FORM SUBMIT =====

// Handles both creating a new event (POST) and saving edits to an existing event (PATCH)
document.getElementById("event-form").addEventListener("submit", async function (event) {
  event.preventDefault();

  const newEventData = {
    title: document.getElementById("event-title").value,
    description: document.getElementById("event-description").value,
    categories: selectedCategories,
    organizer: document.getElementById("event-organizer").value,
    organizerId: localStorage.getItem("userId"),
    creatorSemester: localStorage.getItem('userSemester'),
    date: document.getElementById("event-date").value,
    startTime: document.getElementById("event-starttime").value,
    endTime: document.getElementById("event-endtime").value,
    location: document.getElementById("event-location").value,
    visibility: selectedVisibility.map(v => v.val),
    imageUrl: document.getElementById("event-image").value || "images/aau-entrance.png",
  };

  try {
    // Use PATCH if editing an existing event, POST if creating a new one
    const url = editEventId
      ? `http://localhost:3000/api/events/${editEventId}`
      : "http://localhost:3000/api/events";
    const method = editEventId ? "PATCH" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEventData),
    });

    if (response.ok) {
      alert(editEventId ? "Event updated!" : "Event created!");
      window.location.href = "event_overview.html";
    } else {
      alert("Something went wrong on the server.");
    }
  } catch (error) {
    console.error("Connection error:", error);
    alert("Could not connect to the server.");
  }
});