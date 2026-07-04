import { widgets } from "./widgetRegistry.js";
import { getHiddenWidgets } from "../home/widgetVisibility.js";
import { getExtraPictureInstances } from "../home/addWidgetPanel.js";
import { createPictureStreakWidget } from "./pictureStreak.js";

// 页面加载时，把首页要显示的所有组件的 HTML 一次性拼好：从组件
// 注册表（widgets）里过滤掉已经被用户隐藏的组件，再把每个额外的
// Picture Streak 实例（用户可能加了不止一个）也一起拼接进去。
// On page load, assembles the HTML for every widget that should appear
// on the home page in one go: filters out widgets the user has hidden
// from the widget registry (widgets), then appends the HTML for every
// extra Picture Streak instance too (the user may have added more than
// one).

export function renderWidgets() {
    const hidden = getHiddenWidgets();
    const base = widgets
        .filter(w => !hidden.includes(`${w.id}-widget`))
        .map(w => w.create())
        .join("");

    const extras = getExtraPictureInstances()
        .map(id => createPictureStreakWidget(id))
        .join("");

    return base + extras;
}
