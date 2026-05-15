const paper = document.querySelector("#paper");

/* ================= CARD DATA ================= */

const cardsData = [

    {
        id: "card1",
        title: "Weather",
        x: 100,
        y: 100
    },

    {
        id: "card2",
        title: "Quote",
        x: 450,
        y: 100
    },

    {
        id: "card3",
        title: "Study",
        x: 100,
        y: 350
    }

];

/* ================= CREATE CARD ================= */

cardsData.forEach(data => {

    createCard(data);

});

/* ================= FUNCTION ================= */

function createCard(data) {

    const card = document.createElement("div");

    card.classList.add("card");

    card.id = data.id;

    card.style.left = data.x + "px";

    card.style.top = data.y + "px";

    card.innerHTML = `

        ${data.title}

        <div class="resize-handle"></div>

    `;

    paper.appendChild(card);

}