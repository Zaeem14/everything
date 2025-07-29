
let currentDate = new Date();
let currentView = 'month';
let calendarEvents = [];

const monthView = document.getElementById('monthView');
const weekView = document.getElementById('weekView');
const dayView = document.getElementById('dayView');
const yearView = document.getElementById('yearView');
const monthGrid = document.getElementById('monthGrid');
const weekTimeGrid = document.getElementById('weekTimeGrid');
const dayTimeGrid = document.getElementById('dayTimeGrid');
const yearGrid = document.getElementById('yearGrid');
const currentDisplay = document.getElementById('currentDisplay');
const todayBtn = document.querySelector('.today-button');

console.log('monthView:', monthView);
console.log('weekView:', weekView);
console.log('dayView:', dayView);
console.log('yearView:', yearView);
console.log('monthGrid:', monthGrid);
console.log('weekTimeGrid:', weekTimeGrid);
console.log('dayTimeGrid:', dayTimeGrid);
console.log('yearGrid:', yearGrid);
console.log('currentDisplay:', currentDisplay);
console.log('todayBtn:', todayBtn);

// View buttons
const weekViewBtn = document.querySelector('.weekViewBtn');
const dayViewBtn = document.querySelector('.dayViewBtn');
const monthViewBtn = document.querySelector('.monthViewBtn');
const yearViewBtn = document.querySelector('.yearViewBtn');

// View switch event listeners
if (weekViewBtn) {
    weekViewBtn.addEventListener('click', () => {
        currentView = 'week';
        console.log('Switch to week view');
        renderWeekView(currentDate);
    });
}
if (dayViewBtn) {
    dayViewBtn.addEventListener('click', () => {
        currentView = 'day';
        console.log('Switch to day view');
        renderDayView(currentDate);
    });
}
if (monthViewBtn) {
    monthViewBtn.addEventListener('click', () => {
        currentView = 'month';
        console.log('Switch to month view');
        renderMonthView(currentDate);
    });
}
if (yearViewBtn) {
    yearViewBtn.addEventListener('click', () => {
        currentView = 'year';
        console.log('Switch to year view');
        renderYearView(currentDate);
    });
}

// Initial render
if (currentView === 'month') {
    renderMonthView(currentDate);
} else if (currentView === 'week') {
    renderWeekView(currentDate);
} else if (currentView === 'day') {
    renderDayView(currentDate);
} else if (currentView === 'year') {
    renderYearView(currentDate);
}

// Today button event listener
if (todayBtn) {
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
}











// Load events from localStorage if present
if (window.localStorage) {
    try {
        const storedEvents = localStorage.getItem('calendarEvents');
        if (storedEvents) {
            calendarEvents = JSON.parse(storedEvents);
        }
    } catch (e) {
        calendarEvents = [];
    }
}

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

        // Render events for this date
        const cellDateStr = formatDateToISO(fullDate);
        const eventsForDay = calendarEvents.filter(ev => ev.date === cellDateStr);
        if (eventsForDay.length > 0) {
            const eventsList = document.createElement('div');
            eventsList.className = 'month-events-list';
            eventsForDay.forEach(ev => {
                const evDiv = document.createElement('div');
                evDiv.className = 'month-event px-1 py-0.5 rounded mb-1 bg-blue-100 text-xs text-blue-900 truncate';
                evDiv.style.cursor = 'pointer';
                evDiv.addEventListener('click', function(e) {
                    e.stopPropagation();
                    openEditEventModal(ev.id);
                });
                if (ev.allDay) {
                    evDiv.textContent = `• ${ev.title} (All Day)`;
                } else if (ev.startTime && ev.endTime) {
                    evDiv.textContent = `• ${ev.title} (${ev.startTime} - ${ev.endTime})`;
                } else if (ev.startTime) {
                    evDiv.textContent = `• ${ev.title} (${ev.startTime})`;
                } else {
                    evDiv.textContent = `• ${ev.title}`;
                }
                eventsList.appendChild(evDiv);
            });
            dayDiv.appendChild(eventsList);
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
            dayDiv.addEventListener('click', (e) => {
                // Only open add modal if not clicking on an event
                if (e.target.closest('.month-event')) return;
                openAddEventModal(dayDiv.dataset.date);
            });
        });
    }
}




// for the week view 
function renderWeekView(date) {
    // Set week date range above grid
    // Hide other views, show week view
    if (monthView) monthView.style.display = 'none';
    if (weekView) weekView.style.display = 'block';
    if (yearGrid) yearGrid.style.display = 'none';
    if (dayView) dayView.style.display = 'none';

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
            const cellDateStr = formatDateToISO(currentDay);
            dayCell.dataset.date = cellDateStr;
            dayCell.dataset.hour = rowHour;

            // Render events for this date and hour
            const eventsForCell = calendarEvents.filter(ev => {
                if (ev.date !== cellDateStr) return false;
                if (ev.allDay) return false;
                // Place event if startTime matches this hour
                if (ev.startTime) {
                    const [h, m] = ev.startTime.split(":").map(Number);
                    return h === rowHour;
                }
                return false;
            });
            eventsForCell.forEach(ev => {
                const evDiv = document.createElement('div');
                evDiv.className = 'week-event px-1 py-0.5 rounded mb-1 bg-green-100 text-xs text-green-900 truncate';
                evDiv.style.cursor = 'pointer';
                evDiv.addEventListener('click', function(e) {
                    e.stopPropagation();
                    openEditEventModal(ev.id);
                });
                if (ev.endTime) {
                    evDiv.textContent = `${ev.title} (${ev.startTime} - ${ev.endTime})`;
                } else {
                    evDiv.textContent = `${ev.title} (${ev.startTime})`;
                }
                dayCell.appendChild(evDiv);
            });
            // Add event by clicking empty week cell
            dayCell.addEventListener('click', function(e) {
                console.log('Week cell clicked:', {target: e.target, classList: e.target.classList, cellDateStr, rowHour});
                if (!e.target.classList.contains('week-event')) {
                    console.log('Opening Add Event modal for', cellDateStr, rowHour);
                    openAddEventModal(cellDateStr, rowHour);
                } else {
                    console.log('Click was on an event, not opening Add Event modal.');
                }
            });
            // All-day events: show at top row (hour==1)
            if (rowHour === 1) {
                const allDayEvents = calendarEvents.filter(ev => ev.date === cellDateStr && ev.allDay);
                allDayEvents.forEach(ev => {
                    const evDiv = document.createElement('div');
                    evDiv.className = 'week-event px-1 py-0.5 rounded mb-1 bg-blue-200 text-xs text-blue-900 truncate';
                    evDiv.style.cursor = 'pointer';
                    evDiv.addEventListener('click', function(e) {
                        e.stopPropagation();
                        openEditEventModal(ev.id);
                    });
                    evDiv.textContent = `${ev.title} (All Day)`;
                    dayCell.appendChild(evDiv);
                });
            }
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

    // All-day events at the top (before time rows)
    const allDayEvents = calendarEvents.filter(ev => ev.date === formatDateToISO(date) && ev.allDay);
    if (allDayEvents.length > 0) {
        const allDayRow = document.createElement('div');
        allDayRow.className = 'day-all-day-events mb-2';
        allDayEvents.forEach(ev => {
            const evDiv = document.createElement('div');
            evDiv.className = 'day-event px-1 py-0.5 rounded mb-1 bg-blue-200 text-xs text-blue-900 truncate';
            evDiv.style.cursor = 'pointer';
            evDiv.addEventListener('click', function(e) {
                e.stopPropagation();
                openEditEventModal(ev.id);
            });
            evDiv.textContent = `${ev.title} (All Day)`;
            allDayRow.appendChild(evDiv);
        });
        dayTimeGrid.appendChild(allDayRow);
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

        // Render events for this hour
        const eventsForHour = calendarEvents.filter(ev => {
            if (ev.date !== formatDateToISO(date)) return false;
            if (ev.allDay) return false;
            if (ev.startTime) {
                const [h, m] = ev.startTime.split(":").map(Number);
                return h === rowHour;
            }
            return false;
        });
        eventsForHour.forEach(ev => {
            const evDiv = document.createElement('div');
            evDiv.className = 'day-event px-1 py-0.5 rounded mb-1 bg-green-100 text-xs text-green-900 truncate';
            evDiv.style.cursor = 'pointer';
            evDiv.addEventListener('click', function(e) {
                e.stopPropagation();
                openEditEventModal(ev.id);
            });
            if (ev.endTime) {
                evDiv.textContent = `${ev.title} (${ev.startTime} - ${ev.endTime})`;
            } else {
                evDiv.textContent = `${ev.title} (${ev.startTime})`;
            }
            dayCell.appendChild(evDiv);
        });

        // Add event on cell click
        dayCell.addEventListener('click', (e) => {
            if (e.target.closest('.day-event')) return;
            openAddEventModal(formatDateToISO(date), rowHour);
        });
        dayTimeGrid.appendChild(dayCell);
    }

    console.log('dayTimeGrid children after render:', dayTimeGrid.children.length);
    console.log('dayTimeGrid:', dayTimeGrid, 'children:', dayTimeGrid.children.length, 'dayView.style.display:', dayView.style.display, 'computed display:', getComputedStyle(dayView).display);
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



// button for today
if (window.todayBtn) {
    window.todayBtn.addEventListener('click', () => {
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
}




// Add Event Button & Modal Logic

document.addEventListener('DOMContentLoaded', () => {
    function renderMonthView(date) {
       
    }
    function renderWeekView(date) {
       
    }
    function renderDayView(date) {
       
    }
    function renderYearView(date) {
       
    }

    // DOM assignments
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
    const yearView = document.getElementById('yearView');
    
    // View buttons
    const weekViewBtn = document.querySelector('.weekViewBtn');
    const dayViewBtn = document.querySelector('.dayViewBtn');
    const monthViewBtn = document.querySelector('.monthViewBtn');
    const yearViewBtn = document.querySelector('.yearViewBtn');


    // View switch event listeners
    if (weekViewBtn) {
        weekViewBtn.addEventListener('click', () => {
            currentView = 'week';
            renderWeekView(currentDate);
        });
    }
    if (dayViewBtn) {
        dayViewBtn.addEventListener('click', () => {
            currentView = 'day';
            renderDayView(currentDate);
        });
    }
    if (monthViewBtn) {
        monthViewBtn.addEventListener('click', () => {
            currentView = 'month';
            renderMonthView(currentDate);
        });
    }
    if (yearViewBtn) {
        yearViewBtn.addEventListener('click', () => {
            currentView = 'year';
            renderYearView(currentDate);
        });
    }



    // Add Event button opens modal
    const addEventBtn = document.getElementById('addEventBtn');
    const addEventModal = document.getElementById('addEventModal');
    const addEventForm = document.getElementById('addEventForm');

    // Utility: open Add Event modal with date/time prefilled
    function openAddEventModal(date, hour) {
        const eventDateInput = document.getElementById('eventDate');
        const eventStartTime = document.getElementById('eventStartTime');
        const eventEndTime = document.getElementById('eventEndTime');
        const eventAllDay = document.getElementById('eventAllDay');
        if (eventDateInput && date) eventDateInput.value = date;
        if (eventStartTime && hour) eventStartTime.value = String(hour).padStart(2, '0') + ':00';
        if (eventEndTime && hour) eventEndTime.value = '';
        if (eventAllDay) eventAllDay.checked = false;
        if (eventAllDay) eventAllDay.dispatchEvent(new Event('change'));
        const modal = new bootstrap.Modal(addEventModal);
        modal.show();
    }

    if (addEventBtn && addEventModal) {
        addEventBtn.addEventListener('click', () => {
            // Set default date to today
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const todayStr = `${yyyy}-${mm}-${dd}`;
            openAddEventModal(todayStr);
        });
    }

    // All Day toggle logic
    const eventAllDay = document.getElementById('eventAllDay');
    const eventTimeFields = document.getElementById('eventTimeFields');
    const eventStartTime = document.getElementById('eventStartTime');
    const eventEndTime = document.getElementById('eventEndTime');

    // Render initial calendar view on page load
    if (currentView === 'month') {
        renderMonthView(currentDate);
    } else if (currentView === 'week') {
        renderWeekView(currentDate);
    } else if (currentView === 'day') {
        renderDayView(currentDate);
    } else if (currentView === 'year') {
        renderYearView(currentDate);
    }

    if (eventAllDay && eventTimeFields && eventStartTime && eventEndTime) {
        eventAllDay.addEventListener('change', function() {
            if (eventAllDay.checked) {
                eventStartTime.value = '';
                eventEndTime.value = '';
                eventStartTime.disabled = true;
                eventEndTime.disabled = true;
                eventTimeFields.classList.add('d-none');
            } else {
                eventStartTime.disabled = false;
                eventEndTime.disabled = false;
                eventTimeFields.classList.remove('d-none');
            }
        });
        // Initialize state
        eventAllDay.dispatchEvent(new Event('change'));
    }

    // --- Edit & Delete Event Modal Logic ---
    const editEventModal = document.getElementById('editEventModal');
    const editEventForm = document.getElementById('editEventForm');
    const deleteEventBtn = document.getElementById('deleteEventBtn');
    const editEventId = document.getElementById('editEventId');
    const editEventTitle = document.getElementById('editEventTitle');
    const editEventDate = document.getElementById('editEventDate');
    const editEventAllDay = document.getElementById('editEventAllDay');
    const editEventTimeFields = document.getElementById('editEventTimeFields');
    const editEventStartTime = document.getElementById('editEventStartTime');
    const editEventEndTime = document.getElementById('editEventEndTime');
    const editEventDescription = document.getElementById('editEventDescription');



    // All Day toggle for edit modal
    if (editEventAllDay && editEventTimeFields && editEventStartTime && editEventEndTime) {
        editEventAllDay.addEventListener('change', function() {
            if (editEventAllDay.checked) {
                editEventStartTime.value = '';
                editEventEndTime.value = '';
                editEventStartTime.disabled = true;
                editEventEndTime.disabled = true;
                editEventTimeFields.classList.add('d-none');
            } else {
                editEventStartTime.disabled = false;
                editEventEndTime.disabled = false;
                editEventTimeFields.classList.remove('d-none');
            }
        });
    }

    // Handle save changes
    if (editEventForm) {
        editEventForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const id = editEventId.value;
            const idx = calendarEvents.findIndex(ev => ev.id === id);
            if (idx !== -1) {
                calendarEvents[idx].title = editEventTitle.value;
                calendarEvents[idx].date = editEventDate.value;
                calendarEvents[idx].allDay = editEventAllDay.checked;
                calendarEvents[idx].startTime = (!editEventAllDay.checked && editEventStartTime) ? editEventStartTime.value : null;
                calendarEvents[idx].endTime = (!editEventAllDay.checked && editEventEndTime) ? editEventEndTime.value : null;
                calendarEvents[idx].description = editEventDescription.value;
                // Save to localStorage
                if (window.localStorage) {
                    try { localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents)); } catch (e) {}
                }
                // Close modal and re-render
                const modal = bootstrap.Modal.getInstance(editEventModal);
                if (modal) modal.hide();
                if (currentView === 'month') {
                    renderMonthView(currentDate);
                } else if (currentView === 'week') {
                    renderWeekView(currentDate);
                } else if (currentView === 'day') {
                    renderDayView(currentDate);
                }
            }
        });
    }


    
    // Handle delete
    if (deleteEventBtn) {
        deleteEventBtn.addEventListener('click', function() {
            const id = editEventId.value;
            const idx = calendarEvents.findIndex(ev => ev.id === id);
            if (idx !== -1) {
                calendarEvents.splice(idx, 1);
                if (window.localStorage) {
                    try { localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents)); } catch (e) {}
                }
                const modal = bootstrap.Modal.getInstance(editEventModal);
                if (modal) modal.hide();
                if (currentView === 'month') {
                    renderMonthView(currentDate);
                } else if (currentView === 'week') {
                    renderWeekView(currentDate);
                } else if (currentView === 'day') {
                    renderDayView(currentDate);
                }
            }
        });
    }

    // Utility: open edit modal with event data
    function openEditEventModal(eventId) {
        const ev = calendarEvents.find(ev => ev.id === eventId);
        if (!ev) return;
        editEventId.value = ev.id;
        editEventTitle.value = ev.title;
        editEventDate.value = ev.date;
        editEventAllDay.checked = !!ev.allDay;
        editEventStartTime.value = ev.startTime || '';
        editEventEndTime.value = ev.endTime || '';
        editEventDescription.value = ev.description || '';
        if (editEventAllDay) editEventAllDay.dispatchEvent(new Event('change'));
        const modal = new bootstrap.Modal(editEventModal);
        modal.show();
    }

    if (addEventForm) {
        addEventForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Collect form data
            const title = document.getElementById('eventTitle').value;
            const date = document.getElementById('eventDate').value;
            const allDay = eventAllDay ? eventAllDay.checked : false;
            const startTime = (!allDay && eventStartTime) ? eventStartTime.value : null;
            const endTime = (!allDay && eventEndTime) ? eventEndTime.value : null;
            const description = document.getElementById('eventDescription').value;
            // Save event to global array
            const newEvent = {
                id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
                title,
                date,
                allDay,
                startTime,
                endTime,
                description
            };
            calendarEvents.push(newEvent);
            console.log('Event added:', newEvent);
            console.log('All events after add:', calendarEvents);
            // Persist to localStorage
            if (window.localStorage) {
                try {
                    localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
                } catch (e) {}
            }
            // Re-render current view
            console.log('Re-rendering current view:', currentView, currentDate);
            if (currentView === 'month') {
                renderMonthView(currentDate);
            } else if (currentView === 'week') {
                renderWeekView(currentDate);
            } else if (currentView === 'day') {
                renderDayView(currentDate);
            }
            // Re-render the current view after adding event
            if (currentView === 'month') {
                renderMonthView(currentDate);
            } else if (currentView === 'week') {
                renderWeekView(currentDate);
            } else if (currentView === 'day') {
                renderDayView(currentDate);
            } else if (currentView === 'year') {
                renderYearView(currentDate);
            }
            // Close modal and clear form
            const modal = bootstrap.Modal.getInstance(addEventModal);
            if (modal) modal.hide();
            addEventForm.reset();
            // Optionally, show a toast or alert for success
            if (eventAllDay) eventAllDay.dispatchEvent(new Event('change'));
        });
    }

    window.monthViewBtn = document.querySelector('.monthViewBtn');
    window.weekViewBtn = document.querySelector('.weekViewBtn');
    window.dayViewBtn = document.querySelector('.dayViewBtn');

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