// ================= ELEMENTS =================

const quoteSettingButton =
    document.querySelector(".quote-setting-btn");

const quoteOverlay =
    document.querySelector("#quote-popup-overlay");

const quoteText =
    document.querySelector("#quote-text");


// ================= QUOTE DATA =================

let quotes = {};


// ================= LOAD JSON =================

fetch("/homepage_static/json/quotes.json")

.then(function(response) {

    return response.json();

})

.then(function(data) {

    console.log(data);

    quotes = data;

    showRandomQuote("Motivation");

});


// ================= RANDOM QUOTE =================

function showRandomQuote(category) {

    const categoryQuotes =
        quotes[category];

    const randomIndex =
        Math.floor(Math.random() * categoryQuotes.length);

    quoteText.textContent =
        categoryQuotes[randomIndex];

}


// ================= OPEN POPUP =================

quoteSettingButton.addEventListener("click", function() {

    quoteOverlay.style.display = "block";

});


// ================= CLOSE POPUP =================

quoteOverlay.addEventListener("click", function(event) {

    if (event.target === quoteOverlay) {

        quoteOverlay.style.display = "none";

    }

});