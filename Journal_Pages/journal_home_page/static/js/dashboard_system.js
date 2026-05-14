/* ===================================================== */
/* ================= WIDGETS =========================== */
/* ===================================================== */

const widgets =
document.querySelectorAll(".widget");


/* ===================================================== */
/* ================= EDIT MODE ========================= */
/* ===================================================== */

let editMode = false;


/* ===================================================== */
/* ================= CTRL CLICK WIDGET ================= */
/* ===================================================== */

widgets.forEach(function(widget) {

    widget.addEventListener(

        "click",

        function(event) {

            if (editMode) {

                return;
            }

            if (event.ctrlKey) {

                /* ================= STREAK ================= */

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

                /* ================= SUMMARY ================= */

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

                /* ================= AI SUMMARY ================= */

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

                /* ================= QUOTE ================= */

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


/* ===================================================== */
/* ================= REARRANGE BUTTON ================== */
/* ===================================================== */

const rearrangeButton =
document.querySelector(
    "#rearrange-btn"
);


if (rearrangeButton) {

    rearrangeButton.addEventListener(

        "click",

        function() {

            editMode = true;

            document.body.classList.add(
                "edit-mode"
            );

            updateEditModeUI();

        }

    );

}


/* ===================================================== */
/* ================= DONE BUTTON ======================= */
/* ===================================================== */

const doneButton =
document.querySelector(
    "#done-edit-btn"
);


if (doneButton) {

    doneButton.addEventListener(

        "click",

        function() {

            editMode = false;

            document.body.classList.remove(
                "edit-mode"
            );

            updateEditModeUI();

        }

    );

}


/* ===================================================== */
/* ================= DELETE WIDGET ===================== */
/* ===================================================== */

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


/* ===================================================== */
/* ================= RESIZE ============================ */
/* ===================================================== */

const resizeHandles =
document.querySelectorAll(
    ".resize-handle"
);


resizeHandles.forEach(function(handle) {

    handle.addEventListener(

        "mousedown",

        function(event) {

            if (!editMode) {

                return;
            }

            event.preventDefault();

            event.stopPropagation();

            const widget =
            handle.closest(".widget");

            const startX =
            event.clientX;

            const startY =
            event.clientY;

            const startWidth =
            widget.offsetWidth;

            const startHeight =
            widget.offsetHeight;

            widget.classList.add(
                "resizing"
            );

            function resize(event) {

                const now = Date.now();

                if (
                    resize.lastFrame &&
                    now - resize.lastFrame < 16
                ) {

                    return;
                }

                resize.lastFrame = now;

                let newWidth =
                startWidth +
                (event.clientX - startX);

                let newHeight =
                startHeight +
                (event.clientY - startY);

                if (newWidth < 220) {

                    newWidth = 220;
                }

                if (newHeight < 180) {

                    newHeight = 180;
                }

                const currentRect =
                widget.getBoundingClientRect();

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

                if (!collision) {

                    widget.style.width =
                    newWidth + "px";
                }

                widget.style.height =
                newHeight + "px";

            }

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


/* ===================================================== */
/* ================= CUSTOM DRAG SYSTEM ================ */
/* ===================================================== */

let draggedWidget = null;

let placeholder = null;

let offsetX = 0;

let offsetY = 0;


/* ===================================================== */
/* ================= ENABLE DRAGGING =================== */
/* ===================================================== */

function enableWidgetDragging() {

    const widgets =
    document.querySelectorAll(".widget");


    widgets.forEach(function(widget) {

        if (
            widget.dataset.dragReady ===
            "true"
        ) {

            return;
        }

        widget.dataset.dragReady = "true";


        /* CREATE DRAG AREA */

        const dragArea =
        document.createElement("div");

        dragArea.className =
        "widget-drag-area";

        widget.appendChild(dragArea);


        /* ===================================================== */
        /* ================= MOUSE DOWN ======================== */
        /* ===================================================== */

        dragArea.addEventListener(

            "mousedown",

            function(event) {

                if (!editMode) {

                    return;
                }

                event.preventDefault();

                draggedWidget = widget;

                widget.classList.add(
                    "dragging"
                );


                /* START POSITION */

                const rect =
                widget.getBoundingClientRect();

                offsetX =
                event.clientX - rect.left;

                offsetY =
                event.clientY - rect.top;


                /* PLACEHOLDER */

                placeholder =
                document.createElement("div");

                placeholder.className =
                "widget-placeholder";

                placeholder.style.width =
                rect.width + "px";

                placeholder.style.height =
                rect.height + "px";


                widget.parentNode.insertBefore(

                    placeholder,

                    widget.nextSibling
                );


                /* FLOATING MODE */

                widget.style.position =
                "fixed";

                widget.style.left =
                rect.left + "px";

                widget.style.top =
                rect.top + "px";

                widget.style.width =
                rect.width + "px";

                widget.style.height =
                rect.height + "px";


                /* MOVE EVENTS */

                document.addEventListener(
                    "mousemove",
                    dragMove
                );

                document.addEventListener(
                    "mouseup",
                    stopDrag
                );

            }

        );

    });

}


/* ===================================================== */
/* ================= DRAG MOVE ========================= */
/* ===================================================== */

function dragMove(event) {

    if (!draggedWidget) {

        return;
    }


    /* MOVE CARD */

    draggedWidget.style.left =

        (event.clientX - offsetX) + "px";

    draggedWidget.style.top =

        (event.clientY - offsetY) + "px";


    /* DETECT TARGET */

    const widgets =
    document.querySelectorAll(
        ".widget:not(.dragging)"
    );


    widgets.forEach(function(widget) {

        const rect =
        widget.getBoundingClientRect();


        const inside =

            event.clientX > rect.left &&
            event.clientX < rect.right &&
            event.clientY > rect.top &&
            event.clientY < rect.bottom;


        if (inside) {

            const container =
            widget.parentNode;


            const middleY =
            rect.top + rect.height / 2;


            if (event.clientY > middleY) {

                container.insertBefore(

                    placeholder,

                    widget.nextSibling
                );

            }

            else {

                container.insertBefore(

                    placeholder,

                    widget
                );

            }

        }

    });

}


/* ===================================================== */
/* ================= STOP DRAG ========================= */
/* ===================================================== */

function stopDrag() {

    if (!draggedWidget) {

        return;
    }


    draggedWidget.classList.remove(
        "dragging"
    );


    draggedWidget.style.position = "";

    draggedWidget.style.left = "";

    draggedWidget.style.top = "";

    draggedWidget.style.width = "";

    draggedWidget.style.height = "";


    /* INSERT FINAL */

    placeholder.replaceWith(
        draggedWidget
    );


    document.removeEventListener(
        "mousemove",
        dragMove
    );

    document.removeEventListener(
        "mouseup",
        stopDrag
    );


    draggedWidget = null;

    placeholder = null;

}


/* ===================================================== */
/* ================= UPDATE EDIT UI ==================== */
/* ===================================================== */

function updateEditModeUI() {

    const widgets =
    document.querySelectorAll(".widget");

    widgets.forEach(function(widget) {

        if (editMode) {

            widget.classList.add(
                "edit-mode"
            );
        }

        else {

            widget.classList.remove(
                "edit-mode"
            );
        }

    });

}


/* ===================================================== */
/* ================= INIT ============================== */
/* ===================================================== */

enableWidgetDragging();