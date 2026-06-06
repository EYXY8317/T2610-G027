import {
    initializeHomepage
}
from "./homepage/index.js";

console.clear();

console.log(
    "Journal Homepage Loaded"
);

document.addEventListener(
    "DOMContentLoaded",
    initializeHomepage
);