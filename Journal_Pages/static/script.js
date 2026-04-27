let box = document.getElementById("box");

box.addEventListener("input", function() {

    let data = new FormData();
    data.append("content", box.value);
    //content = key
    //box.value = value
    data.append("mood", "neutral");

    fetch("/autosave", {
        method: "POST",
        body: data
    });

});