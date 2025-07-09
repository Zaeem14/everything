import { hideEmptyTaskGroups, tasks } from "../data/tasks.js";

// Track the current filter state
let currentDateFilter = "all";
let currentFolderFilter = null;

// Date filter buttons
const tasksFilterContainers = document.querySelectorAll(".todo-date-container");

tasksFilterContainers.forEach(tasksFilterContainer => {
    tasksFilterContainer.addEventListener("click", () => {
        const selectedDate = tasksFilterContainer.dataset.date;

        currentDateFilter = selectedDate;
        currentFolderFilter = null;

        updatePageTitleDate(selectedDate);
        assignCurrentFilter(tasksFilterContainers, tasksFilterContainer);
        handleDateFilterClick(selectedDate);
    });
});

// Folder filter buttons
const folderDivs = document.querySelectorAll(".folder-div");

folderDivs.forEach(folderDiv => {
    folderDiv.addEventListener("click", () => {
        const folderId = folderDiv.dataset.id;
        const folderName = folderDiv.dataset.folder;

        currentFolderFilter = folderId;
        currentDateFilter = null;

        updatePageTitleFolder(folderName);
        assignCurrentFilter(folderDivs, folderDiv);
        handleFolderClick(folderId);
    });
});

// Handle date-based filtering (all, today, tomorrow, week, overdue)
function handleDateFilterClick(selectedDate) {
    const taskGroups = document.querySelectorAll(".task-group");
    const allTasks = document.querySelectorAll(".task");

    if (selectedDate === "all") {
        taskGroups.forEach(group => group.style.display = "flex");
        allTasks.forEach(task => task.style.display = "flex");
        hideEmptyTaskGroups();
        return;
    }

    // Show only the selected date group
    taskGroups.forEach(group => {
        group.style.display = (group.dataset.date === selectedDate) ? "flex" : "none";
    });

    // Show only tasks with that date
    allTasks.forEach(task => {
        task.style.display = (task.dataset.date === selectedDate) ? "flex" : "none";
    });
}

// Handle folder-based filtering
function handleFolderClick(folderId) {
    const taskGroups = document.querySelectorAll(".task-group");
    const allTasks = document.querySelectorAll(".task");
    let groupHasVisibleTasks = {};

    // Hide all tasks first
    allTasks.forEach(task => {
        const taskObj = tasks.find(t => t.taskName === task.querySelector(".task-text").textContent.trim());
        const taskFolderId = taskObj?.folderId;

        if (String(taskFolderId) === String(folderId)) {
            task.style.display = "flex";
            const group = task.closest(".task-group");
            if (group) groupHasVisibleTasks[group.dataset.date] = true;
        } else {
            task.style.display = "none";
        }
    });

    // Show/hide task groups based on whether they contain matching tasks
    taskGroups.forEach(group => {
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
    const folderDivs = document.querySelectorAll(".folder-div");
    folderDivs.forEach(folderDiv => {
        folderDiv.onclick = () => {
            const folderId = folderDiv.dataset.id;
            const folderName = folderDiv.dataset.folder;
            currentFolderFilter = folderId;
            currentDateFilter = null;
            updatePageTitleFolder(folderName);
            assignCurrentFilter(folderDivs, folderDiv);
            handleFolderClick(folderId);
        };
    });
}

export function getCurrentDateFilter() {
    return currentDateFilter;
}
