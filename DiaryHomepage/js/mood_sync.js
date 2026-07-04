import { userScopedKey } from "./currentUser.js";

// 全站共用的"五种心情"清单：每一项有内部用的值（value）、表情符号
// （emoji）、显示用的中文标签（label）、给鼠标悬停提示用的英文标题
// （title）、以及对应的图片路径（image）。Today Emotion 组件、
// Emotion Summary 组件、日记页面的心情选择器都从这里读取同一份清单，
// 保证整个网站的心情种类和顺序永远一致。
// The shared list of the five moods used site-wide: each entry has an
// internal value, an emoji, a Chinese display label, an English title
// (for mouse hover tooltips), and a matching image path. The Today
// Emotion widget, Emotion Summary widget, and the diary page's mood
// picker all read from this same list, guaranteeing the set of moods and
// their order stays consistent across the whole site.

export const MOOD_LIST = [
    { value: 'happy',   emoji: '😄', label: '开心',   title: 'Happy',   image: '/diary_home_static/assets/emotions/happy.png' },
    { value: 'sad',     emoji: '😢', label: '伤心',   title: 'Sad',     image: '/diary_home_static/assets/emotions/sad.png' },
    { value: 'angry',   emoji: '😠', label: '生气',   title: 'Angry',   image: '/diary_home_static/assets/emotions/angry.png' },
    { value: 'anxious', emoji: '😰', label: '焦虑',   title: 'Anxious', image: '/diary_home_static/assets/emotions/anxious.png' },
    { value: 'unwell',  emoji: '🤢', label: '不舒服', title: 'Unwell',  image: '/diary_home_static/assets/emotions/unwell.png' },
];

// "今天的心情锁"存的 key：一旦在日记页面选定今天的心情，就存在这里，
// Today Emotion 组件读到这个值以后，选择会被锁定，只能到日记页面改。
// The key used for "today's mood lock": once a mood is chosen on the
// diary page for today, it's stored here — once the Today Emotion widget
// reads this value, its selection becomes locked and can only be
// changed from the diary page.
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
