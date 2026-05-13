// ================= WIDGETS =================

const widgets =
document.querySelectorAll(".widget");

console.log(widgets);


// ================= CTRL CLICK WIDGET =================

widgets.forEach(function(widget) {

    widget.addEventListener("click", function(event) {

        // ================= CTRL CLICK =================

        if (event.ctrlKey) {

            // ================= STREAK =================

            if (
                widget.id ===
                "current-streak-widget"
            ) {

                const popup =
                    document.querySelector(
                        "#popup-overlay"
                    );

                if (popup) {

                    popup.style.display =
                        "block";

                }

            }

            // ================= SUMMARY =================

            if (
                widget.id ===
                "mood-chart-widget"
            ) {

                const popup =
                    document.querySelector(
                        "#summary-popup-overlay"
                    );

                if (popup) {

                    popup.style.display =
                        "block";

                }

            }

            // ================= AI SUMMARY =================

            if (
                widget.id ===
                "ai-summary-widget"
            ) {

                const popup =
                    document.querySelector(
                        "#summary-popup-overlay"
                    );

                if (popup) {

                    popup.style.display =
                        "block";

                }

            }

            // ================= QUOTE =================

            if (
                widget.id ===
                "quote-widget"
            ) {

                const popup =
                    document.querySelector(
                        "#quote-popup-overlay"
                    );

                if (popup) {

                    popup.style.display =
                        "block";

                }

            }

        }

    });

});


// ================= REARRANGE BUTTON =================

const rearrangeButton =
    document.querySelector(
        "#rearrange-btn"
    );


// ================= TOGGLE EDIT MODE =================

if (rearrangeButton) {

    rearrangeButton.addEventListener(
        "click",

        function() {

            document.body.classList.toggle(
                "edit-mode"
            );

        }

    );

}