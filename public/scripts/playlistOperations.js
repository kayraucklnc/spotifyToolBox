/*global chrome*/

/**
 * Retrieves an access token from Spotify's API using client credentials.
 *
 * @returns {string} The access token.
 */

let localAccessToken = "";
chrome.storage.local.get(["accessToken"]).then(result => {
    console.log(result.accessToken);
    localAccessToken = result.accessToken;
})
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
    // let localAccessToken = "";
    // chrome.storage.local.get(["accessToken"]).then(result => {
    //     console.log(result.accessToken);
    //     localAccessToken = result.accessToken;
    // })
    // return localAccessToken;
}

// Retrieves playlist from SpotifyAPI via accessToken and playlistID.
async function getPlaylist(accessToken, playlistID) {
    console.log(accessToken);
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
        const playlistID = request.url.split("/")[4];
        const playlistData = await getPlaylist(localAccessToken, playlistID);
        const allMusicInfos = processTracks(playlistData.tracks.items);
        downloadAsJSONFile(allMusicInfos);
    } catch (error) {
        console.error('Error:', error);
    }
}

function getCheckedSongs(){
    const songDivs = document.querySelectorAll('div[class="gvLrgQXBFVW6m9MscfFA"]');
    let checkedSongs = [];

    songDivs.forEach(function (songDiv) {
        const song = songDiv.querySelector('a.t_yrXoUO3qGsJS4Y6iXX');
        if(song !== null){
            const checkbox = songDiv.querySelector('input[class="checkbox"]');
            if(checkbox !== null && checkbox.checked){
                checkedSongs.push(song.href.split("/")[4]);
            }
        }
    })
    return checkedSongs;
}

async function deleteSongsViaAPI(request){
    const trackIds = getCheckedSongs();
    const trackUris = trackIds.map(trackId => `spotify:track:${trackId}`);
    const playlist_id = request.url.split("/")[4];

    const playlist = await getPlaylist(localAccessToken, playlist_id);
    const snapshot_id = playlist.snapshot_id;
    console.log(snapshot_id);

    await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localAccessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            tracks: trackUris.map(trackUri => ({ uri: trackUri })),
            snapshot_id: snapshot_id
        }),
    });
    console.log( JSON.stringify({
        tracks: trackUris.map(trackUri => ({ uri: trackUri })),
        snapshot_id: snapshot_id,
        Authorization: `Bearer ${localAccessToken}`
    }));
}

async function addCheckedSongsToBasket(){
    const checkedSongs = getCheckedSongs();
    const songs = [];

    for(let i = 0; i < checkedSongs.length; i++){
        console.log(checkedSongs[i]);
        const response = await fetch(`https://api.spotify.com/v1/tracks/${checkedSongs[i]}`, {
            headers: {
                'Authorization': `Bearer ${localAccessToken}`
            }
        });

        const songData = await response.json();

        const song = {
            imageUrl: songData.album.images[0].url,
            name: songData.name,
            artist: songData.artists.map(artist => artist.name)
        }

        console.log(song);
        songs.push(song);
    }
    chrome.runtime.sendMessage({ action: "addSongsToBasketReturn", checkedSongs: songs });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(request.action);
    if (request.action === 'downloadJson') {
        downloadPlaylistViaAPI(request);
    }
    else if(request.action === 'deleteSongs'){
        deleteSongsViaAPI(request);
    }
    else if(request.action === 'setAccessToken'){
        console.log(request.url)
    }
    else if(request.action === 'addSongsToBasket'){
        addCheckedSongsToBasket();
    }
});