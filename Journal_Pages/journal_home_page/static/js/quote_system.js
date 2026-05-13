// ================= ELEMENTS =================

const quoteSettingButton =
    document.querySelector(".quote-setting-btn");

const quoteOverlay =
    document.querySelector("#quote-popup-overlay");

const quoteText =
    document.querySelector("#quote-text");

const ownQuoteSection =
    document.querySelector("#own-quote-section");

const savedQuoteSection =
    document.querySelector("#saved-quote-section");

const ownQuoteInput =
    document.querySelector("#own-quote-input");

const saveOwnQuoteBtn =
    document.querySelector("#save-own-quote-btn");

const savedQuotesList =
    document.querySelector("#saved-quotes-list");


// ================= QUOTE DATA =================

let quotes = {};


// ================= SAVED OWN QUOTES =================

let savedOwnQuotes = [];


// ================= LOAD JSON =================

fetch("/homepage_static/json/quotes.json")

.then(function(response) {
    return response.json();
})

.then(function(data) {
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


// ================= TYPE CARDS =================

const typeCards = document.querySelectorAll(
    "#quote-popup .type-card"
);


// ================= CATEGORY SECTION =================

const categorySection = document.querySelector(
    "#quote-category-section"
);


// ================= HIDE FIRST =================

categorySection.style.display = "none";
ownQuoteSection.style.display = "none";
savedQuoteSection.style.display = "none";


// ================= RENDER SAVED QUOTES =================

function renderSavedQuotes() {

    savedQuotesList.innerHTML = "";

    savedOwnQuotes.forEach(function(item, index) {

        const quoteItem = document.createElement("div");
        quoteItem.className = "saved-quote-item";

        quoteItem.innerHTML = `
            <p>${item}</p>
            <button class="saved-star-btn" data-index="${index}">
                ⭐
            </button>
        `;

        savedQuotesList.appendChild(quoteItem);
    });

    const starButtons = document.querySelectorAll(".saved-star-btn");

    starButtons.forEach(function(btn) {

        btn.addEventListener("click", function() {

            const index = Number(btn.dataset.index);

            btn.classList.toggle("selected");

            if (btn.classList.contains("selected")) {
                btn.textContent = "⭐";
            } else {
                btn.textContent = "☆";
            }

            // 这里先只是切换星星
            // 华语：这里先只做星星切换
        });

    });
}


// ================= SAVE OWN QUOTE =================

saveOwnQuoteBtn.addEventListener("click", function() {

    const newQuote = ownQuoteInput.value.trim();

    if (newQuote === "") {
        return;
    }

    savedOwnQuotes.push(newQuote);
    ownQuoteInput.value = "";

    renderSavedQuotes();
});


// ================= TYPE SELECT =================

typeCards.forEach(function(card) {

    card.addEventListener("click", function() {

        const type = card.dataset.type;

        // ================= HIDE =================

        if (type === "hide") {

            const hideSelected =
                card.classList.contains("selected");

            typeCards.forEach(function(item) {
                item.classList.remove("selected");
            });

            if (!hideSelected) {
                card.classList.add("selected");
            }

            categorySection.style.display = "none";
            ownQuoteSection.style.display = "none";
            savedQuoteSection.style.display = "none";

            return;
        }

        // ================= REMOVE HIDE =================

        const hideCard = document.querySelector(
            '#quote-popup .type-card[data-type="hide"]'
        );

        hideCard.classList.remove("selected");

        // ================= MULTI SELECT =================

        card.classList.toggle("selected");

        // ================= RANDOM CHECK =================

        const randomCard = document.querySelector(
            '#quote-popup .type-card[data-type="random"]'
        );

        const randomSelected =
            randomCard.classList.contains("selected");

        if (randomSelected) {
            categorySection.style.display = "block";
        } else {
            categorySection.style.display = "none";
        }

        // ================= OWN CHECK =================

        const ownCard = document.querySelector(
            '#quote-popup .type-card[data-type="own"]'
        );

        const ownSelected =
            ownCard.classList.contains("selected");

        if (ownSelected) {
            ownQuoteSection.style.display = "block";
        } else {
            ownQuoteSection.style.display = "none";
        }

        // ================= SAVE CHECK =================

        const saveCard = document.querySelector(
            '#quote-popup .type-card[data-type="save"]'
        );

        const saveSelected =
            saveCard.classList.contains("selected");

        if (saveSelected) {
            savedQuoteSection.style.display = "block";
            renderSavedQuotes();
        } else {
            savedQuoteSection.style.display = "none";
        }

    });

});


// ================= CATEGORY =================

const categoryCards = document.querySelectorAll(
    "#quote-popup .category-card"
);

categoryCards.forEach(function(card) {

    card.addEventListener("click", function() {
        card.classList.toggle("selected");
    });

});


// ================= FREQUENCY =================

const quoteFrequencyCards = document.querySelectorAll(
    "#quote-popup .frequency-card"
);

quoteFrequencyCards.forEach(function(card) {

    card.addEventListener("click", function() {

        quoteFrequencyCards.forEach(function(item) {
            item.classList.remove("selected");
        });

        card.classList.add("selected");
    });

});


// ================= THEME =================

const quoteThemeCards = document.querySelectorAll(
    "#quote-popup .theme-card"
);

quoteThemeCards.forEach(function(card) {

    card.addEventListener("click", function() {

        quoteThemeCards.forEach(function(item) {
            item.classList.remove("selected");
        });

        card.classList.add("selected");
    });

});