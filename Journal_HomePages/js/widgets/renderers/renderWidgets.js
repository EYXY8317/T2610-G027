import {
    widgets
}
from "../registry/widgetRegistry.js";

export function renderWidgets() {

    return widgets
        .map(

            widget =>

                widget.create()

        )
        .join("");

}