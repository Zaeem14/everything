document.addEventListener("DOMContentLoaded", () => {
    const folderAddButton = document.querySelector(".add-folder-button");

    if (folderAddButton) {
        folderAddButton.addEventListener("click", () => {
            console.log("Button clicked!");
            addFolder();
        });
    } else {
        console.warn("Add Folder button not found.");
    }

    loadFoldersFromLocalStorage();
});


let folders = [];

function addFolder() {
    const folderId = folders.length + 1;

    let folderName = document.querySelector(".folder-name-input").value;
    let folderColor = document.getElementById("folderColorPicker").value;
    let folderIcon = document.getElementById("folderIcon").textContent;

    const newFolder = {
        folderId: folderId,
        folderName: folderName,
        folderColor: folderColor,
        folderIcon: folderIcon
    };

    folders.push(newFolder);
    addFolderToThePage(folderIcon, folderName, folderColor, folderId);
    saveFoldersToLocalStorage();

    // Reset
    document.querySelector(".folder-name-input").value = "";
    document.getElementById("folderColorPicker").value = "#000000";
    document.getElementById("folderIcon").textContent = "📁";

    console.log(folders);
}

function addFolderToThePage(folderIcon, folderName, folderColor, folderId) {
    const folderContainer = document.querySelector(".folder-list");

    const folderDiv = document.createElement("div");
    folderDiv.classList.add("folder-div");
    folderDiv.setAttribute("data-id", folderId);

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

function loadFoldersFromLocalStorage() {
    const storedFolders = localStorage.getItem("folders");
    if (storedFolders) {
        folders = JSON.parse(storedFolders);
        renderAllFolders();
    }
}






function deleteFolder(folderId) {
    // Remove from array
    folders = folders.filter(folder => folder.folderId !== folderId);

    // Save updated array
    saveFoldersToLocalStorage();

    // Re-render folders
    renderAllFolders();
}

function renderAllFolders() {
    const folderContainer = document.querySelector(".folder-list");
    folderContainer.innerHTML = ""; // Clear

    folders.forEach(folder => {
        addFolderToThePage(folder.folderIcon, folder.folderName, folder.folderColor, folder.folderId);
    });
}


document.addEventListener("click", () => {
    document.querySelectorAll(".folder-more-icon-menu-container").forEach(menu => {
        menu.classList.add("hidden-element");
    });
});


