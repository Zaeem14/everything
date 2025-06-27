let tasks = [
    {
        taskId: 1,
        taskName: "Buy groceries",
        completed: false,
        wontDo: false,
        dueDate: "2023-08-31",
        folderId: 1,
        priority: "low",
        description: "Buy groceries for the week",
        subTask1: "Milk",
        subTask2: "Bread",
        subTask3: "Eggs"
    }
]



function saveTasksToLocalStorage() {
    
}

function loadTasksFromLocalStorage() {
    
}

function addTaskToLocalStorage(taskId) {
    
}

function deleteTaskFromLocalStorage(taskId) {
    
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


        inputPriorityIcon.src = priorityIcons[priorityText] || priorityIcons["None"];

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
}
