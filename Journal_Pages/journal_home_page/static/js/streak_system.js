const settingButton = document.querySelector(".setting-btn");

const popup = document.querySelector("#popup-overlay");

const modeCards = document.querySelectorAll(".mode-card");

const streakWidget = document.querySelector("#streak-widget");

const streakText = document.querySelector("#streak-text");

const notificationCard = document.querySelector(".notification-card");

console.log("JS WORKING");

// ================= OPEN POPUP =================

settingButton.addEventListener("click", function () {

    popup.style.display = "block";

});


// ================= MODE SELECTION =================

modeCards.forEach(function(card) {

    card.addEventListener("click", function() {

        // Remove selected from all cards

        modeCards.forEach(function(item) {

            item.classList.remove("selected");

        });

        // Add selected to clicked card

        card.classList.add("selected");

        // Get selected mode

        const mode = card.dataset.mode;

        // ================= HIDE MODE =================

        if (mode === "hide") {

            streakWidget.style.display = "none";

        }

        // ================= SHOW WIDGET =================

        else {

            streakWidget.style.display = "block";

        }

        // ================= DAILY MODE =================

        if (mode === "daily") {

            const currentStreak = streakText.dataset.current;

            streakText.innerText =
                currentStreak + " Day Streak";

        }

        // ================= HIGHEST MODE =================

        if (mode === "highest") {

            const highestStreak = streakText.dataset.highest;

            console.log(highestStreak);

            streakText.innerText =
                "Highest Streak: " +
                highestStreak +
                " Days";

        }

    });

});


// ================= NOTIFICATION =================

notificationCard.addEventListener("click", function() {

    notificationCard.classList.toggle("selected");

});

popup.addEventListener("click", function(event) {
    // If click outside popup
    // 如果点击 popup 外面

    if (event.target === popup) {

        popup.style.display = "none";

    }

});

// ================= DRAG POPUP =================

let isDragging = false;

let offsetX, offsetY;

const popupBox =
    document.querySelector("#streak-setting-popup");

popupBox.addEventListener("mousedown", function(event) {

    isDragging = true;

    offsetX =
        event.clientX - popupBox.offsetLeft;

    offsetY =
        event.clientY - popupBox.offsetTop;

});

document.addEventListener("mousemove", function(event) {

    if (isDragging) {

        popupBox.style.left =
            event.clientX - offsetX + "px";

        popupBox.style.top =
            event.clientY - offsetY + "px";

        popupBox.style.transform = "none";

    }

});

document.addEventListener("mouseup", function() {

    isDragging = false;

});