// 注意：下面这个 console.log 是遗留的调试语句——这个文件一旦被
// import，就会立刻在浏览器控制台打印一行 "TITLE SIZE LOADED"，
// 不影响功能，但属于可以清理掉的调试残留。
// Note: the console.log below is a leftover debug statement — the
// moment this file is imported, it immediately prints "TITLE SIZE
// LOADED" to the browser console. It doesn't affect functionality, but
// is debug residue that could be removed.

console.log(
    "TITLE SIZE LOADED"
);

export function getTitleSizeSetting() {

    return `

        <div
            class="setting-row"
        >

            <span>
                Title Size
            </span>

        </div>

        <div
            class="
            title-size-value
            "
        >

            20px

        </div>

        <div
            class="
            title-size-slider-row
            "
        >

            <span>
                12
            </span>

            <input
                type="range"
                min="12"
                max="40"
                value="20"
                class="
                title-size-slider
                "
            >

            <span>
                40
            </span>

        </div>

    `;

}

export function applyTitleSize(
    widget,
    size
) {

    const title =
        widget.querySelector(
            ".widget-header"
        );

    if (!title) {
        return;
    }

    title.style.fontSize =
        size + "px";

}
