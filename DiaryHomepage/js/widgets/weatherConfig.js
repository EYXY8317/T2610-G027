const STORAGE_KEY = "weather-config";

const DEFAULT_CONFIG = {
    latitude: 3.03,
    longitude: 101.75,
    cityName: "Kuala Lumpur",
    tempUnit: "celsius"
};

function getConfig() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        return { ...DEFAULT_CONFIG };
    }
    try {
        return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    }
    catch {
        return { ...DEFAULT_CONFIG };
    }
}

function saveConfig(partial) {
    const config = { ...getConfig(), ...partial };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return config;
}

export function getWeatherConfig() {
    return getConfig();
}

export function setWeatherCity(cityName, latitude, longitude) {
    return saveConfig({ cityName, latitude, longitude });
}

export function setTempUnit(unit) {
    return saveConfig({ tempUnit: unit });
}

export function toDisplayTemp(celsius, unit) {
    if (unit === "fahrenheit") {
        return Math.round(celsius * 9 / 5 + 32) + "°F";
    }
    return Math.round(celsius) + "°C";
}

const CITIES = [
    { name: "Kuala Lumpur", lat: 3.03, lon: 101.75 },
    { name: "Singapore", lat: 1.29, lon: 103.85 },
    { name: "Bangkok", lat: 13.75, lon: 100.52 },
    { name: "Jakarta", lat: -6.21, lon: 106.85 },
    { name: "Manila", lat: 14.60, lon: 120.98 },
    { name: "Taipei", lat: 25.05, lon: 121.53 },
    { name: "Tokyo", lat: 35.69, lon: 139.69 },
    { name: "Seoul", lat: 37.57, lon: 126.98 },
    { name: "Shanghai", lat: 31.23, lon: 121.47 },
    { name: "Beijing", lat: 39.91, lon: 116.39 },
    { name: "Hong Kong", lat: 22.33, lon: 114.17 },
    { name: "London", lat: 51.51, lon: -0.13 },
    { name: "Paris", lat: 48.85, lon: 2.35 },
    { name: "Berlin", lat: 52.52, lon: 13.40 },
    { name: "New York", lat: 40.71, lon: -74.01 },
    { name: "Los Angeles", lat: 34.05, lon: -118.24 },
    { name: "Sydney", lat: -33.87, lon: 151.21 },
    { name: "Dubai", lat: 25.20, lon: 55.27 }
];

export function getCityList() {
    return CITIES;
}

export function getWeatherIconEmoji(code) {
    if (code === 0) return "☀️";
    if (code <= 2) return "🌤️";
    if (code <= 3) return "☁️";
    if (code <= 48) return "🌫️";
    if (code <= 57) return "🌧️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    if (code <= 82) return "🌦️";
    if (code <= 86) return "🌨️";
    if (code <= 99) return "⛈️";
    return "🌡️";
}
