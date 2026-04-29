// --- CATEGORIES LOGIC ---
let selectedCategories = []; // An array to store the categories the user picks (e.g., ["Sports", "Gaming"])

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
    event.preventDefault(); // Stop the page from refreshing automatically
// Bundle all form inputs into a single object to send to the server
    const newEventData = {
      title: document.getElementById("event-title").value,
      description: document.getElementById("event-description").value,
      categories: selectedCategories, 
      organizer: document.getElementById("event-organizer").value,
      organizerId: localStorage.getItem("userId"),
      creatorSemester: localStorage.getItem('userSemester'), // This attaches the logged-in user's semester to the event data
      date: document.getElementById("event-date").value,
      startTime: document.getElementById("event-starttime").value,
      endTime: document.getElementById("event-endtime").value,
      location: document.getElementById("event-location").value,
      
      // Update: Now sends the visibility array
      visibility: selectedVisibility, 
      
      imageUrl: document.getElementById("event-image").value || "images/aau-entrance.png",
    };

    // Quick check to make sure they picked at least one visibility
    if (selectedVisibility.length === 0) {
      alert("Please select at least one visibility option.");
      return;
    }

    const validation = validateEvent(newEventData);
    if (!validation.valid) {
      alert("Please fix the following:\n" + validation.errors.join("\n"));
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEventData),
      });

      if (response.ok) {
        alert("Success! Your event has been saved.");
        document.getElementById("event-form").reset();
        window.location.href = "event_overview.html";
      } else {
        alert("Something went wrong on the server.");
      }
    } catch (error) {
      console.error("Connection error:", error);
      alert("Could not connect to the server.");
    }
});