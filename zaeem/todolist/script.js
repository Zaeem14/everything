const taskInputContainer = document.querySelector('.todo-input-container');
const hiddenElements = document.querySelectorAll('.hidden');
const taskInputBox = document.querySelector('.input-plus-add-icon-container');
const todoInput = document.getElementById('todo-input');

let isInputActive = false;

taskInputContainer.addEventListener('click', (e) => {
  e.stopPropagation();

  // Always remove gray border when clicking inside
  taskInputContainer.classList.remove('todo-input-gray');

  if (!isInputActive) {
    taskInputContainer.classList.add('active-todo-input');
    hiddenElements.forEach(el => el.classList.remove('hidden'));
    taskInputBox.classList.add('active-todo-input-box');
    isInputActive = true;
  } else {
    // if already active but gray, turn it back blue
    taskInputContainer.classList.add('active-todo-input');
  }
});

document.addEventListener('click', (e) => {
  if (!taskInputContainer.contains(e.target)) {
    if (todoInput.value.trim() === "") {
      // Input is empty — fully reset everything
      taskInputContainer.classList.remove('active-todo-input', 'todo-input-gray');
      hiddenElements.forEach(el => el.classList.add('hidden'));
      taskInputBox.classList.remove('active-todo-input-box');
      isInputActive = false;
    } else {
      // Input has text — keep expanded, switch to gray border
      taskInputContainer.classList.remove('active-todo-input');
      taskInputContainer.classList.add('todo-input-gray');
    }
  }
});


