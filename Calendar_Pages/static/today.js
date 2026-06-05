// =====================================
// TODAY DATE
// =====================================

function loadTodayDate() {

    const now = new Date();

    const options = {

        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"

    };

    document.getElementById("date").textContent =
        now.toLocaleDateString("en-US", options);

}