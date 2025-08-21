
import { addHabitRefreshParams } from "../data/habit.js";

document.addEventListener("DOMContentLoaded", () => {
    const addHabitMenusParents = document.querySelectorAll(".add-habit-input");
    addHabitMenusParents.forEach(parent => {
        parent.addEventListener("click", () => {
            toggleAddHabitMenus(parent);
        });
    });

    const addHabitDateInput = document.querySelector("#habit-date");
    const addHabitDateText = document.querySelector(".habit-date-text");
    addHabitDateText.addEventListener("click", () => {
        addHabitDateInput.showPicker();
    });

    bindRepeatMenuItemHover();
});

document.querySelectorAll('.habits-group-header').forEach(header => {
    header.addEventListener('click', () => {
        const habitsGroup = header.closest('.habits-group');
        const habits = habitsGroup.querySelector('.habits');
        header.classList.toggle('open');
        habits.classList.toggle('hidden');
    });
});

document.querySelector(".add-habits-container").addEventListener("click", () => {
    addHabitRefreshParams();
    const modalOverlay = document.getElementById("modal-overlay");
    const habitModal = document.querySelector(".habit-add-modal");
    modalOverlay.classList.remove("hidden");
    habitModal.classList.remove("hidden");

    const closeModalIconContainer = document.querySelector(".close-modal-icon-container");
    closeModalIconContainer.addEventListener("click", () => {
        modalOverlay.classList.add("hidden");
        habitModal.classList.add("hidden");
    });
});

document.querySelector(".add-folder-icon").addEventListener("click", () => {
    const modalOverlay = document.getElementById("modal-overlay");
    const folderModal = document.querySelector(".folder-add-modal");
    modalOverlay.classList.remove("hidden");
    folderModal.classList.remove("hidden");

    const closeModalIcon = folderModal.querySelector(".close-modal-icon-container");
    closeModalIcon.addEventListener("click", () => {
        modalOverlay.classList.add("hidden");
        folderModal.classList.add("hidden");
    });
});

function toggleAddHabitMenus(parent) {
    let clickedMenu = parent.querySelector(".add-habit-menu-container");

    if (!clickedMenu) return;

    if (!clickedMenu.classList.contains("hidden")) {
        const stickyClasses = [
            "habit-time-menu-container",
            "habit-repeat-menu-container",
            "habit-repeat-menu-item-container"
        ];

        if (stickyClasses.some(cls => clickedMenu.classList.contains(cls))) {
            return;
        } else {
            clickedMenu.classList.add("hidden");
            return;
        }
    }

    const allMenus = document.querySelectorAll(".add-habit-menu-container");
    allMenus.forEach(menu => menu.classList.add("hidden"));

    clickedMenu.classList.remove("hidden");

    const handleClickOutside = (e) => {
        const stickyClasses = [
            "habit-time-menu-container",
            "habit-repeat-menu-container",
            "habit-repeat-menu-item-container"
        ];

        if (
            stickyClasses.some(cls => e.target.closest(`.${cls}`)) ||
            parent.contains(e.target)
        ) {
            return;
        }

        clickedMenu.classList.add("hidden");
        document.removeEventListener("click", handleClickOutside, true);
    };

    document.addEventListener("click", handleClickOutside, true);
}

function bindRepeatMenuItemHover() {
    const repeatItemsContainer = document.querySelectorAll(".habit-repeat-menu-item-container");

    repeatItemsContainer.forEach(container => {
        const repeatItemMenu = container.querySelector(".habit-repeat-item-menu-container");
        let hideTimeout;

        container.addEventListener("mouseenter", () => {
            repeatItemsContainer.forEach(otherContainer => {
                const otherMenu = otherContainer.querySelector(".habit-repeat-item-menu-container");
                if (otherMenu !== repeatItemMenu) {
                    otherMenu.classList.add("hidden");
                }
            });

            clearTimeout(hideTimeout);
            repeatItemMenu.classList.remove("hidden");
        });

        container.addEventListener("mouseleave", () => {
            hideTimeout = setTimeout(() => {
                if (!repeatItemMenu.matches(":hover")) {
                    repeatItemMenu.classList.add("hidden");
                }
            }, 500);
        });

        repeatItemMenu.addEventListener("mouseenter", () => {
            clearTimeout(hideTimeout);
        });

        repeatItemMenu.addEventListener("mouseleave", () => {
            hideTimeout = setTimeout(() => {
                if (!container.matches(":hover")) {
                    repeatItemMenu.classList.add("hidden");
                }
            }, 500);
        });
    });
}
