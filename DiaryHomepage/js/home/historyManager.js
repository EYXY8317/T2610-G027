// 一个通用的撤销/重做栈，跟 diary.html 里那个自己实现的撤销/重做
// 概念一样（两个栈、后进先出），但这里用的是"命令模式"：每个存进
// 历史记录的 entry 都必须自带 revert()（撤销时怎么做）和 apply()
// （重做时怎么做）这两个方法，而不是像 diary.html 那样存一份完整的
// 画布快照。这样做的好处是每次操作只需要记住"怎么撤销/重做这一步"，
// 不用把整个页面状态都复制一份。
// A generic undo/redo stack, conceptually the same as the one diary.html
// implements itself (two stacks, last-in-first-out) — but this one uses
// the "command pattern": every entry pushed into history must supply its
// own revert() (how to undo it) and apply() (how to redo it) methods,
// rather than storing a full snapshot of everything like diary.html
// does. The benefit is that each action only needs to remember "how to
// undo/redo this one step", without copying the entire page's state.

const MAX = 50;
const _undoStack = [];
const _redoStack = [];

let _undoBtn = null;
let _redoBtn = null;

export function initHistoryButtons(undoEl, redoEl) {
    _undoBtn = undoEl;
    _redoBtn = redoEl;
    _refresh();
}

function _refresh() {
    if (_undoBtn) _undoBtn.disabled = _undoStack.length === 0;
    if (_redoBtn) _redoBtn.disabled = _redoStack.length === 0;
}

export function pushHistory(entry) {
    _undoStack.push(entry);
    if (_undoStack.length > MAX) _undoStack.shift();
    // 新操作发生后，之前能"重做"的历史就不再有意义了，清空它。
    // Once a new action happens, whatever "redo" history existed before
    // no longer makes sense, so it's cleared.
    _redoStack.length = 0;
    _refresh();
}

export function undo() {
    if (!_undoStack.length) return;
    const e = _undoStack.pop();
    _redoStack.push(e);
    e.revert();
    _refresh();
}

export function redo() {
    if (!_redoStack.length) return;
    const e = _redoStack.pop();
    _undoStack.push(e);
    e.apply();
    _refresh();
}
