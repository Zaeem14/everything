
let currentDate = new Date();
let currentView = 'month';
let calendarEvents = [];

// DOM elements will be initialized after DOM is loaded
let monthView, weekView, dayView, yearView, monthGrid, weekTimeGrid, dayTimeGrid, yearGrid, currentDisplay, todayBtn;
let weekViewBtn, dayViewBtn, monthViewBtn, yearViewBtn;

// --- Drag-select globals ---
let isDragging = false;
let dragStartDate = null;
let dragStartHour = null;
let currentHighlighted = [];

// ---- Enhanced Drag-select helper functions (global) ----
function clearDragHighlight() {
    currentHighlighted.forEach(cell => cell.classList.remove('selecting'));
    currentHighlighted = [];
    // Remove dragging class from grids
    document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
}

function highlightRange(gridEl, date, startH, endH) {
    clearDragHighlight();
    const [minH, maxH] = startH < endH ? [startH, endH] : [endH, startH];
    const selector = `.day-cell[data-date="${date}"]`;
    const cells = Array.from(gridEl.querySelectorAll(selector));
    cells.forEach(cell => {
        const h = Number(cell.dataset.hour);
        if (h >= minH && h <= maxH) {
            cell.classList.add('selecting');
            currentHighlighted.push(cell);
        }
    });
}

// Enhanced function to support month view drag selection
function highlightMonthRange(startDate, endDate) {
    clearDragHighlight();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const [minDate, maxDate] = start <= end ? [start, end] : [end, start];

    const cells = Array.from(document.querySelectorAll('.month-cell'));
    cells.forEach(cell => {
        if (cell.dataset.date) {
            const cellDate = new Date(cell.dataset.date);
            if (cellDate >= minDate && cellDate <= maxDate) {
                cell.classList.add('selecting');
                currentHighlighted.push(cell);
            }
        }
    });
}

// Universal drag selection enabler for all views
function enableDragSelection(gridEl, viewType = 'time') {
    if (!gridEl || gridEl.dataset.dragSetup) return; // prevent duplicates
    gridEl.dataset.dragSetup = '1';

    let dragStartCell = null;
    let hasDragged = false;

    // Clear any existing drag-related classes
    const clearDragClasses = () => {
        document.querySelectorAll('.selecting, .dragging').forEach(el => {
            el.classList.remove('selecting', 'dragging');
        });
    };

    // Add draggable class to cells for visual feedback
    if (viewType === 'month') {
        gridEl.querySelectorAll('.month-cell').forEach(cell => cell.classList.add('draggable'));
    } else {
        gridEl.querySelectorAll('.day-cell').forEach(cell => cell.classList.add('draggable'));
    }

    gridEl.addEventListener('mousedown', e => {
        clearDragClasses();
        
        const cell = viewType === 'month' ?
            e.target.closest('.month-cell') :
            e.target.closest('.day-cell');

        if (!cell || !cell.dataset.date) return;

        // Don't start drag if clicking on an event
        if (e.target.closest('.week-event, .month-event, .time-event')) return;

        isDragging = true;
        hasDragged = false;
        dragStartCell = cell;
        gridEl.classList.add('dragging');
        dragStartDate = cell.dataset.date;

        if (viewType === 'month') {
            highlightMonthRange(dragStartDate, dragStartDate);
        } else {
            dragStartHour = Number(cell.dataset.hour || 0);
            highlightRange(gridEl, dragStartDate, dragStartHour, dragStartHour);
        }
        e.preventDefault();
        e.stopPropagation();
    });

    gridEl.addEventListener('mousemove', e => {
        if (!isDragging) return;

        const cell = viewType === 'month' ?
            e.target.closest('.month-cell') :
            e.target.closest('.day-cell');

        if (!cell || !cell.dataset.date) return;

        // Mark that we've actually dragged (not just clicked)
        if (cell !== dragStartCell) {
            hasDragged = true;
        }

        if (viewType === 'month') {
            highlightMonthRange(dragStartDate, cell.dataset.date);
        } else {
            if (cell.dataset.date !== dragStartDate) return;
            const hour = Number(cell.dataset.hour || 0);
            highlightRange(gridEl, dragStartDate, dragStartHour, hour);
        }
    });

    // Use a single global mouseup handler
    const mouseUpHandler = e => {
        if (!isDragging) return;

        const wasDragging = hasDragged;
        isDragging = false;
        hasDragged = false;
        dragStartCell = null;
        gridEl.classList.remove('dragging');

        const cell = viewType === 'month' ?
            e.target.closest('.month-cell') :
            e.target.closest('.day-cell');

        // Only open modal if we actually dragged
        if (wasDragging) {
            if (viewType === 'month') {
                let endDate = dragStartDate;
                if (cell && cell.dataset.date) {
                    endDate = cell.dataset.date;
                }
                clearDragHighlight();
                // For month view, open modal with all-day event
                openAddEventModal(dragStartDate, null, true, null, endDate);
            } else {
                let endHour = dragStartHour;
                if (cell && cell.dataset.date === dragStartDate) {
                    endHour = Number(cell.dataset.hour || 0) + 1; // make end exclusive
                } else {
                    endHour = dragStartHour + 1;
                }
                clearDragHighlight();
                openAddEventModal(dragStartDate, Math.min(dragStartHour, endHour - 1), false, endHour);
            }
            e.preventDefault();
            e.stopPropagation();
        } else {
            // If we didn't drag, just clear the highlight
            clearDragHighlight();
        }
    };

    // Remove old listener if exists and add new one
    document.removeEventListener('mouseup', mouseUpHandler);
    document.addEventListener('mouseup', mouseUpHandler);
}

// --- Utility: update dropdown toggle text based on current view (global) ---
function updateDropdownText() {
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    if (dropdownToggle) {
        const textMap = {
            'month': 'Month',
            'week': 'Week',
            'day': 'Day',
            'year': 'Year'
        };
        dropdownToggle.textContent = textMap[currentView] || 'Month';
    }
}

// --- Utility: setup color pickers ---
function setupColorPickers() {
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.addEventListener('click', () => {
            // Deselect others
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            const color = opt.getAttribute('data-color');
            const eventColorInput = document.getElementById('eventColor');
            if (eventColorInput) eventColorInput.value = color;
            const editEventColorInput = document.getElementById('editEventColor');
            if (editEventColorInput) editEventColorInput.value = color;
        });
    });
}

// Initialize the calendar when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Initialize DOM elements
    monthView = document.getElementById('monthView');
    
    // Ensure sidebar is visible
    const calendarSidebar = document.getElementById('calendarSidebar');
    if (calendarSidebar) {
        calendarSidebar.style.display = 'block';
    }
    weekView = document.getElementById('weekView');
    dayView = document.getElementById('dayView');
    yearView = document.getElementById('yearView');
    monthGrid = document.getElementById('monthGrid');
    weekTimeGrid = document.getElementById('weekTimeGrid');
    dayTimeGrid = document.getElementById('dayTimeGrid');
    yearGrid = document.getElementById('yearGrid');
    currentDisplay = document.getElementById('currentDisplay');
    todayBtn = document.querySelector('.today-button');

    // Initialize view buttons
    weekViewBtn = document.querySelector('.weekViewBtn');
    dayViewBtn = document.querySelector('.dayViewBtn');
    monthViewBtn = document.querySelector('.monthViewBtn');
    yearViewBtn = document.querySelector('.yearViewBtn');

    // Set up view switch event listeners
    if (weekViewBtn) {
        weekViewBtn.addEventListener('click', () => {
            currentView = 'week';
            renderWeekView(currentDate);
            updateDropdownText();
        });
    }
    if (dayViewBtn) {
        dayViewBtn.addEventListener('click', () => {
            currentView = 'day';
            renderDayView(currentDate);
            updateDropdownText();
        });
    }
    if (monthViewBtn) {
        monthViewBtn.addEventListener('click', () => {
            currentView = 'month';
            renderMonthView(currentDate);
            updateDropdownText();
        });
    }
    if (yearViewBtn) {
        yearViewBtn.addEventListener('click', () => {
            currentView = 'year';
            renderYearView(currentDate);
            updateDropdownText();
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
    updateDropdownText();

    // Initialize color pickers
    setupColorPickers();

    // Set up event listeners for the calendar navigation
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const todayNavBtn = document.getElementById('todayBtn');

    if (prevBtn) {
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
            updateDropdownText();
        });
    }

    if (nextBtn) {
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
            updateDropdownText();
        });
    }

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
            updateDropdownText();
        });
    }
});



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
        dayDiv.classList.add('calendar-day', 'month-cell', 'py-2', 'relative');
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
                evDiv.className = 'month-event px-1 py-0.5 rounded mb-1 text-xs truncate';
                evDiv.style.cursor = 'pointer';
                evDiv.style.backgroundColor = ev.color ? `${ev.color}20` : '#e3f2fd';
                evDiv.style.color = ev.color || '#0d47a1';
                evDiv.addEventListener('click', function (e) {
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

        // Enable drag selection for month view
        enableDragSelection(monthGrid, 'month');
    }
}

function renderWeekView(date) {
    // Set week date range above grid
    // Hide other views, show week view
    if (monthView) monthView.style.display = 'none';
    if (weekView) weekView.style.display = 'block';
    if (yearGrid) yearGrid.style.display = 'none';
    if (dayView) dayView.style.display = 'none';

    // Clear all-day events row
    const weekAllDayEvents = document.getElementById('weekAllDayEvents');
    if (weekAllDayEvents) {
        weekAllDayEvents.innerHTML = '';

        // Create a cell for each day of the week
        for (let d = 0; d < 7; d++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell p-1 min-h-[2rem]';
            dayCell.dataset.date = formatDateToISO(new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + d));

            // Find all-day events for this day
            const allDayEvents = calendarEvents.filter(ev =>
                ev.date === dayCell.dataset.date && ev.allDay
            );

            // Add each all-day event
            allDayEvents.forEach(ev => {
                const evDiv = document.createElement('div');
                evDiv.className = 'all-day-event event-cell';
                
                // Set background with opacity and solid border
                const bgColor = ev.color ? `${ev.color}30` : '#e3f2fd';
                const borderColor = ev.color || '#4285F4';
                
                evDiv.style.setProperty('--event-color', bgColor);
                evDiv.style.setProperty('--event-border-color', borderColor);
                evDiv.style.backgroundColor = bgColor;
                evDiv.style.borderLeft = `3px solid ${borderColor}`;
                evDiv.style.color = '#1a202c';
                evDiv.style.cursor = 'pointer';
                evDiv.textContent = ev.title;

                evDiv.addEventListener('click', function (e) {
                    e.stopPropagation();
                    openEditEventModal(ev.id);
                });

                dayCell.appendChild(evDiv);
            });

            // Make empty cells clickable to add new all-day events
            if (allDayEvents.length === 0) {
                dayCell.style.minHeight = '2rem';
                dayCell.style.cursor = 'pointer';
                dayCell.addEventListener('click', function () {
                    openAddEventModal(dayCell.dataset.date, 0, true);
                });
            }

            weekAllDayEvents.appendChild(dayCell);
        }
    }

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

    // Ensure drag-to-select listeners are attached
    if (weekTimeGrid) {
        enableDragSelection(weekTimeGrid);
    }

    // Clear the week time grid
    if (weekTimeGrid) {
        weekTimeGrid.innerHTML = '';
        weekTimeGrid.classList.add('time-grid');
        weekTimeGrid.style.position = 'relative';
    }

    // Define time slots (e.g., 1:00 to 24:00)
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
            dayCell.classList.add('week-cell', 'day-cell', 'border', 'border-gray-200', 'relative', 'hover:bg-blue-50', 'h-12');

            // For future event placement, store date and hour
            const currentDay = new Date(startOfWeek);
            currentDay.setDate(startOfWeek.getDate() + d);
            const cellDateStr = formatDateToISO(currentDay);
            dayCell.dataset.date = cellDateStr;
            dayCell.dataset.hour = rowHour;

            // Check if any event spans this hour for this day
            const eventsForCell = [];
            calendarEvents.forEach(ev => {
                // Skip all-day events as they are handled separately
                if (ev.allDay) return;
                
                // Parse event date and time
                const eventDate = new Date(ev.date);
                const cellDate = new Date(cellDateStr);
                
                // Only process events for this specific day
                if (eventDate.toDateString() !== cellDate.toDateString()) {
                    return;
                }

                // Parse start and end times
                const [startH, startM] = ev.startTime ? ev.startTime.split(":").map(Number) : [0, 0];
                let [endH, endM] = ev.endTime ? ev.endTime.split(":").map(Number) : [23, 59];
                
                // If end time is on the hour, include the previous hour
                if (endM === 0 && endH > 0) {
                    endH--;
                    endM = 59;
                }

                // Check if current hour is within event's time range
                if (rowHour >= startH && rowHour <= endH) {
                    eventsForCell.push(ev);
                }
            });

            // Process events for this cell
            eventsForCell.forEach(ev => {
                const [startH, startM] = ev.startTime ? ev.startTime.split(":").map(Number) : [0, 0];
                let [endH, endM] = ev.endTime ? ev.endTime.split(":").map(Number) : [23, 59];
                
                // Create event element
                const evDiv = document.createElement('div');
                evDiv.className = 'time-event';
                
                // Set color-related styles
                const bgColor = ev.color ? `${ev.color}CC` : '#4285F4CC';
                const borderColor = ev.color || '#4285F4';
                
                // Apply styles as CSS properties
                evDiv.style.setProperty('--event-bg-color', bgColor);
                evDiv.style.setProperty('--event-border-color', borderColor);
                
                // Reset any problematic styles
                evDiv.style.margin = '0';
                evDiv.style.position = 'absolute';
                evDiv.style.left = '2px';
                evDiv.style.right = '2px';
                evDiv.style.width = 'calc(100% - 4px)';
                evDiv.style.boxSizing = 'border-box';
                
                // Set cursor and z-index
                evDiv.style.cursor = 'pointer';
                evDiv.style.zIndex = '5';

                // Calculate position and height based on time
                const startMinute = rowHour === startH ? startM : 0;
                const endMinute = rowHour === endH ? endM : 60;
                const heightPercent = ((endMinute - startMinute) / 60) * 100;
                const topPercent = (startMinute / 60) * 100;
                
                evDiv.style.top = `${topPercent}%`;
                evDiv.style.height = `calc(${heightPercent}% - 1px)`; // Subtract 1px for border

                // Only show title in the starting hour cell
                if (rowHour === startH) {
                    const titleDiv = document.createElement('div');
                    titleDiv.className = 'font-semibold truncate';
                    titleDiv.textContent = ev.title;
                    titleDiv.style.overflow = 'hidden';
                    titleDiv.style.textOverflow = 'ellipsis';
                    titleDiv.style.whiteSpace = 'nowrap';
                    evDiv.appendChild(titleDiv);
                    
                    const timeDiv = document.createElement('div');
                    timeDiv.className = 'text-xxs opacity-90';
                    timeDiv.textContent = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')} - ${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
                    timeDiv.style.overflow = 'hidden';
                    timeDiv.style.textOverflow = 'ellipsis';
                    timeDiv.style.whiteSpace = 'nowrap';
                    evDiv.appendChild(timeDiv);
                }

                evDiv.addEventListener('click', function (e) {
                    e.stopPropagation();
                    openEditEventModal(ev.id);
                });

                dayCell.style.position = 'relative';
                dayCell.style.overflow = 'visible';
                dayCell.appendChild(evDiv);
            });
            // Add event by clicking empty week cell (only if not dragging)
            dayCell.addEventListener('click', function (e) {
                // Don't open modal if we're dragging or just finished dragging
                if (isDragging || weekTimeGrid.classList.contains('dragging')) {
                    return;
                }
                console.log('Week cell clicked:', { target: e.target, classList: e.target.classList, cellDateStr, rowHour });
                if (!e.target.classList.contains('week-event')) {
                    console.log('Opening Add Event modal for', cellDateStr, rowHour);
                    openAddEventModal(cellDateStr, rowHour);
                } else {
                    console.log('Click was on an event, not opening Add Event modal.');
                }
            });
            // Enable drag selection for the grid
            if (!weekTimeGrid.dataset.dragSetup) {
                enableDragSelection(weekTimeGrid);
            }
            // All-day events are now handled in the dedicated all-day row above
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

    // Clear existing grid
    dayTimeGrid.innerHTML = '';

    // Ensure grid has the right classes for selection
    dayTimeGrid.classList.add('time-grid');
    dayTimeGrid.style.position = 'relative';

    // Attach drag-to-select listeners
    enableDragSelection(dayTimeGrid);
    const dayViewContent = dayView.querySelector('.day-view-content');

    if (!dayView) {
        console.error('dayView container not found');
        return;
    }
    if (!dayTimeGrid) {
        console.error('dayTimeGrid container not found');
        return;
    }

    // Hide other views, show day view
    dayView.style.display = 'flex';
    if (weekView) weekView.style.display = 'none';
    if (monthView) monthView.style.display = 'none';
    if (yearGrid) yearGrid.style.display = 'none';

    // Set the main header (if needed)
    if (currentDisplay) {
        currentDisplay.textContent = new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    }

    // Update or create day view header
    let dayViewHeader = dayView.querySelector('.day-view-header');
    if (!dayViewHeader) {
        dayViewHeader = document.createElement('div');
        dayViewHeader.classList.add('day-view-header');
        dayView.insertBefore(dayViewHeader, dayViewContent);
    } else {
        dayViewHeader.innerHTML = '';
    }

    // Highlight header if today
    const today = new Date();
    const isToday = date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();

    if (isToday) {
        dayViewHeader.classList.add('day-header-today');
    } else {
        dayViewHeader.classList.remove('day-header-today');
    }

    // Set the header content
    dayViewHeader.textContent = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    // Clear the time grid
    dayTimeGrid.innerHTML = '';
    console.log('dayTimeGrid cleared, ready to populate');

    // Create a container for the time grid
    const timeGridContainer = document.createElement('div');
    timeGridContainer.className = 'day-time-grid-container';
    dayTimeGrid.appendChild(timeGridContainer);

    // Clear all-day events row
    const dayAllDayEvents = document.getElementById('dayAllDayEvents');
    if (dayAllDayEvents) {
        dayAllDayEvents.innerHTML = '';

        // Find all-day events for this day
        const allDayEvents = calendarEvents.filter(ev =>
            ev.date === formatDateToISO(date) && ev.allDay
        );

        // Add each all-day event
        allDayEvents.forEach(ev => {
            const evDiv = document.createElement('div');
            evDiv.className = 'all-day-event px-3 py-2 rounded text-sm mb-1 inline-block mr-2';
            evDiv.style.backgroundColor = ev.color ? `${ev.color}30` : '#e3f2fd';
            evDiv.style.color = ev.color || '#0d47a1';
            evDiv.style.borderLeft = `3px solid ${ev.color || '#4285F4'}`;
            evDiv.style.cursor = 'pointer';
            evDiv.textContent = ev.title;

            evDiv.addEventListener('click', function (e) {
                e.stopPropagation();
                openEditEventModal(ev.id);
            });

            dayAllDayEvents.appendChild(evDiv);
        });

        // Add "+ Add" button if no all-day events
        if (allDayEvents.length === 0) {
            const addButton = document.createElement('button');
            addButton.className = 'text-xs text-gray-500 hover:text-blue-500';
            addButton.innerHTML = '+ Add';
            addButton.addEventListener('click', function () {
                openAddEventModal(formatDateToISO(date), 0, true);
            });
            dayAllDayEvents.appendChild(addButton);
        }
    }

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
            evDiv.className = 'day-event px-1 py-0.5 rounded mb-1 text-xs truncate';
            evDiv.style.cursor = 'pointer';
            evDiv.style.backgroundColor = ev.color ? `${ev.color}20` : '#e3f2fd';
            evDiv.style.color = ev.color || '#0d47a1';
            evDiv.addEventListener('click', function (e) {
                e.stopPropagation();
                openEditEventModal(ev.id);
            });
            evDiv.textContent = `${ev.title} (All Day)`;
            allDayRow.appendChild(evDiv);
        });
        dayTimeGrid.appendChild(allDayRow);
    }

    // For each hour, create a row with time label and day cell
    for (let i = 0; i < hours.length; i++) {
        const rowHour = hours[i];

        // Create a row container
        const row = document.createElement('div');
        row.className = 'day-time-row';

        // Time label cell (left side)
        const timeCell = document.createElement('div');
        timeCell.className = 'time-label-cell';

        const timeLabel = document.createElement('div');
        timeLabel.className = 'time-label';

        // Format time (e.g., 12 PM, 1 PM, etc.)
        let displayHour = rowHour % 12 || 12;
        const ampm = rowHour < 12 || rowHour === 24 ? 'AM' : 'PM';
        if (rowHour === 0) displayHour = 12; // 12 AM
        if (rowHour === 24) displayHour = 12; // 12 AM next day

        timeLabel.textContent = `${displayHour} ${ampm}`;
        timeCell.appendChild(timeLabel);
        row.appendChild(timeCell);

        // Day cell (right side)
        const dayCell = document.createElement('div');
        dayCell.className = 'day-cell';
        dayCell.dataset.date = formatDateToISO(date);
        dayCell.dataset.hour = rowHour;

        // Store date and hour for event placement
        dayCell.dataset.date = formatDateToISO(date);
        dayCell.dataset.hour = rowHour;

        // Check if any event spans this hour
        const eventsForHour = [];
        calendarEvents.forEach(ev => {
            if (ev.date !== formatDateToISO(date) || ev.allDay) return;

            const [startH, startM] = ev.startTime ? ev.startTime.split(":").map(Number) : [0, 0];
            let endH = 23, endM = 59; // Default to end of day if no end time

            if (ev.endTime) {
                [endH, endM] = ev.endTime.split(":").map(Number);
                // If end time is on the hour, include the previous hour
                if (endM === 0) endH--;
            }

            // Check if current hour is within event's time range
            if (rowHour >= startH && rowHour <= endH) {
                eventsForHour.push(ev);

                // Apply solid color to the entire cell for this hour
                dayCell.style.backgroundColor = ev.color || '#4285F4';
                dayCell.style.color = '#ffffff';
                dayCell.style.borderLeft = `4px solid ${ev.color || '#4285F4'}`;
                dayCell.classList.add('event-cell');

                // Only show event title in the starting hour
                if (rowHour === startH) {
                    const evDiv = document.createElement('div');
                    evDiv.className = 'day-event-title text-white font-semibold text-xs p-1';
                    evDiv.style.cursor = 'pointer';
                    evDiv.style.textShadow = '0 1px 2px rgba(0,0,0,0.2)';
                    evDiv.addEventListener('click', function (e) {
                        e.stopPropagation();
                        openEditEventModal(ev.id);
                    });
                    evDiv.textContent = ev.title;
                    const timeSpan = document.createElement('div');
                    timeSpan.className = 'text-xs opacity-90';
                    timeSpan.textContent = `${ev.startTime || ''} - ${ev.endTime || ''}`;
                    evDiv.appendChild(timeSpan);
                    dayCell.appendChild(evDiv);
                }
            }
        });

        // Add event on cell click (only if not dragging)
        dayCell.addEventListener('click', (e) => {
            // Don't open modal if we're dragging or just finished dragging
            if (isDragging || dayTimeGrid.classList.contains('dragging')) return;
            if (e.target.closest('.day-event-title')) return;
            openAddEventModal(formatDateToISO(date), rowHour);
        });
        // Add day cell to row
        row.appendChild(dayCell);

        // Add row to container
        timeGridContainer.appendChild(row);
    }

    console.log('dayTimeGrid children after render:', dayTimeGrid.children.length);
    console.log('dayTimeGrid:', dayTimeGrid, 'children:', dayTimeGrid.children.length, 'dayView.style.display:', dayView.style.display, 'computed display:', getComputedStyle(dayView).display);
}

// Year view
function renderYearView(date) {
    // Show year view, hide others
    if (yearView) yearView.style.display = 'block';
    if (monthView) monthView.style.display = 'none';
    if (weekView) weekView.style.display = 'none';
    if (dayView) dayView.style.display = 'none';

    // Clear the year grid and set layout
    if (yearGrid) {
        yearGrid.innerHTML = '';
        yearGrid.style.display = 'grid';
        yearGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
        yearGrid.style.gap = '8px';
    }

    const year = date.getFullYear();
    if (currentDisplay) currentDisplay.textContent = `${year}`;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    for (let m = 0; m < 12; m++) {
        const monthContainer = document.createElement('div');
        monthContainer.className = 'year-month border rounded p-1 text-xs cursor-pointer hover:bg-gray-100';

        // Month header
        const monthHeader = document.createElement('div');
        monthHeader.className = 'font-semibold text-center mb-1';
        monthHeader.textContent = monthNames[m];
        monthContainer.appendChild(monthHeader);

        // Mini month grid
        const daysInMonth = new Date(year, m + 1, 0).getDate();
        const firstDay = new Date(year, m, 1).getDay();

        const miniGrid = document.createElement('div');
        miniGrid.style.display = 'grid';
        miniGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';
        miniGrid.style.gap = '1px';

        // Leading blanks for first week alignment
        for (let i = 0; i < firstDay; i++) {
            miniGrid.appendChild(document.createElement('div'));
        }
        // Day numbers
        for (let d = 1; d <= daysInMonth; d++) {
            const dayCell = document.createElement('div');
            dayCell.textContent = d;
            dayCell.className = 'text-center';
            miniGrid.appendChild(dayCell);
        }

        monthContainer.appendChild(miniGrid);

        // Clicking a month switches to month view of that month
        monthContainer.addEventListener('click', () => {
            currentDate = new Date(year, m, 1);
            currentView = 'month';
            renderMonthView(currentDate);
            updateDropdownText();
        });

        if (yearGrid) yearGrid.appendChild(monthContainer);
    }
}

// Utility: open Add Event modal with date/time prefilled
// Enhanced to support multi-day events with endDate parameter

function openAddEventModal(date, hour, isAllDay = false, endHour = null, endDate = null) {
    const eventDateInput = document.getElementById('eventDate');
    const eventStartTime = document.getElementById('eventStartTime');
    const eventEndTime = document.getElementById('eventEndTime');
    const eventAllDay = document.getElementById('eventAllDay');
    const timeFields = document.getElementById('eventTimeFields');
    const eventTitle = document.getElementById('eventTitle');

    // Clear previous values
    if (eventTitle) eventTitle.value = '';

    if (eventDateInput && date) eventDateInput.value = date;

    // For multi-day events, we'll need to enhance the form to support end date
    // For now, we'll set the title to indicate the date range
    if (endDate && endDate !== date) {
        const startD = new Date(date);
        const endD = new Date(endDate);
        const options = { month: 'short', day: 'numeric' };
        const rangeText = `${startD.toLocaleDateString('en-US', options)} - ${endD.toLocaleDateString('en-US', options)}`;
        if (eventTitle) {
            eventTitle.placeholder = `Event (${rangeText})`;
        }
    }

    if (isAllDay) {
        if (eventAllDay) eventAllDay.checked = true;
        if (timeFields) timeFields.style.display = 'none';
        if (eventStartTime) eventStartTime.value = '00:00';
        if (eventEndTime) eventEndTime.value = '23:59';
    } else {
        if (eventAllDay) eventAllDay.checked = false;
        if (timeFields) timeFields.style.display = 'block';
        if (hour !== undefined && hour !== null) {
            const computedEnd = endHour !== null ? endHour : (hour + 1);
            const startVal = `${String(hour).padStart(2, '0')}:00`;
            const endVal = `${String(computedEnd).padStart(2, '0')}:00`;
            if (eventStartTime) eventStartTime.value = startVal;
            if (eventEndTime) eventEndTime.value = endVal;
        }
    }

    const modal = new bootstrap.Modal(document.getElementById('addEventModal'));
    modal.show();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    // Set up event listeners for view buttons
    const weekViewBtn = document.querySelector('.weekViewBtn');
    const dayViewBtn = document.querySelector('.dayViewBtn');
    const monthViewBtn = document.querySelector('.monthViewBtn');
    const yearViewBtn = document.querySelector('.yearViewBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const todayNavBtn2 = document.querySelector('.today-button');
    const addEventBtn = document.getElementById('addEventBtn');

    // View switch event listeners
    if (weekViewBtn) {
        weekViewBtn.addEventListener('click', () => {
            currentView = 'week';
            renderWeekView(currentDate);
            updateDropdownText();
        });
    }

    if (dayViewBtn) {
        dayViewBtn.addEventListener('click', () => {
            currentView = 'day';
            renderDayView(currentDate);
            updateDropdownText();
        });
    }

    if (monthViewBtn) {
        monthViewBtn.addEventListener('click', () => {
            currentView = 'month';
            renderMonthView(currentDate);
            updateDropdownText();
        });
    }

    if (yearViewBtn) {
        yearViewBtn.addEventListener('click', () => {
            currentView = 'year';
            renderYearView(currentDate);
            updateDropdownText();
        });
    }

    // Navigation buttons
    if (prevBtn) {
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
    }

    if (nextBtn) {
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
    }

    // Today button
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

    // Add event button
    if (addEventBtn) {
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
        eventAllDay.addEventListener('change', function () {
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
    const editEventColor = document.getElementById('editEventColor');

    // All Day toggle for edit modal
    if (editEventAllDay && editEventTimeFields && editEventStartTime && editEventEndTime) {
        editEventAllDay.addEventListener('change', function () {
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
        editEventForm.addEventListener('submit', function (e) {
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
                calendarEvents[idx].color = editEventColor.value || '#4285F4';
                // Save to localStorage
                if (window.localStorage) {
                    try { localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents)); } catch (e) { }
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

    // Utility: open edit modal with event data
    function openEditEventModal(eventId) {
        const event = calendarEvents.find(ev => ev.id === eventId);
        if (!event) return;

        editEventId.value = event.id;
        editEventTitle.value = event.title;
        editEventDate.value = event.date;
        editEventAllDay.checked = event.allDay || false;
        editEventStartTime.value = event.startTime || '';
        editEventEndTime.value = event.endTime || '';
        editEventDescription.value = event.description || '';
        editEventColor.value = event.color || '#4285F4';

        // Set the color picker
        const color = event.color || '#4285F4';
        document.querySelectorAll('#editEventModal .color-option').forEach(option => {
            option.classList.remove('selected');
            if (option.getAttribute('data-color') === color) {
                option.classList.add('selected');
            }
        });
        if (editEventAllDay) editEventAllDay.dispatchEvent(new Event('change'));
        const modal = new bootstrap.Modal(editEventModal);
        modal.show();
    }

    if (addEventForm) {
        console.log('Add event form found, attaching submit listener');
        addEventForm.addEventListener('submit', function (e) {
            e.preventDefault();
            console.log('Form submitted!');

            // Collect form data
            const title = document.getElementById('eventTitle').value;
            const date = document.getElementById('eventDate').value;
            const allDay = document.getElementById('eventAllDay').checked;
            const startTime = document.getElementById('eventStartTime').value;
            const endTime = document.getElementById('eventEndTime').value;
            const description = document.getElementById('eventDescription').value;
            const color = document.getElementById('eventColor').value || '#4285F4';

            console.log('Form values:', { title, date, allDay, startTime, endTime, description, color });

            // Create event object
            const newEvent = {
                id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
                title: title,
                date: date,
                allDay: allDay,
                startTime: allDay ? null : startTime,
                endTime: allDay ? null : endTime,
                description: description || '',
                color: color || '#4285F4'
            };

            console.log('Creating new event:', newEvent);
            calendarEvents.push(newEvent);
            console.log('Event added successfully. Total events:', calendarEvents.length);
            console.log('All events:', calendarEvents);
            // Persist to localStorage
            if (window.localStorage) {
                try {
                    localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
                } catch (e) { }
            }
            // Re-render current view
            console.log('Re-rendering current view:', currentView, currentDate);
            switch (currentView) {
                case 'month':
                    renderMonthView(currentDate);
                    break;
                case 'week':
                    renderWeekView(currentDate);
                    break;
                case 'day':
                    renderDayView(currentDate);
                    break;
                case 'year':
                    renderYearView(currentDate);
                    break;
            }
            // Close modal and clear form
            const modal = bootstrap.Modal.getInstance(addEventModal);
            if (modal) modal.hide();
            // Clear form and reset color picker
            addEventForm.reset();
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            const defaultColor = document.querySelector('.color-option[data-color="#4285F4"]');
            if (defaultColor) defaultColor.classList.add('selected');
            // Reset event color input
            const eventColorInput = document.getElementById('eventColor');
            if (eventColorInput) eventColorInput.value = '#4285F4';
            // Reset all day toggle
            if (eventAllDay) eventAllDay.dispatchEvent(new Event('change'));
        });
    }

    // Initialize view buttons in global scope and set up event listeners
    const setupViewButtons = () => {
        if (monthViewBtn) {
            monthViewBtn.addEventListener('click', () => {
                currentView = 'month';
                renderMonthView(currentDate);
                updateDropdownText();
            });
        }
        if (weekViewBtn) {
            weekViewBtn.addEventListener('click', () => {
                currentView = 'week';
                renderWeekView(currentDate);
                updateDropdownText();
            });
        }
        if (dayViewBtn) {
            dayViewBtn.addEventListener('click', () => {
                currentView = 'day';
                renderDayView(currentDate);
                updateDropdownText();
            });
        }
        if (yearViewBtn) {
            yearViewBtn.addEventListener('click', () => {
                currentView = 'year';
                renderYearView(currentDate);
                updateDropdownText();
            });
        }
    };

    setupViewButtons();

    // ---- Drag-select helper functions ----
    function clearDragHighlight() {
        currentHighlighted.forEach(cell => cell.classList.remove('selecting'));
        currentHighlighted = [];
    }

    function highlightRange(gridEl, date, startH, endH) {
        clearDragHighlight();
        const [minH, maxH] = startH < endH ? [startH, endH] : [endH, startH];
        const selector = `.day-cell[data-date="${date}"]`;
        const cells = Array.from(gridEl.querySelectorAll(selector));
        cells.forEach(cell => {
            const h = Number(cell.dataset.hour);
            if (h >= minH && h <= maxH) {
                cell.classList.add('selecting');
                currentHighlighted.push(cell);
            }
        });
    }

    function enableDragSelection(gridEl) {
        if (!gridEl || gridEl.dataset.dragSetup) return; // prevent duplicates
        gridEl.dataset.dragSetup = '1';

        gridEl.addEventListener('mousedown', e => {
            const cell = e.target.closest('.day-cell');
            if (!cell) return;
            isDragging = true;
            dragStartDate = cell.dataset.date;
            dragStartHour = Number(cell.dataset.hour);
            highlightRange(gridEl, dragStartDate, dragStartHour, dragStartHour);
            e.preventDefault();
        });

        gridEl.addEventListener('mousemove', e => {
            if (!isDragging) return;
            const cell = e.target.closest('.day-cell');
            if (!cell || cell.dataset.date !== dragStartDate) return;
            const currHour = Number(cell.dataset.hour);
            highlightRange(gridEl, dragStartDate, dragStartHour, currHour);
        });

        document.addEventListener('mouseup', e => {
            if (!isDragging) return;
            isDragging = false;
            const cell = e.target.closest('.day-cell');
            let endHour = dragStartHour;
            if (cell && cell.dataset.date === dragStartDate) {
                endHour = Number(cell.dataset.hour) + 1; // make end exclusive
            } else {
                // if mouseup outside grid keep original hour+1
                endHour = dragStartHour + 1;
            }
            clearDragHighlight();
            openAddEventModal(dragStartDate, Math.min(dragStartHour, endHour - 1), false, endHour);
        });
    }

    // Update dropdown toggle text based on current view
    function updateDropdownText() {
        const dropdownToggle = document.querySelector('.dropdown-toggle');
        if (dropdownToggle) {
            const textMap = {
                'month': 'Month',
                'week': 'Week',
                'day': 'Day',
                'year': 'Year'
            };
            dropdownToggle.textContent = textMap[currentView] || 'Month';
        }
    }

    // Initialize the current view
    function initializeView() {
        // Make sure all views are hidden first
        if (monthView) monthView.style.display = 'none';
        if (weekView) weekView.style.display = 'none';
        if (dayView) dayView.style.display = 'none';
        if (yearView) yearView.style.display = 'none';

        // Show the current view
        switch (currentView) {
            case 'month':
                if (monthView) monthView.style.display = 'block';
                renderMonthView(currentDate);
                break;
            case 'week':
                if (weekView) weekView.style.display = 'block';
                renderWeekView(currentDate);
                break;
            case 'day':
                if (dayView) dayView.style.display = 'block';
                renderDayView(currentDate);
                break;
            case 'year':
                if (yearView) yearView.style.display = 'block';
                renderYearView(currentDate);
                break;
            default:
                // Default to month view
                currentView = 'month';
                if (monthView) monthView.style.display = 'block';
                renderMonthView(currentDate);
        }

        updateDropdownText();
    }

    // Initialize the calendar
    initializeView();

    // Feature menu
    const openMenuBtn = document.getElementById('openMenuBtn');
    const featureMenu = document.getElementById('featureMenu');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const overlay = document.getElementById('overlay');

    if (openMenuBtn && featureMenu) {
        openMenuBtn.addEventListener('click', () => {
            featureMenu.classList.remove('-translate-x-full');
            featureMenu.classList.add('translate-x-0');
            if (overlay) overlay.classList.remove('hidden');
        });
    }

    if (closeMenuBtn && featureMenu) {
        closeMenuBtn.addEventListener('click', () => {
            featureMenu.classList.remove('translate-x-0');
            featureMenu.classList.add('-translate-x-full');
            if (overlay) overlay.classList.add('hidden');
        });
    }

    if (overlay && featureMenu) {
        overlay.addEventListener('click', () => {
            featureMenu.classList.remove('translate-x-0');
            featureMenu.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
        });
    }

    // Initialize dropdowns
    const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
    dropdownElementList.forEach(dropdownToggleEl => {
        new bootstrap.Dropdown(dropdownToggleEl);
    });

    // Initial render
    updateDropdownText();
    initializeView();
});

// Initialize the calendar when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // This will be called after the DOM is fully loaded
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