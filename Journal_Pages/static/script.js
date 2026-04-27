const box = document.getElementById("diaryBox");

// 🔥 get id
let currentId = box.dataset.id || null;

let timeout = null;

box.addEventListener("input", function () {

    clearTimeout(timeout);

    timeout = setTimeout(function () {

        fetch("/autosave", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: currentId,
                content: box.value
            })
        })

        .then(res => res.text())
        .then(data => {

            // 🔥 first time save
            if (!currentId && data) {
                currentId = data;
                box.dataset.id = data;
            }
        });

    }, 2000);
});

document.getElementById("editBtn").onclick = () => {
    box.removeAttribute("readonly");
};