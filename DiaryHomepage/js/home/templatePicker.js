// "布局模板"选择弹窗——展示几套预设好的首页布局主题（配色 + 排版），
// 用户点 Apply 之后先弹出二次确认（因为会替换掉当前的组件排列/外观
// 设置），确认后才真正套用模板、同步到服务器、并刷新页面让新布局
// 生效。
// The "layout templates" picker popup — shows a few preset home-page
// layout themes (color palette + arrangement). Clicking Apply first shows
// a confirmation (since it replaces the current widget arrangement/
// appearance settings), and only after confirming does it actually apply
// the template, sync it to the server, and reload the page for the new
// layout to take effect.

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
