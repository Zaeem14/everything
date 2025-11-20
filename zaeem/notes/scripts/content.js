document.addEventListener("DOMContentLoaded", () => {
    ContentEditor();
    LineHoverBehavior();
    PlaceholderHandlers();
    enableClickToAddNewLine();
    handleContentMenu(); // safe now, works for all current + future lines
});

let suppressPlaceholder = false;


document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const active = document.activeElement;

        // If cursor is inside page title
        if (active.classList.contains("page-title")) {
            e.preventDefault(); // stop new line in title

            // Grab the first .content inside .line
            const target = document.querySelector(".first-line .content");
            if (!target) return;

            target.focus();

            // Place cursor at start
            const range = document.createRange();
            const sel = window.getSelection();
            range.setStart(target, 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);

            updatePlaceholder(target);

        }
    }
});

// add-icon click handler — stop propagation so global click handlers don't race
document.addEventListener("click", (e) => {
    const targetElement = e.target;
    if (targetElement && targetElement.alt === "add block icon") {
        // prevent default click behavior and stop other click handlers from interfering
        e.preventDefault();
        e.stopPropagation();

        const currentLine = targetElement.closest(".line");
        if (currentLine) addIconInsertBlockNextLine(currentLine);
    }
});

function ContentEditor() {
    const container = document.querySelector(".content-container");
    if (!container) return;

    container.addEventListener("keydown", (e) => {
        const content = document.activeElement;
        const line = content.closest(".line");

        const isHeading = content.classList.contains("text-xl") ||
                         content.classList.contains("text-2xl") ||
                         content.classList.contains("text-3xl");

        // Enhancement: Remove placeholder text for headers when typing begins
        if (!e.ctrlKey && !e.metaKey && e.key.length === 1) {
            const placeholderText = content.dataset.placeholder;
            if (placeholderText && content.textContent.trim() === placeholderText) {
                content.textContent = "";
            }
        }

        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();

            if (isHeading && content.textContent.trim() === "") {
                // 🧠 If user just presses Enter on an empty heading, create new line instead of deleting
                const newLine = insertNewLineAfter(line);
                const newContent = newLine.querySelector(".content");
                updatePlaceholder(newContent);
                newContent.focus();
                return; // ✅ don’t delete the heading
            }


            // Save the current content
            const currentText = content.textContent.trim();

            // Create new line with placeholder
            const newLine = insertNewLineAfter(line);
            const newContent = newLine.querySelector(".content");

            // Update the current line's content (remove any placeholder)
            if (currentText === "" ||
                currentText === "Type here..." ||
                currentText === "Heading 1" ||
                currentText === "Heading 2" ||
                currentText === "Heading 3") {
                content.textContent = "";
            }

            // Show placeholder in the new line
            updatePlaceholder(newContent);

            // Focus the new line
            newContent.focus();
        }

        if (e.key === "Backspace") {
            const isEmpty = content.textContent.trim() === "" ||
                          content.textContent === "Type here..." ||
                          content.textContent === "Heading 1" ||
                          content.textContent === "Heading 2" ||
                          content.textContent === "Heading 3";
            if (isEmpty) {
                e.preventDefault();
                // If it's a heading and empty, remove and update placeholder for previous line
                if (isHeading && content.textContent.trim() === "") {
                    const prevLine = line.previousElementSibling;
                    line.remove();
                    if (prevLine) {
                        const prevContent = prevLine.querySelector(".content");
                        updatePlaceholder(prevContent);
                    }
                    return;
                }
                deleteCurrentLine(line);
            }
        }
    });
}


function insertNewLineAfter(currentLine) {
    const newLine = line();
    const currentContent = currentLine.querySelector(".content");

    // Remove placeholder from current line if it's empty
    if (["Type here...", "Heading 1", "Heading 2", "Heading 3"].includes(currentContent.textContent.trim())) {
        currentContent.textContent = "";
    }


    // Copy heading class if current line is a heading
    const newContent = newLine.querySelector(".content");



    // Hide all other icons
    document.querySelectorAll(".line .icons img").forEach(img => img.classList.add("hidden"));

    // Insert and show icons on new line
    currentLine.insertAdjacentElement("afterend", newLine);
    const icons = newLine.querySelectorAll(".icons img");
    icons.forEach(icon => icon.classList.remove("hidden"));

    // Focus new line
    newContent.focus();
    // Always update placeholder for new line (for headings, show correct heading placeholder)
    updatePlaceholder(newContent);
    return newLine;
}

// 🔹 Turn current line into a text block
function transformToTextBlock(currentLine) {
    const content = currentLine.querySelector(".content");
    if (!content) return;

    // Remove heading styles if present
    content.classList.remove("text-3xl", "text-2xl", "text-xl", "font-bold");

    // Reset to normal text
    content.classList.add("w-full", "outline-none");

    // Clear placeholder if needed
    clearPlaceholder(content);

    // Reset placeholder to default text
    updatePlaceholder(content);

    // Focus back
    content.focus();

    return currentLine; // ✅ no new element added
}


// 🔹 Turn current line into a heading block
function transformToHeadingBlock(currentLine, headingSize) {
    const content = currentLine.querySelector(".content");
    if (!content) return;

    // Remove existing heading styles
    content.classList.remove("text-3xl", "text-2xl", "text-xl", "font-bold");

    // Apply new heading size
    if (headingSize === 1) {
        content.classList.add("text-3xl", "font-bold");
    } else if (headingSize === 2) {
        content.classList.add("text-2xl", "font-bold");
    } else if (headingSize === 3) {
        content.classList.add("text-xl", "font-bold");
    }

    // Clear current text if it's a placeholder
    if (["Type here...", "Heading 1", "Heading 2", "Heading 3"].includes(content.textContent.trim())) {
        content.textContent = "";
    }

    // Update placeholder to new heading type
    updatePlaceholder(content);

    // Focus back on current line
    content.focus();

    return currentLine; // ✅ no new element added
}

function deleteCurrentLine(currentLine) {
    const prevLine = currentLine.previousElementSibling;
    currentLine.remove();

    // Hide all icons globally
    document.querySelectorAll(".line .icons img").forEach(img => img.classList.add("hidden"));

    if (!prevLine) return;

    const prevContent = prevLine.querySelector(".content");

    setTimeout(() => {
        // Update placeholder if needed
        if (prevContent.textContent.trim() === "" || isOnlyPlaceholder(prevContent)) {
            updatePlaceholder(prevContent);
        }

        // Show icons for this line
        prevLine.querySelectorAll(".icons img").forEach(icon => icon.classList.remove("hidden"));

        // Focus and move cursor to END of text
        prevContent.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(prevContent);
        range.collapse(false); // false = end
        sel.removeAllRanges();
        sel.addRange(range);
    }, 0);
}





function LineHoverBehavior() {
    const contentContainer = document.querySelector(".content-container");
    if (!contentContainer) return;

    contentContainer.addEventListener("mouseover", (e) => {
        const line = e.target.closest(".line");
        if (line && !line.classList.contains("prevent-hover-icons")) {
            line.querySelectorAll("img[alt='move block icon'], img[alt='add block icon']")
                .forEach(icon => icon.classList.remove("hidden"));
        }
    });

    contentContainer.addEventListener("mouseout", (e) => {
        const line = e.target.closest(".line");
        if (line && !line.contains(e.relatedTarget)) {
            line.querySelectorAll("img[alt='move block icon'], img[alt='add block icon']")
                .forEach(icon => icon.classList.add("hidden"));
        }
    });
}


function PlaceholderHandlers() {
    // Handle input event - when user types in a field
    document.addEventListener("input", (e) => {
        const content = e.target;
        if (!content.classList.contains("content")) return;

        const placeholderText = content.dataset.placeholder;
        if (placeholderText && content.textContent.trim() === placeholderText) {
        content.textContent = "";
    }

    // 🧠 If heading becomes empty, immediately reapply placeholder
    if (
        (content.classList.contains("text-3xl") ||
        content.classList.contains("text-2xl") ||
        content.classList.contains("text-xl")) &&
        content.textContent.trim() === ""
    ) {
        updatePlaceholder(content);
    }



        // Remove placeholder styles only if content is not empty
        if ((content.classList.contains('text-gray-400') || content.classList.contains('italic')) && content.textContent.trim() !== "") {
            content.classList.remove('text-gray-400', 'italic');
            delete content.dataset.placeholder;
        }
    });

    document.addEventListener("focusin", (e) => {
        const content = e.target;
        if (!content.classList.contains("content")) return;

        const text = content.textContent.trim();
        const isHeading =
            content.classList.contains("text-3xl") ||
            content.classList.contains("text-2xl") ||
            content.classList.contains("text-xl");

        const placeholderText = content.dataset.placeholder;

        // 🧠 For normal text blocks, remove placeholder immediately when focused
        if (!isHeading) {
            if (["Type here..."].includes(text)) {
                content.textContent = "";
                content.classList.remove("text-gray-400", "italic");
                delete content.dataset.placeholder;
            }
            return;
        }

        // 🧩 For headings: keep placeholder visible until user types something
        if (isHeading && (text === "" || text === placeholderText)) {
            content.textContent = placeholderText;
            content.classList.add("text-gray-400", "italic");
            content.dataset.placeholder = placeholderText;
        }
    });


    document.addEventListener("focusout", (e) => {
        if (suppressPlaceholder) return;

        const content = e.target;
        if (!content.classList.contains("content")) return;

        const isHeading =
            content.classList.contains("text-3xl") ||
            content.classList.contains("text-2xl") ||
            content.classList.contains("text-xl");

        const text = content.textContent.trim();

        // 🧩 If empty heading, always keep its placeholder visible
        if (isHeading && text === "") {
            updatePlaceholder(content);
            return;
        }

        // 🧩 For normal text lines: handle normally
        if (text === "") {
            updatePlaceholder(content);
        } else {
            clearPlaceholder(content);
        }
    });


}

function updatePlaceholder(content) {
    const text = content.textContent.trim();
    // Always reapply placeholder text for empty headings (even if not a new line)
    // Clear any existing placeholder classes
    content.classList.remove('text-gray-400', 'italic');

    let placeholderText = "";
    if (content.classList.contains("text-3xl")) {
        placeholderText = "Heading 1";
    } else if (content.classList.contains("text-2xl")) {
        placeholderText = "Heading 2";
    } else if (content.classList.contains("text-xl")) {
        placeholderText = "Heading 3";
    } else {
        placeholderText = "Type here...";
    }

    // Always update if the content is empty, for headings show heading placeholder
    if (text === "") {
        content.textContent = placeholderText;
        content.dataset.placeholder = placeholderText;
        content.classList.add('text-gray-400', 'italic');
    } else if (["Type here...", "Heading 1", "Heading 2", "Heading 3"].includes(text)) {
        // If already a placeholder, ensure correct placeholder for heading type
        if (text !== placeholderText) {
            content.textContent = placeholderText;
        }
        content.dataset.placeholder = placeholderText;
        content.classList.add('text-gray-400', 'italic');
    }
}

function clearAllPlaceholders() {
    const lines = document.querySelectorAll(".line");
    lines.forEach(line => {
        const content = line.querySelector(".content");
        clearPlaceholder(content);
    });
}

function enableClickToAddNewLine() {
    const container = document.querySelector(".content-container");
    if (!container) return;

    container.addEventListener("click", (e) => {
        const clickedLine = e.target.closest(".line");
        if (!clickedLine) return;

        const clickedContent = clickedLine.querySelector(".content");
        if (!clickedContent) return;

        const isClickedEmpty =
            clickedContent.textContent.trim() === "" ||
            ["Type here...", "Heading 1", "Heading 2", "Heading 3"].includes(clickedContent.textContent.trim());

        if (isClickedEmpty) {
            // Remove placeholder from all other empty lines
            document.querySelectorAll(".line .content").forEach((content) => {
                if (content !== clickedContent) {
                    const isEmpty =
                        content.textContent.trim() === "" ||
                        ["Type here...", "Heading 1", "Heading 2", "Heading 3"].includes(content.textContent.trim());
                    if (isEmpty) {
                        clearPlaceholder(content);
                    }
                }
            });

            // Ensure clicked line has the correct placeholder
            updatePlaceholder(clickedContent);

            // Focus the clicked content
            clickedContent.focus();
        }
    });
}


function isOnlyPlaceholder(contentEl) {
    const text = contentEl.textContent.trim();
    const placeholder = contentEl.dataset.placeholder || "";
    return text === placeholder;
}

function handleContentMenu() {
    // Single document-level delegation

    // 1️⃣ Detect "/" key to show menu
    document.addEventListener("keydown", (e) => {
        if (e.key === "/") {
            e.preventDefault();

            const line = e.target.closest(".line");
            if (!line) return;

            const menu = line.querySelector(".content-menu");
            if (menu) showContentMenu(menu);
        }
    });

    // 2️⃣ Handle clicks on menu items
    document.addEventListener("click", (e) => {
        const menuItem = e.target.closest(".content-menu div");
        if (!menuItem) return;

        e.stopPropagation(); // stop bubbling to prevent multiple insertions

        const menu = menuItem.closest(".content-menu");
        const blockType = menuItem.textContent.trim();
        const currentLine = menu.closest(".line");

        hideContentMenu(menu);

        if (blockType === "Text") {
            transformToTextBlock(currentLine);
        } else if (blockType === "Heading 1") {
            transformToHeadingBlock(currentLine, 1);
        } else if (blockType === "Heading 2") {
            transformToHeadingBlock(currentLine, 2);
        } else if (blockType === "Heading 3") {
            transformToHeadingBlock(currentLine, 3);
        }
    });

    // 3️⃣ Hide menus when clicking outside
    document.addEventListener("click", (e) => {
        document.querySelectorAll(".content-menu").forEach(menu => {
            if (!menu.contains(e.target)) hideContentMenu(menu);
        });
    });
}


function showContentMenu(menu) {
    menu.classList.remove("hidden");
}

function hideContentMenu(menu) {
    menu.classList.add("hidden");
}

function line() {
    const newLine = document.createElement("div");
    newLine.className = "line flex items-start h-auto relative gap-2 line-hover-zone";
    newLine.innerHTML = `
        <div class="icons flex gap-1 pt-1 absolute left-[-3rem] absolute">
            <img src="images/main/icons8-add-16.png" class="w-[1.2rem] h-[1.2rem] rounded-sm p-[2px] cursor-pointer hover:bg-gray-200 hidden " alt="add block icon"/>
            <div class="w-[10rem] rounded cursor-pointer absolute top-full left-0 bg-white z-[100] h-auto p-2 border border-black box-shadow-normal hidden">
                <div class="flex w-full gap-2 items-center cursor-pointer hover:bg-gray-200 rounded-l p-1 ">
                    <img src="images/main/icons8-text-16.png" class="w-[1.2rem] h-[1.2rem]">
                    <div class="block-type">Text</div>
                </div>
                <div class="flex w-full gap-2 items-center cursor-pointer hover:bg-gray-200 rounded-l p-1 ">
                    <img src="images/main/icons8-1-16.png" class="w-[1.2rem] h-[1.2rem]">
                    <div class="block-type">Heading 1</div>
                </div>
                <div class="flex w-full gap-2 items-center cursor-pointer hover:bg-gray-200 rounded-l p-1 ">
                    <img src="images/main/icons8-2-16.png" class="w-[1.2rem] h-[1.2rem]">
                    <div class="block-type">Heading 2</div>
                </div>
                <div class="flex w-full gap-2 items-center cursor-pointer hover:bg-gray-200 rounded-l p-1 ">
                    <img src="images/main/icons8-3-16.png" class="w-[1.2rem] h-[1.2rem]">
                    <div class="block-type">Heading 3</div>
                </div>
            </div>
            <img src="images/main/icons8-menu-16 (1).png" class="line-block-menu-icon w-[1.2rem] h-[1.2rem] rounded-sm p-[2px] cursor-pointer hover:bg-gray-200 hidden " alt="move block icon"/>
            <div class="line-block-menu hidden w-[10rem] rounded absolute top-full left-0 bg-white z-[100] h-auto p-2 border border-black box-shadow-normal">
                <div class="flex w-full  cursor-pointer  rounded-sm p-1 flex-col">
                    <div class="text-xs font-bold text-gray-500 rounded-sm p-1">Text</div>
                    <div class="flex items-center gap-1 hover:bg-gray-200 cursor-pointer rounded-sm p-1">
                        <img src="images/main/turn-into.png" class="w-[1.2rem] h-[1.2rem]">
                        <div>Turn into</div>
                    </div>
                    <div class="flex items-center gap-1 hover:bg-gray-200 cursor-pointer rounded-sm p-1">
                        <img src="images/main/paint-roller.png" class="w-[1.2rem] h-[1.2rem]">
                        <div>Color</div>
                    </div>
                    <hr class="w-full my-2">
                    <div class="flex items-center gap-1 hover:bg-gray-200 cursor-pointer rounded-sm p-1">
                        <img src="images/container-header/icons8-arrow-16.png" class="w-[1.2rem] h-[1.2rem]">
                        <div>Move to</div>
                    </div>
                    <div class="flex items-center gap-1 hover:bg-gray-200 cursor-pointer rounded-sm p-1">
                        <img src="images/container-header/icons8-trash-can-50.png" class="w-[1.2rem] h-[1.2rem]">
                        <div>Delete</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="content w-full outline-none" contenteditable="true"></div>
        <div class="content-menu top-full w-[10rem] outline-none flex flex-col items-center p-2 absolute bg-white z-[100] hidden border border-black box-shadow-normal rounded">
            <div class="flex w-full gap-2 items-center cursor-pointer hover:bg-gray-200 rounded-l p-1 ">
                <img src="images/main/icons8-text-16.png" class="w-[1.2rem] h-[1.2rem]">
                <div class="block-type">Text</div>
            </div>
            <div class="flex w-full gap-2 items-center cursor-pointer hover:bg-gray-200 rounded-l p-1 ">
                <img src="images/main/icons8-1-16.png" class="w-[1.2rem] h-[1.2rem]">
                <div class="block-type">Heading 1</div>
            </div>
            <div class="flex w-full gap-2 items-center cursor-pointer hover:bg-gray-200 rounded-l p-1 ">
                <img src="images/main/icons8-2-16.png" class="w-[1.2rem] h-[1.2rem]">
                <div class="block-type">Heading 2</div>
            </div>
            <div class="flex w-full gap-2 items-center cursor-pointer hover:bg-gray-200 rounded-l p-1 ">
                <img src="images/main/icons8-3-16.png" class="w-[1.2rem] h-[1.2rem]">
                <div class="block-type">Heading 3</div>
            </div>
        </div>
    `;

    return newLine;
}

function heading(size) {
    let headingTextXl = "";
    if (size === 1) {
        headingTextXl = "text-3xl"
    } else if (size === 2) {
        headingTextXl = "text-2xl"
    } else if (size === 3) {
        headingTextXl = "text-xl"
    }
    const newHeadingLine = document.createElement("div");
    newHeadingLine.className = "line line-hover-zone h-auto relative gap-2 line-hover-zone";
    newHeadingLine.innerHTML = `
        <div class="icons flex gap-1 pt-1 absolute left-[-3rem]">
            <img src="images/main/icons8-add-16.png" class="w-[1.2rem] h-[1.2rem] rounded-sm p-[2px] cursor-pointer hover:bg-gray-200 hidden " alt="add block icon"/>
            <img src="images/main/icons8-menu-16 (1).png" class="w-[1.2rem] h-[1.2rem] rounded-sm p-[2px] cursor-pointer hover:bg-gray-200 hidden " alt="move block icon"/>
        </div>
        <div class="content w-full ${headingTextXl} font-bold outline-none" contenteditable="true"></div>
        <div class="content-menu top-full w-[10rem] outline-none flex flex-col items-center p-2 absolute bg-white z-[100] hidden border border-black box-shadow-normal rounded" contenteditable="true">
            <div class="flex w-full gap-2 items-center cursor-pointer hover:bg-gray-200 rounded-sm p-1 ">
                <img src="images/main/icons8-text-16.png" class="w-[1.2rem] h-[1.2rem]">
                <div>Text</div>
            </div>
            <div class="flex w-full gap-2 items-center cursor-pointer hover:bg-gray-200 rounded-sm p-1 ">
                <img src="images/main/icons8-1-16.png" class="w-[1.2rem] h-[1.2rem]">
                <div>Heading 1</div>
            </div>
            <div class="flex w-full gap-2 items-center cursor-pointer hover:bg-gray-200 rounded-sm p-1 ">
                <img src="images/main/icons8-2-16.png" class="w-[1.2rem] h-[1.2rem]">
                <div>Heading 2</div>
            </div>
            <div class="flex w-full gap-2 items-center cursor-pointer hover:bg-gray-200 rounded-sm p-1 ">
                <img src="images/main/icons8-3-16.png" class="w-[1.2rem] h-[1.2rem]">
                <div>Heading 3</div>
            </div>
        </div>
    `;
    return newHeadingLine;
}

function addIconInsertBlockNextLine(currentLine) {
    const currentContent = currentLine.querySelector(".content");

    // prevent placeholder from reappearing during this operation
    suppressPlaceholder = true;
    setTimeout(() => suppressPlaceholder = false, 200);

    // if first-line is empty and its add icon is clicked, clear its placeholder
    if (currentLine.classList.contains("first-line")) {
        clearPlaceholder(currentContent);
        currentContent.textContent = "";
    }

    // Clear placeholder for any line
    if (currentContent) {
        clearPlaceholder(currentContent);
        currentContent.textContent = "";
    }

    // Create and insert new line
    const newLine = line();
    currentLine.parentNode.insertBefore(newLine, currentLine.nextSibling);
    const newContent = newLine.querySelector(".content");

    // Hide current line’s icons
    const currentAdd = currentLine.querySelector("[alt='add block icon']");
    const currentMove = currentLine.querySelector("[alt='move block icon']");
    if (currentAdd) currentAdd.classList.add("hidden");
    if (currentMove) currentMove.classList.add("hidden");

    // Show icons on new line
    const newAdd = newLine.querySelector("[alt='add block icon']");
    const newMove = newLine.querySelector("[alt='move block icon']");
    if (newAdd) newAdd.classList.remove("hidden");
    if (newMove) newMove.classList.remove("hidden");

    // Prevent hover re-show
    currentLine.classList.add("prevent-hover-icons");
    setTimeout(() => {
        currentLine.classList.remove("prevent-hover-icons");
    }, 150);

    // Update placeholder and open menu for new line
    updatePlaceholder(newContent);
    newLine.querySelector(".content-menu").classList.remove("hidden");

    // Focus the new line
    setTimeout(() => {
        newContent.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(newContent, 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }, 0);
}



// robust clearPlaceholder: removes placeholder text and dataset unconditionally if they match
function clearPlaceholder(contentEl) {
    if (!contentEl) return;
    const placeholder = contentEl.dataset.placeholder || "";
    if (placeholder && contentEl.textContent.trim() === placeholder) {
        contentEl.textContent = "";
        contentEl.classList.remove('text-gray-400', 'italic');
    }
    // make sure we remove the dataset even if content doesn't currently match exactly
    delete contentEl.dataset.placeholder;
}