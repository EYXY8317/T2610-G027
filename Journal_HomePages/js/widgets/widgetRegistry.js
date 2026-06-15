import {
    createDigitalClock
}
from "./digitalClock/createDigitalClock.js";

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

import {
    createTodayEmotionWidget
}
from "./todayEmotion.js";

import {
    createWeatherWeekWidget
}
from "./weatherWeek.js";

import {
    createNowStreakWidget
}
from "./nowStreak.js";

import {
    createHighStreakWidget
}
from "./highStreak.js";

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
    },

    {
        id: "today-emotion",
        name: "Today Emotion",
        create: createTodayEmotionWidget
    },

    {
        id: "digital-clock",

        name: "Digital Clock",

        create:
            createDigitalClock
    },

    {
        id: "weather-week",
        name: "Weather Week",
        create: createWeatherWeekWidget
    },

    {
        id: "now-streak",
        name: "Now Streak",
        create: createNowStreakWidget
    },

    {
        id: "high-streak",
        name: "High Streak",
        create: createHighStreakWidget
    },

];
