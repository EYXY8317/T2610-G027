console.log("JS RUNNING");

const box = document.getElementById ("diaryBox");
//get the textarea from HTML
//const = create a variable (cannot be changed)
//box = variable name
    //box = the name of the textarea element in the HTML file
//document = the whole webpage
//.getElementById = find element with id "diaryBox"

let timeout = null;
// store timer

box.addEventListener("input", function() {
//when user types in textarea, run this function
//.addEventListener = listen for an event (in this case, "input" which means when the user types something in the textarea)


    console.log(box.value);
//print current text in console
//console = browser debug tool
//.log = print something in the console
//box.value = the current text in the textarea
    
    clearTimeout(timeout);
    // cancel previous timer

    timeout = setTimeout(function() {
    // set new timer

        console.log("SENDING...");

        fetch("/autosave", {
        //send a POST request to the server at the "/autosave" endpoint
            method:"POST",
            //send data to the server using the POST method
              //post = send data to the server
              //get = request data from the server
            headers:{
            //extra information in request
                "Content-Type": "application/json"
                //content type = type of data being sent (in this case, JSON)
                //“application/json” = the data being sent is in JSON format
            },
            body: JSON.stringify({
            //body = the data being sent to the server
            //JSON.stringify = convert JavaScript object to JSON string
                content:box.value
                //content = the key for the data being sent (can be any name)
                //box.value = the current text in the textarea (the value being sent to the server)
            })
        })

        .then(response => response.text())
        .then(data => {
            console.log("SAVED:", data);
        })
        .catch(error => {
            console.error("ERROR:", error);
        });
    }, 2000);
});

//EDIT BUTTON (UNLOCK) =========================================
const editBtn = document.getElementById("editBtn")
//const = create a variable (cannot be changed)
//editBtn = variable name
    //the name of the edit button element in the HTML file
//document = the whole webpage
//.getElementById = find element with id "editBtn"
editBtn.addEventListener("click", function() {
//when user clicks the edit button, run this function
    box.removeAttribute("readonly");
    //remove the "readonly" attribute from the textarea, making it editable
        //.removeAttribute("readonly") = remove the "readonly" attribute from the textarea element, allowing the user to edit the content
});

//MOOD AUTO SAVE =========================================
let currentEntry = null;
//variable to store the currently selected diary entry
// 必须记住用户点的是哪一条日记，不然不知道改谁

function openMoodPicker(el) {
//function runs when user clicks the mood area
//function definition: open mood selection UI

    currentEntry = el.closest(".date-mood");
    //find the parent entry container

    document.getElementById("moodPicker").style.display = "block";
    //show the mood picker UI
    //block" makes hidden element visible
}

function selectMood(mood) {
   
    let circle = currentEntry.querySelector(".mood-circle");
    //find the mood display area inside current entry
    //.querySelector(".mood-circle") = find the element with class "mood-circle" inside the current entry container
    circle.innerText = mood;


    fetch("/update-mood", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: currentEntry.dataset.id,
          

            mood: mood
         
        })
    })

    .then(response => response.text())
    .then(data => {
        console.log("MOOD SAVED:", data);
    })

    .catch(error => {
        console.error("ERROR:", error);
    });

    document.getElementById("moodPicker").style.display = "none";
}