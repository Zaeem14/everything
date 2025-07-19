const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const currentDisplay = document.getElementById('currentDisplay');
const todayBtn = document.querySelector('.today-button');
const monthView = document.getElementById('monthView');
const weekView = document.getElementById('weekView');
const monthGrid = document.getElementById('monthGrid');
const weekGrid = document.getElementById('weekGrid');


//for the month and week view 
let monthViewBtn;
let weekViewBtn;

let currentDate = new Date();
let currentView = 'month';

// for compare
function formatDateToISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}




// for the month view function
function renderMonthView(date) {
    // Show month view, hide week view
    if (monthView && weekView) {
        monthView.style.display = 'block';
        weekView.style.display = 'none';
    }

    // Clear the month grid
    if (monthGrid) {
        monthGrid.innerHTML = '';
    }


    const year = date.getFullYear();
    const month = date.getMonth();

    currentDisplay.textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDayIndex = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day', 'text-gray-400', 'py-2');
        dayDiv.textContent = prevMonthLastDay - i;
        dayDiv.classList.add('non-current-month');
        if (monthGrid) monthGrid.appendChild(dayDiv);
    }


    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day', 'py-2', 'relative');
        dayDiv.textContent = i;
        const fullDate = new Date(year, month, i);
        dayDiv.dataset.date = formatDateToISO(fullDate);

        const today = new Date();
        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayDiv.innerHTML = `<span class="today-highlight">${i}</span>`;
            dayDiv.classList.add('today-container');
        } else {
            dayDiv.classList.add('text-gray-800');
        }
        if (monthGrid) monthGrid.appendChild(dayDiv);
    }

    const totalDaysDisplayed = startDayIndex + daysInMonth;
    const remainingCells = 42 - totalDaysDisplayed;
    for (let i = 1; i <= remainingCells; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day', 'text-gray-400', 'py-2');
        dayDiv.textContent = i;
        dayDiv.classList.add('non-current-month');
        if (monthGrid) monthGrid.appendChild(dayDiv);
    }

    if (monthGrid) {
        monthGrid.querySelectorAll('.calendar-day:not(.non-current-month)').forEach(dayDiv => {
            dayDiv.addEventListener('click', () => {
                const selectedDate = dayDiv.dataset.date;
            });
        });
    }
}




// for the week view 
function renderWeekView(date) {
    // Show week view, hide month view
    if (monthView && weekView) {
        monthView.style.display = 'none';
        weekView.style.display = 'block';
    }

    // Clear the week grid
    if (weekGrid) {
        weekGrid.innerHTML = '';
    }

    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const startOfWeek = new Date(year, month, day - date.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    currentDisplay.textContent = `${new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(startOfWeek)} - ${new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(endOfWeek)}`;

    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + i);

        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day', 'py-2', 'relative');
        dayDiv.dataset.date = formatDateToISO(currentDay);

        const dayOfMonth = currentDay.getDate();
        const dayOfWeekName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(currentDay);

        dayDiv.innerHTML = `
            <div class="text-lg font-semibold">${dayOfMonth}</div>
        `;

        const today = new Date();
        if (currentDay.getDate() === today.getDate() && currentDay.getMonth() === today.getMonth() && currentDay.getFullYear() === today.getFullYear()) {
            dayDiv.classList.add('today-container');
            dayDiv.querySelector('.text-lg').classList.add('today-highlight');
        } else {
            dayDiv.classList.add('text-gray-800');
        }
        if (weekGrid) {
            weekGrid.appendChild(dayDiv);
        }
    }

    if (weekGrid) {
        weekGrid.querySelectorAll('.calendar-day').forEach(dayDiv => {
            dayDiv.addEventListener('click', () => {
                const selectedDate = dayDiv.dataset.date;
            });
        });
    }
}




// checking what view user want
prevBtn.addEventListener('click', () => {
    if (currentView === 'month') {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderMonthView(currentDate);
    } else if (currentView === 'week') {
        currentDate.setDate(currentDate.getDate() - 7);
        renderWeekView(currentDate);
    }
});


// button for seeing month
nextBtn.addEventListener('click', () => {
    if (currentView === 'month') {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderMonthView(currentDate);
    } else if (currentView === 'week') {
        currentDate.setDate(currentDate.getDate() + 7);
        renderWeekView(currentDate);
    }
});

todayBtn.addEventListener('click', () => {
    currentDate = new Date();
    if (currentView === 'month') {
        renderMonthView(currentDate);
    } else if (currentView === 'week') {
        renderWeekView(currentDate);
    }
});




// for nevigation

document.addEventListener('DOMContentLoaded', () => {
    monthViewBtn = document.querySelector('.monthViewBtn');
    weekViewBtn = document.querySelector('.weekViewBtn');

    if (monthViewBtn) {
        monthViewBtn.addEventListener('click', () => {
            currentView = 'month';
            renderMonthView(currentDate);
            document.querySelector('.dropdown-toggle').textContent = 'Month';
        });
    }

    if (weekViewBtn) {
        weekViewBtn.addEventListener('click', () => {
            currentView = 'week';
            renderWeekView(currentDate);
            document.querySelector('.dropdown-toggle').textContent = 'Week';
        });
    }



    //featureMenu
    const openMenuBtn = document.getElementById('openMenuBtn');
    const featureMenu = document.getElementById('featureMenu');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const overlay = document.getElementById('overlay');

    openMenuBtn.addEventListener('click', () => {
        featureMenu.classList.remove('-translate-x-full');
        featureMenu.classList.add('translate-x-0');
        overlay.classList.remove('hidden');
    });

    closeMenuBtn.addEventListener('click', () => {
        featureMenu.classList.remove('translate-x-0');
        featureMenu.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    });

    overlay.addEventListener('click', () => {
        featureMenu.classList.remove('translate-x-0');
        featureMenu.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    });

    const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
    const dropdownList = dropdownElementList.map(function (dropdownToggleEl) {
        return new bootstrap.Dropdown(dropdownToggleEl);
    });

    if (currentView === 'month') {
        renderMonthView(currentDate);
    } else if (currentView === 'week') {
        renderWeekView(currentDate);
    }
});