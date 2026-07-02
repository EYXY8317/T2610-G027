import { userScopedKey } from "../currentUser.js";

const STORAGE_KEY = "quote-state";

const SYSTEM_QUOTES = {
    time: [
        { text: "The two most powerful warriors are patience and time.", author: "Leo Tolstoy" },
        { text: "Time you enjoy wasting is not wasted time.", author: "Marthe Troly-Curtin" },
        { text: "Lost time is never found again.", author: "Benjamin Franklin" },
        { text: "Time is what we want most, but what we use worst.", author: "William Penn" },
        { text: "Better three hours too soon than a minute too late.", author: "Shakespeare" }
    ],
    self: [
        { text: "You yourself, as much as anybody in the entire universe, deserve your love.", author: "Buddha" },
        { text: "Love yourself first and everything else falls into line.", author: "Lucille Ball" },
        { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
        { text: "Owning our story and loving ourselves through that process is the bravest thing.", author: "Brené Brown" },
        { text: "To fall in love with yourself is the first secret to happiness.", author: "Robert Morley" }
    ],
    family: [
        { text: "Family is not an important thing. It's everything.", author: "Michael J. Fox" },
        { text: "The love of family is life's greatest blessing.", author: "Eva Burrows" },
        { text: "In family life, love is the oil that eases friction.", author: "Friedrich Nietzsche" },
        { text: "Family means no one gets left behind or forgotten.", author: "David Ogden Stiers" },
        { text: "Happiness is having a large, loving, caring family in another city.", author: "George Burns" }
    ],
    encouragement: [
        { text: "You are braver than you believe, stronger than you seem.", author: "A.A. Milne" },
        { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
        { text: "Keep going. Everything you need will come to you at the right time.", author: "Unknown" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" }
    ],
    inspiration: [
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
        { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
        { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
        { text: "Dream big and dare to fail.", author: "Norman Vaughan" }
    ]
};

const DEFAULT_STATE = {
    systemCategories: ["encouragement"],  // array — multiple categories allowed
    autoRotate: true,
    rotateDaily: true,
    showSources: ["system", "user"],      // array — "system" and/or "user"
    fontStyle: "serif",
    showAuthor: true,
    showSourceTag: true,
    savedQuotes: [],
    userQuotes: [],
    currentSource: "system",
    currentSystemIndex: 0,
    currentUserIndex: 0,
    lastRotateDate: "",
    textColor: "",
    authorColor: ""
};

function getState() {
    const raw = localStorage.getItem(userScopedKey(STORAGE_KEY));
    if (!raw) {
        return { ...DEFAULT_STATE };
    }
    try {
        const parsed = JSON.parse(raw);

        // Migrate old single-string state shapes
        if (parsed.systemCategory && !parsed.systemCategories) {
            parsed.systemCategories = [parsed.systemCategory];
            delete parsed.systemCategory;
        }
        if (parsed.showSource && !parsed.showSources) {
            parsed.showSources = parsed.showSource === "both" ? ["system", "user"]
                : parsed.showSource === "system" ? ["system"]
                : ["user"];
            delete parsed.showSource;
        }

        return { ...DEFAULT_STATE, ...parsed };
    }
    catch {
        return { ...DEFAULT_STATE };
    }
}

function saveState(partial) {
    const next = { ...getState(), ...partial };
    localStorage.setItem(userScopedKey(STORAGE_KEY), JSON.stringify(next));
    return next;
}

function todayKey() {
    return new Date().toISOString().slice(0, 10);
}

function getSystemPool(state) {
    const cats = state.systemCategories && state.systemCategories.length
        ? state.systemCategories
        : ["encouragement"];
    const pool = [];
    cats.forEach(cat => {
        const quotes = SYSTEM_QUOTES[cat] || [];
        pool.push(...quotes);
    });
    return pool.length ? pool : SYSTEM_QUOTES.encouragement;
}

function checkAutoRotate(state) {
    if (!state.autoRotate || !state.rotateDaily) {
        return state;
    }
    if (state.lastRotateDate === todayKey()) {
        return state;
    }

    const pool = getSystemPool(state);
    const nextIdx = (state.currentSystemIndex + 1) % pool.length;

    return saveState({
        currentSystemIndex: nextIdx,
        lastRotateDate: todayKey()
    });
}

function getCurrentQuote(state) {
    const sources = state.showSources || ["system", "user"];
    const showUser   = sources.includes("user");
    const showSystem = sources.includes("system");
    const hasUser = state.userQuotes.length > 0;

    let source;
    if (showSystem && showUser) {
        source = (state.currentSource === "user" && hasUser) ? "user" : "system";
    } else if (showUser && hasUser) {
        source = "user";
    } else {
        source = "system";
    }

    if (source === "user" && hasUser) {
        const q = state.userQuotes[state.currentUserIndex % state.userQuotes.length];
        return { ...q, source: "user" };
    }

    const pool = getSystemPool(state);
    const q = pool[state.currentSystemIndex % pool.length];
    return { ...q, source: "system" };
}

function isSaved(state, quote) {
    return state.savedQuotes.some(
        q => q.text === quote.text && q.author === quote.author
    );
}

const FONT_STYLES = {
    serif:   "Georgia, serif",
    sans:    "system-ui, sans-serif",
    italic:  "Georgia, serif",
    cursive: "cursive, Georgia"
};

function renderWidget(state) {

    const quote = getCurrentQuote(state);
    const saved = isSaved(state, quote);

    const fontFamily = FONT_STYLES[state.fontStyle] || FONT_STYLES.serif;
    const isItalic = state.fontStyle === "italic";

    const textColorStyle   = state.textColor   ? `color:${state.textColor};`              : "";
    const authorColorStyle = state.authorColor ? `color:${state.authorColor};opacity:1;` : "";

    const authorText = state.showAuthor !== false && quote.author
        ? `<span class="quote-author" style="${authorColorStyle}">— ${quote.author}</span>`
        : "";

    return `
        <div class="quote-body">
            <div class="quote-main">
                <div class="quote-text" style="font-family:${fontFamily};${isItalic ? "font-style:italic;" : ""}${textColorStyle}">${quote.text}</div>
                <div class="quote-author-row">
                    ${authorText}
                </div>
                ${state.showSourceTag !== false ? `<div class="quote-source-tag">${quote.source === "user" ? "My Quote" : "Daily Quote"}</div>` : ""}
            </div>
            <div class="quote-corner-actions">
                <button class="quote-save-btn${saved ? " saved" : ""}" title="${saved ? "Unsave" : "Save"}">${saved ? "★" : "☆"}</button>
                ${!state.autoRotate ? `<button class="quote-next-btn" title="Next quote">↻</button>` : ""}
            </div>
        </div>
    `;

}

function rerender(state) {
    const content = document.querySelector("#quote-widget .widget-content");
    if (!content) {
        return;
    }
    content.innerHTML = renderWidget(state);
}

function updateState(partial) {
    const next = saveState(partial);
    rerender(next);
    return next;
}

export function createQuoteWidget() {
    return `
        <div class="widget" id="quote-widget">
            <div class="drag-handle">
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
            </div>
            <div class="widget-header">
                <span>Quote</span>
            </div>
            <div class="widget-content">Loading...</div>
            <div class="resize-handle">↘</div>
        </div>
    `;
}

export function initializeQuote() {

    const widget = document.getElementById("quote-widget");
    if (!widget) {
        return;
    }

    let state = getState();
    state = checkAutoRotate(state);
    rerender(state);

    widget.addEventListener("click", event => {

        const saveBtn = event.target.closest(".quote-save-btn");
        const nextBtn = event.target.closest(".quote-next-btn");
        const cur = getState();

        if (saveBtn) {
            const quote = getCurrentQuote(cur);

            if (isSaved(cur, quote)) {
                updateState({
                    savedQuotes: cur.savedQuotes.filter(
                        q => !(q.text === quote.text && q.author === quote.author)
                    )
                });
            } else {
                updateState({
                    savedQuotes: [...cur.savedQuotes, { ...quote }]
                });
            }
        }

        if (nextBtn) {
            const pool = getSystemPool(cur);

            if (cur.currentSource === "user" && cur.userQuotes.length) {
                updateState({
                    currentUserIndex: (cur.currentUserIndex + 1) % cur.userQuotes.length
                });
            } else {
                updateState({
                    currentSystemIndex: (cur.currentSystemIndex + 1) % pool.length
                });
            }
        }

    });

}

export function getQuoteState() {
    return getState();
}

export function updateQuoteState(partial) {
    return updateState(partial);
}

export { SYSTEM_QUOTES };
