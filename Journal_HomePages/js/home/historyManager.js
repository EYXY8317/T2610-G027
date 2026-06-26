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
