import { editMode } from "./editMode.js";
import { saveLayout } from "./saveLayout.js";

const cards = document.querySelectorAll(".card");

const paper = document.querySelector("#paper");


let activeCard = null;

let offsetX = 0;

let offsetY = 0;

let startX = 0;

let startY = 0;

/* ================= DRAG START ================= */

cards.forEach(card => {

    card.addEventListener("mousedown", (e) => {

        if (!editMode) return;

        activeCard = card;

        startX = card.offsetLeft;

        startY = card.offsetTop;

        offsetX = e.clientX - card.offsetLeft;

        offsetY = e.clientY - card.offsetTop;

    });

});

/* ================= DRAG MOVE ================= */

document.addEventListener("mousemove", (e) => {

    if (!activeCard) return;

    let newX = e.clientX - offsetX;

    let newY = e.clientY - offsetY;

    /* ================= BOUNDARY ================= */

    const maxX = paper.clientWidth - activeCard.offsetWidth;

    const maxY = paper.clientHeight - activeCard.offsetHeight;

    if (newX < 0) {

        newX = 0;
    }

    if (newY < 0) {

        newY = 0;
    }

    if (newX > maxX) {

        newX = maxX;
    }

    if (newY > maxY) {

        newY = maxY;
    }

    /* ================= SNAP ================= */

    clearGuides();

    const SNAP_DISTANCE = 40;

    cards.forEach(card => {

        if (card === activeCard) return;

        /* ACTIVE */

        const activeLeft = newX;

        const activeRight = newX + activeCard.offsetWidth;

        const activeCenterX = newX + activeCard.offsetWidth / 2;

        const activeTop = newY;

        const activeBottom = newY + activeCard.offsetHeight;

        const activeCenterY = newY + activeCard.offsetHeight / 2;

        /* TARGET */

        const targetLeft = card.offsetLeft;

        const targetRight = card.offsetLeft + card.offsetWidth;

        const targetCenterX = card.offsetLeft + card.offsetWidth / 2;

        const targetTop = card.offsetTop;

        const targetBottom = card.offsetTop + card.offsetHeight;

        const targetCenterY = card.offsetTop + card.offsetHeight / 2;

        /* LEFT */

        if (Math.abs(activeLeft - targetLeft) < SNAP_DISTANCE) {

            newX = targetLeft;

            createGuideLine(
                targetLeft,
                0,
                2,
                paper.clientHeight
            );
        }

        /* RIGHT */

        if (Math.abs(activeRight - targetRight) < SNAP_DISTANCE) {

            newX = targetRight - activeCard.offsetWidth;

            createGuideLine(
                targetRight,
                0,
                2,
                paper.clientHeight
            );
        }

        /* CENTER X */

        if (Math.abs(activeCenterX - targetCenterX) < SNAP_DISTANCE) {

            newX = targetCenterX - activeCard.offsetWidth / 2;

            createGuideLine(
                targetCenterX,
                0,
                2,
                paper.clientHeight
            );
        }

        /* ================= GROUP CENTER ================= */

        const otherCards = [...cards].filter(
            card => card !== activeCard
        );

        /* must have 2 cards */

        if (otherCards.length >= 2) {

            const leftCard = otherCards[0];

            const rightCard = otherCards[1];

            const groupLeft =
                leftCard.offsetLeft;

            const groupRight =
                rightCard.offsetLeft +
                rightCard.offsetWidth;

            const groupCenter =
                (groupLeft + groupRight) / 2;

            const activeCenter =
                newX + activeCard.offsetWidth / 2;

            if (
                Math.abs(
                    activeCenter - groupCenter
                ) < SNAP_DISTANCE
            ) {

                newX =
                    groupCenter -
                    activeCard.offsetWidth / 2;

                createGuideLine(
                    groupCenter,
                    0,
                    2,
                    paper.clientHeight
                );
            }

        }

        /* TOP */

        if (Math.abs(activeTop - targetTop) < SNAP_DISTANCE) {

            newY = targetTop;

            createGuideLine(
                0,
                targetTop,
                paper.clientWidth,
                2
            );
        }

        /* BOTTOM */

        if (Math.abs(activeBottom - targetBottom) < SNAP_DISTANCE) {

            newY = targetBottom - activeCard.offsetHeight;

            createGuideLine(
                0,
                targetBottom,
                paper.clientWidth,
                2
            );
        }

        /* CENTER Y */

        if (Math.abs(activeCenterY - targetCenterY) < SNAP_DISTANCE) {

            newY = targetCenterY - activeCard.offsetHeight / 2;

            createGuideLine(
                0,
                targetCenterY,
                paper.clientWidth,
                2
            );
        }

    });

    /* APPLY */

    activeCard.style.left = newX + "px";

    activeCard.style.top = newY + "px";

});

/* ================= DRAG END ================= */

document.addEventListener("mouseup", () => {

    if (!activeCard) return;

    let collision = false;

    cards.forEach(card => {

        if (card === activeCard) return;

        if (isColliding(activeCard, card)) {

            collision = true;
        }

    });

    if (collision) {

        activeCard.style.left = startX + "px";

        activeCard.style.top = startY + "px";
    }

    clearGuides();

    saveLayout();
    
    activeCard = null;

});

/* ================= GUIDE SYSTEM ================= */

function clearGuides() {

    document.querySelectorAll(".guide-line").forEach(line => {

        line.remove();

    });

}

function createGuideLine(x, y, width, height) {

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