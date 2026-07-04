// Add PNG/WebP/SVG images here to populate the decoration picker.
// To add your own: { label: "Name", src: "/diary_home_static/assets/deco/filename.png" }
// 在这里添加 PNG/WebP/SVG 图片，就能出现在装饰选择器里。
// 要加入自己的图片：{ label: "名称", src: "/diary_home_static/assets/deco/文件名.png" }

export const DECO_ASSETS = [
    { label: "Leaf Small",    src: "/diary_home_static/assets/deco/leaf-small.png"        },
    { label: "Leaf Tall",     src: "/diary_home_static/assets/deco/leaf-tall.png"         },
    { label: "Leaf Oval",     src: "/diary_home_static/assets/deco/leaf-oval.png"         },
    { label: "Flower Cluster",src: "/diary_home_static/assets/deco/flower-cluster.png"    },
    { label: "Flower 3",      src: "/diary_home_static/assets/deco/flower-3bloom.png"     },
    { label: "Bell Flower",   src: "/diary_home_static/assets/deco/flower-bell.png"       },
    { label: "Flower 4",      src: "/diary_home_static/assets/deco/flower-4bloom.png"     },
    { label: "Baby's Breath", src: "/diary_home_static/assets/deco/flower-babysbreath.png"},
];

// 这两个模块级变量分别记住"当前弹窗有没有被创建过"（避免每次打开都
// 重新创建 DOM）和"选中某个装饰之后要回调哪个函数"。
// These two module-level variables remember "has the picker's DOM
// already been created" (so it isn't rebuilt every time it opens) and
// "which callback function to invoke once a decoration is selected".

let _onSelect = null;
let _pickerEl = null;

export function openDecoPicker(onSelect) {
    _onSelect = onSelect;
    if (!_pickerEl) _createPicker();
    _render();
    _pickerEl.classList.add("visible");
}

export function closeDecoPicker() {
    if (_pickerEl) _pickerEl.classList.remove("visible");
    _onSelect = null;
}

function _createPicker() {
    _pickerEl = document.createElement("div");
    _pickerEl.id = "deco-picker";
    _pickerEl.innerHTML = `
        <div id="deco-picker-header">
            <span>Choose a decoration</span>
            <button id="deco-picker-close">✕</button>
        </div>
        <div id="deco-picker-grid"></div>
    `;
    document.body.appendChild(_pickerEl);
    document.getElementById("deco-picker-close").addEventListener("click", closeDecoPicker);
}

function _render() {
    const grid = _pickerEl.querySelector("#deco-picker-grid");
    if (!DECO_ASSETS.length) {
        grid.innerHTML = `<p id="deco-empty-msg">No decorations yet — add images to <code>assets/deco/</code></p>`;
        return;
    }
    grid.innerHTML = DECO_ASSETS.map(a => `
        <div class="deco-picker-thumb" data-src="${a.src}" title="${a.label}">
            <img src="${a.src}" alt="${a.label}">
        </div>
    `).join("");
    grid.querySelectorAll(".deco-picker-thumb").forEach(thumb => {
        thumb.addEventListener("click", () => {
            const src = thumb.dataset.src;
            // 先把回调函数记下来，再关闭弹窗（closeDecoPicker 会把
            // _onSelect 清空成 null），最后才调用记下来的回调——
            // 顺序反过来的话，关闭弹窗时 _onSelect 已经被清空，
            // 回调就永远不会被调用到了。
            // The callback is saved into a local variable first, then the
            // picker is closed (closeDecoPicker resets _onSelect to
            // null), and only then is the saved callback invoked — if
            // this order were reversed, _onSelect would already be wiped
            // out by the time the picker closes, and the callback would
            // never get called.
            const cb = _onSelect;
            closeDecoPicker();
            cb?.(src);
        });
    });
}
