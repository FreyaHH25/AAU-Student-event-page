/* Funktion der styrer selve filter-panelet (popup menuen) */
function startFilter() {
    const filterBtn = document.getElementById('open-filter-btn');
    const saveBtn = document.getElementById('save-filter-btn');
    const filterBox = document.getElementById('filter-panel');
    const checkboxes = filterBox.querySelectorAll('input[type="checkbox"]');

    /* Viser eller skjuler filter-menuen når man klikker på tragt-ikonet */
    filterBtn.addEventListener('click', () => {
        filterBox.style.display = (filterBox.style.display === 'block') ? 'none' : 'block';
    });

    /* Tilføj event listeners til hver checkbox for at håndtere logik */
    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            if (cb.value === 'All') {
                if (cb.checked) {
                    // Hvis "All" checked, check alle andre
                    checkboxes.forEach(other => other.checked = true);
                } else {
                    // Hvis "All" unchecked, uncheck alle andre
                    checkboxes.forEach(other => {
                        if (other.value !== 'All') other.checked = false;
                    });
                }
            } else {
                // Hvis en specifik unchecked, uncheck "All"
                if (!cb.checked) {
                    const allCb = filterBox.querySelector('input[value="All"]');
                    if (allCb) allCb.checked = false;
                }
                // Hvis alle specifikke er checked, check "All"
                const specificCbs = Array.from(checkboxes).filter(c => c.value !== 'All');
                const allChecked = specificCbs.every(c => c.checked);
                if (allChecked) {
                    const allCb = filterBox.querySelector('input[value="All"]');
                    if (allCb) allCb.checked = true;
                }
            }
        });
    });

    /* Gemmer det valgte filter og opdaterer visningen */
    saveBtn.addEventListener('click', () => {
        const checkedBoxes = filterBox.querySelectorAll('input[type="checkbox"]:checked');
        selectedCategories = Array.from(checkedBoxes).map(cb => cb.value);
        localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));
        /* Gen-distribuerer events med ny filter */
        const currentUserId = localStorage.getItem('userId');
        const userSemester = localStorage.getItem('userSemester');
        distributeEvents(allEvents, userSemester, currentUserId);
        /* Lukker filter-panelet */
        filterBox.style.display = 'none';
    });
}

/* Aktiverer filter-logikken så knapperne virker */
startFilter();
startSearch();

/* Sætter de rigtige checkboxes som checked baseret på gemte kategorier */
const checkboxes = document.querySelectorAll('#filter-panel input[type="checkbox"]');
checkboxes.forEach(cb => {
    if (selectedCategories.includes(cb.value)) {
        cb.checked = true;
    }
});