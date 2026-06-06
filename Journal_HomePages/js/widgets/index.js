import {
    createDigitalClock
}
from "../time/digitalClock/createDigitalClock.js";

import {
    createWeatherHourWidget
}
from "../weatherHour.js";

import {
    createWeatherDayWidget
}
from "../weatherDay.js";

import {
    createWeatherWeekWidget
}
from "../weatherWeek.js";

import {
    createQuoteWidget
}
from "../quote.js";

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
        id: "weather-week",

        name: "Weather Week",

        create:
            createWeatherWeekWidget
    },

    {
        id: "quote",

        name: "Quote",

        create:
            createQuoteWidget
    },

    {
        id: "digital-clock",

        name: "Digital Clock",

        create:
            createDigitalClock
    }

];