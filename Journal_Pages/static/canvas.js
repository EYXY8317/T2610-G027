let upload = document.getElementById("uploadImg");
let box = document.getElementById("box");

upload.addEventListener("change", function(e) {
    let file = e.target.files[0];
    if (!file) return;

    let url = URL.createObjectURL(file);

    let img = document.createElement("img");
    img.src = url;
    img.style.width = "120px";

    box.appendChild(img);
});