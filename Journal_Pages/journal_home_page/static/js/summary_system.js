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

if (emojiChart) {

    const happyCount =
        Number(emojiChart.dataset.happy);

    const sadCount =
        Number(emojiChart.dataset.sad);

    const angryCount =
        Number(emojiChart.dataset.angry);

    const totalMood =
        happyCount + sadCount + angryCount;

    // ================= EMOJI SIZE =================

    if (totalMood === 0) {

        if (happyEmoji) {

            happyEmoji.style.fontSize = "70px";

        }

        if (sadEmoji) {

            sadEmoji.style.fontSize = "70px";

        }

        if (angryEmoji) {

            angryEmoji.style.fontSize = "70px";

        }

    }

    else {

        if (happyEmoji) {

            happyEmoji.style.fontSize =
                (happyCount / totalMood * 120) + "px";

        }

        if (sadEmoji) {

            sadEmoji.style.fontSize =
                (sadCount / totalMood * 120) + "px";

        }

        if (angryEmoji) {

            angryEmoji.style.fontSize =
                (angryCount / totalMood * 120) + "px";

        }

    }

    // ================= TOOLTIP =================

    if (totalMood > 0) {

        if (happyEmoji) {

            happyEmoji.title =
                "Happy: " +
                Math.round(happyCount / totalMood * 100)
                + "%";

        }

        if (sadEmoji) {

            sadEmoji.title =
                "Sad: " +
                Math.round(sadCount / totalMood * 100)
                + "%";

        }

        if (angryEmoji) {

            angryEmoji.title =
                "Angry: " +
                Math.round(angryCount / totalMood * 100)
                + "%";

        }

    }

    else {

        if (happyEmoji) {

            happyEmoji.title = "No mood data";

        }

        if (sadEmoji) {

            sadEmoji.title = "No mood data";

        }

        if (angryEmoji) {

            angryEmoji.title = "No mood data";

        }

    }

}


// ================= CHART =================

let moodChart;

if (chartCanvas) {

    moodChart =
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

}


// ================= ELEMENTS =================

const summarySettingButton =
    document.querySelector(".summary-setting-btn");

const summaryOverlay =
    document.querySelector("#summary-popup-overlay");

const summaryWidget =
    document.querySelector("#summary-widget");

const frequencyCards =
    document.querySelectorAll(
        "#summary-setting-popup [data-frequency]"
    );

const frequencyText =
    document.querySelector("#summary-frequency-text");

const hideSummaryButton =
    document.querySelector("#hide-summary-btn");

const chartCards =
    document.querySelectorAll(
        "#summary-setting-popup [data-chart]"
    );

const chartTypeText =
    document.querySelector("#chart-type-text");

const wordCards =
    document.querySelectorAll(
        "#summary-setting-popup [data-word]"
    );

const wordFrequencyCards =
    document.querySelectorAll(
        "#summary-setting-popup [data-word-frequency]"
    );

const wordSummaryText =
    document.querySelector("#word-summary-text");


// ================= OPEN POPUP =================

if (summarySettingButton) {

    summarySettingButton.addEventListener("click", function() {

        summaryOverlay.style.display = "block";

    });

}


// ================= CLOSE POPUP =================

if (summaryOverlay) {

    summaryOverlay.addEventListener("click", function(event) {

        if (event.target === summaryOverlay) {

            summaryOverlay.style.display = "none";

        }

    });

}


// ================= FREQUENCY =================

frequencyCards.forEach(function(card) {

    card.addEventListener("click", function() {

        frequencyCards.forEach(function(item) {

            item.classList.remove("selected");

        });

        card.classList.add("selected");

        const frequency =
            card.dataset.frequency;

        if (frequency === "week" && frequencyText) {

            frequencyText.innerText =
                "Weekly Mood Summary";

        }

        if (frequency === "month" && frequencyText) {

            frequencyText.innerText =
                "Monthly Mood Summary";

        }

        if (frequency === "year" && frequencyText) {

            frequencyText.innerText =
                "Yearly Mood Summary";

        }

    });

});


// ================= HIDE SUMMARY =================

if (hideSummaryButton) {

    hideSummaryButton.addEventListener("click", function() {

        if (summaryWidget) {

            summaryWidget.style.display = "none";

        }

        if (summaryOverlay) {

            summaryOverlay.style.display = "none";

        }

    });

}


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

            if (chartCanvas) {

                chartCanvas.style.display = "none";

            }

            if (emojiChart) {

                emojiChart.style.display = "flex";

            }

            if (chartTypeText) {

                chartTypeText.innerText =
                    "😊 Emoji Mood Chart";

            }

            return;

        }

        // ================= NORMAL CHART =================

        if (emojiChart) {

            emojiChart.style.display = "none";

        }

        if (chartCanvas) {

            chartCanvas.style.display = "block";

        }

        // ================= CHANGE TEXT =================

        if (chartType === "line" && chartTypeText) {

            chartTypeText.innerText =
                "📈 Line Chart";

        }

        if (chartType === "bar" && chartTypeText) {

            chartTypeText.innerText =
                "📊 Bar Chart";

        }

        if (chartType === "pie" && chartTypeText) {

            chartTypeText.innerText =
                "🥧 Pie Chart";

        }

        if (chartType === "doughnut" && chartTypeText) {

            chartTypeText.innerText =
                "🍩 Doughnut Chart";

        }

        if (chartType === "radar" && chartTypeText) {

            chartTypeText.innerText =
                "🕸 Radar Chart";

        }

        // ================= DESTROY OLD CHART =================

        if (moodChart) {

            moodChart.destroy();

        }

        // ================= CREATE NEW CHART =================

        if (chartCanvas) {

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

        }

    });

});


// ================= WORD SUMMARY TYPE =================

wordCards.forEach(function(card) {

    card.addEventListener("click", function() {

        wordCards.forEach(function(item) {

            item.classList.remove("selected");

        });

        card.classList.add("selected");

        const wordType =
            card.dataset.word;

        // ================= AI FEEDBACK =================

        if (wordType === "ai" && wordSummaryText) {

            wordSummaryText.innerText =

                "You seemed calmer this week and " +
                "stress levels were reduced.";

        }

        // ================= WORD SUMMARY =================

        if (wordType === "summary" && wordSummaryText) {

            wordSummaryText.innerText =

                "Mostly happy emotions were recorded.";

        }

    });

});


// ================= WORD FREQUENCY =================

wordFrequencyCards.forEach(function(card) {

    card.addEventListener("click", function() {

        wordFrequencyCards.forEach(function(item) {

            item.classList.remove("selected");

        });

        card.classList.add("selected");

        const frequency =
            card.dataset.wordFrequency;

        // ================= DAY =================

        if (frequency === "day") {

            console.log("Day summary");

        }

        // ================= WEEK =================

        if (frequency === "week") {

            console.log("Week summary");

        }

        // ================= MONTH =================

        if (frequency === "month") {

            console.log("Month summary");

        }

    });

});