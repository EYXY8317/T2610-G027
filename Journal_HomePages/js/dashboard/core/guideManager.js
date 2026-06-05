export function hideGuideLines() {

    const verticalLine =
        document.getElementById(
            "snap-line"
        );

    const horizontalLine =
        document.getElementById(
            "snap-line-horizontal"
        );

    verticalLine.style.display =
        "none";

    horizontalLine.style.display =
        "none";

}