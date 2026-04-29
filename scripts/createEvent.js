// Listen for the "submit" event on the form with the ID 'event-form'
let selectedCategories = []; // Array to hold your 3 choices

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
  this.value = ""; // Resets the dropdown so "Select a category" shows again
});

function updateTagDisplay() {
  tagsDisplay.innerHTML = ""; // Clear
  selectedCategories.forEach((cat) => {
    const tag = document.createElement("span");
    // This uses your existing tag CSS classes!
    tag.className = `tag-${cat}`;
    tag.style.padding = "5px 10px";
    tag.style.borderRadius = "12px";
    tag.style.cursor = "pointer";
    tag.style.fontSize = "12px";
    tag.innerText = cat + " ✕";

    // Click a tag to remove it
    tag.onclick = () => {
      selectedCategories = selectedCategories.filter((c) => c !== cat);
      updateTagDisplay();
    };
    tagsDisplay.appendChild(tag);
  });
}

// --- UPDATE YOUR SUBMIT HANDLER ---
document
  .getElementById("event-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const newEventData = {
      title: document.getElementById("event-title").value,
      description: document.getElementById("event-description").value,
      categories: selectedCategories, // Sends the array of 1-3 tags
      organizer: document.getElementById("event-organizer").value,
      organizerId: localStorage.getItem("userId"),
      date: document.getElementById("event-date").value,
      startTime: document.getElementById("event-starttime").value,
      endTime: document.getElementById("event-endtime").value,
      location: document.getElementById("event-location").value,
      visibility: document.getElementById("event-visibility").value,
      imageUrl: document.getElementById("event-image").value || "images/aau-entrance.png",
    };

    // Validate before sending to server
    const validation = validateEvent(newEventData);
    if (!validation.valid) {
      alert("Please fix the following:\n" + validation.errors.join("\n"));
      return;
    }

    try {
      // SEND DATA TO BACKEND:
      // We use fetch() to send the data to our Express server.
      const response = await fetch("http://localhost:3000/api/events", {
        method: "POST", // POST means we are sending new data to be created
        headers: {
          "Content-Type": "application/json", // Tells the server we are sending JSON formatted data
        },
        // We must convert our javascript object into a JSON text string before sending it over the internet
        body: JSON.stringify(newEventData),
      });

      // handle server resopnse:
      // If the server replies with status 200/201 (OK)
      if (response.ok) {
        alert("Success! Your event has been saved to the UniEvent database.");
        document.getElementById("event-form").reset(); // Clear the input fields

        // Automatically redirect the user to the event overview page to see their new event
        window.location.href = "event_overview.html";
      } else {
        alert("Something went wrong on the server. Could not save the event.");
      }
    } catch (error) {
      // error handling:
      // If the fetch fails entirely (e.g., the server is not running)
      console.error("Connection error:", error);
      alert(
        "Could not connect to the server. Please ensure your backend is running.",
      );
    }
  });
