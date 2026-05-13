const settingButton =
    document.querySelector(".setting-btn");

const popup =
    document.querySelector("#popup-overlay");

const modeCards =
    document.querySelectorAll(
        "#streak-setting-popup .mode-card"
    );

const streakWidget =
    document.querySelector("#streak-widget");

const streakText =
    document.querySelector("#streak-text");

const notificationCard =
    document.querySelector(".notification-card");


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

            const currentStreak =
                streakText.dataset.current;

            streakText.innerText =
                currentStreak + " Day Streak";

        }

        // ================= HIGHEST MODE =================

        if (mode === "highest") {

            const highestStreak =
                streakText.dataset.highest;

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


// ================= CLOSE POPUP =================

popup.addEventListener("click", function(event) {

    if (event.target === popup) {

        popup.style.display = "none";

    }

});