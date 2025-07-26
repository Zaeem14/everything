
// defining all the elements

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const currentDisplay = document.getElementById('currentDisplay');
const todayBtn = document.querySelector('.today-button');
const monthView = document.getElementById('monthView');
const weekView = document.getElementById('weekView');
const monthGrid = document.getElementById('monthGrid');
const weekTimeGrid = document.getElementById('weekTimeGrid');
const dayTimeGrid = document.getElementById('dayTimeGrid');
const yearGrid = document.getElementById('yearGrid');
const yearView = document.getElementById('yearView'); // <-- added assignment for yearView


//for the month and week view 
// Assign view buttons after DOM is loaded
weekViewBtn = document.querySelector('.weekViewBtn');
dayViewBtn = document.querySelector('.dayViewBtn');
monthViewBtn = document.querySelector('.monthViewBtn');
yearViewBtn = document.querySelector('.yearViewBtn');

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
        yearGrid.style.display = 'none';
    }

    // Clear the month grid
    if (monthGrid) {
        monthGrid.innerHTML = '';
    }


    const year = date.getFullYear();
    const month = date.getMonth();

    // Set header to 'Month Year', e.g., 'July 2025'
    if (currentDisplay) {
        currentDisplay.textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
    }

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

    // creating the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day', 'py-2', 'relative');
        dayDiv.textContent = i;
        const fullDate = new Date(year, month, i);
        dayDiv.dataset.date = formatDateToISO(fullDate);

        // highlighting the today's date
        const today = new Date();
        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayDiv.innerHTML = `<span class="today-highlight_for_month_week">${i}</span>`;
            dayDiv.classList.add('today-container');
        } else {
            dayDiv.classList.add('text-gray-800');
        }
        if (monthGrid) monthGrid.appendChild(dayDiv);
    }

    // creating the remaining days of the month
    const totalDaysDisplayed = startDayIndex + daysInMonth;
    const remainingCells = 42 - totalDaysDisplayed;
    for (let i = 1; i <= remainingCells; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day', 'text-gray-400', 'py-2');
        dayDiv.textContent = i;
        dayDiv.classList.add('non-current-month');
        if (monthGrid) monthGrid.appendChild(dayDiv);
    }

    // adding the click event to the days of the month
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
    // Set header to week range, e.g., 'Jul 20 – Jul 26, 2025'
    if (currentDisplay) {
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
        } else {
            rangeStr = `${startOfWeek.toLocaleDateString('en-US', options)} – ${endOfWeek.toLocaleDateString('en-US', options)}, ${endOfWeek.getFullYear()}`;
        }
        currentDisplay.textContent = rangeStr;
    }
    // Show week view, hide month view
    if (monthView && weekView && yearGrid) {
        monthView.style.display = 'none';
        weekView.style.display = 'block';
        yearGrid.style.display = 'none';
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
            headerDiv.innerHTML = `<div>${weekdayNames[d]}</div><div class="text-sm text-gray-500${isToday ? ' today-highlight_for_month_week' : ''}">${dayDate.getDate()}</div>`;
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
    if (yearGrid) yearGrid.style.display = 'none';
    // Set header to 'Day, Month Date, Year', e.g., 'Saturday, July 26, 2025'
    if (currentDisplay) {
        currentDisplay.textContent = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(date);
    }

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


//for the year view function
function renderYearView(date) {
    // Show year view, hide others
    if (monthView && weekView && yearView && dayView) {
        monthView.style.display = 'none';
        weekView.style.display = 'none';
        yearView.style.display = 'block';
        dayView.style.display = 'none';
    }

    // Clear the year grid
    yearGrid.innerHTML = '';

    // Get the year from provided date
    const year = date.getFullYear();

    // Set header to current year
    if (currentDisplay) {
        currentDisplay.textContent = year;
    }
    const today = new Date();

    // Set up year grid as 4 columns, 3 rows
    yearGrid.style.display = 'grid';
    yearGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
    yearGrid.style.gap = '1rem';

    for (let month = 0; month < 12; month++) {
        // Month container
        const monthCell = document.createElement('div');
        monthCell.classList.add('month-cell', 'border', 'border-gray-200', 'bg-white', 'rounded-lg', 'shadow-sm', 'p-2');
        monthCell.style.minWidth = '160px';

        // Month name
        const monthName = document.createElement('div');
        monthName.classList.add('font-semibold', 'text-center', 'mb-1');
        monthName.textContent = new Date(year, month, 1).toLocaleString('en-US', { month: 'long' });
        monthCell.appendChild(monthName);

        // Mini month grid
        const miniGrid = document.createElement('div');
        miniGrid.classList.add('mini-month-grid');
        miniGrid.style.display = 'grid';
        miniGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';
        miniGrid.style.gap = '2px';

        // Days of week header
        const daysShort = ['S','M','T','W','T','F','S'];
        for (let d = 0; d < 7; d++) {
            const dow = document.createElement('div');
            dow.classList.add('mini-day-cell', 'text-xs', 'font-bold', 'text-center', 'text-gray-500');
            dow.textContent = daysShort[d];
            miniGrid.appendChild(dow);
        }

        // Find first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Fill in blanks for days before the 1st
        for (let i = 0; i < firstDay; i++) {
            const blank = document.createElement('div');
            blank.classList.add('mini-day-cell');
            miniGrid.appendChild(blank);
        }

        // Fill in days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('mini-day-cell', 'text-xs', 'text-center', 'rounded', 'cursor-pointer', 'hover:bg-blue-100');
            dayCell.textContent = day;
            dayCell.style.width = '20px';
            dayCell.style.height = '20px';
            dayCell.style.margin = 'auto';

            // Highlight today
            if (
                year === today.getFullYear() &&
                month === today.getMonth() &&
                day === today.getDate()
            ) {
                dayCell.classList.add('bg-blue-500', 'text-white', 'font-bold');
            }

            miniGrid.appendChild(dayCell);
        }

        monthCell.appendChild(miniGrid);
        yearGrid.appendChild(monthCell);
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
    } else if (currentView === 'day') {
        currentDate.setDate(currentDate.getDate() - 1);
        renderDayView(currentDate);
    } else if (currentView === 'year') {
        currentDate.setFullYear(currentDate.getFullYear() - 1);
        renderYearView(currentDate);
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
    } else if (currentView === 'year') {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        renderYearView(currentDate);
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
    } else if (currentView === 'year') {
        renderYearView(currentDate);
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

    if (yearViewBtn) {
        yearViewBtn.addEventListener('click', () => {
            currentView = 'year';
            renderYearView(currentDate);
            document.querySelector('.dropdown-toggle').textContent = 'Year';
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
    } else if (currentView === 'year') {
        renderYearView(currentDate);
    }
});