import {
    enableSettingDrag
}
from "./settingDrag.js";

import {
    closeCurrentPopup,
    setCurrentPopup
}
from "./settingManager.js";

export function createSettingPopup(
    title = "Settings"
) {

    closeCurrentPopup();

    const popup =
        document.createElement("div");

    popup.className =
        "setting-popup";

    popup.innerHTML = `
        <div class="setting-header">
            <span>${title}</span>

            <button
                class="setting-close">
                ✕
            </button>
        </div>

        <div class="setting-body">

            <h3>Appearance</h3>

            <h3>Content</h3>

        </div>
    `;

    popup
        .querySelector(
            ".setting-close"
        )
        .addEventListener(
            "click",
            () => {
                closeCurrentPopup();
            }
        );

    document.body.append(
        popup
    );

    const header =
        popup.querySelector(
            ".setting-header"
        );

    enableSettingDrag(
        popup,
        header
    );

    setCurrentPopup(
        popup
    );

    return popup;
}