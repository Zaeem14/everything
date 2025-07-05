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