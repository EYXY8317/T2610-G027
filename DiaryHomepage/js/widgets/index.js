// 组件目录——列出"添加组件"面板里能选择添加的每一种组件：
// 每一项有一个 id、显示给用户看的名字，以及创建这个组件 DOM 的函数。
// 注意这里只包含 5 种组件（天气类 3 种 + 语录 + 数字时钟），
// 其他组件（心情类、连续记录类、日记卡片等）是通过别的入口
// （比如 widgetRegistry.js）注册的，不在这份列表里。
// A widget catalog — lists every widget type selectable in the "Add
// Widget" panel: each entry has an id, a display name, and the function
// that creates that widget's DOM. Note this only covers 5 widget types
// (3 weather ones + quote + digital clock); other widgets (mood-related,
// streak-related, diary card, etc.) are registered through a different
// entry point (e.g. widgetRegistry.js) and aren't in this list.

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
    createWeatherWeekWidget
}
from "./weatherWeek.js";

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
