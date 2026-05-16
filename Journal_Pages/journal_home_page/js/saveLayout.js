const cards = document.querySelectorAll(".card");

/* ================= SAVE ================= */

export function saveLayout() {

    const layout = [];

    cards.forEach(card => {

        layout.push({

            id: card.id,

            left: card.style.left,

            top: card.style.top,

            width: card.style.width,

            height: card.style.height

        });

    });

    localStorage.setItem(
        "workspace-layout",
        JSON.stringify(layout)
    );

}

/* ================= LOAD ================= */

export function loadLayout() {

    const savedLayout =
        localStorage.getItem("workspace-layout");

    if (!savedLayout) return;

    const layout =
        JSON.parse(savedLayout);

    layout.forEach(savedCard => {

        const card =
            document.querySelector(
                "#" + savedCard.id
            );

        if (!card) return;

        card.style.left =
            savedCard.left;

        card.style.top =
            savedCard.top;

        card.style.width =
            savedCard.width;

        card.style.height =
            savedCard.height;

    });

}