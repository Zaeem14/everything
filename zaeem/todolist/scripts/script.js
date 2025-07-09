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

// Toggle arrow in task-group-header and show/hide tasks
const taskGroupHeaders = document.querySelectorAll('.task-group-header');
taskGroupHeaders.forEach(header => {
  header.addEventListener('click', () => {
    const group = header.closest('.task-group');
    group.classList.toggle('open');
  });
});



const colorInput = document.getElementById("folderColorPicker");
const colorIcon = document.getElementById("colorPickerIcon");

colorIcon.addEventListener("click", () => {
  colorInput.click();
  
});

// header icons 
const todolistSortIcon = document.querySelector(".todo-header-sort-icon-js");
const todolistMoreIcon = document.querySelector(".todo-header-more-icon-js");

// header icons hidden menus
const sortIconMenu = document.querySelector(".sort-header-icon-menu-container");
const moreIconMenu = document.querySelector(".more-header-icon-menu-container");

// Toggle visibility on icon click
todolistSortIcon?.addEventListener("click", (e) => {
  e.stopPropagation(); // Prevent it from triggering the document click
  sortIconMenu.classList.toggle("hidden-element");
  moreIconMenu.classList.add("hidden-element"); // optional: close the other menu
});

todolistMoreIcon?.addEventListener("click", (e) => {
  e.stopPropagation();
  moreIconMenu.classList.toggle("hidden-element");
  sortIconMenu.classList.add("hidden-element"); // optional: close the other menu
});

// Hide menus if clicking outside
document.addEventListener("click", (e) => {
  if (
    !todolistSortIcon.contains(e.target) &&
    !sortIconMenu.contains(e.target)
  ) {
    sortIconMenu.classList.add("hidden-element");
  }

  if (
    !todolistMoreIcon.contains(e.target) &&
    !moreIconMenu.contains(e.target)
  ) {
    moreIconMenu.classList.add("hidden-element");
  }
});



// stats priority icon 
const priorityIconStats = document.querySelector(".task-priority-container-stats");
// stats priority icon hidden menu
const priorityIconMenuStats = document.querySelector(".todo-priority-menu-stats");

priorityIconStats.addEventListener("click", () => {
  priorityIconMenuStats.classList.toggle("hidden-element");
})

document.addEventListener("click", (e) => {
  if (
    priorityIconMenuStats &&
    !priorityIconStats.contains(e.target) &&
    !priorityIconMenuStats.contains(e.target)
  ) {
    priorityIconMenuStats.classList.add("hidden-element");
  }
});


const inputPriorityIcon = document.querySelector(".todo-input-priority-icon-js");
const inputPriorityIconMenu = document.querySelector(".todo-priority-menu");

inputPriorityIcon?.addEventListener("click", (e) => {
  e.stopPropagation(); // Prevent immediate hiding
  inputPriorityIconMenu?.classList.toggle("hidden-element");
});

document.addEventListener("click", (e) => {
  // ONLY keep it open if click is on icon or on menu
  const clickedOnIcon = inputPriorityIcon?.contains(e.target);
  const clickedOnMenu = inputPriorityIconMenu?.contains(e.target);

  if (!clickedOnIcon && !clickedOnMenu) {
    inputPriorityIconMenu?.classList.add("hidden-element");
  }
});

const sidebarIcon = document.querySelector(".collapse-sidebar-icon"); // initial class
const menuBar = document.getElementById("todolist-menu");
const todoContainer = document.getElementById("todo-container");

sidebarIcon.addEventListener("click", () => {
  if (sidebarIcon.classList.contains("collapse-sidebar-icon")) {
    // Collapse sidebar
    menuBar.classList.add("hidden-menu");
    todoContainer.style.width = "67%";
    sidebarIcon.src = "images/todo-container/expand.png";
    sidebarIcon.classList.remove("collapse-sidebar-icon");
    sidebarIcon.classList.add("expand-sidebar-icon");
  } else {
    // Expand sidebar
    menuBar.classList.remove("hidden-menu");
    todoContainer.style.width = "50%";
    sidebarIcon.src = "images/todo-container/collapse.png";
    sidebarIcon.classList.remove("expand-sidebar-icon");
    sidebarIcon.classList.add("collapse-sidebar-icon");
  }
});

function updateExpandSideBarIconSrc(e) {
  if (e.matches) {
    sidebarIcon.src = "images/todo-container/expand.png";
  } 
}

function updateCollapseSideBarIconSrc(e) {
  if (e.matches) {
    sidebarIcon.src = "images/todo-container/collapse.png";
  }
}

// Create a media query list
const mq = window.matchMedia('(max-width: 768px)');
const mq2 = window.matchMedia('(min-width: 769px)');

// Initial check
updateExpandSideBarIconSrc(mq);
updateCollapseSideBarIconSrc(mq2);

// Listen for viewport changes
mq.addEventListener('change', updateExpandSideBarIconSrc);
mq2.addEventListener('change', updateCollapseSideBarIconSrc);

const taskStatsDueDateContainer = document.querySelector('.task-due-date-container-stats');
const taskStatsDueDateInput = document.querySelector(".todo-date-input-stats");

taskStatsDueDateContainer.addEventListener('click', () => {
  if (taskStatsDueDateInput.showPicker) {
    taskStatsDueDateInput.showPicker(); // Modern browsers only (Chrome, Edge)
  } else {
    taskStatsDueDateInput.focus(); // Fallback for older/unsupported browsers
  }
});


