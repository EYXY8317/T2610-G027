// Add PNG/WebP/SVG images here to populate the decoration picker.
// To add your own: { label: "Name", src: "/journal_home_static/assets/deco/filename.png" }
export const DECO_ASSETS = [
    { label: "Leaf Small",    src: "/journal_home_static/assets/deco/leaf-small.png"        },
    { label: "Leaf Tall",     src: "/journal_home_static/assets/deco/leaf-tall.png"         },
    { label: "Leaf Oval",     src: "/journal_home_static/assets/deco/leaf-oval.png"         },
    { label: "Flower Cluster",src: "/journal_home_static/assets/deco/flower-cluster.png"    },
    { label: "Flower 3",      src: "/journal_home_static/assets/deco/flower-3bloom.png"     },
    { label: "Bell Flower",   src: "/journal_home_static/assets/deco/flower-bell.png"       },
    { label: "Flower 4",      src: "/journal_home_static/assets/deco/flower-4bloom.png"     },
    { label: "Baby's Breath", src: "/journal_home_static/assets/deco/flower-babysbreath.png"},
];

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
            const cb = _onSelect;
            closeDecoPicker();
            cb?.(src);
        });
    });
}
