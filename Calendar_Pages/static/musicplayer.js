/* ================= ELEMENTS ================= */
// Select important elements from the DOM
const upload     = document.getElementById("musicUpload");   // File upload input
const audio      = document.getElementById("audioPlayer");   // Audio player element
const vinyl      = document.getElementById("vinyl");         // Vinyl record animation element
const songTitle  = document.getElementById("songTitle");     // Song title display

/* ================= MP3 UPLOAD ================= */
// Handle MP3 file upload
upload.addEventListener("change", function() {
    const file = this.files[0];                    // Get the selected file
    
    if (file) {
        const musicURL = URL.createObjectURL(file); // Create temporary URL for the file
        audio.src = musicURL;                       // Load the music into the audio player
        songTitle.textContent = file.name;          // Show the file name
    }
});

/* ================= PLAY & PAUSE CONTROLS ================= */
// Play the music
function playMusic() {
    audio.play();                    // Start playback
    vinyl.classList.add("playing");  // Start vinyl spinning animation
}

// Pause the music
function pauseMusic() {
    audio.pause();                     // Pause playback
    vinyl.classList.remove("playing"); // Stop vinyl spinning animation
}