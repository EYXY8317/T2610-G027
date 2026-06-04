import {
    widgets
}
from "./widgetRegistry.js";

export function renderWidgets() {

    return widgets
        .map(

            widget =>

                widget.create()

        )
        .join("");

}