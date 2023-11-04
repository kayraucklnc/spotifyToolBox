/*global chrome*/
// Content script code

/**
 * Retrieves an access token from Spotify's API using client credentials.
 *
 * @returns {string} The access token.
 */
async function getAccessToken() {

    const clientID = '95a834e74870414da4c4fe63d3153de6';
    const clientSecret = 'ee5e6d4f94a04f838119c28e3aabd16a';
    let accessToken = 'deneme';

    const data = {
        grant_type: 'client_credentials',
        client_id: clientID,
        client_secret: clientSecret
    };

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(data)
    });
    const responseData = await response.json();
    return responseData.access_token;
}

// Retrieves playlist from SpotifyAPI via accessToken and playlistID.
async function getPlaylist(accessToken, playlistID) {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistID}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.json();
}

function processTracks(tracks) {
    return tracks.map(track => ({
        title: track.track.name,
        artists: track.track.artists.map(artist => artist.name),
        album: track.track.album.name,
        duration: `${Math.floor(track.track.duration_ms / 1000 / 60)}:${Math.floor(track.track.duration_ms / 1000 % 60)}`
    }));
}

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

/**
 * Downloads a Spotify playlist's track information via the Spotify API and saves it as a JSON file.
 *
 * @param {Request} request - The incoming HTTP request containing the playlist URL.
 */
async function downloadPlaylistViaAPI(request) {
    try {
        const accessToken = await getAccessToken();
        const playlistID = request.url.split("/")[4];
        const playlistData = await getPlaylist(accessToken, playlistID);
        const allMusicInfos = processTracks(playlistData.tracks.items);
        downloadAsJSONFile(allMusicInfos);
    } catch (error) {
        console.error('Error:', error);
    }
}

function getCheckedSongs(){
    const songDivs = document.querySelectorAll('div[class="gvLrgQXBFVW6m9MscfFA"]');

    songDivs.forEach(function (songDiv) {
        const song = songDiv.querySelector('a.t_yrXoUO3qGsJS4Y6iXX');
        if(song !== null){
            const checkbox = songDiv.querySelector('input[class="checkbox"]');
            if(checkbox !== null && checkbox.checked){
                console.log(song.href);
            }
        }
    })
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'downloadJson') {
        downloadPlaylistViaAPI(request);
    }
    else if(request.action === 'deleteSongs'){
        getCheckedSongs();
    }
});