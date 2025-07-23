const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const currentDisplay = document.getElementById('currentDisplay');
const todayBtn = document.querySelector('.today-button');
const monthView = document.getElementById('monthView');
const weekView = document.getElementById('weekView');
const monthGrid = document.getElementById('monthGrid');
const weekTimeGrid = document.getElementById('weekTimeGrid');
const dayTimeGrid = document.getElementById('dayTimeGrid');


//for the month and week view 
let monthViewBtn;
let weekViewBtn;
let dayViewBtn;

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
    // Set week date range above grid
    const weekDateRangeElem = document.getElementById('weekDateRange');
    if (weekDateRangeElem) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const startOfWeek = new Date(year, month, day - date.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        const options = { month: 'short', day: 'numeric' };
        let rangeStr = '';
        if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
            rangeStr = `${startOfWeek.toLocaleDateString('en-US', options)} – ${endOfWeek.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`;
            rangeStr = `${startOfWeek.toLocaleDateString('en-US', { month: 'short' })} ${startOfWeek.getDate()} – ${endOfWeek.getDate()}, ${endOfWeek.getFullYear()}`;
        } else {
            rangeStr = `${startOfWeek.toLocaleDateString('en-US', options)} – ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
        weekDateRangeElem.textContent = rangeStr;
    }
    // Show week view, hide month view
    if (monthView && weekView) {
        monthView.style.display = 'none';
        weekView.style.display = 'block';
    }

    // Render week header with day names and dates
    const weekDaysHeader = document.getElementById('weekDaysHeader');
    if (weekDaysHeader) {
        weekDaysHeader.innerHTML = '';
        // First column empty for time labels
        const emptyDiv = document.createElement('div');
        weekDaysHeader.appendChild(emptyDiv);
        // Calculate week days
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const startOfWeek = new Date(year, month, day - date.getDay());
        const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let d = 0; d < 7; d++) {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + d);
            const headerDiv = document.createElement('div');
            headerDiv.className = 'week-header-day';
            // Highlight today
            const today = new Date();
            const isToday = dayDate.getFullYear() === today.getFullYear() &&
                            dayDate.getMonth() === today.getMonth() &&
                            dayDate.getDate() === today.getDate();
            headerDiv.innerHTML = `<div>${weekdayNames[d]}</div><div class="text-sm text-gray-500${isToday ? ' today-highlight' : ''}">${dayDate.getDate()}</div>`;
            weekDaysHeader.appendChild(headerDiv);
        }
    }

    // Clear the week time grid
    if (weekTimeGrid) {
        weekTimeGrid.innerHTML = '';
    }

    // Define time slots (e.g., 8:00 to 20:00)
    const startHour = 1;
    const endHour = 24;
    const hours = [];
    for (let h = startHour; h <= endHour; h++) {
        hours.push(h);
    }

    // Get the start of the week (Sunday)
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const startOfWeek = new Date(year, month, day - date.getDay());

    // For each hour, create a row: first column is time label, next 7 columns are days
    for (let i = 0; i < hours.length; i++) {
        const rowHour = hours[i];

        // Time label cell
        const timeCell = document.createElement('div');
        timeCell.classList.add('time-label', 'border', 'border-gray-200', 'text-xs', 'text-right', 'pr-2', 'py-1', 'bg-gray-50');
        const hourStr = rowHour < 12 ? `${rowHour} AM` : rowHour === 12 ? '12 PM' : rowHour === 24 ? '12 AM' : rowHour === 25 ? '1 AM' : `${rowHour - 12} PM`;
        timeCell.textContent = hourStr;
        weekTimeGrid.appendChild(timeCell);

        // 7 day cells
        for (let d = 0; d < 7; d++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('week-cell', 'border', 'border-gray-200', 'relative', 'hover:bg-blue-50', 'h-12');

            // For future event placement, store date and hour
            const currentDay = new Date(startOfWeek);
            currentDay.setDate(startOfWeek.getDate() + d);
            dayCell.dataset.date = formatDateToISO(currentDay);
            dayCell.dataset.hour = rowHour;

            weekTimeGrid.appendChild(dayCell);
        }
    }
}


// for the day view

function renderDayView(date) {
    console.log('renderDayView called with date:', date);

    const dayView = document.getElementById('dayView');
    const weekView = document.getElementById('weekView');
    const monthView = document.getElementById('monthView');
    const currentDisplay = document.getElementById('currentDisplay');
    const dayTimeGrid = document.getElementById('dayTimeGrid');

    if (!dayView) {
        console.error('dayView container not found');
        return;
    }
    if (!dayTimeGrid) {
        console.error('dayTimeGrid container not found');
        return;
    }   

    // Hide other views, show day view
    dayView.style.display = 'block';
    if (weekView) weekView.style.display = 'none';
    if (monthView) monthView.style.display = 'none';
    if (currentDisplay) currentDisplay.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Remove any existing day view header
    const oldHeader = dayView.querySelector('.day-view-header');
    if (oldHeader) oldHeader.remove();

    // Add day view header with full date
    const dayViewHeader = document.createElement('div');
    dayViewHeader.classList.add('day-view-header');
    // Highlight header if today
    const today = new Date();
    if (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    ) {
        dayViewHeader.classList.add('day-header-today');
    }
    dayViewHeader.innerHTML = `<span class=\"day-header-date\">${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>`;
    dayView.insertBefore(dayViewHeader, dayTimeGrid);

    // Clear grid
    dayTimeGrid.innerHTML = '';
    console.log('dayTimeGrid cleared, ready to populate');

    // Define time slots (e.g., 1:00 to 24:00)
    const startHour = 1;
    const endHour = 24;
    const hours = [];
    for (let h = startHour; h <= endHour; h++) {
        hours.push(h);
    }

    // For each hour, create a row: first column is time label, second column is the day cell for the current day
    for (let i = 0; i < hours.length; i++) {
        const rowHour = hours[i];

        // Time label cell
        const timeCell = document.createElement('div');
        timeCell.classList.add('time-label', 'border', 'border-gray-200', 'text-xs', 'text-right', 'pr-2', 'py-1', 'bg-gray-50');
        const hourStr = rowHour < 12 ? `${rowHour} AM` : rowHour === 12 ? '12 PM' : rowHour === 24 ? '12 AM' : rowHour === 25 ? '1 AM' : `${rowHour - 12} PM`;
        timeCell.textContent = hourStr;
        dayTimeGrid.appendChild(timeCell);

        // Single day cell
        const dayCell = document.createElement('div');
        dayCell.classList.add('day-cell', 'border', 'border-gray-200', 'relative', 'hover:bg-blue-50', 'h-12');

        // Store date and hour for event placement
        dayCell.dataset.date = formatDateToISO(date);
        dayCell.dataset.hour = rowHour;

        // No highlight for cell, just append
        dayTimeGrid.appendChild(dayCell);
    }

    console.log('dayTimeGrid children after render:', dayTimeGrid.children.length);
}





// checking what view user want
prevBtn.addEventListener('click', () => {
    if (currentView === 'month') {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderMonthView(currentDate);
    } else if (currentView === 'week') {
        currentDate.setDate(currentDate.getDate() - 7);
        renderWeekView(currentDate);
    } else if (currentView === 'day') {
        currentDate.setDate(currentDate.getDate() - 1);
        renderDayView(currentDate);
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
    } else if (currentView === 'day') {
        currentDate.setDate(currentDate.getDate() + 1);
        renderDayView(currentDate);
    }   
});

todayBtn.addEventListener('click', () => {
    currentDate = new Date();
    if (currentView === 'month') {
        renderMonthView(currentDate);
    } else if (currentView === 'week') {
        renderWeekView(currentDate);
    } else if (currentView === 'day') {
        renderDayView(currentDate);
    }
});




// for nevigation

document.addEventListener('DOMContentLoaded', () => {
    monthViewBtn = document.querySelector('.monthViewBtn');
    weekViewBtn = document.querySelector('.weekViewBtn');
    dayViewBtn = document.querySelector('.dayViewBtn');

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

    if (dayViewBtn) {
        dayViewBtn.addEventListener('click', () => {
            currentView = 'day';
            renderDayView(currentDate);
            document.querySelector('.dropdown-toggle').textContent = 'Day';
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
    } else if (currentView === 'day') {
        renderDayView(currentDate);
    }
});