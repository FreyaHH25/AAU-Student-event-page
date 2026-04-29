// --- CATEGORIES LOGIC ---
let selectedCategories = []; 
const categorySelect = document.getElementById("event-category");
const tagsDisplay = document.getElementById("selected-tags-display");

categorySelect.addEventListener("change", function () {
  const val = this.value;
  if (val && !selectedCategories.includes(val)) {
    if (selectedCategories.length < 3) {
      selectedCategories.push(val);
      updateTagDisplay();
    } else {
      alert("You can only choose up to 3 categories.");
    }
  }
  this.value = ""; 
});

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
    tag.onclick = () => {
      selectedCategories = selectedCategories.filter((c) => c !== cat);
      updateTagDisplay();
    };
    tagsDisplay.appendChild(tag);
  });
}

// --- VISIBILITY LOGIC (Unlimited Selection) ---
let selectedVisibility = []; 
const visibilitySelect = document.getElementById("event-visibility");
const visibilityTagsDisplay = document.getElementById("visibility-tags-display");

visibilitySelect.addEventListener("change", function () {
  const val = this.value;
  if (val && !selectedVisibility.includes(val)) {
    // Logic: If "ALL" is selected, clear everything else. 
    // If a semester is selected, remove "ALL".
    if (val === "ALL") {
      selectedVisibility = ["ALL"];
    } else {
      selectedVisibility = selectedVisibility.filter(v => v !== "ALL");
      selectedVisibility.push(val);
    }
    updateVisibilityTagDisplay();
  }
  this.value = ""; 
});

function updateVisibilityTagDisplay() {
  visibilityTagsDisplay.innerHTML = ""; 
  selectedVisibility.forEach((vis) => {
    const tag = document.createElement("span");
    // Styling the visibility tags to look distinct (Dark Blue)
    tag.style.backgroundColor = "#211951";
    tag.style.color = "white";
    tag.style.padding = "5px 10px";
    tag.style.borderRadius = "12px";
    tag.style.cursor = "pointer";
    tag.style.fontSize = "12px";
    tag.innerText = vis + " ✕";
    tag.onclick = () => {
      selectedVisibility = selectedVisibility.filter((v) => v !== vis);
      updateVisibilityTagDisplay();
    };
    visibilityTagsDisplay.appendChild(tag);
  });
}

// --- SUBMIT HANDLER ---
document.getElementById("event-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const newEventData = {
      title: document.getElementById("event-title").value,
      description: document.getElementById("event-description").value,
      categories: selectedCategories, 
      organizer: document.getElementById("event-organizer").value,
      organizerId: localStorage.getItem("userId"),
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