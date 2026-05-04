// --- CATEGORIES LOGIC ---
let selectedCategories = []; // An array to store the categories the user picks (e.g., ["Sports", "Gaming"])

// Grab the <select> dropdown and the <div> where the colored tags will appear
const categorySelect = document.getElementById("event-category");
const tagsDisplay = document.getElementById("selected-tags-display");
const userSemester = localStorage.getItem('userSemester');

// --- INITIALIZATION: Check for Edit Mode ---
const urlParams = new URLSearchParams(window.location.search);
const editEventId = urlParams.get('edit');

if (editEventId) {
    // Change the page title/button text so the user knows they are editing
    document.querySelector('.title_with_icon').innerHTML = `
    <img src="images/icons/create_icon.png" alt="icon" class="title-icon" />
        Edit Event`;

    // Change the description text
    document.querySelector('.create_description').innerText = "Fill in the details to update the event.";
    
    //Change the post button to "save changes"
    document.querySelector('button[type="submit"]').innerText = "Save Changes";
    
    loadEventDataForEditing(editEventId);
}

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

        // Reconstruct Categories (Tags)
        selectedCategories = eventData.categories || [];
        updateTagDisplay();

        // Reconstruct Visibility
        // Note: We need to map the values (e.g. "1 semester") back to their pretty text
        if (eventData.visibility) {
            selectedVisibility = eventData.visibility.map(val => {
                // Find the option in the dropdown to get the text label
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

// Runs every time the user picks an option from the dropdown
categorySelect.addEventListener("change", function () {
  const val = this.value; // Get the chosen category (e.g., "creative")
  // Only proceed if a value exists and isn't already in our array (prevents duplicates)
  if (val && !selectedCategories.includes(val)) {
    // Limit check: ensures the user doesn't pick more than 3
    if (selectedCategories.length < 3) {
      selectedCategories.push(val); // Add to our list
      updateTagDisplay(); // Refresh the visual tags on screen
    } else {
      alert("You can only choose up to 3 categories.");
    }
  }
  this.value = "";  // Reset dropdown to "Select a category" so they can pick again
});
// This function clears the tag area and recreates all tags based on the current array
function updateTagDisplay() {
  tagsDisplay.innerHTML = ""; // Wipe the area clean
  selectedCategories.forEach((cat) => {
    const tag = document.createElement("span"); // Create a new tag element
    tag.className = `tag-${cat}`; // Apply CSS (e.g., tag-sports) for color
    tag.style.padding = "5px 10px";
    tag.style.borderRadius = "12px";
    tag.style.cursor = "pointer";
    tag.style.fontSize = "12px";
    tag.innerText = cat + " ✕"; // Add the name and a little 'X' icon
    // Logic to remove a category when the tag itself is clicked
    tag.onclick = () => {
      // Create a new array excluding the one we clicked on
      selectedCategories = selectedCategories.filter((c) => c !== cat);
      updateTagDisplay(); // Refresh the list again
    }; 
    tagsDisplay.appendChild(tag);// Put the tag into the visual container
  });
}

// --- VISIBILITY LOGIC (Unlimited Selection) ---
// Array to store chosen semesters or "ALL"
let selectedVisibility = []; 
const visibilitySelect = document.getElementById("event-visibility");
const visibilityTagsDisplay = document.getElementById("visibility-tags-display");

visibilitySelect.addEventListener("change", function () {
  // Grab the actual text (e.g., "1-2 semester")
  const selectedText = this.options[this.selectedIndex].text; 
  // Keep the data value for the database (e.g., "1 semester")
  const selectedValue = this.value; 

  if (selectedValue && !selectedVisibility.some(v => v.val === selectedValue)) {
       // Logic: If "ALL" is selected, clear everything else. 
      // If a semester is selected, remove "ALL".
    if (selectedValue === "ALL") {
      selectedVisibility = [{ val: "ALL", text: "ALL" }];// Clear all semesters and just set to ALL
    } else {
            // If a specific semester is picked, remove "ALL" from the list (can't have both)

      selectedVisibility = selectedVisibility.filter(v => v.val !== "ALL");
      selectedVisibility.push({ val: selectedValue, text: selectedText });
    }
    updateVisibilityTagDisplay();// Refresh the visual semester tags
  }
  this.value = "";
});
// Recreates the visual list of visibility tags
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
    
    // DISPLAY the pretty text (1-2 semester)
    tag.innerText = vis.text + " ✕"; 
    
    tag.onclick = () => { // Click to remove a semester choice
      selectedVisibility = selectedVisibility.filter((v) => v.val !== vis.val);
      updateVisibilityTagDisplay();
    };
    visibilityTagsDisplay.appendChild(tag);
  });
}
// --- SUBMIT HANDLER ---
// Runs when the "Create and post event" button is clicked
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

    // ... (Your validation code here) ...

    try {
        // --- LOGIC SWITCH: POST for new, PUT/PATCH for edit ---
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