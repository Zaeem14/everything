import { setupFolderDivClicks } from "../scripts/menu.js";

document.addEventListener("DOMContentLoaded", () => {
    loadFoldersFromLocalStorage();
    renderFolderPickerMenu();



    const folderAddButton = document.querySelector(".add-folder-button");

    folderAddButton.addEventListener("click", () => {
        addFolder();
        closeModal();
        
        setTimeout(() => {
            clearFolderInput();
        }, 200); // Give the modal a moment to close before clearing
    });

    const inputFolderIconContainer = document.querySelector(".todo-input-folder-icon-container");
    const inputFolderIcon = document.querySelector(".todo-input-folder-icon-js");
    const inputFolderIconMenu = document.querySelector(".todo-folder-menu");

    inputFolderIconContainer.addEventListener("click", () => {
        if (!inputFolderIconContainer.classList.contains("hidden")) {
            inputFolderIconMenu.classList.remove("hidden-element");
        }
        
    });

    document.addEventListener("click", (e) => {
        if (
            inputFolderIconMenu &&
            !inputFolderIcon.contains(e.target) &&
            !inputFolderIconMenu.contains(e.target)
        ) {
            inputFolderIconMenu.classList.add("hidden-element");
        }
    });


    // Event delegation to handle clicks on folder options
    inputFolderIconMenu.addEventListener("click", (event) => {
        const option = event.target.closest(".folder-menu-container");
        if (!option) return;

        // Get icon + name from clicked option
        const folderName = option.querySelector(".folder-menu-name").textContent.trim();
        const folderIcon = option.querySelector(".folder-icon").textContent.trim();

        // Replace selected folder display
        inputFolderIconContainer.innerHTML = `${folderIcon} ${folderName}`;
        inputFolderIconContainer.setAttribute("data-id", option.getAttribute("data-id")); // optional if storing id
        


        // Highlight selected in menu
        document.querySelectorAll(".folder-menu-container").forEach(opt =>
            opt.classList.remove("current-folder")
        );
        option.classList.add("current-folder");
        inputFolderIconContainer.classList.add("current-folder");

        // Hide menu
        inputFolderIconMenu.classList.add("hidden-element");
    });

    document.getElementById("folderColorPicker").addEventListener("input", changeFolderColorIndicator);

});


export let folders = {};

function addFolder() {
    const folderId = Date.now(); // Unique folder ID

    const folderName = document.querySelector(".folder-name-input").value;
    const folderColor = document.getElementById("folderColorPicker").value;
    const folderIcon = document.getElementById("folderIcon").textContent;

    

    const newFolder = {
        folderId,
        folderName,
        folderColor,
        folderIcon
    };

    folders[folderId] = newFolder;
    saveFoldersToLocalStorage();
    renderFolderPickerMenu();
    renderAllFolders()

}


function addFolderToThePage(folderIcon, folderName, folderColor, folderId) {
    const folderContainer = document.querySelector(".folder-list");

    const folderDiv = document.createElement("div");
    folderDiv.classList.add("folder-div");
    folderDiv.setAttribute("data-id", folderId);
    folderDiv.setAttribute("data-folder", folderName);

    folderDiv.innerHTML = `
        <div class="folder-div-left">
            <div class="folder-div-icon">${folderIcon}</div>
            <div class="folder">${folderName}</div>
        </div>
        <div class="folder-div-right">
            <div class="folder-color-circle" style="background-color: ${folderColor};"></div>
            <div class="folder-more-icon-container">
                <img class="folder-more-icon" src="images/todo-container/icons8-more-30.png">
                <div class="folder-more-icon-menu-container hidden-element">
                    <div class="folder-more-icon-menu edit-folder">
                        <img src="images/todo-folders-icons/icons8-edit-16.png">
                        <div>Edit</div>
                    </div>
                    <div class="folder-more-icon-menu delete-folder">
                        <img src="images/todo-container/icons8-trash-can-50.png" class="delete-folder-icon">
                        <div>Delete</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Toggle the right menu
    const moreIcon = folderDiv.querySelector(".folder-more-icon");
    const menuContainer = folderDiv.querySelector(".folder-more-icon-menu-container");

    moreIcon.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent closing if clicked inside
        menuContainer.classList.toggle("hidden-element");
    });


    // ✅ Add delete handler
    folderDiv.querySelector(".delete-folder").addEventListener("click", () => {
        deleteFolder(folderId);
    });

    menuContainer.addEventListener("click", e => e.stopPropagation());

    folderContainer.appendChild(folderDiv);
}


function saveFoldersToLocalStorage() {
    localStorage.setItem("folders", JSON.stringify(folders));
}

export function loadFoldersFromLocalStorage() {
    const storedFolders = localStorage.getItem("folders");
    if (storedFolders) {
        const parsedFolders = JSON.parse(storedFolders);
        Object.assign(folders, parsedFolders); // ✅ merge into existing object
        renderAllFolders();
    }
}







function deleteFolder(folderId) {
    // Remove from array
    delete folders[folderId];
    /*folders = folders.filter(folder => folder.folderId !== folderId);*/

    // Save updated array
    saveFoldersToLocalStorage();

    // Re-render folders
    renderAllFolders();
    renderFolderPickerMenu();
}

function renderAllFolders() {
    const folderContainer = document.querySelector(".folder-list");
    folderContainer.innerHTML = ""; // Clear before rendering
    Object.values(folders).forEach(folder => {
        addFolderToThePage(folder.folderIcon, folder.folderName, folder.folderColor, folder.folderId);
    });

    setupFolderDivClicks();

}


document.addEventListener("click", () => {
    document.querySelectorAll(".folder-more-icon-menu-container").forEach(menu => {
        menu.classList.add("hidden-element");
    });
});


const addFolderIcon = document.querySelector(".add-folder-icon");
const addFolderIconModalOverlay = document.getElementById("modal-overlay");
const addFolderIconModalCloseIcon = document.querySelector(".close-modal-icon-container");

addFolderIcon.addEventListener("click", () => {
  addFolderIconModalOverlay.classList.remove("hidden-element");
});

addFolderIconModalCloseIcon.addEventListener("click", () => {
  closeModal();
})

function closeModal() {
  addFolderIconModalOverlay.classList.add("hidden-element");
}

export function renderFolderPickerMenu() {
    const dynamicMenus = document.querySelectorAll(".folder-menu-dynamic");

    dynamicMenus.forEach(menu => {
        menu.innerHTML = ""; // clear previous items

        Object.values(folders).forEach(folder => {
            const folderPicker = document.createElement("div");
            folderPicker.classList.add("folder-menu-container");
            folderPicker.setAttribute("data-id", folder.folderId);
            folderPicker.setAttribute("data-folder", folder.folderName);
            folderPicker.setAttribute("data-color", folder.folderColor);

            folderPicker.innerHTML = `
                <div class="folder-menu-icon-container">
                    <div class="folder-icon">${folder.folderIcon}</div>
                </div>
                <div class="folder-menu-name">${folder.folderName}</div>
            `;

            menu.appendChild(folderPicker); // ✅ now it's created fresh per menu
        });
    });
}

function clearFolderInput() {
    document.querySelector(".folder-name-input").value = "";
    document.getElementById("folderColorPicker").value = "#000000";
    document.getElementById("folderIcon").textContent = "📁";
}

function changeFolderColorIndicator() {
    const selectedColor = document.getElementById("folderColorPicker").value;
    const container = document.querySelector(".folder-color-picker-container");

    // Remove any existing indicator circles
    container.querySelectorAll(".color-indicator-circle").forEach(el => el.remove());

    // Add the new indicator right after the color picker icon
    const newColorPickerCircle = document.createElement("div");
    newColorPickerCircle.classList.add("color-indicator-circle");
    newColorPickerCircle.style.backgroundColor = selectedColor;

    // Find the color picker icon to insert after
    const colorPickerIcon = container.querySelector(".color-picker-icon");
    if (colorPickerIcon && colorPickerIcon.nextSibling) {
        container.insertBefore(newColorPickerCircle, colorPickerIcon.nextSibling);
    } else {
        container.appendChild(newColorPickerCircle);
    }
}