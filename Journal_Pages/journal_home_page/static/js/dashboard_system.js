// ================= WIDGETS =================

const widgets =
document.querySelectorAll(".widget");


// ================= CTRL CLICK WIDGET =================

widgets.forEach(function(widget) {

    widget.addEventListener(

        "click",

        function(event) {

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

        }

    );

});


// ================= REARRANGE BUTTON =================

const rearrangeButton =
document.querySelector(
    "#rearrange-btn"
);


// ================= ENTER EDIT MODE =================

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


// ================= DONE BUTTON =================

const doneButton =
document.querySelector(
    "#done-edit-btn"
);


// ================= EXIT EDIT MODE =================

if (doneButton) {

    doneButton.addEventListener(

        "click",

        function() {

            document.body.classList.remove(
                "edit-mode"
            );

        }

    );

}


// ================= DELETE WIDGET =================

const deleteButtons =
document.querySelectorAll(
    ".delete-widget-btn"
);


deleteButtons.forEach(function(button) {

    button.addEventListener(

        "click",

        function(event) {

            event.stopPropagation();

            const widget =
            button.closest(".widget");

            if (widget) {

                widget.remove();

            }

        }

    );

});


// ================= RESIZE =================

const resizeHandles =
document.querySelectorAll(
    ".resize-handle"
);


resizeHandles.forEach(function(handle) {

    handle.addEventListener(

        "mousedown",

        function(event) {

            // ================= ONLY EDIT MODE =================

            if (
                !document.body.classList.contains(
                    "edit-mode"
                )
            ) {

                return;

            }

            event.preventDefault();

            event.stopPropagation();

            // ================= WIDGET =================

            const widget =
            handle.closest(".widget");

            // ================= START =================

            const startX =
            event.clientX;

            const startY =
            event.clientY;

            const startWidth =
            widget.offsetWidth;

            const startHeight =
            widget.offsetHeight;

            // ================= RESIZE EFFECT =================

            widget.classList.add(
                "resizing"
            );

            // ================= RESIZE =================

            function resize(event) {

                // ================= THROTTLE =================

                const now = Date.now();

                if (
                    resize.lastFrame &&
                    now - resize.lastFrame < 16
                ) {

                    return;

                }

                resize.lastFrame = now;

                // ================= NEW SIZE =================

                let newWidth =
                startWidth +
                (event.clientX - startX);

                let newHeight =
                startHeight +
                (event.clientY - startY);

                // ================= MIN SIZE =================

                if (newWidth < 220) {

                    newWidth = 220;

                }

                if (newHeight < 180) {

                    newHeight = 180;

                }

                // ================= CURRENT RECT =================

                const currentRect =
                widget.getBoundingClientRect();

                // ================= PREDICT WIDTH ONLY =================

                const predictedRect = {

                    left:
                    currentRect.left,

                    top:
                    currentRect.top,

                    right:
                    currentRect.left + newWidth,

                    bottom:
                    currentRect.bottom

                };

                // ================= CHECK COLLISION =================

                let collision = false;

                widgets.forEach(function(other) {

                    if (other === widget) {

                        return;

                    }

                    const otherRect =
                    other.getBoundingClientRect();

                    const overlap = !(

                        predictedRect.right <
                        otherRect.left ||

                        predictedRect.left >
                        otherRect.right ||

                        predictedRect.bottom <
                        otherRect.top ||

                        predictedRect.top >
                        otherRect.bottom

                    );

                    if (overlap) {

                        collision = true;

                    }

                });

                // ================= APPLY WIDTH =================

                if (!collision) {

                    widget.style.width =
                    newWidth + "px";

                }

                // ================= APPLY HEIGHT =================

                widget.style.height =
                newHeight + "px";

            }

            // ================= STOP =================

            function stopResize() {

                widget.classList.remove(
                    "resizing"
                );

                document.removeEventListener(
                    "mousemove",
                    resize
                );

                document.removeEventListener(
                    "mouseup",
                    stopResize
                );

            }

            // ================= EVENTS =================

            document.addEventListener(
                "mousemove",
                resize
            );

            document.addEventListener(
                "mouseup",
                stopResize
            );

        }

    );

});