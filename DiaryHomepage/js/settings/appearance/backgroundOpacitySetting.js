export const backgroundOpacitySetting = {

    id: "background-opacity",

    label: "Background Opacity",

    defaultValue: 100

};

export function getBackgroundOpacitySetting() {

    return `

        <div
            class="setting-row"
        >

            <span>
                Background Opacity
            </span>

        </div>

        <div
            class="
            background-opacity-value
            "
        >

            100%

        </div>

        <div
            class="
            background-opacity-slider-row
            "
        >

            <span>
                0
            </span>

            <input
                type="range"
                min="0"
                max="100"
                value="100"
                class="
                background-opacity-slider
                "
            >

            <span>
                100
            </span>

        </div>

    `;

}

export function applyBackgroundOpacity(widget, opacity) {
    // 把 0~100 的百分比转换成 CSS 颜色需要的 0~1 小数（alpha 透明度值）。
    // Converts the 0-100 percentage into the 0-1 decimal (alpha
    // transparency value) that CSS colors expect.
    const alpha = Number(opacity) / 100;

    // Shadow fades with background
    // 阴影的深浅跟着背景的透明度一起变淡，视觉上更协调。
    widget.style.setProperty("--widget-shadow-a", (alpha * 0.10).toFixed(3));

    // getComputedStyle(widget).backgroundColor 拿到的是浏览器已经算好的
    // 实际颜色（形如 "rgb(255, 255, 255)"），用正则 /\d+/g 把里面所有的
    // 数字（也就是 R、G、B 三个分量）提取出来，再重新拼成带透明度的
    // rgba(...) 颜色，赋值回去——这样只改变透明度，不改变原本的颜色。
    // getComputedStyle(widget).backgroundColor gives the browser's
    // already-resolved actual color (something like "rgb(255, 255,
    // 255)"); the regex /\d+/g pulls out all the numbers in it (the R, G,
    // B components), which are then reassembled into an rgba(...) color
    // with the new alpha and assigned back — this changes only the
    // transparency, leaving the original color untouched.
    const currentColor = getComputedStyle(widget).backgroundColor;
    const rgb = currentColor.match(/\d+/g);
    if (!rgb || rgb.length < 3) return;

    widget.style.backgroundColor = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
}
