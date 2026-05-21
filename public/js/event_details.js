// ===== MODAL OPEN =====

// Listens for clicks on any "Read More" button and populates the event details modal
document.addEventListener("click", function (e) {
    const btn = e.target.closest(".read-more-btn");
    if (btn) {
        const eventId = btn.getAttribute("data-id");
        const eventData = window.allEvents.find(ev => (ev._id || ev.id) === eventId);

        if (eventData) {
            // Populate modal fields with event data
            modal.setAttribute("data-current-event-id", eventId);
            document.getElementById("modal-title").innerText = eventData.title;
            document.getElementById("modal-description").innerText = eventData.description;
            document.getElementById("modal-date").innerText = eventData.date;
            document.getElementById("modal-location").innerText = eventData.location;
            document.getElementById("modal-organizer").innerText = eventData.organizer || "Student";
            document.getElementById("modal-image").src = eventData.imageUrl || "images/basket.webp";
            document.getElementById("modal-time").innerText = eventData.time || `${eventData.startTime} - ${eventData.endTime}`;

            // Render category tags
            const tagContainer = document.getElementById("modal-tags-container");
            if (tagContainer) {
                tagContainer.innerHTML = "";
                const categories = eventData.categories || ["General"];
                categories.forEach(cat => {
                    const span = document.createElement("span");
                    span.className = `tag-visuel tag-${cat.toLowerCase()}`;
                    span.innerText = cat;
                    tagContainer.appendChild(span);
                });
            }


            // ===== ATTENDEE LOGIC =====

            const currentUserId = localStorage.getItem('userId');
            const namesArray = Array.isArray(eventData.attendeeNames) ? eventData.attendeeNames : [];
            const attendeesIDs = Array.isArray(eventData.attending) ? eventData.attending : [];

            document.getElementById("modal-attendees").innerText = attendeesIDs.length;

            // Toggle attend button state based on whether the user is already attending
            const isAlreadyAttending = attendeesIDs.includes(currentUserId);
            attendBtn.classList.toggle("attending", isAlreadyAttending);
            attendBtn.textContent = isAlreadyAttending ? "Attending ✓" : "Attend event";

            // Show attendee names if available, otherwise fall back to "Student" placeholders
            updateModalAttendeeList(namesArray.length > 0 ? namesArray : attendeesIDs.map(() => "Student"));


            // ===== EDIT / DELETE BUTTONS =====

            const editBtn = document.getElementById("edit-button");
            const deleteBtn = document.getElementById("delete-button");

            // Only show edit and delete buttons to the event creator
            const isCreator = (eventData.organizerId || eventData.organizer) === currentUserId;
            if (isCreator) {
                editBtn.classList.remove("hidden-btn");
                deleteBtn.classList.remove("hidden-btn");
            } else {
                editBtn.classList.add("hidden-btn");
                deleteBtn.classList.add("hidden-btn");
            }

            // Delete the current event after confirmation
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

            // Redirect to the create events page in edit mode
            editBtn.onclick = () => {
                window.location.href = `create_events.html?edit=${eventId}`;
            };

            // Show the modal
            modal.classList.remove("hidden");
        }
    }
});


// ===== MODAL - CLOSE =====

// Close modal via the close button
if (closeButton) closeButton.addEventListener("click", () => modal.classList.add("hidden"));

// Close modal by clicking outside the modal box
window.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
});


// ===== ATTEND BUTTON =====

// Handles the "Attend event" button click inside the modal
if (attendBtn) {
    attendBtn.addEventListener("click", async function () {
        const currentUserId = localStorage.getItem('userId');
        const eventId = modal.getAttribute("data-current-event-id");
        const isCurrentlyAttending = this.classList.contains("attending");

        if (!currentUserId) return alert("Please log in!");

        if (isCurrentlyAttending && !confirm("Are you sure you want to leave this event?")) return;

        try {
            // Tells the backend to toggle (add/remove) the current user from the attendance list
            const response = await fetch(`http://localhost:3000/api/events/${eventId}/attend`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId })
            });

            if (response.ok) {
                const updatedData = await response.json();
                const names = updatedData.attendeeNames || [];

                // Update attendee count and button state without reloading the page
                document.getElementById("modal-attendees").innerText = names.length;
                const isNowAttending = updatedData.attending.includes(currentUserId);
                this.classList.toggle("attending", isNowAttending);
                this.textContent = isNowAttending ? "Attending ✓" : "Attend event";

                updateModalAttendeeList(names);

                // Sync the global event list so event cards reflect the updated attendance
                const eventIndex = window.allEvents.findIndex(ev => (ev._id || ev.id) === eventId);
                if (eventIndex !== -1) {
                    window.allEvents[eventIndex].attending = updatedData.attending;
                    window.allEvents[eventIndex].attendeeNames = names;
                }
                if (isNowAttending) {
                    showToast("You are now successfully attending this event!");
                } else {
                    showToast("You are no longer attending this event.", "not-attending");
                }
            }
        } catch (error) {
            console.error("Attend Error:", error);
        }
    });
}


// ===== ATTENDEE LIST =====

// Builds the attendee name list inside the modal
function updateModalAttendeeList(names) {
    const list = document.getElementById("modal-list");
    if (!list) return;

    list.innerHTML = "";

    if (!names || names.length === 0) {
        list.innerHTML = "<li>No one attending yet.</li>";
        return;
    }

    names.forEach(name => {
        const li = document.createElement("li");
        li.innerHTML = `👤 ${name}`;
        list.appendChild(li);
    });
}


// ===== SEARCH =====

// Filters events on every keystroke in the search bar
function startSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        searchText = searchInput.value.toLowerCase();
        if (typeof distributeEvents === 'function') {
            distributeEvents(window.allEvents, localStorage.getItem('userSemester'), localStorage.getItem('userId'));
        } else if (typeof renderCalendar === 'function') {
            renderCalendar();
        }
    });
}


// ===== TOAST NOTIFICATIONS =====

// Shows a temporary popup message at the bottom of the screen
function showToast(message, type = 'attending') {
    const toast = document.createElement('div');
    toast.id = 'attend-toast';
    toast.classList.add(type);
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}