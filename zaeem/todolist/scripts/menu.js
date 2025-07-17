import { hideEmptyTaskGroups, tasks, updateTaskGroupCount} from "../data/tasks.js";


// Track the current filter state
let currentDateFilter = "all";
let currentFolderFilter = null;

setupDateFilterClicks();
setupFolderDivClicks();

// Handle date-based filtering (all, today, tomorrow, week, overdue)
// Handle date-based filtering (all, today, tomorrow, week, overdue)
function handleDateFilterClick(selectedDate) {
    const taskGroups = document.querySelectorAll(".task-group");
    const allTaskContainers = document.querySelectorAll(".task-more-container");

    // Show/hide tasks based on date
    allTaskContainers.forEach(container => {
        const task = container.querySelector('.task');
        if (!task) {
            container.style.display = "none";
            return;
        }
        const taskDate = container.getAttribute("data-date") || task.getAttribute("data-date");
        console.log("Task Date filtered:", taskDate);
        container.style.display = (selectedDate === "all" || taskDate === selectedDate) ? "flex" : "none";
    });

    // Show/hide task groups based on filter
    taskGroups.forEach(group => {
        if (selectedDate === "all") {
            // Show group if it has any visible tasks
            const visibleTasks = Array.from(group.querySelectorAll('.task-more-container'))
                .filter(container => getComputedStyle(container).display !== "none");
            group.style.display = visibleTasks.length > 0 ? "flex" : "none";
        } else {
            // Show only the group matching the selected date, and only if it has visible tasks
            if (group.dataset.date === selectedDate) {
                const visibleTasks = Array.from(group.querySelectorAll('.task-more-container'))
                    .filter(container => getComputedStyle(container).display !== "none");
                group.style.display = visibleTasks.length > 0 ? "flex" : "none";
            } else {
                group.style.display = "none";
            }
        }
        updateTaskGroupCount(group);
    });
}
// Handle folder-based filtering
function handleFolderClick(folderId) {
    const taskGroups = document.querySelectorAll(".task-group");
    const allTasks = document.querySelectorAll(".task-more-container");
    let groupHasVisibleTasks = {};

    allTasks.forEach(task => {
        const taskFolderId = task.getAttribute("data-folder-id");
        if (String(taskFolderId) === String(folderId)) {
            task.style.display = "flex";
            const group = task.closest(".task-group");
            if (group) {
                groupHasVisibleTasks[group.dataset.date] = true;
            }
        } else {
            task.style.display = "none";
        }
    });

    // Show/hide task groups based on whether they contain matching tasks
    taskGroups.forEach(group => {
        updateTaskGroupCount(group);
        const hasTasks = groupHasVisibleTasks[group.dataset.date];
        group.style.display = hasTasks ? "flex" : "none";

        
    });
}

// Reapply the current active filter (used after adding new task)
export function reapplyCurrentFilter() {
    if (currentFolderFilter !== null) {
        handleFolderClick(currentFolderFilter);
    } else {
        handleDateFilterClick(currentDateFilter || "all");
    }
}

// Assign "current-date" or "current-folder" style class
function assignCurrentFilter(filterList, activeFilter) {
    filterList.forEach(filter => filter.classList.remove("current-date"));
    activeFilter.classList.add("current-date");
}

// Update title for date filters
function updatePageTitleDate(filter) {
    const pageTitleElement = document.querySelector(".page-title");

    const titleMap = {
        all: "All",
        today: "Today",
        tomorrow: "Tomorrow",
        week: "This Week",
        overdue: "Overdue"
    };

    pageTitleElement.textContent = titleMap[filter] || filter;
}

// Update title for folder filters
function updatePageTitleFolder(folderName) {
    const pageTitleElement = document.querySelector(".page-title");
    pageTitleElement.textContent = folderName;
}

// Optional: Setup function for dynamically added folder divs
export function setupFolderDivClicks() {
    const folderList = document.querySelector(".folder-list");
    if (!folderList) return;

    folderList.onclick = (event) => {
        const folderDiv = event.target.closest(".folder-div");
        if (!folderDiv) return;

        const folderId = folderDiv.dataset.id;
        const folderName = folderDiv.dataset.folder;

        currentFolderFilter = folderId;
        currentDateFilter = null;

        updatePageTitleFolder(folderName);

        // Remove current highlight from all, add to clicked
        folderList.querySelectorAll(".folder-div").forEach(div => div.classList.remove("current-date"));
        folderDiv.classList.add("current-date");

        handleFolderClick(folderId);
    };
}

export function setupDateFilterClicks() {
    const dateFilterList = document.querySelectorAll(".todo-date-container");
    if (!dateFilterList.length) return;

    dateFilterList.forEach(dateFilter => {
        dateFilter.onclick = () => {
            const selectedDate = dateFilter.dataset.date;

            currentDateFilter = selectedDate;
            currentFolderFilter = null;

            updatePageTitleDate(selectedDate);

            // Remove highlight from all, add to clicked
            dateFilterList.forEach(filter => filter.classList.remove("current-date"));
            dateFilter.classList.add("current-date");

            handleDateFilterClick(selectedDate);
            hideEmptyTaskGroups();
        };
    });
}


export function getCurrentDateFilter() {
    return currentDateFilter;
}
