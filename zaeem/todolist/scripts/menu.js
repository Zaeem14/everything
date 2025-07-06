import { hideEmptyTaskGroups, tasks } from "../data/tasks.js";
import { folders } from "../data/folder.js";


// TODO: When a data filter is clicked, filter task-groups and tasks based on the selected date (or non-selected date).
const tasksFilterContainers = document.querySelectorAll(".todo-date-container");


tasksFilterContainers.forEach(tasksFilterContainer => {
    tasksFilterContainer.addEventListener("click", () => {
        // Get the selected date from the clicked data filter.
        const selectedDate = tasksFilterContainer.dataset.date; // Assuming each filter has a data-date attribute.
        
        // update the page title based on the selected date.
        const pageTitleElement = document.querySelector(".page-title");
        updatePageTitleDate(selectedDate);


        // If the selected date is "all", show all task groups.
        if (selectedDate === "all") {
            
            handleDateFilterClick("all");
            assignCurrentFilter(tasksFilterContainers, tasksFilterContainer);
            return;
        }

        assignCurrentFilter(tasksFilterContainers, tasksFilterContainer);

        // Call the function to handle filtering based on the selected date.
        handleDateFilterClick(selectedDate);
    });
});

const folderDivs = document.querySelectorAll(".folder-div");

folderDivs.forEach(folderDiv => {
    folderDiv.addEventListener("click", () => {
        // Get the folder ID from the clicked folder.
        const folderId = folderDiv.dataset.id; // Assuming each folder has a data-id attribute.
        const folderName = folderDiv.dataset.folder; // Assuming each folder has a data-folder attribute.

        // Update the page title based on the selected folder.
        const pageTitleElement = document.querySelector(".page-title");
        pageTitleElement.textContent = folderName;

        // Call the function to handle filtering based on the selected folder.
        handleFolderClick(folderId);

        // Assign current filter class to the clicked folder.
        assignCurrentFilter(folderDivs, folderDiv);
    });
});

function handleDateFilterClick(selectedDate, pageTitle) {
    const taskGroups = document.querySelectorAll(".task-group");
    const tasks = document.querySelectorAll(".task");

    if (selectedDate === "all") {
        // Show all groups and all tasks
        taskGroups.forEach(taskGroup => {
            taskGroup.style.display = "flex";
        });
        tasks.forEach(task => {
            task.style.display = "flex";
        });
        hideEmptyTaskGroups(); // Ensure empty task groups are hidden
        return;
    }

    // Otherwise, filter by selected date
    taskGroups.forEach(taskGroup => {
        const groupDate = taskGroup.dataset.date;
        if (groupDate === selectedDate) {
            taskGroup.style.display = "flex";
        } else {
            taskGroup.style.display = "none";
        }
    });

    tasks.forEach(task => {
        const taskDate = task.dataset.date;
        if (taskDate === selectedDate) {
            task.style.display = "flex";
        } else {
            task.style.display = "none";
        }
    });

}

// TODO: When a folder is clicked, filter task-groups and tasks based on the selected folder (or non-selected folder).
function handleFolderClick(folderId) {
    tasks.forEach(task => {
        const taskFolderId = task.folderId; // Assuming each task has a data-folder attribute.
        const taskGroup = task.closest(".task-group");

        if (taskFolderId === folderId) {
            task.style.display = "flex";
            taskGroup.style.display = "flex";
        } else {
            task.style.display = "none";
            taskGroup.style.display = "none";
        }
    });
}

function assignCurrentFilter(tasksFilterContainers, tasksFilterContainer) {
     // Remove the "current-date" class from all filters.
    tasksFilterContainers.forEach(container => {
        container.classList.remove("current-date");
    });

    // Add the "current-date" class to the clicked filter.
    tasksFilterContainer.classList.add("current-date");
}



function updatePageTitleDate(dataFilterName) {
    const pageTitleElement = document.querySelector(".page-title");

    if (dataFilterName === "all") {
        pageTitleElement.textContent = "All";
    } else if (dataFilterName === "today") {
        pageTitleElement.textContent = "Today";
    } else if (dataFilterName === "tomorrow") {
        pageTitleElement.textContent = "Tomorrow";
    } else if (dataFilterName === "week") {
        pageTitleElement.textContent = "This Week";
    } else if (dataFilterName === "overdue") {
        pageTitleElement.textContent = "Overdue";
    } else {
        pageTitleElement.textContent = dataFilterName; // Fallback for custom dates
    }
}

export function setupFolderDivClicks() {
    const folderDivs = document.querySelectorAll(".folder-div");
    folderDivs.forEach(folderDiv => {
        folderDiv.onclick = () => {
            const folderId = folderDiv.dataset.id;
            const folderName = folderDiv.dataset.folder;
            const pageTitleElement = document.querySelector(".page-title");
            pageTitleElement.textContent = folderName;
            filterTasksByFolder(folderId);
            assignCurrentFilter(folderDivs, folderDiv);
        };
    });
}

function filterTasksByFolder(folderId) {
    // Show all groups first
    const taskGroups = document.querySelectorAll(".task-group");
    taskGroups.forEach(group => {
        group.style.display = "flex";
        // Hide all tasks in this group initially
        group.querySelectorAll(".task").forEach(task => {
            task.style.display = "none";
        });
    });

    // Show only tasks with the selected folderId, and their groups
    let groupHasTask = {};
    document.querySelectorAll(".task").forEach(task => {
        // You must store folderId on the .task element as data-folder-id!
        const taskObj = tasks.find(t => t.taskName === task.querySelector('.task-text').textContent.trim());
        if (taskObj && String(taskObj.folderId) === String(folderId)) {
            task.style.display = "flex";
            const group = task.closest(".task-group");
            if (group) groupHasTask[group.dataset.date] = true;
        }
    });

    // Hide groups that have no visible tasks
    taskGroups.forEach(group => {
        if (!groupHasTask[group.dataset.date]) {
            group.style.display = "none";
        }
    });
}