document.addEventListener("click", function (e) {
    if (e.target.classList.contains("read-more-btn")) {
        const eventId = e.target.getAttribute("data-id");
        const eventData = window.allEvents.find(ev => (ev._id || ev.id) === eventId);

        if (eventData) {
            // 1. Set Modal Data
            modal.setAttribute("data-current-event-id", eventId);
            document.getElementById("modal-title").innerText = eventData.title;
            document.getElementById("modal-description").innerText = eventData.description;
            document.getElementById("modal-date").innerText = eventData.date;
            document.getElementById("modal-location").innerText = eventData.location;
            document.getElementById("modal-organizer").innerText = eventData.organizer || "Student";
            document.getElementById("modal-image").src = eventData.imageUrl || "images/basket.webp";
            document.getElementById("modal-time").innerText = eventData.time || `${eventData.startTime} - ${eventData.endTime}`;

            // 2. Handle Tags
            const tagContainer = document.getElementById("modal-tags-container");
            if (tagContainer) {
                tagContainer.innerHTML = ""; 
                const categories = eventData.categories || ["General"];
                categories.forEach(cat => {
                    const span = document.createElement("span");
                    span.className = `tag-visuel tag-${cat.toLowerCase()}`;
                    span.style.marginRight = "5px"; 
                    span.innerText = cat;
                    tagContainer.appendChild(span);
                });
            }

            // 3. User & Attendee Logic
            const currentUserId = localStorage.getItem('userId');
            const namesArray = Array.isArray(eventData.attendeeNames) ? eventData.attendeeNames : [];
            const attendeesIDs = Array.isArray(eventData.attending) ? eventData.attending : [];

            document.getElementById("modal-attendees").innerText = attendeesIDs.length;

            const isAlreadyAttending = attendeesIDs.includes(currentUserId);
            attendBtn.classList.toggle("attending", isAlreadyAttending);
            attendBtn.textContent = isAlreadyAttending ? "Attending ✓" : "Attend event";

            updateModalAttendeeList(namesArray.length > 0 ? namesArray : attendeesIDs.map(() => "Student"));

            // --- MOVED: LOGIC FOR EDIT/DELETE BUTTONS ---
            // This must be inside so it knows WHICH event is open
            const editBtn = document.getElementById("edit-button");
            const deleteBtn = document.getElementById("delete-button");

            // Check if the user is the creator
            const isCreator = (eventData.organizerId || eventData.organizer) === currentUserId;

            if (isCreator) {
                editBtn.classList.remove("hidden-btn");
                deleteBtn.classList.remove("hidden-btn");
            } else {
                editBtn.classList.add("hidden-btn");
                deleteBtn.classList.add("hidden-btn");
            }

            // Define the delete action for THIS specific event
            deleteBtn.onclick = async () => {
                if (confirm("Are you sure you want to delete this event?")) {
                    try {
                        const response = await fetch(`http://localhost:3000/api/events/${eventId}`, {
                            method: 'DELETE'
                        });
                        if (response.ok) {
                            alert("Event deleted!");
                            location.reload(); 
                        } else {
                            alert("Failed to delete event.");
                        }
                    } catch (error) {
                        console.error("Delete Error:", error);
                    }
                }
            };

            // Define the edit action for THIS specific event
            editBtn.onclick = () => {
                window.location.href = `create_events.html?edit=${eventId}`;
            };

            // Show the modal
            modal.classList.remove("hidden");
        }
    }
});

// Closes the popup if the "X" button is clicked.
if (closeButton) closeButton.addEventListener("click", () => modal.classList.add("hidden"));

// Handles the "Attend event" button click inside the popup.
if (attendBtn) {
    attendBtn.addEventListener("click", async function () {
        const currentUserId = localStorage.getItem('userId');
        const eventId = modal.getAttribute("data-current-event-id");

        // Error handling: you must be logged in to sign up.
        if (!currentUserId) return alert("Please log in!");

        try {
            // Tells the backend to toggle (add/remove) the current user from the attendance list.
            const response = await fetch(`http://localhost:3000/api/events/${eventId}/attend`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId })
            });

            if (response.ok) {
                // If the server says "OK", we update the UI immediately without reloading.
                const updatedData = await response.json();
                const names = updatedData.attendeeNames || [];
                
                document.getElementById("modal-attendees").innerText = names.length;
                this.classList.toggle("attending", updatedData.attending.includes(currentUserId));
                this.textContent = updatedData.attending.includes(currentUserId) ? "Attending ✓" : "Attend event";
                
                updateModalAttendeeList(names); // Refresh the visible name list.

                // Updates the main data list (global variable) so the card on the main page is also current.
                const eventIndex = window.allEvents.findIndex(ev => (ev._id || ev.id) === eventId);
                if (eventIndex !== -1) {
                    window.allEvents[eventIndex].attending = updatedData.attending;
                    window.allEvents[eventIndex].attendeeNames = names;
                }
            }
        } catch (error) { console.error("Attend Error:", error); }
    });
}

// Function that builds the little 👤 list of names in the popup.
function updateModalAttendeeList(names) {
    const list = document.getElementById("modal-list");
    if (!list) return;
    
    list.innerHTML = ""; // Wipe the list clean first.
    
    if (!names || names.length === 0) {
        list.innerHTML = "<li>No one attending yet.</li>";
        return;
    }

    // Loops through the names and adds each one as a list item.
    names.forEach(name => {
        const li = document.createElement("li");
        li.style.padding = "5px 0";
        li.innerHTML = `👤 ${name}`;
        list.appendChild(li);
    });
}

// Sets up the search bar to filter events every time the user types a key.
function startSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            searchText = searchInput.value.toLowerCase(); // Updates our global search variable.
            // Triggers a full refresh of all event sections with the new filter.
            distributeEvents(window.allEvents, localStorage.getItem('userSemester'), localStorage.getItem('userId'));
        });
    }
}

// Visual category tags setup for the modal footer.
const tagContainerFooter = document.getElementById("modal-tags-container");

if (tagContainerFooter) {
    tagContainerFooter.innerHTML = ""; // Clear existing UI.
    
    // Safety check for categories to prevent code crashes.
    const categories = (typeof eventData !== 'undefined' && eventData.categories) ? eventData.categories : ["General"];
    
    categories.forEach(cat => {
        const span = document.createElement("span");
        span.className = `tag-visuel tag-${cat.toLowerCase()}`;
        span.innerText = cat;
        tagContainerFooter.appendChild(span);
    });
}

// --- LOGIC FOR EDIT/DELETE BUTTONS ---
const editBtn = document.getElementById("edit-button");
const deleteBtn = document.getElementById("delete-button");

// Check if the user is the creator
const isCreator = (eventData.organizerId || eventData.organizer) === currentUserId;

if (isCreator) {
    editBtn.classList.remove("hidden-btn");
    deleteBtn.classList.remove("hidden-btn");
} else {
    editBtn.classList.add("hidden-btn");
    deleteBtn.classList.add("hidden-btn");
}

// --- ADDING THE DELETE FUNCTIONALITY ---
deleteBtn.onclick = async () => {
    if (confirm("Are you sure you want to delete this event? This cannot be undone.")) {
        try {
            const response = await fetch(`http://localhost:3000/api/events/${eventId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert("Event deleted successfully!");
                location.reload(); // Refresh the page to update the grids
            } else {
                alert("Failed to delete event.");
            }
        } catch (error) {
            console.error("Delete Error:", error);
        }
    }
};

// --- ADDING THE EDIT REDIRECT ---
editBtn.onclick = () => {
    // Redirect to create_events page with the event ID in the URL
    window.location.href = `create_events.html?edit=${eventId}`;
};


