import {
    createWeatherHourWidget
}
from "./weatherHour.js";

import {
    createWeatherDayWidget
}
from "./weatherDay.js";

import {
    createQuoteWidget
}
from "./quote.js";

export const widgets = [

    {
        id: "weather-hour",

        name: "Weather Hour",

        create:
            createWeatherHourWidget
    },

    {
        id: "weather-day",

        name: "Weather Day",

        create:
            createWeatherDayWidget
    },

    {
        id: "quote",
        name: "Quote",
        create: createQuoteWidget
    }   

];
