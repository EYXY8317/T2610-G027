// 用一个模块级变量记住"当前打开着的那个设置弹窗"，这样任何地方
// 都能通过 getCurrentPopup()/closeCurrentPopup() 找到并关闭它——
// 一次只允许打开一个设置弹窗（打开新的之前，调用方通常会先调用
// closeCurrentPopup() 把旧的关掉）。
// A module-level variable remembers "the currently open settings popup",
// so anywhere in the code can find and close it via
// getCurrentPopup()/closeCurrentPopup() — only one settings popup is
// meant to be open at a time (callers typically call closeCurrentPopup()
// before opening a new one).

let currentPopup = null;

export function setCurrentPopup(
    popup
) {
    currentPopup = popup;
}

export function getCurrentPopup() {
    return currentPopup;
}

export function closeCurrentPopup() {

    if (!currentPopup) {
        return;
    }

    currentPopup.remove();

    currentPopup = null;
}
