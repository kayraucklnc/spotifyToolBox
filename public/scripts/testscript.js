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

        const clientID = '95a834e74870414da4c4fe63d3153de6';
        const clientSecret = 'ee5e6d4f94a04f838119c28e3aabd16a';
        let accessToken = 'deneme';

        const data = {
            grant_type: 'client_credentials',
            client_id: clientID,
            client_secret: clientSecret
        };

        fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(data)
        })
            .then(response => response.json())
            .then(data => {
                accessToken = data.access_token;
                // Use the access token for authenticated requests
                const playlistID = request.url.split("/")[4];

                fetch(`https://api.spotify.com/v1/playlists/${playlistID}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        // Handle the playlist data
                        const allTracks = data.tracks.items;
                        let allMusicInfos = [];

                        for(let i = 0; i<allTracks.length; i++){
                            let track = allTracks[i].track;
                            let musicInfo = {
                                title: track.name,
                                artists: track.artists.map(artist => artist.name),
                                album: track.album.name,
                                duration: Math.floor(track.duration_ms/1000 / 60) + ":" + Math.floor(track.duration_ms/1000 % 60)
                            }
                            allMusicInfos.push(musicInfo)
                        }
                        console.log(allMusicInfos);
                        downloadAsJSONFile(allMusicInfos)
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            })
            .catch(error => {
                console.error('Error:', error);
            });


        function downloadAsJSONFile(array){
            // Convert array to JSON string
            let jsonString = JSON.stringify(array);

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
    }
});