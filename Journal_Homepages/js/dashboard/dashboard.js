import {
    createWeatherWeek
}
from "../widgets/weather/weatherWeek.js";

import {
    createWeatherDay
}
from "../widgets/weather/weatherDay.js";

import {
    CARDS
}
from "./config/cardRegistry.js";

const dashboard =
    document.getElementById(
        "dashboard"
    );

CARDS.forEach(

    async (cardData) => {

        const card =
            document.createElement(
                "div"
            );

        card.classList.add(
            "card"
        );

        card.dataset.id =
            cardData.id;

        if (
            cardData.id ===
            "weatherWeek"
        ) {

            card.innerHTML =
                await createWeatherWeek();

        }

        if (
            cardData.id ===
            "weatherDay"
        ) {

            card.innerHTML =
                await createWeatherDay();

        }

        dashboard.appendChild(
            card
        );

    }

);