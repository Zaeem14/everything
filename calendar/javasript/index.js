const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn')
const currentDisplay = document.getElementById('currentDisplay')
const todayBtn = document.querySelector('.today-button')


let currentDate = new Date()

function formatMonthYear(date) {
    const options = {year: 'numeric', month: 'long'};
    return date.toLocaleDateString('en-US', options)
};

function updateDisplay() {
    currentDisplay.textContent = formatMonthYear(currentDate);
}

prevBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth()-1);
    updateDisplay();
})

nextBtn.addEventListener('clcik', ()=> {
    currentDate.setMonth(currentDate.getDate() + 1);
    updateDisplay();
})

todayBtn.addEventListener('click', ()=> {
    currentDate = new Date();
    updateDisplay();

})
document.addEventListener('DOMContentLoaded', () => {
            const openMenuBtn = document.getElementById('openMenuBtn');
            const featureMenu = document.getElementById('featureMenu');
            const closeMenuBtn = document.getElementById('closeMenuBtn');
            const overlay = document.getElementById('overlay');

            // Open menu when hamburger icon is clicked
            openMenuBtn.addEventListener('click', () => {
                featureMenu.classList.remove('-translate-x-full'); // Slide in
                featureMenu.classList.add('translate-x-0');
                overlay.classList.remove('hidden'); // Show overlay
            });

            // Close menu when close button is clicked
            closeMenuBtn.addEventListener('click', () => {
                featureMenu.classList.remove('translate-x-0'); // Slide out
                featureMenu.classList.add('-translate-x-full');
                overlay.classList.add('hidden'); // Hide overlay
            });

            // Close menu when overlay is clicked
            overlay.addEventListener('click', () => {
                featureMenu.classList.remove('translate-x-0'); // Slide out
                featureMenu.classList.add('-translate-x-full');
                overlay.classList.add('hidden'); // Hide overlay
            });

            // Initialize Bootstrap dropdowns
            // This ensures Bootstrap's JavaScript components are active
            const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
            const dropdownList = dropdownElementList.map(function (dropdownToggleEl) {
                return new bootstrap.Dropdown(dropdownToggleEl);
            });
        });