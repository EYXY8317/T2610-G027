// ================= VINYL MUSIC =================

// Get the vinyl element
const vinyl = document.getElementById("vinyl");

// Get the audio element
const music = document.getElementById("bgMusic");

// Music playing status
let isPlaying = false;

// When vinyl is clicked
vinyl.addEventListener("click",()=>{

    // If music is NOT playing
    if(!isPlaying){

        // Play music
        music.play();

        // Add spinning class
        vinyl.classList.add("playing");

        // Update status
        isPlaying = true;

    }else{

        // Pause music
        music.pause();

        // Remove spinning class
        vinyl.classList.remove("playing");

        // Update status
        isPlaying = false;

    }

});

