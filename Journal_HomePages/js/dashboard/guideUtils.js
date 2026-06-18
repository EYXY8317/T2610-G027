export function showVerticalLine(x) {
    const verticalLine = document.getElementById("snap-line");
    verticalLine.style.display = "block";
    verticalLine.style.left = x + "px";
}

export function showHorizontalLine(y) {
    const horizontalLine = document.getElementById("snap-line-horizontal");
    horizontalLine.style.display = "block";
    horizontalLine.style.top = y + "px";
}

export function hideVerticalLine() {
    const verticalLine = document.getElementById("snap-line");
    verticalLine.style.display = "none";
}

export function hideHorizontalLine() {
    const horizontalLine = document.getElementById("snap-line-horizontal");
    horizontalLine.style.display = "none";
}

export function hideGuideLines() {
    hideVerticalLine();
    hideHorizontalLine();
}

export default {
    showVerticalLine,
    showHorizontalLine,
    hideGuideLines
};
