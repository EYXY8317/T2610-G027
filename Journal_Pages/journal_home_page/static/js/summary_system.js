// ================= CHART =================

const chartCanvas =
    document.querySelector("#mood-chart");

const emojiChart =
    document.querySelector("#emoji-chart");

const happyEmoji =
    document.querySelector(".happy-emoji");

const sadEmoji =
    document.querySelector(".sad-emoji");

const angryEmoji =
    document.querySelector(".angry-emoji");


// ================= MOOD DATA =================

const happyCount =
    Number(emojiChart.dataset.happy);

const sadCount =
    Number(emojiChart.dataset.sad);

const angryCount =
    Number(emojiChart.dataset.angry);

const totalMood =
    happyCount + sadCount + angryCount;


// ================= EMOJI SIZE =================

// No mood data
// 没有 mood data

if (totalMood === 0) {

    happyEmoji.style.fontSize = "70px";

    sadEmoji.style.fontSize = "70px";

    angryEmoji.style.fontSize = "70px";

}

// Have mood data
// 有 mood data

else {

    happyEmoji.style.fontSize =
        (happyCount / totalMood * 120) + "px";

    sadEmoji.style.fontSize =
        (sadCount / totalMood * 120) + "px";

    angryEmoji.style.fontSize =
        (angryCount / totalMood * 120) + "px";

}


// ================= TOOLTIP =================

if (totalMood > 0) {

    happyEmoji.title =
        "Happy: " +
        Math.round(happyCount / totalMood * 100)
        + "%";

    sadEmoji.title =
        "Sad: " +
        Math.round(sadCount / totalMood * 100)
        + "%";

    angryEmoji.title =
        "Angry: " +
        Math.round(angryCount / totalMood * 100)
        + "%";

}

else {

    happyEmoji.title = "No mood data";

    sadEmoji.title = "No mood data";

    angryEmoji.title = "No mood data";

}


// ================= CHART =================

let moodChart =
    new Chart(chartCanvas, {

        type: "line",

        data: {

            labels: [
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
                "Sun"
            ],

            datasets: [{

                label: "Mood Level",

                data: [4, 6, 5, 7, 8, 6, 9],

                borderWidth: 2

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false

        }

    });


// ================= ELEMENTS =================

const summarySettingButton =
    document.querySelector(".summary-setting-btn");

const summaryOverlay =
    document.querySelector("#summary-popup-overlay");

const summaryWidget =
    document.querySelector("#summary-widget");

const frequencyCards =
    document.querySelectorAll("[data-frequency]");

const frequencyText =
    document.querySelector("#summary-frequency-text");

const hideSummaryButton =
    document.querySelector("#hide-summary-btn");

const chartCards =
    document.querySelectorAll("[data-chart]");

const chartTypeText =
    document.querySelector("#chart-type-text");


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


// ================= CHART TYPE =================

chartCards.forEach(function(card) {

    card.addEventListener("click", function() {

        chartCards.forEach(function(item) {

            item.classList.remove("selected");

        });

        card.classList.add("selected");

        const chartType =
            card.dataset.chart;

        // ================= EMOJI MODE =================

        if (chartType === "emoji") {

            chartCanvas.style.display = "none";

            emojiChart.style.display = "flex";

            chartTypeText.innerText =
                "😊 Emoji Mood Chart";

            return;

        }

        // ================= NORMAL CHART =================

        emojiChart.style.display = "none";

        chartCanvas.style.display = "block";

        // ================= CHANGE TEXT =================

        if (chartType === "line") {

            chartTypeText.innerText =
                "📈 Line Chart";

        }

        if (chartType === "bar") {

            chartTypeText.innerText =
                "📊 Bar Chart";

        }

        if (chartType === "pie") {

            chartTypeText.innerText =
                "🥧 Pie Chart";

        }

        if (chartType === "doughnut") {

            chartTypeText.innerText =
                "🍩 Doughnut Chart";

        }

        if (chartType === "radar") {

            chartTypeText.innerText =
                "🕸 Radar Chart";

        }

        // ================= DESTROY OLD CHART =================

        moodChart.destroy();

        // ================= CREATE NEW CHART =================

        moodChart =
            new Chart(chartCanvas, {

                type: chartType,

                data: {

                    labels: [
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                        "Sun"
                    ],

                    datasets: [{

                        label: "Mood Level",

                        data: [4, 6, 5, 7, 8, 6, 9],

                        borderWidth: 2

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false

                }

            });

    });

});