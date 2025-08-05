

import { folders, loadFoldersFromLocalStorage } from "./folder.js";

document.addEventListener("DOMContentLoaded", () => {
    loadFoldersFromLocalStorage();
    loadHabitsFromLocalStorage();
    InputNewHabit();
    renderHabits();
    console.log(habits);
    document.querySelector(".habit-add-button").addEventListener("click", () => {
        addHabit();
        hideAllEmptyGroups();
        closeAddHabitModal();
        clearAddHabitInputs();

        const activeFolder = document.querySelector(".folder-div.current-filter");
        if (activeFolder) {
            activeFolder.click();
        }
    });    

    document.addEventListener("click", (event) => {
        const allMenus = document.querySelectorAll(".habit-more-menu-container");
        
        // Check if the click was on a habit-more-icon
        const isMoreIcon = event.target.classList.contains("habit-more-icon");
    
        allMenus.forEach(menu => {
            // If this is the clicked one, toggle it
            if (isMoreIcon && menu === event.target.closest(".habits-more-container")?.querySelector(".habit-more-menu-container")) {
                const isCurrentlyVisible = menu.style.display === "block";
                menu.style.display = isCurrentlyVisible ? "none" : "block";
            } else {
                // Close all others
                menu.style.display = "none";
            }
        });
    });
    
});




let habits = [];

function addHabit() {
   const addHabitModal = document.querySelector(".habit-add-modal") 
    
   const addHabitInputs = {
    habitId: Date.now(),
    habitName: addHabitModal.querySelector("#new-habit-name").value,
    habitIcon: addHabitModal.querySelector(".new-habit-icon").textContent,
    habitGoalNumber: addHabitModal.querySelector("#habit-goal").value,
    habitGoalUnit: addHabitModal.querySelector(".times").textContent,
    habitPerUnit: addHabitModal.querySelector(".per").textContent,
    habitInterval: addHabitModal.querySelector(".habit-repeat-text").textContent,
    habitTimeOfDay: addHabitModal.querySelector(".habit-time-text").textContent.trim().toLowerCase(),
    habitFolderId: addHabitModal.querySelector(".habit-folder-text").dataset.folderId,
    habitStartDate: addHabitModal.querySelector("#habit-date").value,
    habitDescription: addHabitModal.querySelector("#new-habit-description").value,
    habitCompleted: 0,
    habitFailed: 0,
    habitSkipped: 0,
    habitStreak: 0,
    habitFinish: false
   }

   console.log(addHabitInputs.habitFolderId);

   habits.push(addHabitInputs);
   renderHabits();
   saveHabitsToLocalStorage();
   
}

export function renderHabits() {
    document.querySelectorAll(".habits-group .habits").forEach(group => {
        group.innerHTML = "";
    });

    habits.forEach(habit => {
        const folder = folders.find(folder => String(folder.folderId) === String(habit.habitFolderId));
        if (!folder) {
            console.warn("No matching folder found for habit:", habit.habitName);
            return;
        }

        let color = "";
        if (folder.folderId == "1") {
            color = "black";
        }
    

        const habitHTML = `
            <div class="habits-more-container" data-id="${habit.habitId}" data-folder-id="${habit.habitFolderId}">
                <div class="habit">
                    <div class="habit-icon-container">
                        <div>${habit.habitIcon}</div>
                    </div>
                    <div class="habit-content-container">
                        <div class="left-side-habit">
                            <div class="habit-text">${habit.habitName}</div>
                            <div class="habit-times-number">${habit.habitCompleted} / ${habit.habitGoalNumber} ${habit.habitGoalUnit}</div>
                        </div>
                        <div class="right-side-habit">
                            <div class="habit-folder-container habit-editor" style="background-color: ${folder.folderColor}; color: ${color};">${folder.folderIcon} ${" "} ${folder.folderName}</div>
                            <div class="habit-done-container habit-editor">
                                <div class="habit-done-icon-container">
                                    <img src="images/habits-container-icons/icons8-done-30.png" class="habit-done-icon" alt="done">
                                </div>
                                <div class="habit-done-text">Done</div>
                            </div>
                            <div class="habit-more-container habit-editor">
                                <img src="images/habits-container-icons/icons8-more-50.png" class="habit-more-icon" alt="more">
                                <div class="habit-more-menu-container" style="display: none;" data-id="${habit.habitId}">
                                    <div class="habit-more-menu-item-container">
                                        <img src="images/habits-container-icons/icons8-checkmark-16.png" class="habit-more-menu-item-icon">
                                        <div class="habit-more-menu-item">Check In</div>
                                    </div>
                                    <div class="habit-more-menu-item-container">
                                        <img src="images/habits-container-icons/icons8-right-arrow-16.png" class="habit-more-menu-item-icon">
                                        <div class="habit-more-menu-item">Skip</div>
                                    </div>
                                    <div class="habit-more-menu-item-container">
                                        <img src="images/habits-container-icons/icons8-wrong-16.png" class="habit-more-menu-item-icon">
                                        <div class="habit-more-menu-item">Fail</div>
                                    </div>
                                    <div class="habit-more-menu-item-container">
                                        <img src="images/habits-container-icons/icons8-edit-30.png" class="habit-more-menu-item-icon">
                                        <div class="habit-more-menu-item">Edit</div>
                                    </div>
                                    <div class="habit-more-menu-item-container">
                                        <img src="images/habits-container-icons/icons8-trash-can-50.png" class="habit-more-menu-item-icon habit-more-delete-icon">
                                        <div class="habit-more-menu-item">Delete</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        addHabitToCorrectGroup(habit, habitHTML);
        
    });

    hideAllEmptyGroups();
}


function saveHabitsToLocalStorage() {
    localStorage.setItem("habits", JSON.stringify(habits));
}

function loadHabitsFromLocalStorage() {
    const savedHabits = localStorage.getItem("habits");
    if (savedHabits) {
        habits = JSON.parse(savedHabits);
    }
}

function closeAddHabitModal() {
    const modalOverlay = document.getElementById("modal-overlay");
    const habitModal = document.querySelector(".habit-add-modal");
    modalOverlay.classList.add("hidden");
    habitModal.classList.add("hidden");
}

function clearAddHabitInputs() {
    const addHabitModal = document.querySelector(".habit-add-modal");
    addHabitModal.querySelector("#new-habit-name").value = "";
    addHabitModal.querySelector(".new-habit-icon").textContent = "";
    addHabitModal.querySelector("#habit-goal").value = "";
    addHabitModal.querySelector("#habit-date").value = "";
    addHabitModal.querySelector("#new-habit-description").value = "";
}

function InputNewHabit() {
    const addHabitModal = document.querySelector(".habit-add-modal");

    const habitGoalUnitMenu = addHabitModal.querySelector(".times-menu-container");
    const habitGoalUnitMenuItems = habitGoalUnitMenu.querySelectorAll(".times-menu-item");
    const habitGoalUnitMenuText = addHabitModal.querySelector(".times");

    habitGoalUnitMenuItems.forEach((item) => {
        item.addEventListener("click", () => {
            habitGoalUnitMenuText.textContent = item.textContent;
        });
    });


    const habitPerUnitMenu = addHabitModal.querySelector(".per-menu-container");
    const habitPerUnitMenuItems = habitPerUnitMenu.querySelectorAll(".per-menu-item");
    const habitPerUnitMenuText = addHabitModal.querySelector(".per");

    habitPerUnitMenuItems.forEach((item) => {
        item.addEventListener("click", () => {
            habitPerUnitMenuText.textContent = item.textContent;
        });
    });

    const habitTimeOfDayMenu = addHabitModal.querySelector(".habit-time-menu-container");
    const habitTimeOfDayMenuItems = habitTimeOfDayMenu.querySelectorAll(".habit-time-item-container");
    const habitTimeOfDayMenuText = addHabitModal.querySelector(".habit-time-text");

    habitTimeOfDayMenuItems.forEach((item) => {
        item.addEventListener("click", () => {
            const timeCheckMarkContainer = item.querySelector(".habit-time-item-check-container");

            // Toggle the checkmark
            const willHide = !timeCheckMarkContainer.classList.contains("hidden");
            timeCheckMarkContainer.classList.toggle("hidden");

            // Check how many items have checkmarks
            let selectedItems = [];
            habitTimeOfDayMenuItems.forEach((item) => {
                const check = item.querySelector(".habit-time-item-check-container");
                if (!check.classList.contains("hidden")) {
                    selectedItems.push(item);
                }
            });

            // 🛑 Rule 3: Don't allow all to be unchecked
            if (selectedItems.length === 0) {
                timeCheckMarkContainer.classList.remove("hidden"); // Re-check the one just clicked
                selectedItems.push(item);
            }

            // 🕒 Rule 2: If all items checked, show "Anytime"
            if (selectedItems.length === habitTimeOfDayMenuItems.length) {
                habitTimeOfDayMenuText.textContent = "Anytime";
            } else {
                // Show selected time labels
                const selectedText = selectedItems.map(selectedItem =>
                    selectedItem.querySelector(".habit-time-item-text-container").textContent.trim()
                );
                habitTimeOfDayMenuText.textContent = selectedText.join(", ");
            }
        });
    });


    const habitFolderMenu = addHabitModal.querySelector(".habit-folder-menu-container");
    const habitFolderMenuItems = habitFolderMenu.querySelectorAll(".habit-folder-item-container");
    const habitFolderMenuText = addHabitModal.querySelector(".habit-folder-text");

    habitFolderMenuItems.forEach((item) => {
        item.addEventListener("click", () => {
            habitFolderMenuText.textContent = item.querySelector(".habit-folder-item-text-container").textContent;
            habitFolderMenuText.dataset.folderId = item.dataset.id;
            
        });
    });

    const habitDateInput = addHabitModal.querySelector("#habit-date");
    const habitDateDisplayText = addHabitModal.querySelector(".habit-date-text");
    habitDateInput.addEventListener("change", () => {
        habitDateDisplayText.textContent = habitStartDateLabelFormatter(habitDateInput.value);
    });

    const habitIntervalMenuText = addHabitModal.querySelector(".habit-repeat-text");

    const nameOfDaysContainers = addHabitModal.querySelectorAll(".habit-repeat-daily-item-container");
    nameOfDaysContainers.forEach((container) => {
        container.addEventListener("click", () => {
            const checkMarkContainer = container.querySelector(".habit-repeat-daily-item-check-container");

            // Toggle the checkmark
            const willHide = !checkMarkContainer.classList.contains("hidden");
            checkMarkContainer.classList.toggle("hidden");

            // Gather selected items
            let selectedItems = [];
            nameOfDaysContainers.forEach((item) => {
                const check = item.querySelector(".habit-repeat-daily-item-check-container");
                if (!check.classList.contains("hidden")) {
                    selectedItems.push(item);
                }
            });

            // 🛑 Rule 1: Don't allow all to be unchecked
            if (selectedItems.length === 0) {
                checkMarkContainer.classList.remove("hidden"); // Re-check the one just clicked
                selectedItems.push(container);
            }

            // 🧠 Get selected day names
            const selectedDayNames = selectedItems.map(item =>
                item.querySelector(".habit-repeat-daily-item-text-container").textContent.trim()
            );

            const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
            const weekends = ["Saturday", "Sunday"];

            const allSelected = selectedDayNames.length === nameOfDaysContainers.length;
            const weekdaysSelected = weekdays.every(day => selectedDayNames.includes(day)) && selectedDayNames.length === 5;
            const weekendsSelected = weekends.every(day => selectedDayNames.includes(day)) && selectedDayNames.length === 2;

            if (allSelected) {
                habitIntervalMenuText.textContent = "Daily";
            } else if (weekdaysSelected) {
                habitIntervalMenuText.textContent = "Weekdays";
            } else if (weekendsSelected) {
                habitIntervalMenuText.textContent = "Weekend";
            } else {
                // Show first 3 letters of selected days
                const shortNames = selectedDayNames.map(day => day.slice(0, 3));
                habitIntervalMenuText.textContent = shortNames.join(", ");
            }
        });
    });

    const numberOfDaysInMonth = addHabitModal.querySelectorAll(".habit-repeat-monthly-item-calendar-row-item");
    numberOfDaysInMonth.forEach((item) => {
        item.addEventListener("click", () => {
            item.classList.toggle("selected");

            // Convert NodeList to array
            const selectedItems = Array.from(numberOfDaysInMonth).filter(item =>
                item.classList.contains("selected")
            );

            const selectedDays = selectedItems
                .map(item => formatOrdinal(parseInt(item.textContent.trim())))
                .sort((a, b) => parseInt(a) - parseInt(b)); // Optional: sort numerically

            if (selectedDays.length > 0) {
                habitIntervalMenuText.textContent = `Every month on ${selectedDays.join(", ")}`;
            } else {
                habitIntervalMenuText.textContent = "Monthly";
            }
        });
    });

    const habitRepeatIntervalMenuItems = addHabitModal.querySelectorAll(".habit-repeat-interval-item-container");
    const checkMarkContainer = addHabitModal.querySelectorAll(".habit-repeat-interval-item-check-container");
    habitRepeatIntervalMenuItems.forEach((item) => {
        item.addEventListener("click", () => {
            checkMarkContainer.forEach((checkMark) => {
                checkMark.classList.add("hidden");
            });
            item.querySelector(".habit-repeat-interval-item-check-container").classList.remove("hidden");
            habitIntervalMenuText.textContent = item.querySelector(".habit-repeat-interval-item-text-container").textContent;
        });
    });
    
} 

// Helper function to format numbers as 1st, 2nd, 3rd, etc.
function formatOrdinal(n) {
    const suffixes = ["th", "st", "nd", "rd"];
    const v = n % 100;
    const suffix = suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
    return `${n}${suffix}`;
}

function addHabitToCorrectGroup(habit, habitHTML) {
    let habitTimeOfDay = habit.habitTimeOfDay;

    let timeOfDayArray = [];
    if (typeof habitTimeOfDay === "string") {
        timeOfDayArray = habitTimeOfDay
            .split(",")
            .map(t => t.trim().toLowerCase())
            .filter(t => t.length > 0);
    }

    const allHabitGroups = document.querySelectorAll(".habits-group");

    allHabitGroups.forEach((group) => {
        const groupTime = group.dataset.time.toLowerCase();

        const isAnytime = timeOfDayArray.length === 1 && timeOfDayArray.includes("anytime");
        const matchesSpecific = timeOfDayArray.includes(groupTime);

        console.log({ groupTime, timeOfDayArray, isAnytime, matchesSpecific });

        // 🟢 Add to group if:
        // - it specifically matches, OR
        // - it is only set to "anytime" and group is "anytime"
        if (matchesSpecific || (isAnytime && groupTime === "anytime")) {
            const groupList = group.querySelector(".habits");
            groupList.insertAdjacentHTML("beforeend", habitHTML);
            updateHabitGroupCount(group);
        }
    });
}




function hideAllEmptyGroups() {
    const allHabitGroups = document.querySelectorAll(".habits-group");
    allHabitGroups.forEach((group) => {
        const groupList = group.querySelector(".habits");
        const habitCount = groupList.querySelectorAll(".habit").length;
        console.log(habitCount + " " + group.dataset.time);
        if (habitCount === 0) {
            group.classList.add("hidden");
        } else {
            group.classList.remove("hidden");
            updateHabitGroupCount(group);
        }
    });
}


function updateHabitGroupCount(group) {
    const groupList = group.querySelector(".habits");
    const habitCount = groupList.querySelectorAll(".habit").length;
    group.querySelector(".number-of-habits").textContent = habitCount;
}

function habitStartDateLabelFormatter(inputDateValue) {
    // Parse input as local date (not UTC)
    const [year, month, day] = inputDateValue.split("-").map(Number);
    const inputDate = new Date(year, month - 1, day); // This avoids UTC issues

    const today = new Date();
    const yesterday = new Date();
    const tomorrow = new Date();

    // Normalize all to local midnight
    [today, yesterday, tomorrow].forEach(date => date.setHours(0, 0, 0, 0));
    inputDate.setHours(0, 0, 0, 0);

    yesterday.setDate(today.getDate() - 1);
    tomorrow.setDate(today.getDate() + 1);

    if (inputDate.getTime() === today.getTime()) {
        return "Today";
    } else if (inputDate.getTime() === yesterday.getTime()) {
        return "Yesterday";
    } else if (inputDate.getTime() === tomorrow.getTime()) {
        return "Tomorrow";
    } else {
        const options = { year: "numeric", month: "short", day: "numeric" };
        return inputDate.toLocaleDateString("en-US", options); // e.g., "Aug 2, 2025"
    }
}