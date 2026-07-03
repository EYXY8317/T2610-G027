import { TEMPLATES, applyTemplate } from "./layoutTemplates.js";
import { syncLayoutToServer } from "./serverLayout.js";
<<<<<<< HEAD
=======
import { showReminderPopup } from "../shared/reminderPopup.js";
>>>>>>> a857ae47f922cc5718ae9f2e06461a517aa4a7d1

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
<<<<<<< HEAD
    const modal = document.createElement("div");
    modal.className = "confirm-overlay";
    modal.innerHTML = `
        <div class="confirm-modal">
            <div class="confirm-modal-title">Apply "${name}"?</div>
            <div class="confirm-modal-body">This will replace your current widget layout and appearance settings. Your widgets won't be deleted — you can re-arrange them afterward.</div>
            <div class="confirm-modal-btns">
                <button class="confirm-cancel-btn">Cancel</button>
                <button class="confirm-ok-btn">Apply</button>
            </div>
        </div>
    `;
    modal.querySelector(".confirm-cancel-btn").addEventListener("click", () => modal.remove());
    modal.querySelector(".confirm-ok-btn").addEventListener("click", () => { modal.remove(); onConfirm(); });
    modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
=======
    showReminderPopup({
        title: `Apply "${name}"?`,
        message: "This will replace your current widget layout and appearance settings. Your widgets won't be deleted — you can re-arrange them afterward.",
        confirmText: "Apply",
        cancelText: "Cancel",
        onConfirm
    });
>>>>>>> a857ae47f922cc5718ae9f2e06461a517aa4a7d1
}
