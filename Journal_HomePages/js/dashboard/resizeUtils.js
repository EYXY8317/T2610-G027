import RESIZE_CONSTRAINTS from "./resizeConstraints.js";

export function computeNewSize(widget, startWidth, startHeight, deltaX, deltaY, constraints = RESIZE_CONSTRAINTS) {

    let newWidth = startWidth + deltaX;

    let newHeight = startHeight + deltaY;

    newWidth = Math.max(constraints.MIN_WIDTH, Math.min(newWidth, constraints.MAX_WIDTH));

    newHeight = Math.max(constraints.MIN_HEIGHT, Math.min(newHeight, constraints.MAX_HEIGHT));

    return {
        width: newWidth,
        height: newHeight
    };

}

export default computeNewSize;
