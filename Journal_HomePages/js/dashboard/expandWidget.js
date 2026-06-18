import { contentOverflow } from "./resizeManager.js";
import { isOverlapping  } from "./overlapManager.js";
import { saveLayout     } from "../home/saveLayout.js";

function showNoSpaceWarning() {
    if (document.querySelector(".widget-expand-warning")) return;
    const el = document.createElement("div");
    el.className  = "widget-expand-warning";
    el.textContent = "Not enough space — please adjust widget positions first.";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
}

export function autoExpandWidget(widgetId) {
    const widget = document.getElementById(widgetId);
    if (!widget) return;

    const overflow = contentOverflow(widget);
    if (overflow <= 1) return;

    const newHeight = widget.offsetHeight + overflow;
    const dashboard = document.getElementById("dashboard");
    const dashH     = dashboard ? dashboard.offsetHeight : window.innerHeight;

    if (widget.offsetTop + newHeight > dashH) {
        showNoSpaceWarning();
        return;
    }

    const prevHeight = widget.style.height;
    widget.style.height = newHeight + "px";

    if (isOverlapping(widget)) {
        widget.style.height = prevHeight;
        showNoSpaceWarning();
        return;
    }

    saveLayout(widget);
}
