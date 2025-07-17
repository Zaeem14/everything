const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn')
const currentDisplay = document.getElementById('currentDisplay')
const todayBtn = document.querySelector('.today-button')
const monthGrid = document.querySelector('.month-grid');


// Start with the current date

let currentDate = new Date(); 

// --- Utility Functions --- which will help us to 
function formatDateToISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}



// --- Calendar Rendering Functions ---
function renderMonthView(date) {
    monthGrid.innerHTML = ''; 
    
    const year = date.getFullYear();
    const month = date.getMonth(); 

    // Set the display to the current month and year
    currentDisplay.textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);

    // Get the first day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    // Get the last day of the month
    const lastDayOfMonth = new Date(year, month + 1, 0);
    // Get the day of the week for the first day (0 for Sunday, 6 for Saturday)
    const startDayIndex = firstDayOfMonth.getDay();
    // Get the number of days in the month
    const daysInMonth = lastDayOfMonth.getDate();

    // Calculate days from the previous month to display
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day', 'text-gray-400', 'py-2');
        dayDiv.textContent = prevMonthLastDay - i;
        dayDiv.classList.add('non-current-month');
        monthGrid.appendChild(dayDiv);
    }

    // Add days for the current month
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day', 'py-2', 'relative');
        dayDiv.textContent = i;
        const fullDate = new Date(year, month, i);
        dayDiv.dataset.date = formatDateToISO(fullDate);

        // Highlight today's date
        const today = new Date();
        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayDiv.innerHTML = `<span class="today-highlight">${i}</span>`;
            dayDiv.classList.add('today-container');
        } else {
            dayDiv.classList.add('text-gray-800');
        }
        monthGrid.appendChild(dayDiv);
    }

    // Calculate days from the next month to display (to fill the grid)
    const totalDaysDisplayed = startDayIndex + daysInMonth;
    const remainingCells = 42 - totalDaysDisplayed; 
    for (let i = 1; i <= remainingCells; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day', 'text-gray-400', 'py-2');
        dayDiv.textContent = i;
        // Days from prev/next month are not clickable for adding events
        dayDiv.classList.add('non-current-month');
        monthGrid.appendChild(dayDiv);
    }

    // Attach click listeners to current month days for adding events
    monthGrid.querySelectorAll('.calendar-day:not(.non-current-month)').forEach(dayDiv => {
        dayDiv.addEventListener('click', () => {
            const selectedDate = dayDiv.dataset.date;
            openAddEventModal(selectedDate);
        });
    });
}


// --- Navigation Button Event Listeners ---
prevBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderMonthView(currentDate);
});

nextBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderMonthView(currentDate);
});

todayBtn.addEventListener('click', () => {
    currentDate = new Date(); // Reset to current system date
    renderMonthView(currentDate);
});



document.addEventListener('DOMContentLoaded', () => {
    const openMenuBtn = document.getElementById('openMenuBtn');
    const featureMenu = document.getElementById('featureMenu');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const overlay = document.getElementById('overlay');

    // Open menu when hamburger icon is clicked
    openMenuBtn.addEventListener('click', () => {
        featureMenu.classList.remove('-translate-x-full'); // Slide in
        featureMenu.classList.add('translate-x-0');
        overlay.classList.remove('hidden'); // Show overlay
    });

    // Close menu when close button is clicked
    closeMenuBtn.addEventListener('click', () => {
        featureMenu.classList.remove('translate-x-0'); // Slide out
        featureMenu.classList.add('-translate-x-full');
        overlay.classList.add('hidden'); // Hide overlay
    });

    // Close menu when overlay is clicked
    overlay.addEventListener('click', () => {
        featureMenu.classList.remove('translate-x-0');
        featureMenu.classList.add('-translate-x-full');
        overlay.classList.add('hidden'); 
    });

//bootstrap for the toggle list where user can choose which view they wanna watch at
    const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
    const dropdownList = dropdownElementList.map(function (dropdownToggleEl) {
        return new bootstrap.Dropdown(dropdownToggleEl);
    });
});
renderMonthView(currentDate);