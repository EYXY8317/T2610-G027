import { TEMPLATES, applyTemplate } from "./layoutTemplates.js";
import { syncLayoutToServer } from "./serverLayout.js";
import { showReminderPopup } from "../shared/reminderPopup.js";

export function openTemplatePicker() {
    const overlay = document.createElement("div");
    overlay.className = "add-widget-overlay";

    overlay.innerHTML = `
        <div class="add-widget-panel template-picker-panel">
            <div class="add-widget-header">
                <span>Layout Templates</span>
                <button class="add-widget-close">✕</button>
            </div>
            <div class="template-grid">
                ${TEMPLATES.map(t => `
                    <div class="template-card" data-id="${t.id}">
                        <div class="template-palette">
                            ${t.palette.map(c => `<span class="template-dot" style="background:${c}"></span>`).join("")}
                        </div>
                        <div class="template-name">${t.name}</div>
                        <div class="template-desc">${t.desc}</div>
                        <button class="template-apply-btn" data-id="${t.id}">Apply</button>
                    </div>
                `).join("")}
            </div>
        </div>
    `;

    overlay.querySelector(".add-widget-close").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelectorAll(".template-apply-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            const template = TEMPLATES.find(t => t.id === id);
            if (!template) return;

            showTemplateConfirm(template.name, async () => {
                applyTemplate(id);
                await syncLayoutToServer();
                overlay.remove();
                window.location.reload();
            });
        });
    });

    document.body.appendChild(overlay);
}

function showTemplateConfirm(name, onConfirm) {
    showReminderPopup({
        title: `Apply "${name}"?`,
        message: "This will replace your current widget layout and appearance settings. Your widgets won't be deleted — you can re-arrange them afterward.",
        confirmText: "Apply",
        cancelText: "Cancel",
        onConfirm
    });
}
