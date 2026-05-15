import { editMode } from "./editMode.js";

const handles = document.querySelectorAll(".resize-handle");

const cards = document.querySelectorAll(".card");

const paper = document.querySelector("#paper");

let activeCard = null;

let startWidth = 0;

let startHeight = 0;

let startX = 0;

let startY = 0;

/* ================= RESIZE START ================= */

handles.forEach(handle => {

    handle.addEventListener("mousedown", (e) => {

        if (!editMode) return;

        e.stopPropagation();

        activeCard = handle.parentElement;

        startWidth = activeCard.offsetWidth;

        startHeight = activeCard.offsetHeight;

        startX = e.clientX;

        startY = e.clientY;

    });

});

/* ================= RESIZE MOVE ================= */

document.addEventListener("mousemove", (e) => {

    if (!activeCard) return;

    let width = startWidth + (e.clientX - startX);

    let height = startHeight + (e.clientY - startY);

    /* ================= BOUNDARY ================= */

const maxWidth =
    paper.clientWidth - activeCard.offsetLeft;

const maxHeight =
    paper.clientHeight - activeCard.offsetTop;

/* right */

if (width > maxWidth) {

    width = maxWidth;
}

/* bottom */

if (height > maxHeight) {

    height = maxHeight;
}

    clearResizeGuides();

    /* ================= SNAP ================= */

    const SNAP_DISTANCE = 20;

    const activeRight = activeCard.offsetLeft + width;

    const activeBottom = activeCard.offsetTop + height;

    cards.forEach(card => {

        if (card === activeCard) return;

        const targetRight = card.offsetLeft + card.offsetWidth;

        const targetBottom = card.offsetTop + card.offsetHeight;

        /* ================= RIGHT SNAP ================= */

        if (Math.abs(activeRight - targetRight) < SNAP_DISTANCE) {

            width = targetRight - activeCard.offsetLeft;

            createResizeGuideLine(
                targetRight,
                0,
                2,
                paper.clientHeight
            );
        }

        /* ================= BOTTOM SNAP ================= */

        if (Math.abs(activeBottom - targetBottom) < SNAP_DISTANCE) {

            height = targetBottom - activeCard.offsetTop;

            createResizeGuideLine(
                0,
                targetBottom,
                paper.clientWidth,
                2
            );
        }

    });

    /* save old size */

    const oldWidth = activeCard.offsetWidth;

    const oldHeight = activeCard.offsetHeight;

    /* try resize */

    activeCard.style.width = width + "px";

    activeCard.style.height = height + "px";

    /* ================= COLLISION ================= */

    let collision = false;

    cards.forEach(card => {

        if (card === activeCard) return;

        if (isColliding(activeCard, card)) {

            collision = true;
        }

    });

    /* if collision */

    if (collision) {

        activeCard.style.width = oldWidth + "px";

        activeCard.style.height = oldHeight + "px";
    }

});

/* ================= RESIZE END ================= */

document.addEventListener("mouseup", () => {

    clearResizeGuides();

    activeCard = null;

});

/* ================= GUIDE SYSTEM ================= */

function clearResizeGuides() {

    document.querySelectorAll(".guide-line").forEach(line => {

        line.remove();

    });

}

function createResizeGuideLine(x, y, width, height) {

    const line = document.createElement("div");

    line.classList.add("guide-line");

    line.style.left = x + "px";

    line.style.top = y + "px";

    line.style.width = width + "px";

    line.style.height = height + "px";

    /* ================= VERTICAL ================= */

    if (width <= 2) {

        line.style.backgroundImage =
            "repeating-linear-gradient(to bottom, rgba(200,200,200,0.8) 0px, rgba(200,200,200,0.8) 4px, transparent 4px, transparent 20px)";
    }

    /* ================= HORIZONTAL ================= */

    if (height <= 2) {

        line.style.backgroundImage =
            "repeating-linear-gradient(to right, rgba(200,200,200,0.8) 0px, rgba(200,200,200,0.8) 4px, transparent 4px, transparent 20px)";
    }

    paper.appendChild(line);

}

/* ================= COLLISION FUNCTION ================= */

function isColliding(cardA, cardB) {

    const rectA = cardA.getBoundingClientRect();

    const rectB = cardB.getBoundingClientRect();

    return !(
        rectA.right < rectB.left ||
        rectA.left > rectB.right ||
        rectA.bottom < rectB.top ||
        rectA.top > rectB.bottom
    );

}