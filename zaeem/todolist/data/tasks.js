
import { folders } from "./folder.js";

document.addEventListener("DOMContentLoaded", () => {
    loadTasksFromLocalStorage(); // ✅ Restore saved tasks
    setupTaskMoreMenus();
    

});

let tasks = [];

const addTaskButton = document.querySelector(".todo-input-icon-container"); 
const deleteTaskButtons = document.querySelectorAll(".task-delete-icon-container");

addTaskButton.addEventListener("click", () => {
    addTask();
    clearTaskInput();
    clearTaskInputFolder();
})

deleteTaskButtons.forEach(deleteButton => {
    deleteButton.addEventListener("click", () => {
        const taskId = deleteButton.getAttribute("data-id");
        deleteTask(taskId);
        saveTasksToLocalStorage();

    });
});




function addTask() {
    const taskInput = document.getElementById("todo-input");
    const taskText = taskInput.value.trim();
    if (!taskText) {
        alert("Task name is required.");
        return;
    }

    const taskId = Date.now();
    const dueDate = document.getElementById("todo-date-input").value;
    const formattedDueDate = dueDate ? handleDateChange(dueDate) : "";

    const folderIconContainer = document.querySelector(".todo-input-folder-icon-container");
    const folderId = folderIconContainer?.getAttribute("data-id");

    const priorityIcon = document.querySelector(".todo-input-priority-icon-js");
    const priorityId = priorityIcon?.getAttribute("data-id") || "none";

    const newTask = {
        taskId,
        taskName: taskText,
        completed: false,
        wontDo: false,
        dueDate,
        formattedDueDate,
        folderId: folderId || null, // allow null
        priority: priorityId,
        description: null,
        subTask1: null,
        subTask2: null,
        subTask3: null
    };

    tasks.push(newTask);
    renderTasks(newTask);
    saveTasksToLocalStorage();
}



function renderTasks(task) {
    const tasksContainer = document.querySelector(".tasks");

    const folder = folders[task.folderId] || null;

    const folderBarColor = folder ? folder.folderColor : "transparent";
    const folderCircle = folder
        ? `<div class="folder-color-code-circle" style="background-color: ${folder.folderColor};"></div>`
        : "";
    const folderName = folder
        ? `<div class="task-folder">${folder.folderName}</div>`
        : "";
    const dueDate = task.formattedDueDate
        ? `<div class="due-date">${task.formattedDueDate}</div>`
        : "";

    const taskHTML = `
        <div class="task-more-container">
            <div class="task">
                <div class="left-side-task">
                    <div class="folder-color-code-bar" style="background-color: ${folderBarColor};"></div>
                    <input type="checkbox" class="task-checkbox priority-${task.priority}-checkbox">
                    <div class="task-text">${task.taskName}</div>
                </div>
                <div class="right-side-task">
                    ${folderCircle}
                    ${folderName}
                    ${dueDate}
                </div>
            </div>
            <div class="task-more-icon-container">
                <img src="images/todo-container/more.png" class="task-more-icon" alt="more">
                <div class="task-more-icon-menu-container hidden-element">
                    <section class="task-more-date-section">
                        <div class="menu-header">Date</div>
                        <div class="task-more-date-icons">
                            <img src="images/todo-dates-icons/today_icon.png" alt="today" class="task-more-date-icon">
                            <img src="images/todo-dates-icons/tomorrow_icon.png"  alt="tomorrow" class="task-more-date-icon">
                            <img src="images/todo-dates-icons/week_icon.png" alt="week" class="task-more-date-icon">
                            <img src="images/todo-container/icons8-day-off-24.png" alt="clear date" class="task-more-date-icon">
                        </div>
                    </section>
                    <section class="task-more-priority-section">
                        <div class="task-more-priority menu-header">Priority</div>
                        <div class="task-more-priority-icons">
                            <img src="images/todo-container/priorities-icon/red_flag.png" alt="priority" class="task-more-priority-icon">
                            <img src="images/todo-container/priorities-icon/yellow_flag.png" alt="priority" class="task-more-priority-icon">
                            <img src="images/todo-container/priorities-icon/blue_flag.png" alt="priority" class="task-more-priority-icon">
                            <img src="images/todo-container/priorities-icon/grey_flag.png" alt="priority" class="task-more-priority-icon">
                        </div>
                    </section>
                    <section class="task-more-section">
                        <div class="task-more-icon-section-container">
                            <img src="images/todo-container/Subtask.png" alt="subtask" class="task-more-section-icon">
                            <div class="task-more-action-name">Add Subtask</div>
                        </div>
                        <div class="task-more-icon-section-container">
                            <img src="images/todo-container/move_folder.png" alt="move" class="task-more-section-icon">
                            <div class="task-more-action-name">Move To</div>
                            <div class="task-more-folder-icon-container">
                                <img src="images/todo-container/icons8-forward-16.png" class="task-more-folder-icon">
                            </div>
                        </div>
                    </section>
                    <section class="task-more-section">
                        <div class="task-more-icon-section-container">
                            <img src="images/todo-container/icons8-remove-50.png" alt="edit" class="task-more-section-icon">
                            <div class="task-more-action-name">Won't Do</div>
                        </div>
                        <div class="task-more-icon-section-container task-delete-icon-container" data-id="${task.taskId}">
                            <img src="images/todo-container/icons8-trash-can-50.png" alt="delete" class="task-more-section-icon">
                            <div class="task-more-action-name">Delete</div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    `;

    tasksContainer.insertAdjacentHTML("beforeend", taskHTML);

    const lastTask = tasksContainer.lastElementChild;
    const deleteButton = lastTask.querySelector(".task-delete-icon-container");

    if (deleteButton) {
        deleteButton.addEventListener("click", () => {
            const taskId = deleteButton.getAttribute("data-id");
            deleteTask(Number(taskId));
            lastTask.remove();
        });
    }
}


const todoDateIcon = document.getElementById("todo-date-icon");
const todoDateInput = document.getElementById("todo-date-input");
const todoDateChosen = document.querySelector(".todo-date-chosen");

document.getElementById("todo-date-input").addEventListener("change", (e) => {
    handleDateChange(e.target.value);
});

const inputPriorityIcon = document.querySelector(".todo-input-priority-icon-js");
const inputPriorityIconMenu = document.querySelector(".todo-priority-menu");
const inputPriorityMenuOptions = document.querySelectorAll(".todo-priority-container");

inputPriorityMenuOptions.forEach(option => {
    option.addEventListener("click", () => {
        // Remove 'current-priority' from all
        inputPriorityMenuOptions.forEach(opt => opt.classList.remove("current-priority"));
        option.classList.add("current-priority");

        // Get the priority text inside the clicked option
        const priorityText = option.querySelector(".priority-text").textContent.trim();

        const priorityIcons = {
            High: "images/todo-container/priorities-icon/red_flag.png",
            Medium: "images/todo-container/priorities-icon/yellow_flag.png",
            Low: "images/todo-container/priorities-icon/blue_flag.png",
            None: "images/todo-container/priorities-icon/grey_flag.png"
        };

        const priorityIds = {
            High: "high",
            Medium: "medium",
            Low: "low",
            None: "none"
        };

        // Set icon
        inputPriorityIcon.src = priorityIcons[priorityText] || priorityIcons["None"];

        // ✅ Set data-id on the icon element
        inputPriorityIcon.setAttribute("data-id", priorityIds[priorityText] || "none");

        // Hide the menu
        inputPriorityIconMenu.classList.add("hidden-element");
    });
});

function handleDateChange(dateValue) {
    if (!dateValue) return;

    const [year, month, day] = dateValue.split("-");
    const selectedDate = new Date(year, month - 1, day); // local time
    const today = new Date();

    // Strip time from both
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const dateDisplay = document.querySelector(".todo-date-chosen");
    if (!dateDisplay) return;

    // Clear previous classes
    dateDisplay.classList.remove("previous-date", "future-date");

    // Calculate difference in full days
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffInDays = Math.round((selectedDate - today) / msPerDay);

    // Add class
    if (diffInDays < 0) {
        dateDisplay.classList.add("previous-date");
    } else {
        dateDisplay.classList.add("future-date");
    }

    // Display logic
    let formatted;
    if (diffInDays === 0) {
        formatted = "Today";
    } else if (diffInDays === -1) {
        formatted = "Yesterday";
    } else if (diffInDays === 1) {
        formatted = "Tomorrow";
    } else if (diffInDays > 1 && diffInDays <= 7) {
        formatted = selectedDate.toLocaleDateString("en-US", { weekday: "short" }); // e.g. "Fri"
    } else {
        const currentYear = today.getFullYear();
        const selectedYear = selectedDate.getFullYear();

        if (selectedYear === currentYear) {
            formatted = selectedDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric"
            });
        } else {
            formatted = `${selectedYear}/${String(selectedDate.getMonth() + 1).padStart(2, "0")}/${String(selectedDate.getDate()).padStart(2, "0")}`;
        }
    }

    dateDisplay.textContent = formatted;
    return formatted;
}

function saveTasksToLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
        tasks.forEach(task => renderTasks(task));
    }
}



function setupTaskMoreMenus() {
  document.addEventListener("click", (e) => {
    const clickedIcon = e.target.closest(".task-more-icon");
    const allMenus = document.querySelectorAll(".task-more-icon-menu-container");

    if (clickedIcon) {
      const currentMenu = clickedIcon.nextElementSibling;

      allMenus.forEach(menu => {
        if (menu !== currentMenu) {
          menu.classList.add("hidden-element");
        }
      });

      if (currentMenu && currentMenu.classList.contains("task-more-icon-menu-container")) {
        currentMenu.classList.toggle("hidden-element");
      }

      e.stopPropagation(); // Don't let the document click below close it immediately
    } else {
      // If clicked anywhere else, close all menus
      allMenus.forEach(menu => menu.classList.add("hidden-element"));
    }
  });
}

function clearTaskInput() {
  const taskInput = document.getElementById("todo-input");
  const taskDueDate = document.getElementById("todo-date-input");
  const taskPriority = document.querySelector(".todo-input-priority-icon-js");

  taskInput.value = "";
  taskDueDate.value = "";

  if (taskPriority) {
    taskPriority.src = "images/todo-container/priorities-icon/grey_flag.png";
    taskPriority.setAttribute("data-id", "none");
  } else {
    console.warn("Priority icon not found");
  }
  

  const dateDisplay = document.querySelector(".todo-date-chosen");
  if (dateDisplay) {
    dateDisplay.textContent = "";
    dateDisplay.classList.remove("previous-date", "future-date");
  }
}

function clearTaskInputFolder() {
    const taskFolderIconContainer = document.querySelector(".todo-input-folder-icon-container");

    if (!taskFolderIconContainer) {
        console.warn("Folder icon container not found.");
        return;
    }

    // Clear the container
    taskFolderIconContainer.innerHTML = "";

    // Create a new image element
    const img = document.createElement("img");
    img.src = "images/todo-container/move_folder.png";
    img.classList.add("todo-input-folder-icon-js");
    img.classList.add("todo-input-modifier-icons");
    img.alt = "folder icon";

    // Reset container
    taskFolderIconContainer.setAttribute("data-id", "none");
    taskFolderIconContainer.classList.remove("current-folder");
    taskFolderIconContainer.appendChild(img);

    // Remove current-folder from selected menu option (if any)
    const currentSelectedFolder = document.querySelector(".folder-menu-container.current-folder");
    if (currentSelectedFolder) {
        currentSelectedFolder.classList.remove("current-folder");
    }
}






function deleteTask(taskId) {
  tasks = tasks.filter(task => task.taskId !== taskId);
  saveTasksToLocalStorage();
}