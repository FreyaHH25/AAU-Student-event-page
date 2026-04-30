/* 1. THE MAIN LOGIC */
function startFilter() {
    const filterBtn = document.getElementById('open-filter-btn');
    const filterBox = document.getElementById('filter-panel');
    const saveBtn = document.getElementById('save-filter-btn');

    // If elements aren't on this page, exit quietly
    if (!filterBtn || !filterBox) return;

    // Toggle logic
    filterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isVisible = filterBox.style.display === 'block';
        filterBox.style.display = isVisible ? 'none' : 'block';
    });

    // Checkbox All/None logic
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

    // Save button logic
    saveBtn.addEventListener('click', () => {
        const checkedBoxes = filterBox.querySelectorAll('input[type="checkbox"]:checked');
        const selected = Array.from(checkedBoxes).map(cb => cb.value);
    
        localStorage.setItem('selectedCategories', JSON.stringify(selected));
    
        if (typeof selectedCategories !== 'undefined') {
            selectedCategories = selected;
        }
    
        if (typeof distributeEvents === 'function') {
            distributeEvents(allEvents, localStorage.getItem('userSemester'), localStorage.getItem('userId'));
        } else if (typeof renderCalendar === 'function') {
            renderCalendar();
        }
    
        filterBox.style.display = 'none';
    });
}

/* 2. THE ONLY WAY TO RUN IT (WAIT FOR HTML) */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFilterPage);
} else {
    initializeFilterPage();
}

function initializeFilterPage() {
    startFilter();

    // Search safety
    if (typeof startSearch === 'function') {
        startSearch();
    }

    // Initial checkbox sync
    const saved = JSON.parse(localStorage.getItem('selectedCategories')) || ['All'];
    document.querySelectorAll('#filter-panel input[type="checkbox"]').forEach(cb => {
        cb.checked = saved.includes(cb.value);
    });
}