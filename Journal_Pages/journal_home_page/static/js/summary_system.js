// ================= ELEMENTS =================

const summarySettingButton =
    document.querySelector(".summary-setting-btn");

const summaryOverlay =
    document.querySelector("#summary-popup-overlay");

const summaryPopup =
    document.querySelector("#summary-setting-popup");

const summaryWidget =
    document.querySelector("#summary-widget");

const frequencyCards =
    document.querySelectorAll("[data-frequency]");

const frequencyText =
    document.querySelector("#summary-frequency-text");

const hideSummaryButton =
    document.querySelector("#hide-summary-btn");


// ================= OPEN POPUP =================

summarySettingButton.addEventListener("click", function() {

    summaryOverlay.style.display = "block";

});


// ================= CLOSE POPUP =================

summaryOverlay.addEventListener("click", function(event) {

    if (event.target === summaryOverlay) {

        summaryOverlay.style.display = "none";

    }

});


// ================= FREQUENCY =================

frequencyCards.forEach(function(card) {

    card.addEventListener("click", function() {

        frequencyCards.forEach(function(item) {

            item.classList.remove("selected");

        });

        card.classList.add("selected");

        const frequency =
            card.dataset.frequency;

        if (frequency === "week") {

            frequencyText.innerText =
                "Weekly Mood Summary";

        }

        if (frequency === "month") {

            frequencyText.innerText =
                "Monthly Mood Summary";

        }

        if (frequency === "year") {

            frequencyText.innerText =
                "Yearly Mood Summary";

        }

    });

});


// ================= HIDE SUMMARY =================

hideSummaryButton.addEventListener("click", function() {

    summaryWidget.style.display = "none";

    summaryOverlay.style.display = "none";

});