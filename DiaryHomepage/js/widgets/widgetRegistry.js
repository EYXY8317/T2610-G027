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

import {
    createPictureStreakWidget
}
from "./pictureStreak.js";

import {
    createEmotionSummaryWidget
}
from "./emotionSummary.js";

import {
    createDiaryCardWidget
}
from "./diaryCard.js";

// 所有可以从"添加组件"面板里加到首页的组件，统一登记在这个列表里：
// 每一项有一个 id（内部识别用）、name（面板里显示的名字）、
// create（调用后会返回这个组件的 HTML 字符串的函数）。
// 面板只需要遍历这个列表就能画出所有可添加的组件，不用为每个组件
// 单独写一段面板代码。
// Every widget that can be added to the home page from the "Add Widget"
// panel is registered here in one list: each entry has an id (used
// internally), a name (shown in the panel), and a create function
// (returns that widget's HTML string when called). The panel just loops
// over this list to render every addable widget, instead of needing
// separate panel code written per widget.

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

    {
        id: "picture-streak",
        name: "Picture Streak",
        create: () => createPictureStreakWidget("picture-streak-widget")
    },

    {
        id: "emotion-summary",
        name: "Emotion Summary",
        create: createEmotionSummaryWidget
    },

    {
        id: "diary-card",
        name: "Diary",
        create: createDiaryCardWidget
    },

];
