// Get references to HTML elements by their IDs
const flashcardFields = document.getElementById('flashcard-fields');
const addFlashcardBtn = document.getElementById('add-flashcard');
const flashcardForm = document.getElementById('flashcard-form');
const setTitleInput = document.getElementById('set-title');
const recentFlashcards = document.getElementById('recent-flashcards');

// Function to make a new flashcard input row
function createFlashcardRow(question = '', answer = '') {
    const row = document.createElement('div'); // Make a new div for the row
    row.className = 'row g-2 mb-2 flashcard-row'; // Add CSS classes
    // Add HTML for question, answer, and remove button
    row.innerHTML = `
        <div class="col-12 col-md-5">
            <input type="text" class="form-control question-input" placeholder="Question" required maxlength="100" value="${question}">
        </div>
        <div class="col-12 col-md-5">
            <input type="text" class="form-control answer-input" placeholder="Answer" required maxlength="100" value="${answer}">
        </div>
        <div class="col-12 col-md-2 d-grid">
            <button type="button" class="btn btn-danger remove-flashcard" title="Remove">&times;</button>
        </div>
    `;
    // When remove button is clicked, remove this row (if more than one row left)
    row.querySelector('.remove-flashcard').onclick = () => {
        if (flashcardFields.children.length > 1) row.remove();
        updateRecentFlashcards(); // Update the recent flashcards list
    };
    // If user presses Enter in answer input, add a new flashcard row
    row.querySelector('.answer-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addFlashcardBtn.click();
        }
    });
    // Update recent flashcards when typing in question or answer
    row.querySelector('.question-input').addEventListener('input', updateRecentFlashcards);
    row.querySelector('.answer-input').addEventListener('input', updateRecentFlashcards);
    return row; // Return the new row
}

// When add button is clicked, add a new flashcard row
addFlashcardBtn.onclick = () => {
    const lastRow = flashcardFields.lastElementChild; // Get the last row
    const q = lastRow.querySelector('.question-input').value.trim(); // Get question text
    const a = lastRow.querySelector('.answer-input').value.trim(); // Get answer text
    // If question or answer is empty, focus on question input and stop
    if (!q || !a) {
        lastRow.querySelector('.question-input').focus();
        return;
    }
    // Add a new empty flashcard row
    flashcardFields.appendChild(createFlashcardRow());
    // Focus on the new question input after a short delay
    setTimeout(() => {
        flashcardFields.lastElementChild.querySelector('.question-input').focus();
    }, 10);
    updateRecentFlashcards(); // Update the recent flashcards list
};

// When the form is submitted (user clicks save)
flashcardForm.onsubmit = function(e) {
    e.preventDefault(); // Stop the page from reloading
    const setTitle = setTitleInput.value.trim(); // Get the set title
    // If title is empty, focus on title input and stop
    if (!setTitle) {
        setTitleInput.focus();
        return;
    }
    const cards = []; // Make an array for the cards
    // For each flashcard row, get question and answer
    flashcardFields.querySelectorAll('.flashcard-row').forEach(row => {
        const q = row.querySelector('.question-input').value.trim();
        const a = row.querySelector('.answer-input').value.trim();
        if (q && a) cards.push({ question: q, answer: a }); // Add to cards if both filled
    });
    if (!cards.length) return; // If no cards, stop

    // Send the new set data to library.html via localStorage event
    localStorage.setItem('newFlashcardSet', JSON.stringify({ title: setTitle, cards }));

    // Optionally, you can redirect to library.html or trigger a custom event here
    // window.location.href = 'library.html';
    // Get existing sets from localStorage (or empty array)
    const sets = JSON.parse(localStorage.getItem('flashcardSets') || '[]');
    // Add the new set with title and cards
    sets.push({ title: setTitle, cards });
    // Save back to localStorage
    localStorage.setItem('flashcardSets', JSON.stringify(sets));
    // Reset the form: clear title, remove all rows, add one empty row
    setTitleInput.value = '';
    flashcardFields.innerHTML = '';
    flashcardFields.appendChild(createFlashcardRow());
    updateRecentFlashcards(); // Update the recent flashcards list
};

// Show the list of recently added flashcards below the form
function updateRecentFlashcards() {
    const cards = []; // Array for current cards
    // For each flashcard row, get question and answer
    flashcardFields.querySelectorAll('.flashcard-row').forEach(row => {
        const q = row.querySelector('.question-input').value.trim();
        const a = row.querySelector('.answer-input').value.trim();
        if (q && a) cards.push({ question: q, answer: a }); // Add if both filled
    });
    // If no cards, clear the recent flashcards area
    if (cards.length === 0) {
        recentFlashcards.innerHTML = '';
        return;
    }
    // Build HTML for the recent flashcards list
    let html = '<div class="card"><div class="card-body p-2"><strong>Recently Added Flashcards:</strong><ul class="list-group list-group-flush">';
    cards.forEach((card, idx) => {
        html += `<li class="list-group-item d-flex justify-content-between align-items-center">
            <span><b>Q:</b> ${card.question} <b>A:</b> ${card.answer}</span>
            <button type="button" class="btn btn-sm btn-outline-danger remove-recent" data-idx="${idx}">&times;</button>
        </li>`;
    });
    html += '</ul></div></div>';
    recentFlashcards.innerHTML = html; // Show the list

    // Add remove button logic for each recent card
    recentFlashcards.querySelectorAll('.remove-recent').forEach(btn => {
        btn.onclick = function() {
            const idx = parseInt(this.getAttribute('data-idx')); // Get index of card
            // Remove the matching flashcard row
            const rows = flashcardFields.querySelectorAll('.flashcard-row');
            if (rows[idx]) rows[idx].remove();
            updateRecentFlashcards(); // Update the list again
        };
    });
}

// If there are no flashcard rows, add one empty row at the start
if (!flashcardFields.querySelector('.flashcard-row')) {
    flashcardFields.appendChild(createFlashcardRow());
}
updateRecentFlashcards(); // Show the recent flashcards at the start