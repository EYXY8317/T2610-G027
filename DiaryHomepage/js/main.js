// 整个 Diary Homepage 的入口脚本——等页面 DOM 加载完毕后，
// 调用 home/index.js 里的 initializeHomepage() 来真正启动整个组件系统
// （加载已保存的布局、创建各个组件、绑定拖拽/缩放等交互）。
// console.clear() + console.log(...) 只是开发时用来在浏览器控制台
// 确认"这个脚本确实被加载执行了"的小提示，不影响任何功能。
// The entry script for the whole Diary Homepage — once the page's DOM
// has finished loading, it calls initializeHomepage() from home/index.js
// to actually boot up the whole widget system (loading the saved layout,
// creating each widget, wiring up drag/resize interactions, etc.).
// console.clear() + console.log(...) is just a small dev-time hint in the
// browser console confirming "this script really did load and run" — it
// has no effect on functionality.

import {
    initializeHomepage
}
from "./home/index.js";

console.clear();

console.log(
    "Journal Homepage Loaded"
);

document.addEventListener(
    "DOMContentLoaded",
    initializeHomepage
);
