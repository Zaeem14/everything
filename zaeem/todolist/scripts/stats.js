import { renderFolderPickerMenu} from "../data/folder.js"
import { tasks } from "../data/tasks.js";

document.addEventListener("DOMContentLoaded", () => {
    renderFolderPickerMenu();
});

const taskStatsSection = document.querySelector("#todo-stats");



const statsTaskFolderContainer = document.querySelector(".task-folder-container-stats");
const statsTodoFolderMenu = document.getElementById("stats-todo-folder-menu");

document.addEventListener("click", (e) => {
    const clickedOutside =
        !statsTaskFolderContainer.contains(e.target) &&
        !statsTodoFolderMenu.contains(e.target);
    const clickedInside = 
        statsTaskFolderContainer.contains(e.target)&& !statsTodoFolderMenu.contains(e.target) || 
        statsTodoFolderMenu.contains(e.target);

    if (clickedOutside) {
        statsTodoFolderMenu.classList.add("hidden-element");
    } else if (clickedInside) {
        statsTodoFolderMenu.classList.toggle("hidden-element");
    }
});




const statsTaskMoreIcon = taskStatsSection.querySelector("#stats-task-more-icon");
const statsTaskMoreIconMenu = document.querySelector("#stats-task-more-icon-menu");
statsTaskMoreIcon.addEventListener("click", () => {
    statsTaskMoreIconMenu.classList.toggle("hidden-element");
})

const statsTaskMoreIconContainer = document.querySelector(".task-edit-container-right")
document.addEventListener("click", (e) => {
    if (!statsTaskMoreIconContainer.contains(e.target) || !statsTaskMoreIconMenu.contains(e.target)) {
        statsTaskMoreIconMenu.classList.add("hidden-element");
    } else if (statsTaskMoreIconMenu.contains(e.target)) {
        e.stopPropagation(); // Prevent the click from propagating to the document
        statsTaskMoreIconMenu.classList.add("hidden-element")
    } else if (document.contains(e.target) && !statsTaskMoreIcon.contains(e.target)) {
        statsTaskMoreIconMenu.classList.add("hidden-element");
    }
});

document.addEventListener("click", (e) => {
    const taskElement = e.target.closest(".task");
    if (!taskElement) return;

    const taskId = taskElement.getAttribute("data-id");
    const foundTask = tasks.find(t => t.taskId === Number(taskId));
    if (!foundTask) return;

    taskStatsSection.setAttribute("data-id", taskId);

    updateEditableTaskName(taskElement);

    const statsTaskDueDateDisplay = document.querySelector(".task-due-date-stats");
    statsTaskDueDateDisplay.textContent = statsTaskDueDateFormatter(foundTask.dueDate);

    
    const priority = foundTask.priority;
    updateStatsPriorityIcon(priority);
    updateStatsPriorityIconColor(priority);
    updateCheckBoxColor(priority);

    displayTaskDescription();
    updateTaskDescription(taskElement, taskId);

});


function updateEditableTaskName(taskElement) {
    const taskTitle = taskStatsSection.querySelector(".task-title");
    const nameEl = taskElement.querySelector(".task-text"); // assuming this is where the task name is
    taskTitle.textContent = nameEl ? nameEl.textContent : "";
}



function statsTaskDueDateFormatter(inputDateStr) {
    if (!inputDateStr) return "";

    const [year, month, day] = inputDateStr.split("-").map(Number);
    const inputDate = new Date(year, month - 1, day);
    const today = new Date();

    // Strip time for both dates
    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const msPerDay = 1000 * 60 * 60 * 24;
    const msPerMonth = msPerDay * 30.4375;
    const msPerYear = msPerDay * 365.25;

    const diffInMs = inputDate - today;
    const diffInDays = Math.round(diffInMs / msPerDay);
    const diffInMonths = Math.floor(Math.abs(diffInMs) / msPerMonth);
    const diffInYears = Math.floor(Math.abs(diffInMs) / msPerYear);

    const monthName = inputDate.toLocaleString("en-US", { month: "short" });
    const dayOfMonth = inputDate.getDate();
    const fullDate = `${String(inputDate.getMonth() + 1).padStart(2, "0")}/${String(dayOfMonth).padStart(2, "0")}/${inputDate.getFullYear()}`;

    if (diffInDays === 0) {
        return `Today, ${monthName} ${dayOfMonth}`;
    } else if (diffInDays === -1) {
        return `Yesterday, ${monthName} ${dayOfMonth}`;
    } else if (diffInDays === 1) {
        return `Tomorrow, ${monthName} ${dayOfMonth}`;
    } else if (diffInDays < -1 && diffInDays >= -30) {
        return `${Math.abs(diffInDays)} days ago, ${monthName} ${dayOfMonth}`;
    } else if (diffInDays > 1 && diffInDays <= 30) {
        return `${diffInDays} days later, ${monthName} ${dayOfMonth}`;
    } else if (diffInDays < -30 && diffInDays >= -365) {
        return `${diffInMonths} months ago, ${monthName} ${dayOfMonth}`;
    } else if (diffInDays > 30 && diffInDays <= 365) {
        return `${diffInMonths} months later, ${monthName} ${dayOfMonth}`;
    } else if (diffInDays < -365) {
        return `${diffInYears} years ago, ${fullDate}`;
    } else if (diffInDays > 365) {
        return `${diffInYears} years later, ${fullDate}`;
    }

    return `${monthName} ${dayOfMonth}`;
}

function updateStatsPriorityIcon(priority) {
    const statsPriorityIcon = taskStatsSection.querySelector(".task-priority-icon");
    statsPriorityIcon.setAttribute("data-priority", priority)
}
function updateStatsPriorityIconColor(priority) {
    const statsPriorityIcon = taskStatsSection.querySelector(".task-priority-icon");
    if (!statsPriorityIcon) {
        console.warn("Priority icon not found!");
        return;
    }

    const iconMap = {
        low: "blue_flag.png",
        medium: "yellow_flag.png",
        high: "red_flag.png",
        none: "grey_flag.png"
    };

    const fileName = iconMap[priority] || iconMap.none;

    statsPriorityIcon.src = `images/todo-container/priorities-icon/${fileName}`; 
}


function updateCheckBoxColor(priority) {
    const checkBox = taskStatsSection.querySelector(".task-checkbox-stats");
    
    if (checkBox) {
        checkBox.classList.remove("priority-low-checkbox", "priority-medium-checkbox", "priority-high-checkbox", "priority-none-checkbox");
        checkBox.classList.add(`priority-${priority}-checkbox`);  
    } else {
        console.warn("Checkbox not found in stats section!");
     }
}

function displayTaskDescription() {
    const taskDescriptionElement = taskStatsSection.querySelector(".description");
    const taskId = taskStatsSection.getAttribute("data-id");
    const task = tasks.find(t => t.taskId === Number(taskId));

    if (task) {
        taskDescriptionElement.value = task.description || "";
    } else {
        console.warn("Task not found for ID:", taskId);
        taskDescriptionElement.value = "";
    }
}
function updateTaskDescription(task, taskId) {
    const taskDescriptionElement = taskStatsSection.querySelector(".description")

    taskDescriptionElement.addEventListener("input", () => {
        if (task) {
            task.description = taskDescriptionElement.value;
            localStorage.setItem("taskDescriptionElement", task.description);
        } else {
            console.warn("Task not found for ID:", taskId);
        }
    })
}