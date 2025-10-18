document.addEventListener("DOMContentLoaded", () => {
    pageToggles();
    ContentEditor();
    LineHoverBehavior();
    PlaceholderHandlers();
    enableClickToAddNewLine();
    handleContentMenu(); // safe now, works for all current + future lines
    sidebarIconMenuToggle();
    pageHeaderClickPagesToggle();
});


document.addEventListener("click", (e) => {
    const targetElement = e.target;

    // If clicked the button
    if (targetElement.classList.contains("page-more-icon")) {
        const menu = targetElement.nextElementSibling; // assume menu is the sibling div
        togglePageMoreIconMenu(menu);
    } 
    // If clicked outside the menu
    else if (!targetElement.closest(".page-more-icon-menu") &&
             !targetElement.closest(".page-more-icon")) {
        document.querySelectorAll(".page-more-icon-menu").forEach(menu => {
            menu.classList.add("hidden");
        });
    }
});

document.addEventListener("click", (e) => {
    const button = e.target.closest(".page-container-more-icon");
    const menu = e.target.closest(".page-container-more-icon-menu");

    // If clicked on a button
    if (button) {
        const menuEl = button.nextElementSibling;

        // Close all menus first
        document.querySelectorAll(".page-container-more-icon-menu").forEach(m => {
            if (m !== menuEl) m.classList.add("hidden");
        });

        // Toggle this one
        menuEl.classList.toggle("hidden");
        return; // stop here so it doesn’t close immediately
    }

    // If clicked inside a menu, do nothing (let menu item handlers work)
    if (menu) {
        return;
    }

    // Otherwise (clicked outside) → close all
    document.querySelectorAll(".page-container-more-icon-menu").forEach(m => {
        m.classList.add("hidden");
    });
});

document.addEventListener("click", (e) => {
    const targetElement = e.target;
    if (targetElement.classList.contains("page-icon")) {
        const parentElement = targetElement.parentElement;
        parentElement.className = "page-container flex items-center h-auto relative gap-2 page-hover-zone";
        targetElement.className = "page-icon folder-icon cursor-pointer rounded p-[2px] py-[2px] text-[5rem]";
    }
})

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

document.addEventListener("click", (e) => {
    const targetElement = e.target;
    if (targetElement.classList.contains("line-block-menu-icon")) {
        blockMenuToggle();
    } 

    // If not clicked on the menu
    else if (!targetElement.closest(".line-block-menu")) {
        document.querySelectorAll(".line-block-menu").forEach(menu => {
            menu.classList.add("hidden");
        });
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

function pageToggles() {
    const pageContainers = document.querySelectorAll(".page-container");
    const expandedState = new WeakMap();

    pageContainers.forEach(container => {
        const arrowImg = container.querySelector("img[alt='page icon']");
        const containerPadding = parseFloat(getComputedStyle(container).paddingLeft);

        if (arrowImg) {
            arrowImg.style.cursor = "pointer";
            arrowImg.addEventListener("click", () => togglePage(container, arrowImg, containerPadding, expandedState));

            container.addEventListener("mouseenter", () => showPageIcons(container, expandedState));
            container.addEventListener("mouseleave", () => hidePageIcons(container));
        } else {
            container.addEventListener("mouseenter", () => showPageIcons(container, expandedState));
            container.addEventListener("mouseleave", () => hidePageIcons(container));
        }
    });
}

function togglePage(container, arrowImg, containerPadding, expandedState) {
    const isExpanded = expandedState.get(container);
    const shouldExpand = !isExpanded;
    expandedState.set(container, shouldExpand);

    arrowImg.classList.toggle("rotate-90", shouldExpand);

    let sibling = container.nextElementSibling;
    while (sibling) {
        const siblingPadding = parseFloat(getComputedStyle(sibling).paddingLeft);
        if (siblingPadding <= containerPadding) break;

        if (shouldExpand && Math.abs(siblingPadding - (containerPadding + 16)) < 2) {
            sibling.classList.remove("hidden");
        } else if (!shouldExpand) {
            sibling.classList.add("hidden");

            const nestedArrow = sibling.querySelector("img[alt='page icon']");
            if (nestedArrow) {
                nestedArrow.classList.remove("rotate-90");
                expandedState.set(sibling, false);
            }
        }
        sibling = sibling.nextElementSibling;
    }
}

function showPageIcons(container, expandedState) {
    container.querySelectorAll("img[alt='more icon'], img[alt='add icon']")
        .forEach(icon => icon.parentElement.classList.remove("hidden"));

    const arrowImg = container.querySelector("img[alt='page icon']");
    if (arrowImg) {
        arrowImg.src = "images/menu/icons8-forward-16 (1).png";
        if (expandedState.get(container)) arrowImg.classList.add("rotate-90");
    }
}

function hidePageIcons(container) {
    container.querySelectorAll("img[alt='more icon'], img[alt='add icon']")
        .forEach(icon => icon.parentElement.classList.add("hidden"));

    const arrowImg = container.querySelector("img[alt='page icon']");
    if (arrowImg) {
        arrowImg.src = "images/menu/icons8-page-16.png";
        arrowImg.classList.remove("rotate-90");
    }
}

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
                // Remove empty heading
                const prevLine = line.previousElementSibling;
                line.remove();

                if (prevLine) {
                    const prevContent = prevLine.querySelector(".content");
                    updatePlaceholder(prevContent);
                }

                return;
            }

            // Save the current content
            const currentText = content.textContent.trim();

            // Create new line with placeholder
            const newLine = insertNewLineAfter(line);
            const newContent = newLine.querySelector(".content");

            // Update the current line's content (remove any placeholder)
            if (currentText === "" ||
                currentText === "Type here..." ||
                currentText.startsWith("Heading")) {
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
                          content.textContent.startsWith("Heading");
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

    // Copy heading class
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

function insertNewHeadingAfter(currentLine, headingSize) {
    const newHeadingLine = heading(headingSize);
    const currentContent = currentLine.querySelector(".content");
    
    // Remove placeholder from current line if it's empty
    if (["Type here...", "Heading 1", "Heading 2", "Heading 3"].includes(currentContent.textContent.trim())) {
        currentContent.textContent = "";
    }

    // Copy heading class
    const newContent = newHeadingLine.querySelector(".content");
    if (headingSize === 1) {
        newContent.classList.add("text-3xl");
    } else if (headingSize === 2) {
        newContent.classList.add("text-2xl");
    } else if (headingSize === 3) {
        newContent.classList.add("text-xl");
    }

    // Hide all other icons
    document.querySelectorAll(".line .icons img").forEach(img => img.classList.add("hidden"));



    if (currentLine.classList.contains("first-line")) {
    // Instead of inserting a new element, just convert this one
    const content = currentLine.querySelector(".content");

    // Remove existing heading classes
    content.classList.remove("text-3xl", "text-2xl", "text-xl", "font-bold");

    // Apply the new heading size
    if (headingSize === 1) {
        content.classList.add("text-3xl", "font-bold");
    } else if (headingSize === 2) {
        content.classList.add("text-2xl", "font-bold");
    } else if (headingSize === 3) {
        content.classList.add("text-xl", "font-bold");
    }

    // Update placeholder text
    updatePlaceholder(content);

    // Focus stays in same line
    content.focus();
    } else {
        // Insert and show icons on new line
        currentLine.insertAdjacentElement("afterend", newHeadingLine);
        const icons = newHeadingLine.querySelectorAll(".icons img");
        icons.forEach(icon => icon.classList.remove("hidden"));
    }

    // Focus new line
    newHeadingLine.querySelector(".content").focus();
    // Always update placeholder for new line (for headings, show correct heading placeholder)
    updatePlaceholder(newContent);
    return newHeadingLine;
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
        if (line) {
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

        // Remove placeholder styles only if content is not empty
        if ((content.classList.contains('text-gray-400') || content.classList.contains('italic')) && content.textContent.trim() !== "") {
            content.classList.remove('text-gray-400', 'italic');
            delete content.dataset.placeholder;
        }
    });

    // Handle focus in - when user clicks into a field
    document.addEventListener("focusin", (e) => {
        const content = e.target;
        if (!content.classList.contains("content")) return;

        const text = content.textContent.trim();
        if (["Type here...", "Heading 1", "Heading 2", "Heading 3"].includes(text)) {
            // Only remove placeholder if not empty (should not happen, but for safety)
            if (text !== "") {
                content.textContent = "";
            }
            // Do not remove placeholder styling if it's still empty
            if (content.textContent.trim() !== "") {
                content.classList.remove('text-gray-400', 'italic');
                delete content.dataset.placeholder;
            }
        }
    });

    // Handle focus out - when user clicks away from a field
    document.addEventListener("focusout", (e) => {
        const content = e.target;
        if (!content.classList.contains("content")) return;

        if (content.textContent.trim() === "") {
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

function clearPlaceholder(content) {
    const placeholder = content.dataset.placeholder || "";
    if (content.textContent.trim() === placeholder) {
        content.textContent = "";
        content.classList.remove('text-gray-400', 'italic');
    } 
    delete content.dataset.placeholder;
}

function enableClickToAddNewLine() {
    const container = document.querySelector(".content-container");
    if (!container) return;

    container.addEventListener("click", (e) => {
        // If clicking on a line, handle placeholder but don't add new line
        const clickedLine = e.target.closest(".line");
        if (clickedLine) {
            const content = clickedLine.querySelector(".content");
            if (content && content.textContent.trim() === "") {
                updatePlaceholder(content);
                content.focus();
            }
            return;
        }
    });
}

function isOnlyPlaceholder(contentEl) {
    const text = contentEl.textContent.trim();
    const placeholder = contentEl.dataset.placeholder || "";
    return text === placeholder;
}

function handleContentMenu() {
    const container = document.querySelector(".content-container");
    if (!container) return;

    // Listen for "/" key on any line (event delegation)
    container.addEventListener("keydown", (e) => {
        if (e.key === "/") {
            e.preventDefault(); // optional: stop "/" from being typed
            const line = e.target.closest(".line");
            if (!line) return;

            const menu = line.querySelector(".content-menu");
            if (menu) {
                showContentMenu(menu);
            }
        }
    });

    // Listen for clicks on content menu items (event delegation)
    container.addEventListener("click", (e) => {
        const menuItem = e.target.closest(".content-menu div");
        if (!menuItem) return;

        const menu = menuItem.closest(".content-menu");
        hideContentMenu(menu);

        const blockType = menuItem.textContent.trim();
        const currentLine = menu.closest(".line");

        const firstLine = document.querySelector(".first-line");
        

        if (blockType === "Text") {
            insertNewLineAfter(currentLine);
        } else if (blockType === "Heading 1") {
            insertNewHeadingAfter(currentLine, 1);
        } else if (blockType === "Heading 2") {
            insertNewHeadingAfter(currentLine, 2);
        } else if (blockType === "Heading 3") {
            insertNewHeadingAfter(currentLine, 3);
        }
    });

    document.addEventListener("click", (e) => {
        const menus = document.querySelectorAll(".content-menu");
        menus.forEach(menu => {
            if (!menu.contains(e.target)) {
                hideContentMenu(menu);
            }
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
    newLine.className = "line flex items-center h-auto relative gap-2 line-hover-zone";
    newLine.innerHTML = `
        <div class="icons flex gap-1 pt-1 absolute left-[-3rem]">
            <img src="images/main/icons8-add-16.png" class="w-[1.2rem] h-[1.2rem] rounded-sm p-[2px] cursor-pointer hover:bg-gray-200 hidden " alt="add block icon"/>
            <img src="images/main/icons8-menu-16 (1).png" class="w-[1.2rem] h-[1.2rem] rounded-sm p-[2px] cursor-pointer hover:bg-gray-200 hidden " alt="move block icon"/>
        </div>
        <div class="content w-full outline-none" contenteditable="true"></div>
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

function togglePageMoreIconMenu(menu) {
    menu.classList.toggle("hidden");
}

function sidebarIconMenuToggle() {
    const sidebarIcon = document.querySelector("img[alt='sidebar icon']");
    const notesMenu = document.querySelector("#notes-menu");
    
    sidebarIcon.addEventListener("click", () => {
        if (sidebarIcon.classList.contains("collapse-icon")) {
            sidebarIcon.classList.remove("collapse-icon");
            sidebarIcon.classList.add("expand-icon");
            sidebarIcon.src = "images/container-header/expand.png";

            notesMenu.classList.add("hidden");

        } else {
            sidebarIcon.classList.remove("expand-icon");
            sidebarIcon.classList.add("collapse-icon");
            sidebarIcon.src = "images/container-header/collapse.png";

            notesMenu.classList.remove("hidden");
        }
    })
}


function pageHeaderClickPagesToggle() {
    const pageHeader = document.querySelector(".page-header");
    const pages = document.querySelector(".pages-container");
    
    pageHeader.addEventListener("click", () => {
        pages.classList.toggle("hidden");
    })
}

function blockMenuToggle() {
    const blockMenu = document.querySelector(".line-block-menu");
    blockMenu.classList.toggle("hidden");
}

function addIconInsertBlockNextLine(currentLine) {
    const currentContent = currentLine.querySelector(".content");

    // Step 1: Always clear placeholder styling/text for the current line (if any)
    // Use clearPlaceholder to remove placeholder if it matches; but also ensure the element has no leftover placeholder dataset
    if (currentContent) {
        // remove placeholder text if it still matches the placeholder
        clearPlaceholder(currentContent);
        // ensure the content is empty for a clean split
        currentContent.textContent = "";
    }

    // Step 2: Create new line and insert it
    const newLine = line(); // uses your existing factory
    // insert after the current line
    currentLine.parentNode.insertBefore(newLine, currentLine.nextSibling);

    const newContent = newLine.querySelector(".content");

    // Step 3: Copy heading style from current line if present (optional)
    if (currentContent) {
        if (currentContent.classList.contains("text-3xl")) newContent.classList.add("text-3xl");
        else if (currentContent.classList.contains("text-2xl")) newContent.classList.add("text-2xl");
        else if (currentContent.classList.contains("text-xl")) newContent.classList.add("text-xl");
    }

    // Hide other icons, show this new line's icons
    document.querySelectorAll(".line .icons img").forEach(img => img.classList.add("hidden"));
    newLine.querySelectorAll(".icons img").forEach(icon => icon.classList.remove("hidden"));

    // Step 4: Apply placeholder to new content (so the visuals are correct)
    updatePlaceholder(newContent);

    // Step 5: Focus and place caret at the start of the new line.
    // Use setTimeout to ensure this runs *after* other click/focus handlers that might exist globally.
    setTimeout(() => {
        newContent.focus();

        // Move caret to start (collapse to start)
        const range = document.createRange();
        const sel = window.getSelection();
        // If the placeholder is present and you want the caret before it, collapsing at 0 is fine.
        // If you'd rather remove placeholder instantly when new line is focused, uncomment the next two lines:
        // if (newContent.dataset.placeholder) { clearPlaceholder(newContent); }

        range.setStart(newContent, 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }, 0);

    return newLine;
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