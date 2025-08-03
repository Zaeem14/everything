document.querySelectorAll('.habits-group-header').forEach(header => {
  header.addEventListener('click', () => {
    const habitsGroup = header.closest('.habits-group');
    const habits = habitsGroup.querySelector('.habits');
    habits.classList.toggle('hidden');
    header.classList.toggle('open');
  });
});

document.querySelector(".add-habits-container").addEventListener("click", () => {
    const modalOverlay = document.getElementById("modal-overlay");
    const habitModal = document.querySelector(".habit-add-modal");
    const folderModal = document.querySelector(".folder-add-modal");
    modalOverlay.classList.remove("hidden");
    habitModal.classList.remove("hidden");
    folderModal.classList.remove("hidden");
})