import { renderFolderPickerMenu } from "../data/folder.js"
import { tasks } from "../data/tasks.js";

document.addEventListener("DOMContentLoaded", () => {
    renderFolderPickerMenu();
    applyPlaceholder();
});

const taskStatsSection = document.querySelector("#todo-stats");
const statsTaskFolderContainer = document.querySelector(".task-folder-container-stats");
const statsTodoFolderMenu = document.getElementById("stats-todo-folder-menu");
const addSubTaskIconContainer = taskStatsSection.querySelector(".add-sub-task-icon-container");
const statsTaskMoreIcon = taskStatsSection.querySelector("#stats-task-more-icon");
const statsTaskMoreIconMenu = document.querySelector("#stats-task-more-icon-menu");
const statsTaskMoreIconContainer = document.querySelector(".task-edit-container-right");
const editable = document.getElementById('editable-description-stats');
const placeholderText = "Write description for the task...";

// --- Folder menu toggle ---
document.addEventListener("click", (e) => {
    if (!statsTaskFolderContainer.contains(e.target) && !statsTodoFolderMenu.contains(e.target)) {
        statsTodoFolderMenu.classList.add("hidden-element");
    } else if (
        statsTaskFolderContainer.contains(e.target) && !statsTodoFolderMenu.contains(e.target) ||
        statsTodoFolderMenu.contains(e.target)
    ) {
        statsTodoFolderMenu.classList.toggle("hidden-element");
    }
});

// --- Task more menu toggle ---
statsTaskMoreIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    statsTaskMoreIconMenu.classList.toggle("hidden-element");
});
document.addEventListener("click", (e) => {
    if (!statsTaskMoreIconContainer.contains(e.target)) {
        statsTaskMoreIconMenu.classList.add("hidden-element");
    }
});

// --- Add subtask ---
addSubTaskIconContainer.addEventListener("click", () => {
    const taskId = taskStatsSection.getAttribute("data-id");
    if (!taskId) {
        console.warn("No task ID found in stats section.");
        return;
    }
    addSubtask(taskId);
});

// --- Task click: update stats panel and show subtasks ---
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

    displayTaskDescription(taskId);
    setupTaskDescriptionInput(taskId);

    updateCheckBoxColor(priority);

    renderSubtasksForTask(foundTask); // Show only this task's subtasks
});

// --- Editable task name ---
function updateEditableTaskName(taskElement) {
    const taskTitle = taskStatsSection.querySelector(".task-title");
    const nameEl = taskElement.querySelector(".task-text");
    taskTitle.textContent = nameEl ? nameEl.textContent : "";
}

// --- Due date formatting ---
function statsTaskDueDateFormatter(inputDateStr) {
    if (!inputDateStr) return "";
    const [year, month, day] = inputDateStr.split("-").map(Number);
    const inputDate = new Date(year, month - 1, day);
    const today = new Date();
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
    if (diffInDays === 0) return `Today, ${monthName} ${dayOfMonth}`;
    if (diffInDays === -1) return `Yesterday, ${monthName} ${dayOfMonth}`;
    if (diffInDays === 1) return `Tomorrow, ${monthName} ${dayOfMonth}`;
    if (diffInDays < -1 && diffInDays >= -30) return `${Math.abs(diffInDays)} days ago, ${monthName} ${dayOfMonth}`;
    if (diffInDays > 1 && diffInDays <= 30) return `${diffInDays} days later, ${monthName} ${dayOfMonth}`;
    if (diffInDays < -30 && diffInDays >= -365) return `${diffInMonths} months ago, ${monthName} ${dayOfMonth}`;
    if (diffInDays > 30 && diffInDays <= 365) return `${diffInMonths} months later, ${monthName} ${dayOfMonth}`;
    if (diffInDays < -365) return `${diffInYears} years ago, ${fullDate}`;
    if (diffInDays > 365) return `${diffInYears} years later, ${fullDate}`;
    return `${monthName} ${dayOfMonth}`;
}

// --- Priority icon ---
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

// --- Checkbox color ---
function updateCheckBoxColor(priority) {
    const checkBox = taskStatsSection.querySelector(".task-checkbox-stats");
    if (checkBox) {
        checkBox.classList.remove("priority-low-checkbox", "priority-medium-checkbox", "priority-high-checkbox", "priority-none-checkbox");
        checkBox.classList.add(`priority-${priority}-checkbox`);  
    } else {
        console.warn("Checkbox not found in stats section!");
    }
}

// --- Description ---
function displayTaskDescription(taskId) {
    const taskDescriptionElement = taskStatsSection.querySelector(".description");
    const task = tasks.find(t => t.taskId === Number(taskId));
    if (task) {
        taskDescriptionElement.textContent = task.description || "";
    } else {
        taskDescriptionElement.textContent = "";
    }
}
function setupTaskDescriptionInput(taskId) {
    const taskDescriptionElement = taskStatsSection.querySelector(".description");
    // Remove previous event listeners by cloning the node
    const newDescriptionElement = taskDescriptionElement.cloneNode(true);
    taskDescriptionElement.parentNode.replaceChild(newDescriptionElement, taskDescriptionElement);
    newDescriptionElement.addEventListener("input", () => {
        const task = tasks.find(t => t.taskId === Number(taskId));
        if (task) {
            task.description = newDescriptionElement.textContent;
            localStorage.setItem("tasks", JSON.stringify(tasks));
        }
    });
}

// --- Subtasks ---
function getNextSubtaskKey(task) {
    let i = 1;
    while (task[`subTask${i}`] !== undefined) i++;
    return `subTask${i}`;
}
function renderSubtasksForTask(task) {
    const subTaskList = taskStatsSection.querySelector(".sub-task-list");
    subTaskList.innerHTML = ""; // Clear previous subtasks

    Object.keys(task)
        .filter(key => key.startsWith("subTask") && task[key] !== undefined)
        .forEach((key) => {
            const subtaskText = task[key];
            const newSubtask = document.createElement("div");
            newSubtask.classList.add("sub-task-container");
            newSubtask.setAttribute("data-task-id", task.taskId);
            newSubtask.setAttribute("data-subtask-key", key);

            newSubtask.innerHTML = `
                <div class="sub-task">
                    <input type="checkbox" class="task-checkbox priority-none-checkbox">
                    <div class="task-text" contenteditable="true">${subtaskText}</div>
                </div>
                <div class="sub-task-more-container task-more-container">
                    <img src="images/todo-container/more.png" class="task-more-icon sub-task-more-icon" alt="more">
                    <div class="sub-task-more-menu hidden-element">
                        <section class="sub-task-actions-section">
                            <div class="sub-task-action-container add-subtask-container">
                                <img src="images/todo-container/Subtask.png" alt="subtask" class="task-more-section-icon">
                                <div class="sub-task-action add-subtask">Add Subtask</div>
                            </div>
                        </section>
                        <section class="sub-task-complete-section">
                            <div class="sub-task-wont-do-container">
                                <img src="images/todo-container/icons8-remove-50.png" alt="wont do" class="task-more-section-icon">
                                <div class="sub-task-action wont-do">Won't Do</div>
                            </div>
                            <div class="sub-task-delete-container">
                                <img src="images/todo-container/icons8-trash-can-50.png" alt="complete" class="task-more-section-icon">
                                <div class="sub-task-action complete">Delete</div>
                            </div>
                        </section>
                    </div>
                </div>
            `;
            subTaskList.appendChild(newSubtask);

            // Menu toggle logic
            const moreIcon = newSubtask.querySelector('.sub-task-more-icon');
            const moreMenu = newSubtask.querySelector('.sub-task-more-menu');
            moreIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.sub-task-more-menu').forEach(menu => {
                    if (menu !== moreMenu) menu.classList.add('hidden-element');
                });
                moreMenu.classList.toggle('hidden-element');
            });

            // Real-time update of subtask text
            const subtaskTextDiv = newSubtask.querySelector('.task-text');
            subtaskTextDiv.addEventListener('input', () => {
                task[key] = subtaskTextDiv.textContent;
                localStorage.setItem("tasks", JSON.stringify(tasks));
            });

            // --- Subtask delete functionality ---
            const deleteBtn = newSubtask.querySelector('.sub-task-delete-container');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Remove the subtask from the task object
                delete task[key];
                // Save and re-render
                localStorage.setItem("tasks", JSON.stringify(tasks));
                renderSubtasksForTask(task);
            });
        });
}
// Hide all subtask menus when clicking outside
document.addEventListener('click', (e) => {
    document.querySelectorAll('.sub-task-more-menu').forEach(menu => {
        if (!menu.classList.contains('hidden-element')) {
            menu.classList.add('hidden-element');
        }
    });
});

// Add a subtask to the currently selected task in stats panel
function addSubtask(taskId) {
    const task = tasks.find(t => t.taskId === Number(taskId));
    if (!task) return;
    const nextKey = getNextSubtaskKey(task);
    task[nextKey] = ""; // Start with empty text
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderSubtasksForTask(task);
}

// --- Description placeholder logic ---
function isEmpty(el) {
    return (
        el.innerHTML.trim() === "" ||
        el.innerHTML.trim() === "<br>" ||
        el.textContent.trim() === ""
    );
}
function applyPlaceholder() {
    if (isEmpty(editable)) {
        editable.classList.add("placeholder");
        editable.innerText = placeholderText;
    }
}
function removePlaceholder() {
    if (editable.classList.contains("placeholder")) {
        editable.innerText = "";
        editable.classList.remove("placeholder");
    }
}
function handleInput() {
    if (isEmpty(editable)) {
        applyPlaceholder();
    } else if (editable.classList.contains("placeholder")) {
        editable.classList.remove("placeholder");
    }
}
editable.addEventListener("focus", removePlaceholder);
editable.addEventListener("blur", applyPlaceholder);
editable.addEventListener("input", handleInput);

