let currentPopup = null;

export function setCurrentPopup(
    popup
) {
    currentPopup = popup;
}

export function getCurrentPopup() {
    return currentPopup;
}

export function closeCurrentPopup() {

    if (!currentPopup) {
        return;
    }

    currentPopup.remove();

    currentPopup = null;
}