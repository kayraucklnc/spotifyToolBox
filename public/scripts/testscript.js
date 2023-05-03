// Content script code

// Create a new div element
const newDiv = document.createElement("div");

// Set the content of the div element
newDiv.innerHTML = "Hello, world!";
newDiv.className = "anan"

// Add the new div element to the Spotify web player's body element
document.body.appendChild(newDiv);
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'downloadJson') {



            let allTitles = document.querySelectorAll(".t_yrXoUO3qGsJS4Y6iXX div");
            let allArtists = document.querySelectorAll(".rq2VQ5mb9SDAFWbBIUIn");
            let allAlbums = document.querySelectorAll(".bfQ2S9bMXr_kJjqEfcwA a");
            let allDurations = document.querySelectorAll(".HcMOFLaukKJdK5LfdHh0 div");

            // Create an empty array to hold data
            let jsonData = [];

            // Loop through data and push to the array
            for (let i = 0; i < allTitles.length; i++) {
                let temp = [];
                let artists = allArtists[i].getElementsByTagName("a");
                Array.from(artists).forEach(element => {
                    temp.push(element.innerHTML);
                });
                let item = {
                    title: allTitles[i].innerHTML,
                    artists: temp,
                    album: allAlbums[i].innerHTML,
                    duration: allDurations[i+1].innerHTML,
                };
                jsonData.push(item);
            }

            // Convert array to JSON string
            let jsonString = JSON.stringify(jsonData);

            // Create a Blob with the JSON string
            let blob = new Blob([jsonString], {type: "application/json"});

            // Create a download link
            let downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = "data.json";
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);

            // Trigger download
            downloadLink.click();

            // Clean up
            document.body.removeChild(downloadLink);

    }
});