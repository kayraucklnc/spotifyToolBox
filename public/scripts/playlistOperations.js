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

    fetch('https://api.spotify.com/v1/artists/0TnOYISbd1XYRBk9myaseg', {
        headers: {
            'Authorization': `Bearer ${localAccessToken}`
        }
    }).then(data => {
        if (data.status !== 200){
            alert("Access token is invalid. Please login again.");
        }
    })
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
            id: songData.id,
            imageUrl: songData.album.images[0].url,
            name: songData.name,
            artist: songData.artists.map(artist => artist.name)
        }

        console.log(song);
        songs.push(song);
    }
    chrome.runtime.sendMessage({ action: "addSongsToBasketReturn", checkedSongs: songs });
}

async function addSongsToPlaylist(request){
    let songs = [];

    try {
        // Wait for the promise to resolve before continuing
        const result = await new Promise((resolve) => {
            chrome.storage.local.get(["songs"], resolve);
        });

        songs = result.songs || [];
    } catch (error) {
        console.error("Error retrieving songs from storage:", error);
    }

    const trackUris = songs.map(song => `spotify:track:${song.id}`);
    const playlist_id = request.url.split("/")[4];

    await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localAccessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            uris: trackUris,
            position: 0
        }),
    });

    chrome.runtime.sendMessage({ action: "clearBasket"});
}

async function removeDuplicates(request) {
    const playlist_id = request.url.split("/")[4];
    const playlist = await getPlaylist(localAccessToken, playlist_id);
    const snapshot_id = playlist.snapshot_id;
    const playlistTrackIDs = playlist.tracks.items.map(track => track.track.id);
    console.log(playlistTrackIDs);

    let duplicateTrackIDs = playlistTrackIDs.filter((item, index) => playlistTrackIDs.indexOf(item) !== index);
    let uniqueSet = new Set(duplicateTrackIDs);
    duplicateTrackIDs = Array.from(uniqueSet);
    console.log(duplicateTrackIDs);

    let trackUris = duplicateTrackIDs.map(trackId => `spotify:track:${trackId}`);

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

    const delayTime = 2000;
    await new Promise(resolve => setTimeout(resolve, delayTime));

    await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localAccessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            uris: trackUris,
            position: 0
        }),
    });

    window.location.reload();
}

async function getRecursiveRelations(artistID, artistName, depth, itemCount, relations) {
    if (depth <= 0) {
        return relations;
    }

    let response = await fetch(`https://api.spotify.com/v1/artists/${artistID}/related-artists`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localAccessToken}`,
        },
    });

    response = await response.json();
    const relatedArtists = response.artists;

    curItemCount = Math.ceil(2*itemCount/3);
    for (let i = 0; i < curItemCount; i++) {
        if (relations[artistName] == null){
            relations[artistName] = [relatedArtists[i].name]
        } else {
            relations[artistName].push(relatedArtists[i].name);
        }
    }

    for (let i = 0; i < curItemCount; i++) {
        const res = await getRecursiveRelations(relatedArtists[i].id, relatedArtists[i].name, depth - 1, curItemCount, relations);
        // console.log("Result: ", res);
    }
    return relations;
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
    else if(request.action === 'addSongsToPlaylist'){
        addSongsToPlaylist(request);
        window.location.reload();
    }
    else if(request.action === 'removeDuplicates'){
        removeDuplicates(request);
    }
    else if (request.action === 'getRecursiveRelations') {
        chrome.runtime.sendMessage({ action: "waitingRecursive" });

        const artistID = request.url.split("/")[4];
        const response = fetch(`https://api.spotify.com/v1/artists/${artistID}`, {
            headers: {
                'Authorization': `Bearer ${localAccessToken}`
            }
        }).then(data => data.json()).then(data => {
            getRecursiveRelations(artistID, data.name, 3, 16, {}).then((artistList) => {
                console.log(artistList);
                chrome.runtime.sendMessage({ action: "getRecursiveRelationsReturn", artists: artistList });
            });
        });
    }
});