document.addEventListener("DOMContentLoaded", function() {

    let upload = document.getElementById("uploadImg");
    let canvas = document.getElementById("canvas");

    upload.addEventListener("change", function(e) {
        let file = e.target.files[0];
        if (!file) return;

        let url = URL.createObjectURL(file);

        // =========================
        // ⭐ 创建图片
        // =========================
        let img = document.createElement("img");
        img.src = url;
        img.style.width = "120px";
        img.style.position = "absolute";
        img.style.left = "0px";
        img.style.top = "0px";
        img.style.willChange = "transform";

        canvas.appendChild(img);

        // =========================
        // ⭐ 创建旋转按钮（在canvas上）
        // =========================
        let rotateBtn = document.createElement("div");
        rotateBtn.innerHTML = "⟳";

        rotateBtn.style.position = "absolute";
        rotateBtn.style.cursor = "grab";
        rotateBtn.style.background = "white";
        rotateBtn.style.border = "1px solid black";
        rotateBtn.style.borderRadius = "50%";
        rotateBtn.style.padding = "5px";
        rotateBtn.style.zIndex = "999";

        canvas.appendChild(rotateBtn);

        rotateBtn.style.display = "none";

        // =========================
        // ⭐ 更新按钮位置
        // =========================
        function updateRotateBtn() {
            let imgRect = img.getBoundingClientRect();
            let canvasRect = canvas.getBoundingClientRect();

            let left = imgRect.left - canvasRect.left + imgRect.width / 2;
            let top = imgRect.top - canvasRect.top - 25;

            rotateBtn.style.left = left + "px";
            rotateBtn.style.top = top + "px";
        }

        // =========================
        // ⭐ 双击显示按钮
        // =========================
        img.addEventListener("dblclick", function() {
            rotateBtn.style.display = "block";
            updateRotateBtn();
        });

        // =========================
        // ⭐ 拖按钮旋转
        // =========================
        interact(rotateBtn).draggable({
            listeners: {
                move(event) {
                    let rect = img.getBoundingClientRect();

                    let centerX = rect.left + rect.width / 2;
                    let centerY = rect.top + rect.height / 2;

                    let mouseX = event.client.x;
                    let mouseY = event.client.y;

                    let angle = Math.atan2(
                        mouseY - centerY,
                        mouseX - centerX
                    ) * (180 / Math.PI);

                    img.style.transform = "rotate(" + angle + "deg)";
                }
            }
        });

        // =========================
        // ⭐ 拖动（防越界）
        // =========================
        interact(img)
            .draggable({
                listeners: {
                    move(event) {
                        let target = event.target;

                        let left = (parseFloat(target.style.left) || 0) + event.dx;
                        let top = (parseFloat(target.style.top) || 0) + event.dy;

                        target.style.left = left + "px";
                        target.style.top = top + "px";

                        // ⭐ 真实边界限制（含旋转）
                        let imgRect = target.getBoundingClientRect();
                        let canvasRect = canvas.getBoundingClientRect();

                        if (imgRect.left < canvasRect.left) {
                            target.style.left = (left + (canvasRect.left - imgRect.left)) + "px";
                        }

                        if (imgRect.top < canvasRect.top) {
                            target.style.top = (top + (canvasRect.top - imgRect.top)) + "px";
                        }

                        if (imgRect.right > canvasRect.right) {
                            target.style.left = (left - (imgRect.right - canvasRect.right)) + "px";
                        }

                        if (imgRect.bottom > canvasRect.bottom) {
                            target.style.top = (top - (imgRect.bottom - canvasRect.bottom)) + "px";
                        }

                        updateRotateBtn();
                    }
                }
            })

        // =========================
        // ⭐ resize
        // =========================
        .resizable({
            edges: { left: true, right: true, bottom: true, top: true },

            listeners: {
                move(event) {
                    let target = event.target;

                    let width = event.rect.width;
                    let height = event.rect.height;

                    target.style.width = width + "px";
                    target.style.height = height + "px";

                    let left = (parseFloat(target.style.left) || 0) + event.deltaRect.left;
                    let top = (parseFloat(target.style.top) || 0) + event.deltaRect.top;

                    target.style.left = left + "px";
                    target.style.top = top + "px";

                    updateRotateBtn();
                }
            }
        });

    });

});