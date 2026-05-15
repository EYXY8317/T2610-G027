const cards = document.querySelectorAll(".card");

const popup = document.querySelector("#card-settings-popup");

const popupHeader = document.querySelector(".popup-header");

let activeCard = null;

/* ================= OPEN POPUP ================= */

cards.forEach(card => {

    card.addEventListener("click", (e) => {

        if (!e.ctrlKey) return;

        e.preventDefault();

        activeCard = card;

        popup.style.display = "block";

        popup.style.left = e.clientX + "px";

        popup.style.top = e.clientY + "px";

    });

});

/* ================= CLOSE POPUP ================= */

document.addEventListener("click", (e) => {

    if (
        popup.contains(e.target) ||
        e.ctrlKey
    ) return;

    popup.style.display = "none";

});

/* ================= DRAG POPUP ================= */

let dragging = false;

let offsetX = 0;

let offsetY = 0;

popupHeader.addEventListener("mousedown", (e) => {

    dragging = true;

    offsetX = e.clientX - popup.offsetLeft;

    offsetY = e.clientY - popup.offsetTop;

});

document.addEventListener("mousemove", (e) => {

    if (!dragging) return;

    popup.style.left = e.clientX - offsetX + "px";

    popup.style.top = e.clientY - offsetY + "px";

});

document.addEventListener("mouseup", () => {

    dragging = false;

});

/* ================= RESIZE POPUP ================= */

const resizeHandle = document.querySelector(".popup-resize");

let resizing = false;

let startWidth = 0;

let startHeight = 0;

let startResizeX = 0;

let startResizeY = 0;

resizeHandle.addEventListener("mousedown", (e) => {

    resizing = true;

    startWidth = popup.offsetWidth;

    startHeight = popup.offsetHeight;

    startResizeX = e.clientX;

    startResizeY = e.clientY;

});

document.addEventListener("mousemove", (e) => {

    if (!resizing) return;

    const width = startWidth + (e.clientX - startResizeX);

    const height = startHeight + (e.clientY - startResizeY);

    popup.style.width = width + "px";

    popup.style.height = height + "px";

});

document.addEventListener("mouseup", () => {

    resizing = false;

});