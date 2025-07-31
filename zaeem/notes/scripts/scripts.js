document.addEventListener("DOMContentLoaded", () => {
    PageToggles();
    ContentEditor();
    LineHoverBehavior();
    PlaceholderHandlers();
    enableClickToAddNewLine();
});

function PageToggles() {
    const pageContainers = document.querySelectorAll(".page-container");
    const expandedState = new WeakMap();

    pageContainers.forEach(container => {
        const arrowImg = container.querySelector("img[alt='page icon']");
        const containerPadding = parseFloat(getComputedStyle(container).paddingLeft);

        if (!arrowImg) return;

        arrowImg.style.cursor = "pointer";
        arrowImg.addEventListener("click", () => togglePage(container, arrowImg, containerPadding, expandedState));

        container.addEventListener("mouseenter", () => showPageIcons(container, expandedState));
        container.addEventListener("mouseleave", () => hidePageIcons(container));
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
    const newLine = document.createElement("div");
    newLine.className = "line flex items-center h-auto relative gap-2 line-hover-zone";
    newLine.innerHTML = `
        <div class="icons flex gap-1 pt-1 absolute left-[-3rem]">
            <img src="images/main/icons8-add-16.png" class="w-[1.2rem] h-[1.2rem] rounded-sm p-[2px] cursor-pointer hover:bg-gray-200 hidden " alt="add block icon"/>
            <img src="images/main/icons8-menu-16 (1).png" class="w-[1.2rem] h-[1.2rem] rounded-sm p-[2px] cursor-pointer hover:bg-gray-200 hidden " alt="move block icon"/>
        </div>
        <div class="content w-full outline-none" contenteditable="true"></div>
        <div class="content-menu w-[10rem] outline-none flex flex-col items-center p-2 absolute bg-white z-[100] hidden border border-black box-shadow-normal rounded" contenteditable="true">
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

    const currentContent = currentLine.querySelector(".content");

    // Remove placeholder from current line if it's empty
    if (["Type here...", "Heading 1", "Heading 2", "Heading 3"].includes(currentContent.textContent.trim())) {
        currentContent.textContent = "";
    }

    // Copy heading class
    const newContent = newLine.querySelector(".content");
    if (currentContent.classList.contains("text-3xl")) newContent.classList.add("text-3xl");
    else if (currentContent.classList.contains("text-2xl")) newContent.classList.add("text-2xl");
    else if (currentContent.classList.contains("text-xl")) newContent.classList.add("text-xl");

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



function deleteCurrentLine(currentLine) {
    const prevLine = currentLine.previousElementSibling;
    currentLine.remove();

    // Hide all icons globally
    document.querySelectorAll(".line .icons img").forEach(img => img.classList.add("hidden"));

    if (!prevLine) return;

    const prevContent = prevLine.querySelector(".content");
    const isEmpty = prevContent?.textContent.trim() === "" || isOnlyPlaceholder(prevContent);

    if (isEmpty) {
        // Defer updating placeholder to ensure deletion is reflected
        setTimeout(() => {
            updatePlaceholder(prevContent);

            // Show only this line’s icons
            prevLine.querySelectorAll(".icons img").forEach(icon => icon.classList.remove("hidden"));

            // Focus and move cursor to beginning
            prevContent.focus();
            const range = document.createRange();
            const sel = window.getSelection();
            range.setStart(prevContent, 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }, 0);
    }
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
