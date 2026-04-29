Here is your code with detailed comments explaining exactly how each part works. I haven't changed a single line of your actual logic—just added the "why" and "how" for you.

JavaScript
// --- CATEGORIES LOGIC ---

// An array to store the categories the user picks (e.g., ["Sports", "Gaming"])
let selectedCategories = []; 

// Grab the <select> dropdown and the <div> where the colored tags will appear
const categorySelect = document.getElementById("event-category");
const tagsDisplay = document.getElementById("selected-tags-display");

// Runs every time the user picks an option from the dropdown
categorySelect.addEventListener("change", function () {
  const val = this.value; // Get the chosen category (e.g., "creative")

  // Only proceed if a value exists and isn't already in our array (prevents duplicates)
  if (val && !selectedCategories.includes(val)) {
    // Limit check: ensures the user doesn't pick more than 3
    if (selectedCategories.length < 3) {
      selectedCategories.push(val); // Add to our list
      updateTagDisplay();           // Refresh the visual tags on screen
    } else {
      alert("You can only choose up to 3 categories.");
    }
  }
  this.value = ""; // Reset dropdown to "Select a category" so they can pick again
});

// This function clears the tag area and recreates all tags based on the current array
function updateTagDisplay() {
  tagsDisplay.innerHTML = ""; // Wipe the area clean
  selectedCategories.forEach((cat) => {
    const tag = document.createElement("span"); // Create a new tag element
    tag.className = `tag-${cat}`;               // Apply CSS (e.g., tag-sports) for color
    tag.style.padding = "5px 10px";
    tag.style.borderRadius = "12px";
    tag.style.cursor = "pointer";               // Make it look clickable
    tag.style.fontSize = "12px";
    tag.innerText = cat + " ✕";                 // Add the name and a little 'X' icon

    // Logic to remove a category when the tag itself is clicked
    tag.onclick = () => {
      // Create a new array excluding the one we clicked on
      selectedCategories = selectedCategories.filter((c) => c !== cat);
      updateTagDisplay(); // Refresh the list again
    };
    tagsDisplay.appendChild(tag); // Put the tag into the visual container
  });
}

// --- VISIBILITY LOGIC (Unlimited Selection) ---

// Array to store chosen semesters or "ALL"
let selectedVisibility = []; 
const visibilitySelect = document.getElementById("event-visibility");
const visibilityTagsDisplay = document.getElementById("visibility-tags-display");

visibilitySelect.addEventListener("change", function () {
  const val = this.value;
  if (val && !selectedVisibility.includes(val)) {
    // Logic: If "ALL" is selected, it overrides everything else
    if (val === "ALL") {
      selectedVisibility = ["ALL"]; // Clear all semesters and just set to ALL
    } else {
      // If a specific semester is picked, remove "ALL" from the list (can't have both)
      selectedVisibility = selectedVisibility.filter(v => v !== "ALL");
      selectedVisibility.push(val);
    }
    updateVisibilityTagDisplay(); // Refresh the visual semester tags
  }
  this.value = ""; // Reset dropdown
});

// Recreates the visual list of visibility tags
function updateVisibilityTagDisplay() {
  visibilityTagsDisplay.innerHTML = ""; 
  selectedVisibility.forEach((vis) => {
    const tag = document.createElement("span");
    // Manual styling to make them dark blue (standard for the university theme)
    tag.style.backgroundColor = "#211951";
    tag.style.color = "white";
    tag.style.padding = "5px 10px";
    tag.style.borderRadius = "12px";
    tag.style.cursor = "pointer";
    tag.style.fontSize = "12px";
    tag.innerText = vis + " ✕";

    // Click to remove a semester choice
    tag.onclick = () => {
      selectedVisibility = selectedVisibility.filter((v) => v !== vis);
      updateVisibilityTagDisplay();
    };
    visibilityTagsDisplay.appendChild(tag);
  });
}

// --- SUBMIT HANDLER ---

// Runs when the "Create and post event" button is clicked
document.getElementById("event-form").addEventListener("submit", async function (event) {
    event.preventDefault(); // Stop the page from refreshing automatically

    // Bundle all form inputs into a single object to send to the server
    const newEventData = {
      title: document.getElementById("event-title").value,
      description: document.getElementById("event-description").value,
      categories: selectedCategories, // Use the array we built earlier
      organizer: document.getElementById("event-organizer").value,
      organizerId: localStorage.getItem("userId"), // Get the logged-in user ID
      date: document.getElementById("event-date").value,
      startTime: document.getElementById("event-starttime").value,
      endTime: document.getElementById("event-endtime").value,
      location: document.getElementById("event-location").value,
      visibility: selectedVisibility, // Use the visibility array we built earlier
      imageUrl: document.getElementById("event-image").value || "images/aau-entrance.png",
    };

    // Safety check: ensure at least one semester/ALL is chosen before submitting
    if (selectedVisibility.length === 0) {
      alert("Please select at least one visibility option.");
      return; // Stop the code here if empty
    }

    // Call external validation function (imported from validateEvent.js)
    const validation = validateEvent(newEventData);
    if (!validation.valid) {
      alert("Please fix the following:\n" + validation.errors.join("\n"));
      return; // Stop if there are errors (like empty title)
    }

    try {
      // Send the data to the backend API using a POST request
      const response = await fetch("http://localhost:3000/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEventData), // Turn the object into a JSON string
      });

      if (response.ok) {
        alert("Success! Your event has been saved.");
        document.getElementById("event-form").reset(); // Clear the form
        window.location.href = "event_overview.html"; // Send user back to the list
      } else {
        alert("Something went wrong on the server.");
      }
    } catch (error) {
      // Happens if the server is offline or internet is down
      console.error("Connection error:", error);
      alert("Could not connect to the server.");
    }
});