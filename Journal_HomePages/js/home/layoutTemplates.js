// Reference coordinate system: 1000 wide × 800 tall.
// applyTemplate() scales these to the actual viewport at apply time,
// so templates always fit on screen regardless of resolution.
//
// Grid gap in reference units = 14  (scales proportionally)
// Outer margin in reference units = 0 (handled by 16px pixel margin in applyTemplate)

const TEMPLATES = [

    // ── 1. COZY DASHBOARD ────────────────────────────────────────────────────
    // All 11 widgets · 4 rows · matches screenshot layout
    //   Row 1  y=0    h=240   Diary(30%) + Clock(70%)
    //   Row 2  y=254  h=165   Today Emotion + Emotion Summary + Quote  (equal thirds)
    //   Row 3  y=433  h=195   Weather Now(16%) + Hours(37%) + Week(45%)
    //   Row 4  y=642  h=158   3 Streaks (equal thirds)                 end=800 ✓
    {
        id:      "cozy-dashboard",
        name:    "Cozy Dashboard",
        desc:    "Warm browns — all cards on screen",
        palette: ["#3d2212","#faf6f0","#ffffff","#2a1a0e","#4a2c1a","#d4b896"],
        hidden:  [],
        widgets: [
            { id:"diary-card-widget",      x:0,   y:0,   w:300, h:240,
              ap:{ backgroundColor:"#3d2212", backgroundOpacity:100, showTitle:false, showBorder:false, contentColor:"#f5f3ef", titleColor:"#f5f3ef", borderColor:"#3d2212" } },
            { id:"digital-clock-widget",   x:314, y:0,   w:686, h:240,
              ap:{ backgroundColor:"#faf6f0", backgroundOpacity:100, showTitle:false, showBorder:false, contentColor:"#2a1a0e", titleColor:"#2a1a0e" } },

            { id:"today-emotion-widget",   x:0,   y:254, w:324, h:165,
              ap:{ backgroundColor:"#ffffff", backgroundOpacity:100, showTitle:true, showBorder:true, contentColor:"#1a1a1a", titleColor:"#1a1a1a", borderColor:"#ddd8cf" } },
            { id:"emotion-summary-widget", x:338, y:254, w:324, h:165,
              ap:{ backgroundColor:"#ffffff", backgroundOpacity:100, showTitle:true, showBorder:true, contentColor:"#1a1a1a", titleColor:"#1a1a1a", borderColor:"#ddd8cf" } },
            { id:"quote-widget",           x:676, y:254, w:324, h:165,
              ap:{ backgroundColor:"#f5f3ef", backgroundOpacity:100, showTitle:false, showBorder:false, contentColor:"#1a1a1a", titleColor:"#888888" } },

            { id:"weather-day-widget",     x:0,   y:433, w:160, h:195,
              ap:{ backgroundColor:"#fffbee", backgroundOpacity:100, showTitle:true, showBorder:true, contentColor:"#1a1a1a", titleColor:"#1a1a1a", borderColor:"#e8dfc0" } },
            { id:"weather-hour-widget",    x:174, y:433, w:366, h:195,
              ap:{ backgroundColor:"#f5f3ef", backgroundOpacity:100, showTitle:true, showBorder:false, contentColor:"#555555", titleColor:"#888888" } },
            { id:"weather-week-widget",    x:554, y:433, w:446, h:195,
              ap:{ backgroundColor:"#ffffff", backgroundOpacity:100, showTitle:true, showBorder:true, contentColor:"#1a1a1a", titleColor:"#1a1a1a", borderColor:"#ddd8cf" } },

            { id:"now-streak-widget",      x:0,   y:642, w:324, h:158,
              ap:{ backgroundColor:"#2a1a0e", backgroundOpacity:100, showTitle:true, showBorder:false, contentColor:"#f5f3ef", titleColor:"#f5f3ef" } },
            { id:"high-streak-widget",     x:338, y:642, w:324, h:158,
              ap:{ backgroundColor:"#4a2c1a", backgroundOpacity:100, showTitle:true, showBorder:false, contentColor:"#f5f3ef", titleColor:"#f5f3ef" } },
            { id:"picture-streak-widget",  x:676, y:642, w:324, h:158,
              ap:{ backgroundColor:"#d4b896", backgroundOpacity:0, showTitle:true, showBorder:false, contentColor:"#ffffff", titleColor:"#ffffff" } },
        ]
    },


    // ── 2. MINIMAL BLACK ─────────────────────────────────────────────────────
    // 3 rows · bold contrast · 6 widgets only
    //   Row 1  y=0    h=270   Clock (full width)
    //   Row 2  y=284  h=325   Diary + Quote
    //   Row 3  y=623  h=177   3 Streaks                            end=800 ✓
    {
        id:      "minimal-black",
        name:    "Minimal Black",
        desc:    "Bold contrast — just the essentials",
        palette: ["#1a1a1a","#1a1a1a","#1a1a1a","#F2EFE9","#444","#888"],
        hidden:  ["weather-day-widget","weather-hour-widget","weather-week-widget",
                  "today-emotion-widget","emotion-summary-widget"],
        widgets: [
            { id:"digital-clock-widget",   x:0,   y:0,   w:1000, h:270,
              ap:{ backgroundColor:"#F2EFE9", backgroundOpacity:0, showTitle:false, showBorder:false, contentColor:"#1a1a1a", titleColor:"#1a1a1a" } },

            { id:"diary-card-widget",      x:0,   y:284, w:486,  h:325,
              ap:{ backgroundColor:"#1a1a1a", backgroundOpacity:100, showTitle:false, showBorder:false, contentColor:"#F2EFE9", titleColor:"#F2EFE9" } },
            { id:"quote-widget",           x:500, y:284, w:500,  h:325,
              ap:{ backgroundColor:"#1a1a1a", backgroundOpacity:100, showTitle:false, showBorder:false, contentColor:"#c9c9c9", titleColor:"#888888" } },

            { id:"now-streak-widget",      x:0,   y:623, w:322,  h:177,
              ap:{ backgroundColor:"#1a1a1a", backgroundOpacity:100, showTitle:true, showBorder:false, contentColor:"#F2EFE9", titleColor:"#888888" } },
            { id:"high-streak-widget",     x:336, y:623, w:322,  h:177,
              ap:{ backgroundColor:"#1a1a1a", backgroundOpacity:100, showTitle:true, showBorder:false, contentColor:"#F2EFE9", titleColor:"#888888" } },
            { id:"picture-streak-widget",  x:672, y:623, w:328,  h:177,
              ap:{ backgroundColor:"#1a1a1a", backgroundOpacity:100, showTitle:true, showBorder:false, contentColor:"#F2EFE9", titleColor:"#888888" } },

            // parked hidden (out of visible area — still saved for when re-added)
            { id:"today-emotion-widget",   x:0,   y:0,   w:278, h:195,
              ap:{ backgroundColor:"#ffffff", backgroundOpacity:100, showTitle:true, showBorder:true, contentColor:"#1a1a1a", titleColor:"#1a1a1a", borderColor:"#ddd8cf" } },
            { id:"emotion-summary-widget", x:292, y:0,   w:278, h:195,
              ap:{ backgroundColor:"#ffffff", backgroundOpacity:100, showTitle:true, showBorder:true, contentColor:"#1a1a1a", titleColor:"#1a1a1a", borderColor:"#ddd8cf" } },
            { id:"weather-day-widget",     x:0,   y:0,   w:163, h:188,
              ap:{ backgroundColor:"#fffbee", backgroundOpacity:100, showTitle:true, showBorder:true, contentColor:"#1a1a1a", titleColor:"#1a1a1a", borderColor:"#e8dfc0" } },
            { id:"weather-hour-widget",    x:177, y:0,   w:393, h:188,
              ap:{ backgroundColor:"#f5f3ef", backgroundOpacity:100, showTitle:true, showBorder:false, contentColor:"#555555", titleColor:"#888888" } },
            { id:"weather-week-widget",    x:584, y:0,   w:416, h:188,
              ap:{ backgroundColor:"#ffffff", backgroundOpacity:100, showTitle:true, showBorder:true, contentColor:"#1a1a1a", titleColor:"#1a1a1a", borderColor:"#ddd8cf" } },
        ]
    },


    // ── 3. CUTE ───────────────────────────────────────────────────────────────
    // 3 rows · soft pastel palette · 8 widgets
    //   Row 1  y=0    h=240   Clock + Today Emotion
    //   Row 2  y=254  h=355   Diary + Picture Streak + Quote
    //   Row 3  y=623  h=177   Now Streak + High Streak + Weather Now   end=800 ✓
    {
        id:      "cute",
        name:    "Cute",
        desc:    "Pastel palette, playful & light",
        palette: ["#e8f5fd","#fce8ef","#ede7f6","#fffde7","#e8f5e9","#ffebee"],
        hidden:  ["weather-hour-widget","weather-week-widget","emotion-summary-widget"],
        widgets: [
            { id:"digital-clock-widget",   x:0,   y:0,   w:486, h:240,
              ap:{ backgroundColor:"#e8f5fd", backgroundOpacity:100, showTitle:false, showBorder:false, contentColor:"#1a5276", titleColor:"#1a5276" } },
            { id:"today-emotion-widget",   x:500, y:0,   w:500, h:240,
              ap:{ backgroundColor:"#fce8ef", backgroundOpacity:100, showTitle:true, showBorder:true, contentColor:"#880e4f", titleColor:"#ad1457", borderColor:"#f8bbd0" } },

            { id:"diary-card-widget",      x:0,   y:254, w:308, h:355,
              ap:{ backgroundColor:"#ede7f6", backgroundOpacity:100, showTitle:false, showBorder:false, contentColor:"#4a148c", titleColor:"#7b1fa2" } },
            { id:"picture-streak-widget",  x:322, y:254, w:308, h:355,
              ap:{ backgroundColor:"#fffde7", backgroundOpacity:100, showTitle:true, showBorder:false, contentColor:"#f57f17", titleColor:"#f9a825" } },
            { id:"quote-widget",           x:644, y:254, w:356, h:355,
              ap:{ backgroundColor:"#e8f5e9", backgroundOpacity:100, showTitle:false, showBorder:false, contentColor:"#1b5e20", titleColor:"#388e3c" } },

            { id:"now-streak-widget",      x:0,   y:623, w:308, h:177,
              ap:{ backgroundColor:"#ffebee", backgroundOpacity:100, showTitle:true, showBorder:false, contentColor:"#b71c1c", titleColor:"#e53935" } },
            { id:"high-streak-widget",     x:322, y:623, w:308, h:177,
              ap:{ backgroundColor:"#fffde7", backgroundOpacity:100, showTitle:true, showBorder:false, contentColor:"#e65100", titleColor:"#fb8c00" } },
            { id:"weather-day-widget",     x:644, y:623, w:356, h:177,
              ap:{ backgroundColor:"#e3f2fd", backgroundOpacity:100, showTitle:true, showBorder:true, contentColor:"#0d47a1", titleColor:"#1565c0", borderColor:"#90caf9" } },

            // parked hidden
            { id:"weather-hour-widget",    x:0,   y:0,   w:393, h:188,
              ap:{ backgroundColor:"#f5f3ef", backgroundOpacity:100, showTitle:true, showBorder:false, contentColor:"#555555", titleColor:"#888888" } },
            { id:"weather-week-widget",    x:407, y:0,   w:593, h:188,
              ap:{ backgroundColor:"#ffffff", backgroundOpacity:100, showTitle:true, showBorder:true, contentColor:"#1a1a1a", titleColor:"#1a1a1a", borderColor:"#ddd8cf" } },
            { id:"emotion-summary-widget", x:0,   y:0,   w:278, h:195,
              ap:{ backgroundColor:"#ffffff", backgroundOpacity:100, showTitle:true, showBorder:true, contentColor:"#1a1a1a", titleColor:"#1a1a1a", borderColor:"#ddd8cf" } },
        ]
    },


    // ── 4. SUMMARY FOCUS ─────────────────────────────────────────────────────
    // Emotion Summary is the hero (wide + tall)
    //   Row 1  y=0    h=172   Clock (full width)
    //   Row 2  y=186  h=462   Today Emotion (narrow) + Emotion Summary (wide) + Quote
    //   Row 3  y=662  h=138   3 Streaks                            end=800 ✓
    {
        id:      "summary-focus",
        name:    "Summary Focus",
        desc:    "Emotion Summary takes centre stage",
        palette: ["#F2EFE9","#ffffff","#1a1a1a","#888888","#ddd8cf","#f5f3ef"],
        hidden:  ["weather-day-widget","weather-hour-widget","weather-week-widget","diary-card-widget"],
        widgets: [
            { id:"digital-clock-widget",   x:0,   y:0,   w:1000, h:172,
              ap:{ backgroundColor:"#F2EFE9", backgroundOpacity:0, showTitle:false, showBorder:false, contentColor:"#1a1a1a", titleColor:"#1a1a1a" } },

            { id:"today-emotion-widget",   x:0,   y:186, w:200,  h:462,
              ap:{ backgroundColor:"#ffffff", backgroundOpacity:100, showTitle:true, showBorder:true, contentColor:"#1a1a1a", titleColor:"#1a1a1a", borderColor:"#ddd8cf" } },
            { id:"emotion-summary-widget", x:214, y:186, w:593,  h:462,
              ap:{ backgroundColor:"#ffffff", backgroundOpacity:100, showTitle:true, showBorder:true, contentColor:"#1a1a1a", titleColor:"#1a1a1a", borderColor:"#ddd8cf" } },
            { id:"quote-widget",           x:821, y:186, w:179,  h:462,
              ap:{ backgroundColor:"#f5f3ef", backgroundOpacity:100, showTitle:false, showBorder:false, contentColor:"#555555", titleColor:"#888888" } },

            { id:"now-streak-widget",      x:0,   y:662, w:322,  h:138,
              ap:{ backgroundColor:"#1a1a1a", backgroundOpacity:100, showTitle:true, showBorder:false, contentColor:"#F2EFE9", titleColor:"#888888" } },
            { id:"high-streak-widget",     x:336, y:662, w:322,  h:138,
              ap:{ backgroundColor:"#f5f3ef", backgroundOpacity:100, showTitle:true, showBorder:true, contentColor:"#1a1a1a", titleColor:"#888888", borderColor:"#ddd8cf" } },
            { id:"picture-streak-widget",  x:672, y:662, w:328,  h:138,
              ap:{ backgroundColor:"#f5f3ef", backgroundOpacity:100, showTitle:true, showBorder:true, contentColor:"#1a1a1a", titleColor:"#888888", borderColor:"#ddd8cf" } },

            // parked hidden
            { id:"diary-card-widget",      x:0,   y:0,   w:278, h:215,
              ap:{ backgroundColor:"#3d2212", backgroundOpacity:100, showTitle:false, showBorder:false, contentColor:"#f5f3ef", titleColor:"#f5f3ef" } },
            { id:"weather-day-widget",     x:0,   y:0,   w:163, h:188,
              ap:{ backgroundColor:"#fffbee", backgroundOpacity:100, showTitle:true, showBorder:true, contentColor:"#1a1a1a", titleColor:"#1a1a1a", borderColor:"#e8dfc0" } },
            { id:"weather-hour-widget",    x:177, y:0,   w:393, h:188,
              ap:{ backgroundColor:"#f5f3ef", backgroundOpacity:100, showTitle:true, showBorder:false, contentColor:"#555555", titleColor:"#888888" } },
            { id:"weather-week-widget",    x:584, y:0,   w:416, h:188,
              ap:{ backgroundColor:"#ffffff", backgroundOpacity:100, showTitle:true, showBorder:true, contentColor:"#1a1a1a", titleColor:"#1a1a1a", borderColor:"#ddd8cf" } },
        ]
    },


    // ── 5. MAGAZINE ──────────────────────────────────────────────────────────
    // Editorial columns — clean breathing room
    //   Row 1  y=0    h=130   Clock (thin strip, borderless)
    //   Row 2  y=144  h=450   Diary + Weather Week + Emotion Summary
    //   Row 3  y=608  h=192   Today Emotion + 2 Streaks + Weather Hours + Quote  end=800 ✓
    {
        id:      "magazine",
        name:    "Magazine",
        desc:    "Editorial columns — wide & clean",
        palette: ["#F2EFE9","#1a1a1a","#ffffff","#faf6f0","#f5f3ef","#888888"],
        hidden:  ["weather-day-widget","picture-streak-widget"],
        widgets: [
            { id:"digital-clock-widget",   x:0,   y:0,   w:1000, h:130,
              ap:{ backgroundColor:"#F2EFE9", backgroundOpacity:0, showTitle:false, showBorder:false, contentColor:"#1a1a1a", titleColor:"#1a1a1a" } },

            { id:"diary-card-widget",      x:0,   y:144, w:307,  h:450,
              ap:{ backgroundColor:"#1a1a1a", backgroundOpacity:100, showTitle:false, showBorder:false, contentColor:"#F2EFE9", titleColor:"#F2EFE9" } },
            { id:"weather-week-widget",    x:321, y:144, w:307,  h:450,
              ap:{ backgroundColor:"#ffffff", backgroundOpacity:100, showTitle:true, showBorder:true, contentColor:"#1a1a1a", titleColor:"#1a1a1a", borderColor:"#ddd8cf" } },
            { id:"emotion-summary-widget", x:642, y:144, w:358,  h:450,
              ap:{ backgroundColor:"#faf6f0", backgroundOpacity:100, showTitle:true, showBorder:false, contentColor:"#555555", titleColor:"#aaaaaa" } },

            { id:"today-emotion-widget",   x:0,   y:608, w:135,  h:192,
              ap:{ backgroundColor:"#ffffff", backgroundOpacity:100, showTitle:true, showBorder:true, contentColor:"#1a1a1a", titleColor:"#aaaaaa", borderColor:"#ddd8cf" } },
            { id:"now-streak-widget",      x:149, y:608, w:135,  h:192,
              ap:{ backgroundColor:"#1a1a1a", backgroundOpacity:100, showTitle:true, showBorder:false, contentColor:"#F2EFE9", titleColor:"#888888" } },
            { id:"high-streak-widget",     x:298, y:608, w:135,  h:192,
              ap:{ backgroundColor:"#f5f3ef", backgroundOpacity:100, showTitle:true, showBorder:true, contentColor:"#1a1a1a", titleColor:"#aaaaaa", borderColor:"#ddd8cf" } },
            { id:"weather-hour-widget",    x:447, y:608, w:349,  h:192,
              ap:{ backgroundColor:"#f5f3ef", backgroundOpacity:100, showTitle:true, showBorder:false, contentColor:"#555555", titleColor:"#aaaaaa" } },
            { id:"quote-widget",           x:810, y:608, w:190,  h:192,
              ap:{ backgroundColor:"#F2EFE9", backgroundOpacity:100, showTitle:false, showBorder:false, contentColor:"#888888", titleColor:"#888888" } },

            // parked hidden
            { id:"weather-day-widget",     x:0,   y:0,   w:163, h:188,
              ap:{ backgroundColor:"#fffbee", backgroundOpacity:100, showTitle:true, showBorder:true, contentColor:"#1a1a1a", titleColor:"#1a1a1a", borderColor:"#e8dfc0" } },
            { id:"picture-streak-widget",  x:177, y:0,   w:307, h:188,
              ap:{ backgroundColor:"#4a2c1a", backgroundOpacity:100, showTitle:true, showBorder:false, contentColor:"#f5f3ef", titleColor:"#f5f3ef" } },
        ]
    },

];


// ── Apply ──────────────────────────────────────────────────────────────────────
// Scales the 1000×800 reference grid to the actual viewport at call time.

export { TEMPLATES };

export function applyTemplate(templateId) {
    const navH   = document.querySelector(".navbar")?.offsetHeight || 80;
    const availW = window.innerWidth  - 32;          // 16px margin each side
    const availH = window.innerHeight - navH - 32;   // 16px top + 16px bottom
    const scaleX = availW / 1000;
    const scaleY = availH / 800;

    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    template.widgets.forEach(({ id, x, y, w, h, ap }) => {
        const layout = {
            left:   Math.round(16 + x * scaleX) + "px",
            top:    Math.round(navH + 16 + y * scaleY) + "px",
            width:  Math.round(w  * scaleX) + "px",
            height: Math.round(h  * scaleY) + "px",
        };
        localStorage.setItem(`${id}-layout`,     JSON.stringify(layout));
        if (ap) localStorage.setItem(`${id}-appearance`, JSON.stringify(ap));
    });

    localStorage.setItem("hidden-widgets", JSON.stringify(template.hidden || []));
}
