import { getConstraints } from "./resizeConstraints.js";

export function computeNewSize(widget, startWidth, startHeight, deltaX, deltaY) {

    const { minW, minH, maxW, maxH } = getConstraints(widget.id);

    const newWidth  = Math.max(minW, Math.min(startWidth  + deltaX, maxW));
    const newHeight = Math.max(minH, Math.min(startHeight + deltaY, maxH));

    return { width: newWidth, height: newHeight };

}

export default computeNewSize;
