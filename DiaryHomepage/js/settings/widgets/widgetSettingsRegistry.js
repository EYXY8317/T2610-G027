// 注意：这个文件跟同目录下的 registry.js 内容完全一样（重复文件）——
// 把组件的 HTML id（比如 "digital-clock-widget"）映射到它对应的设置
// 面板类型名字（比如 "digitalClock"），用来查找该显示哪一种设置界面。
// Note: this file is byte-for-byte identical to registry.js in the same
// folder (a duplicate file) — it maps a widget's HTML id (e.g.
// "digital-clock-widget") to its settings-panel type name (e.g.
// "digitalClock"), used to look up which settings UI to show.
export const widgetSettingsRegistry = {

    "digital-clock-widget":
        "digitalClock",

    "weather-day-widget":
        "weatherDay",

    "weather-hour-widget":
        "weatherHour",

    "quote-widget":
        "quote"

};
