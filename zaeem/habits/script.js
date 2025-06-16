document.querySelectorAll('.habits-group-header').forEach(header => {
  header.addEventListener('click', () => {
    const habitsGroup = header.closest('.habits-group');
    const habits = habitsGroup.querySelector('.habits');
    habits.classList.toggle('hidden');
    header.classList.toggle('open');
  });
});