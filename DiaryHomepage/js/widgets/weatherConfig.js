// 天气类组件（每小时/单日/一周）共用的配置：当前选中的城市（经纬度）
// 和温度单位，存在同一个 localStorage key 下面，所以换一个城市，
// 所有天气组件都会一起跟着更新，不用每个组件单独设置一次。
// Shared configuration for the weather widgets (hour/day/week): the
// currently selected city (lat/lon) and temperature unit, stored under
// one shared localStorage key — so changing the city updates every
// weather widget together, instead of needing to set it separately per
// widget.

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

// 内置的城市列表，给"选择城市"下拉框用；每个城市配一组固定的经纬度，
// 用来向天气 API 请求这个城市的天气数据。
// The built-in city list used by the "select city" dropdown; each city
// has a fixed lat/lon pair, used to request that city's weather data from
// the weather API.

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

// 把天气 API 返回的"天气代码"（一个数字）转换成对应的表情符号。
// 这些数字区间是 Open-Meteo 天气 API 的标准 WMO 天气代码规范——
// 数字越界代表天气现象越"重"（比如 0 是晴天，99 是雷暴）。
// Converts the "weather code" (a number) returned by the weather API into
// a matching emoji. These number ranges follow the Open-Meteo weather
// API's standard WMO weather code convention — higher numbers represent
// more severe weather (e.g. 0 is clear sky, 99 is a thunderstorm).

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
