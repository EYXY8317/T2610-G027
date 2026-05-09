// ================= ELEMENTS =================

const quoteSettingButton =
    document.querySelector(".quote-setting-btn");

const quoteOverlay =
    document.querySelector("#quote-popup-overlay");


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