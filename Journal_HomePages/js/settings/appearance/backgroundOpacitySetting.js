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
    const alpha = Number(opacity) / 100;

    // Shadow fades with background
    widget.style.setProperty("--widget-shadow-a", (alpha * 0.10).toFixed(3));

    const currentColor = getComputedStyle(widget).backgroundColor;
    const rgb = currentColor.match(/\d+/g);
    if (!rgb || rgb.length < 3) return;

    widget.style.backgroundColor = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
}