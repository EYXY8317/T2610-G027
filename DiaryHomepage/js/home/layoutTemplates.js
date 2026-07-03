// Reference coordinate system: 1000 wide × 800 tall.
// applyTemplate() scales these to the actual viewport at apply time,
// so templates always fit on screen regardless of resolution.
//
// Grid gap in reference units = 14  (scales proportionally)
// Outer margin in reference units = 0 (handled by 16px pixel margin in applyTemplate)

const TEMPLATES = [

    // ── 1. COZY DASHBOARD ────────────────────────────────────────────────────
<<<<<<< HEAD
    // 10 visible widgets · main area (w=668) + right sidebar (x=672, w=328)
    //   Sidebar:  TodayEmotion · PictureStreak · DiaryCard  (stacked full height)
    //   Main R1:  Clock (full main width)
    //   Main R2:  Quote (left) + EmotionSummary (right, taller — free float)
    //   Main R3:  WeatherDay · WeatherHour · NowStreak · HighStreak      end≈800 ✓
=======
    // 11 visible widgets · main area (w=670) + right sidebar (x=674, w=326)
    //   Sidebar:  TodayEmotion · PictureStreak · DiaryCard  (stacked full height)
    //   Main R1:  Clock (full main width)
    //   Main R2:  Quote (left) + EmotionSummary (right)
    //   Main R3:  WeatherDay · WeatherHour (left) · NowStreak · HighStreak (right)
    //   Main R4:  WeatherWeek (left column)                            end≈654 ✓
>>>>>>> a857ae47f922cc5718ae9f2e06461a517aa4a7d1
    // Coordinates converted from ZOEY's saved home_layout in users.json.
    // Deco positions use xPct/yPct (fraction of widget pixel dims) + wPct (fraction of width)
    // so they scale correctly on any viewport size.
    {
        id:      "cozy-dashboard",
        name:    "Cozy Dashboard",
        desc:    "Warm browns — all cards on screen",
        palette: ["#4E3629","#FAF6EE","#F8F1E7","#EFE6D7","#7A5A3A","#D7C2A4"],
<<<<<<< HEAD
        hidden:  ["weather-week-widget"],
        // Deco stickers — positions as fraction of each widget's pixel dimensions at apply time.
        // xPct/yPct are fraction of widget pixel width/height; wPct is item width as fraction of widget width.
        // aspect = item h/w ratio (flower-babysbreath ≈ 1.37).
        // All positions are kept inside the widget bounds (overflow:hidden on .widget).
        deco: {
            "digital-clock-widget": [
                { id: "tpl-dcw-1", src: "/journal_home_static/assets/deco/flower-babysbreath.png",
                  xPct: 0.01, yPct: 0.01, wPct: 0.10, aspect: 1.37, rotation: -12, opacity: 0.88 },
                { id: "tpl-dcw-2", src: "/journal_home_static/assets/deco/flower-babysbreath.png",
                  xPct: 0.88, yPct: 0.01, wPct: 0.10, aspect: 1.37, rotation:  15, opacity: 0.88 },
            ],
            "today-emotion-widget": [
                { id: "tpl-tew-1", src: "/journal_home_static/assets/deco/flower-babysbreath.png",
                  xPct: 0.76, yPct: 0.01, wPct: 0.20, aspect: 1.37, rotation: 20, opacity: 0.82 },
=======
        hidden:  [],
        // Deco stickers — positions as fraction of each widget's pixel dimensions at apply time.
        // xPct/yPct are fraction of widget pixel width/height; wPct is item width as fraction of widget width.
        // aspect = item h/w ratio (flower-babysbreath ≈ 1.37; square images = 1.0).
        deco: {
            "digital-clock-widget": [
                { id: "tpl-dcw-1", src: "/journal_home_static/assets/deco/flower-babysbreath.png",
                  xPct: 0.004, yPct: 0.261, wPct: 0.10, aspect: 1.37, rotation: -12, opacity: 0.88 },
                { id: "tpl-dcw-2", src: "/journal_home_static/assets/deco/flower-babysbreath.png",
                  xPct: 0.880, yPct: 0.011, wPct: 0.10, aspect: 1.37, rotation:  15, opacity: 0.88 },
            ],
            "today-emotion-widget": [
                { id: "tpl-tew-1", src: "/journal_home_static/assets/deco/flower-cluster.png",
                  xPct: 0.708, yPct: -0.222, wPct: 0.205, aspect: 1.0, rotation: 210.5, opacity: 1 },
                { id: "tpl-tew-2", src: "/journal_home_static/assets/deco/flower-cluster.png",
                  xPct: 0.783, yPct: -0.133, wPct: 0.205, aspect: 1.0, rotation: 211.7, opacity: 1 },
            ],
            "weather-week-widget": [
                { id: "tpl-ww-1", src: "/journal_home_static/assets/deco/leaf-small.png",
                  xPct: 0.000, yPct: -0.100, wPct: 0.118, aspect: 1.0, rotation: 104.55, opacity: 1 },
                { id: "tpl-ww-2", src: "/journal_home_static/assets/deco/leaf-small.png",
                  xPct: -0.036, yPct: 0.300, wPct: 0.098, aspect: 1.0, rotation: 67.10, opacity: 1 },
                { id: "tpl-ww-3", src: "/journal_home_static/assets/deco/leaf-small.png",
                  xPct: 0.886, yPct: 0.500, wPct: 0.091, aspect: 1.0, rotation: -38.53, opacity: 1 },
            ],
            "now-streak-widget": [
                { id: "tpl-ns-1", src: "/journal_home_static/assets/deco/leaf-oval.png",
                  xPct: 0.643, yPct: 0.283, wPct: 0.388, aspect: 1.0, rotation: 0, opacity: 1 },
            ],
            "high-streak-widget": [
                { id: "tpl-hs-1", src: "/journal_home_static/assets/deco/leaf-small.png",
                  xPct: 0.636, yPct: -0.192, wPct: 0.354, aspect: 1.0, rotation: 198.24, opacity: 1 },
            ],
            "emotion-summary-widget": [
                { id: "tpl-es-1", src: "/journal_home_static/assets/deco/flower-4bloom.png",
                  xPct: 0.875, yPct: 0.755, wPct: 0.120, aspect: 1.0, rotation: 0, opacity: 1 },
            ],
            "quote-widget": [
                { id: "tpl-q-1", src: "/journal_home_static/assets/deco/flower-cluster.png",
                  xPct: 0.686, yPct: 0.379, wPct: 0.280, aspect: 1.0, rotation: 18.28, opacity: 1 },
            ],
            "diary-card-widget": [
                { id: "tpl-dc-1", src: "/journal_home_static/assets/deco/flower-bell.png",
                  xPct: 0.000, yPct: 0.597, wPct: 0.141, aspect: 1.0, rotation: 0, opacity: 1 },
                { id: "tpl-dc-2", src: "/journal_home_static/assets/deco/flower-babysbreath.png",
                  xPct: 0.824, yPct: -0.125, wPct: 0.205, aspect: 1.0, rotation: 225.66, opacity: 1 },
>>>>>>> a857ae47f922cc5718ae9f2e06461a517aa4a7d1
            ],
        },
        widgets: [
            // ── Right sidebar ──────────────────────────────────────────────────
<<<<<<< HEAD
            { id:"today-emotion-widget",   x:672, y:0,   w:328, h:202,
              ap:{ backgroundColor:"#FAF6EE", backgroundOpacity:100, showTitle:true,  showBorder:true,  contentColor:"#4e3629", titleColor:"#7A5A3A", borderColor:"#4e3629", borderWidth:2, titleAlign:"center", titleScale:"2", contentScale:"3" } },
            { id:"picture-streak-widget",  x:672, y:215, w:328, h:344,
              ap:{ backgroundColor:"#EFE6D7", backgroundOpacity:100, showTitle:false, showBorder:true,  contentColor:"#A67C52", titleColor:"#4E3629", borderColor:"#4e3629", borderWidth:2, titleAlign:"left",   titleScale:"3", contentScale:"3" } },
            { id:"diary-card-widget",      x:672, y:573, w:328, h:227,
              ap:{ backgroundColor:"#7A5A3A", backgroundOpacity:100, showTitle:false, showBorder:true,  contentColor:"#FAF6EE", titleColor:"#D7C2A4", borderColor:"#4e3629", borderWidth:2, titleAlign:"left",   titleScale:"3", contentScale:"3" } },

            // ── Main area ──────────────────────────────────────────────────────
            { id:"digital-clock-widget",   x:0,   y:0,   w:668, h:230,
              ap:{ backgroundColor:"#4E3629", backgroundOpacity:100, showTitle:false, showBorder:true,  contentColor:"#EFE6D7", titleColor:"#A67C52", borderColor:"#4e3629", borderWidth:2, titleAlign:"left",   titleScale:"3", contentScale:"1" } },

            { id:"quote-widget",           x:0,   y:244, w:288, h:344,
              ap:{ backgroundColor:"#FAF6EE", backgroundOpacity:100, showTitle:false, showBorder:true,  contentColor:"#000000", titleColor:"#7A5A3A", borderColor:"#4e3629", borderWidth:2, titleAlign:"left",   titleScale:"3", contentScale:"3" } },
            { id:"emotion-summary-widget", x:302, y:244, w:366, h:381,
              ap:{ backgroundColor:"#F8F1E7", backgroundOpacity:100, showTitle:true,  showBorder:true,  contentColor:"#B08968", titleColor:"#5C4033", borderColor:"#4e3629", borderWidth:2, titleAlign:"center", titleScale:"1", contentScale:"3" } },

            { id:"weather-day-widget",     x:0,   y:599, w:128, h:198,
              ap:{ backgroundColor:"#F8F1E7", backgroundOpacity:100, showTitle:false, showBorder:true,  contentColor:"#7a5a3a", titleColor:"#5C4033", borderColor:"#4e3629", borderWidth:2, titleAlign:"left",   titleScale:"3", contentScale:"2" } },
            { id:"weather-hour-widget",    x:141, y:599, w:152, h:202,
              ap:{ backgroundColor:"#F8F1E7", backgroundOpacity:100, showTitle:true,  showBorder:true,  contentColor:"#B08968", titleColor:"#5C4033", borderColor:"#4e3629", borderWidth:2, titleAlign:"left",   titleScale:"3", contentScale:"3" } },
            { id:"now-streak-widget",      x:306, y:641, w:164, h:161,
              ap:{ backgroundColor:"#EFE6D7", backgroundOpacity:100, showTitle:true,  showBorder:true,  contentColor:"#A67C52", titleColor:"#4E3629", borderColor:"#4e3629", borderWidth:2, titleAlign:"center", titleScale:"3", contentScale:"2" } },
            { id:"high-streak-widget",     x:478, y:641, w:182, h:160,
              ap:{ backgroundColor:"#EFE6D7", backgroundOpacity:100, showTitle:true,  showBorder:true,  contentColor:"#A67C52", titleColor:"#4E3629", borderColor:"#4e3629", borderWidth:2, titleAlign:"center", titleScale:"3", contentScale:"3" } },

            // parked hidden
            { id:"weather-week-widget",    x:0,   y:0,   w:180, h:90,
              ap:{ backgroundColor:"#D7C2A4", backgroundOpacity:100, showTitle:false, showBorder:true,  contentColor:"#7A5A3A", titleColor:"#FAF6EE", borderColor:"#4e3629", borderWidth:2, titleAlign:"center", titleScale:"3", contentScale:"3" } },
=======
            { id:"today-emotion-widget",   x:674, y:0,   w:326, h:167,
              ap:{ backgroundColor:"#FAF6EE", backgroundOpacity:100, showTitle:true,  showBorder:true,  contentColor:"#4e3629", titleColor:"#7A5A3A", borderColor:"#4e3629", borderWidth:2, titleAlign:"center", titleScale:"2", contentScale:"3" } },
            { id:"picture-streak-widget",  x:674, y:173, w:326, h:285,
              ap:{ backgroundColor:"#EFE6D7", backgroundOpacity:100, showTitle:false, showBorder:true,  contentColor:"#A67C52", titleColor:"#4E3629", borderColor:"#4e3629", borderWidth:2, titleAlign:"left",   titleScale:"3", contentScale:"3" } },
            { id:"diary-card-widget",      x:674, y:467, w:326, h:186,
              ap:{ backgroundColor:"#7A5A3A", backgroundOpacity:100, showTitle:false, showBorder:true,  contentColor:"#FAF6EE", titleColor:"#D7C2A4", borderColor:"#4e3629", borderWidth:2, titleAlign:"left",   titleScale:"3", contentScale:"3" } },

            // ── Main area ──────────────────────────────────────────────────────
            { id:"digital-clock-widget",   x:0,   y:0,   w:670, h:186,
              ap:{ backgroundColor:"#4E3629", backgroundOpacity:100, showTitle:false, showBorder:true,  contentColor:"#EFE6D7", titleColor:"#A67C52", borderColor:"#4e3629", borderWidth:2, titleAlign:"left",   titleScale:"3", contentScale:"1" } },

            { id:"quote-widget",           x:3,   y:194, w:293, h:227,
              ap:{ backgroundColor:"#FAF6EE", backgroundOpacity:100, showTitle:false, showBorder:true,  contentColor:"#000000", titleColor:"#7A5A3A", borderColor:"#4e3629", borderWidth:2, titleAlign:"left",   titleScale:"3", contentScale:"3" } },
            { id:"emotion-summary-widget", x:302, y:194, w:367, h:324,
              ap:{ backgroundColor:"#F8F1E7", backgroundOpacity:100, showTitle:true,  showBorder:true,  contentColor:"#000000", titleColor:"#5C4033", borderColor:"#4e3629", borderWidth:2, titleAlign:"center", titleScale:"1", contentScale:"3" } },

            { id:"weather-day-widget",     x:3,   y:426, w:80,  h:127,
              ap:{ backgroundColor:"#F8F1E7", backgroundOpacity:100, showTitle:false, showBorder:true,  contentColor:"#7a5a3a", titleColor:"#5C4033", borderColor:"#4e3629", borderWidth:2, titleAlign:"left",   titleScale:"3", contentScale:"2" } },
            { id:"weather-hour-widget",    x:88,  y:428, w:208, h:123,
              ap:{ backgroundColor:"#F8F1E7", backgroundOpacity:100, showTitle:true,  showBorder:true,  contentColor:"#B08968", titleColor:"#5C4033", borderColor:"#4e3629", borderWidth:2, titleAlign:"left",   titleScale:"3", contentScale:"3" } },
            { id:"now-streak-widget",      x:301, y:527, w:172, h:127,
              ap:{ backgroundColor:"#EFE6D7", backgroundOpacity:100, showTitle:true,  showBorder:true,  contentColor:"#A67C52", titleColor:"#4E3629", borderColor:"#4e3629", borderWidth:2, titleAlign:"center", titleScale:"3", contentScale:"2" } },
            { id:"high-streak-widget",     x:479, y:527, w:189, h:127,
              ap:{ backgroundColor:"#EFE6D7", backgroundOpacity:100, showTitle:true,  showBorder:true,  contentColor:"#A67C52", titleColor:"#4E3629", borderColor:"#4e3629", borderWidth:2, titleAlign:"center", titleScale:"3", contentScale:"3" } },

            { id:"weather-week-widget",    x:3,   y:558, w:293, h:95,
              ap:{ backgroundColor:"#f8f1e7", backgroundOpacity:100, showTitle:false, showBorder:true,  contentColor:"#7A5A3A", titleColor:"#FAF6EE", borderColor:"#4e3629", borderWidth:2, titleAlign:"center", titleScale:"3", contentScale:"1" } },
>>>>>>> a857ae47f922cc5718ae9f2e06461a517aa4a7d1
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

    localStorage.setItem("active-template", templateId);

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

    // Apply template deco — positions are stored as percentages and converted to pixels
    // using each widget's actual rendered dimensions at this viewport size.
    if (template.deco) {
        Object.entries(template.deco).forEach(([widgetId, decoItems]) => {
            const wRef = template.widgets.find(w => w.id === widgetId);
            if (!wRef) return;
            const pixelW = Math.round(wRef.w * scaleX);
            const pixelH = Math.round(wRef.h * scaleY);
            const scaled = decoItems.map(item => {
                const w = Math.round(item.wPct * pixelW);
                const h = Math.round(w * (item.aspect || 1));
                return {
                    id:       item.id,
                    src:      item.src,
                    x:        Math.round(item.xPct * pixelW),
                    y:        Math.round(item.yPct * pixelH),
                    w, h,
                    opacity:  item.opacity  ?? 1,
                    rotation: item.rotation ?? 0,
                };
            });
            localStorage.setItem(`${templateId}:${widgetId}-deco`, JSON.stringify(scaled));
        });
    }

    localStorage.setItem("hidden-widgets", JSON.stringify(template.hidden || []));
}
