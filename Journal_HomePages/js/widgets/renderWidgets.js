import {
    widgets
}
from "./widgetRegistry.js";

import {
    createWeatherWeekWidget
}
from "./weatherWeek.js";

export function renderWidgets() {

    return widgets
        .map(

            widget =>

                widget.create()

        )
        .join("");

}
