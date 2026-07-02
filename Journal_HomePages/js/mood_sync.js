import { userScopedKey } from "./currentUser.js";

export const MOOD_LIST = [
    { value: 'happy',   emoji: '😄', label: '开心',   image: '/journal_home_static/assets/emotions/happy.png' },
    { value: 'sad',     emoji: '😢', label: '伤心',   image: '/journal_home_static/assets/emotions/sad.png' },
    { value: 'angry',   emoji: '😠', label: '生气',   image: '/journal_home_static/assets/emotions/angry.png' },
    { value: 'anxious', emoji: '😰', label: '焦虑',   image: '/journal_home_static/assets/emotions/anxious.png' },
    { value: 'unwell',  emoji: '🤢', label: '不舒服', image: '/journal_home_static/assets/emotions/unwell.png' },
];

const MOOD_KEY = 'diary_mood_today';

export function getMood() {
    return localStorage.getItem(userScopedKey(MOOD_KEY)) || null;
}

export function saveMood(value) {
    localStorage.setItem(userScopedKey(MOOD_KEY), value);
}

export function clearMood() {
    localStorage.removeItem(userScopedKey(MOOD_KEY));
}
