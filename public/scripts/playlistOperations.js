/*global chrome*/
/**
 * Retrieves an access token from Spotify's API using client credentials.
 *
 * @returns {string} The access token.
 */

let localAccessToken = "";
chrome.storage.local.get(["accessToken"]).then((result) => {
    console.log(result.accessToken);
    localAccessToken = result.accessToken;

    fetch("https://api.spotify.com/v1/artists/0TnOYISbd1XYRBk9myaseg", {
        headers: {
            Authorization: `Bearer ${localAccessToken}`,
        },
    }).then((data) => {
        if (data.status !== 200) {
            alert("Access token is invalid. Please login again.");
        }
    });
});

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

function downloadAsJSONFile(array) {
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

function getCheckedSongs() {
    const songDivs = document.querySelectorAll('div[class="gvLrgQXBFVW6m9MscfFA"]');
    let checkedSongs = [];

    songDivs.forEach(function (songDiv) {
        const song = songDiv.querySelector('a.t_yrXoUO3qGsJS4Y6iXX');
        if (song !== null) {
            const checkbox = songDiv.querySelector('input[class="checkbox"]');
            if (checkbox !== null && checkbox.checked) {
                checkedSongs.push(song.href.split("/")[4]);
            }
        }
    })
    return checkedSongs;
}

async function deleteSongsViaAPI(request) {
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
            tracks: trackUris.map(trackUri => ({uri: trackUri})),
            snapshot_id: snapshot_id
        }),
    });
    console.log(JSON.stringify({
        tracks: trackUris.map(trackUri => ({uri: trackUri})),
        snapshot_id: snapshot_id,
        Authorization: `Bearer ${localAccessToken}`
    }));
}

async function addCheckedSongsToBasket() {
    const checkedSongs = getCheckedSongs();
    const songs = [];

    for (let i = 0; i < checkedSongs.length; i++) {
        console.log(checkedSongs[i]);
        const response = await fetch(`https://api.spotify.com/v1/tracks/${checkedSongs[i]}`, {
            headers: {
                'Authorization': `Bearer ${localAccessToken}`
            }
        });

        const songData = await response.json();

        const song = {
            id: songData.id,
            type: "song",
            imageUrl: songData.album.images[0].url,
            name: songData.name,
            artist: songData.artists.map(artist => artist.name)
        }

        console.log(song);
        songs.push(song);
    }
    chrome.runtime.sendMessage({action: "addSongsToBasketReturn", checkedSongs: songs});
}

async function addPlaylistToBasket(request) {

    const playlistID = request.url.split("/")[4];
    const playlistData = await getPlaylist(localAccessToken, playlistID);
    console.log(playlistData.id, playlistData.images[0].url, playlistData.name, playlistData.owner.display_name);
    const songs = [{
        id: playlistData.id,
        type: "playlist",
        imageUrl: playlistData.images[0].url,
        name: playlistData.name,
        artist: playlistData.owner.display_name
    }];

    chrome.runtime.sendMessage({action: "addSongsToBasketReturn", checkedSongs: songs});
}

async function addSongsToPlaylist(request) {
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

    const trackUris = songs
        .filter(song => song.type === "song")
        .map(song => `spotify:track:${song.id}`);

    console.log(trackUris);
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

    chrome.runtime.sendMessage({action: "clearSongsFromBasket"});
    window.location.reload();
}

async function addPlaylistsToPlaylist(request) {
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

    const trackUris = [];

    for (const song of songs) {
        if (song.type === "playlist") {
            try {
                const data = await getPlaylist(localAccessToken, song.id);
                console.log(data);
                const playlistTrackUris = data.tracks.items.map(track => `spotify:track:${track.track.id}`);
                trackUris.push(...playlistTrackUris);
            } catch (error) {
                console.error("Error getting playlist:", error);
                // Handle the error if needed
            }
        }
    }

    console.log(trackUris);
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

    chrome.runtime.sendMessage({action: "clearPlaylistsFromBasket"});
    window.location.reload();
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
            tracks: trackUris.map(trackUri => ({uri: trackUri})),
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

async function getRecursiveRelations(
  artistID,
  artistName,
  depth,
  itemCount,
  relations
) {
  if (depth <= 0) {
    return relations;
  }

  let response = await fetch(
    `https://api.spotify.com/v1/artists/${artistID}/related-artists`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localAccessToken}`,
      },
    }
  );

  response = await response.json();
  const relatedArtists = response.artists;

  curItemCount = Math.ceil((4 * itemCount) / 5);
  for (let i = 0; i < curItemCount; i++) {
    let toAdd = {
      name: relatedArtists[i].name,
      followers: relatedArtists[i].followers.total,
      popularity: relatedArtists[i].popularity,
    };
    if (relations[artistName] == null) {
      relations[artistName] = [toAdd];
    } else {
      relations[artistName].push(toAdd);
    }
  }

  for (let i = 0; i < curItemCount; i++) {
    const res = await getRecursiveRelations(
      relatedArtists[i].id,
      relatedArtists[i].name,
      depth - 1,
      curItemCount,
      relations
    );
    // console.log("Result: ", res);
  }
  return relations;
}


async function getCurrentlyPlayingTrack() {
  try {
    const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: {
        Authorization: `Bearer ${localAccessToken}`,
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      return {
        success: true,
        currentlyPlayingTrack: {
          title: data.item.name,
          artist: data.item.artists.map(artist => artist.name).join(", "),
          imageUrl:data.item.album.images[0].url
        },
      };
    } else {
      return {
        success: false,
        error: "No currently playing track",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: "Error fetching currently playing track",
    };
  }
}


async function compareSongs() {
    const checkedSongs = getCheckedSongs().slice(-2);

    console.log(checkedSongs);

    const songDataPromises = checkedSongs.map(trackID => {
        return getSongDataFromSpotify(trackID)
            .then(data => {
                console.log(trackID);
                let songData = {
                    id: trackID,
                    imageUrl: '',
                    name: '',
                    popularity: '',
                    duration: `${Math.floor(data.duration_ms / 1000 / 60)}:${Math.floor(data.duration_ms / 1000 % 60)}`,
                    danceability: mapDanceability(data.danceability),
                    energy: mapEnergy(data.energy),
                    loudness: mapLoudness(data.loudness),
                    speechiness: mapSpeechiness(data.speechiness),
                    acousticness: mapAcousticness(data.acousticness),
                    instrumentalness: mapInstrumentalness(data.instrumentalness),
                    liveness: mapLiveness(data.liveness),
                    valence: mapValence(data.valence)
                }
                return songData; // Şarkı verisini döndür
            })
            .catch(error => {
                console.error('Error: ', error);
            });
    });

    Promise.all(songDataPromises)
        .then(fullSongDatas => {
            const additionalInfoPromises = fullSongDatas.map((songData, index) => {
                return fetch(`https://api.spotify.com/v1/tracks/${songData.id}`, {
                    headers: {
                        'Authorization': `Bearer ${localAccessToken}`
                    }
                })
                    .then(response => response.json())
                    .then(songInfo => {
                        songData.name = songInfo.name;
                        songData.imageUrl = songInfo.album.images[0].url;
                        songData.popularity = mapPopularity(songInfo.popularity);
                        return songData; // Güncellenmiş şarkı verisini döndür
                    })
                    .catch(error => {
                        console.error('Error: ', error);
                    });
            });

            return Promise.all(additionalInfoPromises); // Tüm ek bilgilerin alınmasını bekle
        })
        .then(completeSongDatas => {
            chrome.runtime.sendMessage({ action: "songComparisonReturn", songDatas: completeSongDatas });
        })
        .catch(error => {
            console.error('Error: ', error);
        });
}

async function getCountriesTopThreeSongs(country) {
    const countryPlaylistUrl = countryPlaylists.find(countryPlaylist => countryPlaylist.country === country).playlistLink;
    let playlistData = await getPlaylist(localAccessToken, countryPlaylistUrl.split("/")[2]);
    playlistData = playlistData.tracks.items.slice(0, 3);
    const allMusicInfos = playlistData.map(track => ({
        id: track.track.id,
        imageUrl: track.track.album.images[0].url,
        name: track.track.name,
        artist: track.track.artists.map(artist => artist.name + " "),
        url: track.track.external_urls.spotify
    }));

    const top3Songs = {
        country: country,
        songs: allMusicInfos,
        url: countryPlaylistUrl
    }

    chrome.runtime.sendMessage({action: "top3SongsReturn", top3Songs: top3Songs});
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(request.action);
    if (request.action === "downloadJson") {
        downloadPlaylistViaAPI(request);
    } else if (request.action === "deleteSongs") {
        deleteSongsViaAPI(request);
    } else if (request.action === "setAccessToken") {
        console.log(request.url);
    } else if (request.action === "addSongsToBasket") {
        addCheckedSongsToBasket();
    } else if (request.action === "addPlaylistToBasket") {
        addPlaylistToBasket(request);
    } else if (request.action === "addSongsToPlaylist") {
        addSongsToPlaylist(request);
    } else if (request.action === "addPlaylistsToPlaylist") {
        addPlaylistsToPlaylist(request);
  } else if (request.action === "removeDuplicates") {
    removeDuplicates(request);
  } else if (request.action === "getRecursiveRelations") {
    chrome.runtime.sendMessage({ action: "waitingRecursive" });

    const artistID = request.url.split("/")[4];
    const response = fetch(`https://api.spotify.com/v1/artists/${artistID}`, {
      headers: {
        Authorization: `Bearer ${localAccessToken}`,
      },
    })
      .then((data) => data.json())
      .then((data) => {
        getRecursiveRelations(artistID, data.name, 3, 20, {}).then(
          (artistList) => {
            console.log(artistList);
            chrome.runtime.sendMessage({
              action: "getRecursiveRelationsReturn",
              artists: artistList,
            });
          }
        );
      });
  } else if (request.action === 'getCurrentlyPlayingTrack') {
    getCurrentlyPlayingTrack().then(response => sendResponse(response));
    return true;
    } else if (request.action === "compareSongs") {
        compareSongs();
    }
    else if (request.action === "getCountriesTopThreeSongs") {
        getCountriesTopThreeSongs(request.country);
    }
});

const countryPlaylists = [
    {country: 'Argentina', playlistLink: '/playlist/37i9dQZEVXbMMy2roB9myp'},

    {country: 'Australia', playlistLink: '/playlist/37i9dQZEVXbJPcfkRz0wJ0'},

    {country: 'Austria', playlistLink: '/playlist/37i9dQZEVXbKNHh6NIXu36'},

    {country: 'Belarus', playlistLink: '/playlist/37i9dQZEVXbIYfjSLbWr4V'},

    {country: 'Belgium', playlistLink: '/playlist/37i9dQZEVXbJNSeeHswcKB'},

    {country: 'Bolivia', playlistLink: '/playlist/37i9dQZEVXbJqfMFK4d691'},

    {country: 'Brazil', playlistLink: '/playlist/37i9dQZEVXbMXbN3EUUhlg'},

    {country: 'Bulgaria', playlistLink: '/playlist/37i9dQZEVXbNfM2w2mq1B8'},

    {country: 'Canada', playlistLink: '/playlist/37i9dQZEVXbKj23U1GF4IR'},

    {country: 'Chile', playlistLink: '/playlist/37i9dQZEVXbL0GavIqMTeb'},

    {country: 'Colombia', playlistLink: '/playlist/37i9dQZEVXbOa2lmxNORXQ'},

    {country: 'Costa Rica', playlistLink: '/playlist/37i9dQZEVXbMZAjGMynsQX'},

    {country: 'Czechia', playlistLink: '/playlist/37i9dQZEVXbIP3c3fqVrJY'},

    {country: 'Denmark', playlistLink: '/playlist/37i9dQZEVXbL3J0k32lWnN'},

    {country: 'Dominican Republic', playlistLink: '/playlist/37i9dQZEVXbKAbrMR8uuf7'},

    {country: 'Ecuador', playlistLink: '/playlist/37i9dQZEVXbJlM6nvL1nD1'},

    {country: 'Egypt', playlistLink: '/playlist/37i9dQZEVXbLn7RQmT5Xv2'},

    {country: 'El Salvador', playlistLink: '/playlist/37i9dQZEVXbLxoIml4MYkT'},

    {country: 'Estonia', playlistLink: '/playlist/37i9dQZEVXbLesry2Qw2xS'},

    {country: 'Finland', playlistLink: '/playlist/37i9dQZEVXbMxcczTSoGwZ'},

    {country: 'France', playlistLink: '/playlist/37i9dQZEVXbIPWwFssbupI'},

    {country: 'Germany', playlistLink: '/playlist/37i9dQZEVXbJiZcmkrIHGU'},

    {country: 'Greece', playlistLink: '/playlist/37i9dQZEVXbJqdarpmTJDL'},

    {country: 'Guatemala', playlistLink: '/playlist/37i9dQZEVXbLy5tBFyQvd4'},

    {country: 'Honduras', playlistLink: '/playlist/37i9dQZEVXbJp9wcIM9Eo5'},

    {country: 'Hong Kong', playlistLink: '/playlist/37i9dQZEVXbLwpL8TjsxOG'},

    {country: 'Hungary', playlistLink: '/playlist/37i9dQZEVXbNHwMxAkvmF8'},

    {country: 'Iceland', playlistLink: '/playlist/37i9dQZEVXbKMzVsSGQ49S'},

    {country: 'India', playlistLink: '/playlist/37i9dQZEVXbLZ52XmnySJg'},

    {country: 'Indonesia', playlistLink: '/playlist/37i9dQZEVXbObFQZ3JLcXt'},

    {country: 'Ireland', playlistLink: '/playlist/37i9dQZEVXbKM896FDX8L1'},

    {country: 'Israel', playlistLink: '/playlist/37i9dQZEVXbJ6IpvItkve3'},

    {country: 'Italy', playlistLink: '/playlist/37i9dQZEVXbIQnj7RRhdSX'},

    {country: 'Japan', playlistLink: '/playlist/37i9dQZEVXbKXQ4mDTEBXq'},

    {country: 'Kazakhstan', playlistLink: '/playlist/37i9dQZEVXbM472oKPNKzS'},

    {country: 'Latvia', playlistLink: '/playlist/37i9dQZEVXbJWuzDrTxbKS'},

    {country: 'Lithuania', playlistLink: '/playlist/37i9dQZEVXbMx56Rdq5lwc'},

    {country: 'Luxembourg', playlistLink: '/playlist/37i9dQZEVXbKGcyg6TFGx6'},

    {country: 'Malaysia', playlistLink: '/playlist/37i9dQZEVXbJlfUljuZExa'},

    {country: 'Mexico', playlistLink: '/playlist/37i9dQZEVXbO3qyFxbkOE1'},

    {country: 'Morocco', playlistLink: '/playlist/37i9dQZEVXbJU9eQpX8gPT'},

    {country: 'Netherlands', playlistLink: '/playlist/37i9dQZEVXbKCF6dqVpDkS'},

    {country: 'New Zealand', playlistLink: '/playlist/37i9dQZEVXbM8SIrkERIYl'},

    {country: 'Nicaragua', playlistLink: '/playlist/37i9dQZEVXbISk8kxnzfCq'},

    {country: 'Nigeria', playlistLink: '/playlist/37i9dQZEVXbKY7jLzlJ11V'},

    {country: 'Norway', playlistLink: '/playlist/37i9dQZEVXbJvfa0Yxg7E7'},

    {country: 'Pakistan', playlistLink: '/playlist/37i9dQZEVXbJkgIdfsJyTw'},

    {country: 'Panama', playlistLink: '/playlist/37i9dQZEVXbKypXHVwk1f0'},

    {country: 'Paraguay', playlistLink: '/playlist/37i9dQZEVXbNOUPGj7tW6T'},

    {country: 'Peru', playlistLink: '/playlist/37i9dQZEVXbJfdy5b0KP7W'},

    {country: 'Philippines', playlistLink: '/playlist/37i9dQZEVXbNBz9cRCSFkY'},

    {country: 'Poland', playlistLink: '/playlist/37i9dQZEVXbN6itCcaL3Tt'},

    {country: 'Portugal', playlistLink: '/playlist/37i9dQZEVXbKyJS56d1pgi'},

    {country: 'Romania', playlistLink: '/playlist/37i9dQZEVXbNZbJ6TZelCq'},

    {country: 'Saudi Arabia', playlistLink: '/playlist/37i9dQZEVXbLrQBcXqUtaC'},

    {country: 'Singapore', playlistLink: '/playlist/37i9dQZEVXbK4gjvS1FjPY'},

    {country: 'Slovakia', playlistLink: '/playlist/37i9dQZEVXbKIVTPX9a2Sb'},

    {country: 'South Africa', playlistLink: '/playlist/37i9dQZEVXbMH2jvi6jvjk'},

    {country: 'South Korea', playlistLink: '/playlist/37i9dQZEVXbNxXF4SkHj9F'},

    {country: 'Spain', playlistLink: '/playlist/37i9dQZEVXbNFJfN1Vw8d9'},

    {country: 'Sweden', playlistLink: '/playlist/37i9dQZEVXbLoATJ81JYXz'},

    {country: 'Switzerland', playlistLink: '/playlist/37i9dQZEVXbJiyhoAPEfMK'},

    {country: 'Taiwan', playlistLink: '/playlist/37i9dQZEVXbMnZEatlMSiu'},

    {country: 'Thailand', playlistLink: '/playlist/37i9dQZEVXbMnz8KIWsvf9'},

    {country: 'Turkey', playlistLink: '/playlist/37i9dQZEVXbIVYVBNw9D5K'},

    {country: 'United Arab Emirates', playlistLink: '/playlist/37i9dQZEVXbM4UZuIrvHvA'},

    {country: 'United States of America', playlistLink: '/playlist/37i9dQZEVXbLRQDuF5jeBp'},

    {country: 'Ukraine', playlistLink: '/playlist/37i9dQZEVXbKkidEfWYRuD'},

    {country: 'United Kingdom', playlistLink: '/playlist/37i9dQZEVXbLnolsZ8PSNw'},

    {country: 'Uruguay', playlistLink: '/playlist/37i9dQZEVXbMJJi3wgRbAy'},

    {country: 'Venezuela', playlistLink: '/playlist/37i9dQZEVXbNLrliB10ZnX'},

    {country: 'Vietnam', playlistLink: '/playlist/37i9dQZEVXbLdGSmz6xilI'}
]