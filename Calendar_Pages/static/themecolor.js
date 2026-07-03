/* ==================================================
  1. THEME POPUP
================================================== */

/* =====================================
   Open Theme Selection Popup
===================================== */

function openThemePopup(){

    // Display the theme popup window

    document
        .getElementById("themePopup")
        .classList.add("show");

}


/* =====================================
   Close Theme Selection Popup
===================================== */

function closeThemePopup(){

    // Hide the theme popup window
    const popup = document.getElementById("themePopup");
    if(popup) popup.classList.remove("show");

}


/* ==================================================
  2. THEME SYSTEM
     Change application color theme instantly
================================================== */

function setTheme(theme){

    // Cache theme so other pages can apply it instantly
    try{ localStorage.setItem('lifepages-theme', theme); }catch(e){}

    /* =====================================
       MOCHA LATTE THEME
    ===================================== */

    if(theme === "mocha"){

        // Main page background color
        document.documentElement.style.setProperty(
            '--background',
            '#f7f3ee'
        );

        // Sidebar gradient colors
        document.documentElement.style.setProperty(
            '--sidebar-top',
            '#fcfaf7'
        );

        document.documentElement.style.setProperty(
            '--sidebar-bottom',
            '#f4eee7'
        );

        // Primary theme color
        document.documentElement.style.setProperty(
            '--primary',
            '#8b6b4f'
        );

        // Light background used for cards and badges
        document.documentElement.style.setProperty(
            '--primary-light',
            '#f5eee7'
        );

        // Hover effect color
        document.documentElement.style.setProperty(
            '--primary-hover',
            '#ece0d3'
        );

        // Soft background color
        document.documentElement.style.setProperty(
            '--primary-soft',
            '#faf7f3'
        );

        // Border color
        document.documentElement.style.setProperty(
            '--primary-border',
            '#e8ddd1'
        );

        // Accent color
        document.documentElement.style.setProperty(
            '--primary-accent',
            '#d9c3ad'
        );

        // Gradient start color
        document.documentElement.style.setProperty(
            '--gradient-start',
            '#b18a68'
        );

        // Gradient end color
        document.documentElement.style.setProperty(
            '--gradient-end',
            '#8b6b4f'
        );

        // Quote card gradient colors
        document.documentElement.style.setProperty(
            '--quote-start',
            '#fcfaf7'
        );

        document.documentElement.style.setProperty(
            '--quote-end',
            '#f5eee7'
        );

    }

    /* =====================================
       LAVENDER DREAM THEME
    ===================================== */

    else if(theme === "lavender"){

        // Main page background color
        document.documentElement.style.setProperty(
            '--background',
            '#f7f4ff'
        );

        // Sidebar gradient colors
        document.documentElement.style.setProperty(
            '--sidebar-top',
            '#fbf9ff'
        );

        document.documentElement.style.setProperty(
            '--sidebar-bottom',
            '#f6f1ff'
        );

        // Primary theme color
        document.documentElement.style.setProperty(
            '--primary',
            '#7c5cff'
        );

        // Light background color
        document.documentElement.style.setProperty(
            '--primary-light',
            '#f3ecff'
        );

        // Hover effect color
        document.documentElement.style.setProperty(
            '--primary-hover',
            '#ebe3ff'
        );

        // Soft background color
        document.documentElement.style.setProperty(
            '--primary-soft',
            '#faf8ff'
        );

        // Border color
        document.documentElement.style.setProperty(
            '--primary-border',
            '#ece7f7'
        );

        // Accent color
        document.documentElement.style.setProperty(
            '--primary-accent',
            '#d8cfff'
        );

        // Gradient colors
        document.documentElement.style.setProperty(
            '--gradient-start',
            '#9a83ff'
        );

        document.documentElement.style.setProperty(
            '--gradient-end',
            '#7c5cff'
        );

        // Quote card gradient colors
        document.documentElement.style.setProperty(
            '--quote-start',
            '#fff8fd'
        );

        document.documentElement.style.setProperty(
            '--quote-end',
            '#f7f2ff'
        );

    }

    /* =====================================
       MATCHA GREEN THEME
    ===================================== */

    else if(theme === "matcha"){

        // Main page background color
        document.documentElement.style.setProperty(
            '--background',
            '#f7fbf7'
        );

        // Sidebar gradient colors
        document.documentElement.style.setProperty(
            '--sidebar-top',
            '#fcfffc'
        );

        document.documentElement.style.setProperty(
            '--sidebar-bottom',
            '#eef7ef'
        );

        // Primary theme color
        document.documentElement.style.setProperty(
            '--primary',
            '#5e8b6a'
        );

        // Light background color
        document.documentElement.style.setProperty(
            '--primary-light',
            '#eef6f0'
        );

        // Hover effect color
        document.documentElement.style.setProperty(
            '--primary-hover',
            '#dce9df'
        );

        // Soft background color
        document.documentElement.style.setProperty(
            '--primary-soft',
            '#f6fbf7'
        );

        // Border color
        document.documentElement.style.setProperty(
            '--primary-border',
            '#d7e7da'
        );

        // Accent color
        document.documentElement.style.setProperty(
            '--primary-accent',
            '#b8d4be'
        );

        // Gradient colors
        document.documentElement.style.setProperty(
            '--gradient-start',
            '#8db79a'
        );

        document.documentElement.style.setProperty(
            '--gradient-end',
            '#5e8b6a'
        );

        // Quote card gradient colors
        document.documentElement.style.setProperty(
            '--quote-start',
            '#fbfffb'
        );

        document.documentElement.style.setProperty(
            '--quote-end',
            '#eef6f0'
        );

    }

    /* =====================================
       ASH GRAY THEME
    ===================================== */

    else if(theme === "ash"){

        // Main page background color
        document.documentElement.style.setProperty(
            '--background',
            '#f5f5f5'
        );

        // Sidebar gradient colors
        document.documentElement.style.setProperty(
            '--sidebar-top',
            '#fafafa'
        );

        document.documentElement.style.setProperty(
            '--sidebar-bottom',
            '#f0f0f0'
        );

        // Primary theme color
        document.documentElement.style.setProperty(
            '--primary',
            '#5f5f5f'
        );

        // Light background color
        document.documentElement.style.setProperty(
            '--primary-light',
            '#eeeeee'
        );

        // Hover effect color
        document.documentElement.style.setProperty(
            '--primary-hover',
            '#e2e2e2'
        );

        // Soft background color
        document.documentElement.style.setProperty(
            '--primary-soft',
            '#f8f8f8'
        );

        // Border color
        document.documentElement.style.setProperty(
            '--primary-border',
            '#dddddd'
        );

        // Accent color
        document.documentElement.style.setProperty(
            '--primary-accent',
            '#bdbdbd'
        );

        // Gradient colors
        document.documentElement.style.setProperty(
            '--gradient-start',
            '#8c8c8c'
        );

        document.documentElement.style.setProperty(
            '--gradient-end',
            '#5f5f5f'
        );

        // Quote card gradient colors
        document.documentElement.style.setProperty(
            '--quote-start',
            '#fcfcfc'
        );

        document.documentElement.style.setProperty(
            '--quote-end',
            '#f2f2f2'
        );

    }

    /* =====================================
       Close popup after selecting a theme
    ===================================== */

    // Refresh progress ring using new theme colors
    if(typeof updateProgress === 'function') updateProgress();

    // Close theme popup
    const _popup = document.getElementById("themePopup");
    if(_popup) _popup.classList.remove("show");

}