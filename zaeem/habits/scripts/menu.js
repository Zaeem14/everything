import { folders } from "../data/folder.js";
import { renderHabits } from "../data/habit.js";


document.addEventListener("DOMContentLoaded", () => {
    setupTimeFilterClicks();
    setupFolderClicks();
});


function handleTimeFilterClick(selectedTime) {
    const allHabitGroups = document.querySelectorAll(".habits-group");

    allHabitGroups.forEach(group => {
        const groupDataTime = group.getAttribute("data-time");

        if (selectedTime === "all" || groupDataTime === selectedTime) {
            group.style.display = "flex";
            renderHabits();
        } else {
            group.style.display = "none";
        }
    });

    updatePageTitleTime(selectedTime);
    
}

function handleFolderClick(folderId, folderName) {
    const allHabitGroups = document.querySelectorAll(".habits-group");

    allHabitGroups.forEach(group => {
        const groupHabits = group.querySelectorAll(".habits-more-container");
        let matchCount = 0;

        groupHabits.forEach(habit => {
            const habitFolderId = habit.getAttribute("data-folder-id");

            if (habitFolderId === folderId) {
                habit.style.display = "flex";
                matchCount++;
            } else {
                habit.style.display = "none";
            }
        });

        // Show the group only if it has matching habits
        group.style.display = matchCount > 0 ? "flex" : "none";

        // Update the habit count
        const countSpan = group.querySelector(".number-of-habits");
        if (countSpan) countSpan.textContent = matchCount;
    });

    updatePageTitleFolder(folderName);
}
  

function setupTimeFilterClicks() {
    const timeFilterList = document.querySelectorAll(".habits-time-container");

    timeFilterList.forEach(timeFilter => {
        timeFilter.onclick = () => {
            const selectedTime = timeFilter.querySelector(".habits-time").textContent.toLowerCase();
            handleTimeFilterClick(selectedTime);
            assignCurrentFilterClass(timeFilter, null);
        };
    });
}

function setupFolderClicks() {
    const folderFilterList = document.querySelectorAll(".folder-div");

    folderFilterList.forEach(folderFilter => {
        folderFilter.onclick = () => {
            const folderId = folderFilter.getAttribute("data-id");
            const folderName = folderFilter.getAttribute("data-folder");
            handleFolderClick(folderId, folderName);
            assignCurrentFilterClass(null, folderFilter);
        };
    });
}

function updatePageTitleTime(selectedTime) {
    const pageTitleElement = document.querySelector(".habits-time-title");
    pageTitleElement.textContent = selectedTime.charAt(0).toUpperCase() + selectedTime.slice(1);
}

function updatePageTitleFolder(folderName) {
    const pageTitleElement = document.querySelector(".habits-time-title");
    pageTitleElement.textContent = folderName.charAt(0).toUpperCase() + folderName.slice(1);
}

function assignCurrentFilterClass(selectedTimeFilter, selectedFolderFilter) {
    const timeFilterList = document.querySelectorAll(".habits-time-container");
    const folderFilterList = document.querySelectorAll(".folder-div");

    timeFilterList.forEach(filter => filter.classList.remove("current-filter"));
    folderFilterList.forEach(filter => filter.classList.remove("current-filter"));

    if (selectedTimeFilter) selectedTimeFilter.classList.add("current-filter");
    if (selectedFolderFilter) selectedFolderFilter.classList.add("current-filter");
}
