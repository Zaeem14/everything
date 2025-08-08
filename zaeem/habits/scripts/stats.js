import { habits } from "../data/habit.js";
import { folders } from "../data/folder.js";

const statsPanel = document.querySelector("#habits-stats-container");

document.addEventListener("click", (e) => {
    const habitElement = e.target.closest(".habits-more-container");
    if (!habitElement) {
        console.log("No habit element found");
        return;
    };

    
    const habitId = habitElement.getAttribute("data-id");
    const habitFolderId = habitElement.getAttribute("data-folder-id");

    const habit = habits.find(h => h.habitId === Number(habitId));
    const folder = folders.find(f => f.folderId === Number(habitFolderId));
    const habitFolderTextColor = habitElement.querySelector(".habit-folder-container").style.color;
    renderStatsPanel(habit, folder, habitFolderTextColor);
})

function renderStatsPanel(habit, folder, habitFolderTextColor) {
    statsPanel.setAttribute("data-id", habit.habitId);


    statsPanel.innerHTML = `
            <div class="habits-stats-header">
                <div class="habits-stats-header-left">
                    <div class="habits-stats-title">${habit.habitIcon} ${" "}${habit.habitName}</div>
                </div>
                <div class="habits-stats-header-right">
                    <div class="habits-stats-folder" style="background-color: ${folder.folderColor}; color: ${habitFolderTextColor}">${folder.folderIcon} ${" "}${folder.folderName}</div>
                    <div class="habits-stats-edit-icon-container">
                        <img src="images/habits-container-icons/icons8-edit-50.png" class="habit-edit-icon" alt="edit">
                    </div>
                </div>
            </div>
            <div class="habits-stats">
                <div class="habit-current-streaks-stats-container stats-container">
                    <div class="streak-icon-container">
                        <img src="images/habits-container-icons/icons8-fire-48.png" class="streak-icon" alt="streak">
                    </div>
                    <div class="streak-stats-container">
                        <div class="current-streak-title">Current Streak</div>
                        <div class="current-streak">${habit.habitStreak} days</div>
                    </div>
                </div>
                
                <div class="habit-completed-times-stats-container">
                    <div class="completed-icon-container">
                        <img src="images/habits-container-icons/icons8-check-mark-48.png" class="streak-icon" alt="streak">
                    </div>
                    <div class="completed-stats-container">
                        <div class="current-completed-title">Completed Times</div>
                        <div class="current-completed">${habit.habitCompleted} times</div>
                    </div>
                </div>
                <div class="habit-failed-times-stats-container">
                    <div class="failed-icon-container">
                        <img src="images/habits-container-icons/icons8-cancel-48.png" class="streak-icon" alt="streak">
                    </div>
                    <div class="failed-stats-container">
                        <div class="current-failed-title">Failed Times</div>
                        <div class="current-failed">${habit.habitFailed} times</div>
                    </div>
                </div>
                
                
                <div class="habit-skipped-times-stats-container">
                    <div class="skipped-icon-container">
                        <img src="images/habits-container-icons/icons8-skip-48.png" class="streak-icon" alt="streak">
                    </div>
                    <div class="skipped-stats-container">
                        <div class="current-skipped-title">Skipped Times</div>
                        <div class="current-skipped">${habit.habitSkipped} times</div>
                    </div>
                </div>
            </div>
    `

    editHabit();

}

function editHabit() {
    const habitId = statsPanel.getAttribute("data-id");
    const habit = habits.find(h => h.habitId === Number(habitId));
    const folder = folders.find(f => f.folderId === Number(habit.habitFolderId));
    const modalOverlay = document.querySelector("#modal-overlay");
    const habitAddModal = document.querySelector(".habit-add-modal");
    const habitEditIcon = document.querySelector(".habit-stats-edit-icon-container");

    habitEditIcon.addEventListener("click", () => {
        habitAddModal.classList.remove("hidden");
        modalOverlay.classList.remove("hidden");
        inputCurrentHabitValues(habit, folder);
        addHabitModalEditModeButtonsHandler();
    });
    
}

function inputCurrentHabitValues(habit, folder) {
    document.querySelector("#new-habit-name").value = habit.habitName;
    document.querySelector(".new-habit-icon").textContent = habit.habitIcon;
    document.querySelector("#habit-goal").value = habit.habitGoal;
    document.querySelector(".habit-time-text").textContent = habit.habitTimeOfDay;
    document.querySelector(".habit-folder-text").textContent = folder.folderName;
    document.querySelector("#habit-date").value = habit.habitStartDate;
    document.querySelector("#new-habit-description").value = habit.habitDescription;
}

function addHabitModalEditModeButtonsHandler() {
    const habitAddModal = document.querySelector(".habit-add-modal");
    const habitAddButton = document.querySelector(".habit-add-button");
    const habitCancelButton = document.querySelector(".habit-cancel-button");

    habitAddButton.textContent = "Save Habit";
    habitAddButton.classList.add("");

    habitCancelButton.classList.remove("hidden");
}



    