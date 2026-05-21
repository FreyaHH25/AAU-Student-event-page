// Runs on pages that have a filter panel (event overview and calendar)
function startFilter() {
    const filterBtn = document.getElementById('open-filter-btn');
    const filterBox = document.getElementById('filter-panel');
    const saveBtn = document.getElementById('save-filter-btn');

    // If filter elements are not present on this page, exit quietly
    if (!filterBtn || !filterBox) return;

    // Toggle the filter panel open and closed
    filterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isVisible = filterBox.style.display === 'block';
        filterBox.style.display = isVisible ? 'none' : 'block';
    });

    // If "All" is checked, check/uncheck all other boxes to match
    // If any individual box is unchecked, also uncheck "All"
    const checkboxes = filterBox.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            if (cb.value === 'All') {
                checkboxes.forEach(other => other.checked = cb.checked);
            } else if (!cb.checked) {
                const allCb = filterBox.querySelector('input[value="All"]');
                if (allCb) allCb.checked = false;
            }
        });
    });

    // Save selected categories to localStorage and re-render the current page view
    saveBtn.addEventListener('click', () => {
        const checkedBoxes = filterBox.querySelectorAll(
            'input[type="checkbox"]:checked'
        );
        const selected = Array.from(checkedBoxes).map(cb => cb.value);

        localStorage.setItem('selectedCategories', JSON.stringify(selected));

        // Update the global selectedCategories variable if it exists on this page
        if (typeof selectedCategories !== 'undefined') {
            selectedCategories = selected;
        }

        // Re-render events or calendar depending on which page is active
        if (typeof distributeEvents === 'function') {
            distributeEvents(
                allEvents,
                localStorage.getItem('userSemester'),
                localStorage.getItem('userId')
            );
        } else if (typeof renderCalendar === 'function') {
            renderCalendar();
        }

        filterBox.style.display = 'none';
    });
}

// Wait for the HTML to be ready before initializing, regardless of script load timing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFilterPage);
} else {
    initializeFilterPage();
}

function initializeFilterPage() {
    startFilter();

    // Initialize search bar if it exists on this page
    if (typeof startSearch === 'function') {
        startSearch();
    }

    // Restore previously saved checkbox selections from localStorage
    const saved =
        JSON.parse(localStorage.getItem('selectedCategories')) || ['All'];
    document.querySelectorAll('#filter-panel input[type="checkbox"]').forEach(cb => {
        cb.checked = saved.includes(cb.value);
    });
}