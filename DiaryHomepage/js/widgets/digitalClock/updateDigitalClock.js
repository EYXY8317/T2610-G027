// 数字时钟组件的"当前设置值"全部存在这个模块顶层的变量里
// （showSeconds/clockFormat/... ），每个都配一个 setXxx() 函数用来
// 修改它——这是一种简单的模块内共享状态，跟用一个对象存所有设置
// 效果类似，只是拆成了各自独立的变量。
// The digital clock widget's "current setting values" all live in
// top-level variables in this module (showSeconds/clockFormat/...), each
// with a matching setXxx() function to change it — a simple form of
// shared in-module state, similar in effect to storing all settings in
// one object, just split into separate individual variables here.

import {
    renderDigitalClock
}
from "./renderDigitalClock.js";

export let showSeconds = true;

export let clockFormat = "24h";

export let clockType = "digital";

export let showDate = true;

export let showWeekday = true;

export let timezone = "";

export let flipClockSize = 80;

export function setShowSeconds(value) {
    showSeconds = value;
}

export function setClockFormat(value) {
    clockFormat = value;
}

export function setClockType(value) {
    clockType = value;
}

export function setShowDate(value) {
    showDate = value;
}

export function setShowWeekday(value) {
    showWeekday = value;
}

export function setTimezone(value) {
    timezone = value;
}

export function setFlipClockSize(value) {
    flipClockSize = value;
}

function render() {
    renderDigitalClock(showSeconds, clockFormat, clockType, showDate, showWeekday, timezone);
}

export function updateDigitalClock() {

    render();

    // setInterval(render, 1000)：每隔 1000 毫秒（1 秒）就重新渲染一次，
    // 这就是时钟"走动"的原理——本质上就是每秒钟重新画一次当前时间。
    // setInterval(render, 1000): re-renders every 1000 milliseconds
    // (1 second) — this is literally how the clock "ticks": it just
    // redraws the current time once per second.
    setInterval(render, 1000);

    // Re-render immediately on resize so font size tracks the card size smoothly
    // 组件被缩放时立刻重新渲染一次，让文字大小能跟着卡片大小平滑变化，
    // 而不用等到下一次每秒刷新才更新。
    const widget = document.getElementById("digital-clock-widget");
    if (widget) {
        widget.addEventListener("widgetresize", render);
    }

}
