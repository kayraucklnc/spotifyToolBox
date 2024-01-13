/*global chrome*/

import React, {useEffect, useState} from 'react';
import SpotifyButton from "../../components/SpotifyButton";
import Basket from "../../components/Basket";
import WorldMap from "./WorldMap";


function PlaylistTab() {
    const [songs, setSongs] = useState([]);
    const [basketController, setBasketController] = useState(false);
    const [worldMapController, setWorldMapController] = useState(false);

    useEffect(() => {
        chrome.storage.local.get(["songs"], function (result) {
            if (result.songs !== undefined) {
                console.log(result.songs);
                setSongs(result.songs);
            }
        });
    }, []);

    const showBasket = () => {
        setBasketController(!basketController);
    }

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === 'addSongsToBasketReturn') {
            console.log(request.checkedSongs);
            setSongs(songs.concat(request.checkedSongs));
            chrome.storage.local.set({songs: songs.concat(request.checkedSongs)});
        }
    });

    const playlistToJson = () => {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            const currentUrl = tabs[0].url;
            chrome.tabs.sendMessage(tabs[0].id, {action: 'downloadJson', url: currentUrl});
        });
    }

    const deleteSongs = () => {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            const currentUrl = tabs[0].url;
            chrome.tabs.sendMessage(tabs[0].id, {action: 'deleteSongs', url: currentUrl});
        });
    }

    const addSongsToBasket = () => {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            const currentUrl = tabs[0].url;
            chrome.tabs.sendMessage(tabs[0].id, {action: 'addSongsToBasket'});
        });
    }

    const addPlaylistToBasket = () => {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            const currentUrl = tabs[0].url;
            chrome.tabs.sendMessage(tabs[0].id, {action: 'addPlaylistToBasket', url: currentUrl});
        });
    }

    const removeDuplicates = () => {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            const currentUrl = tabs[0].url;
            chrome.tabs.sendMessage(tabs[0].id, {action: 'removeDuplicates', url: currentUrl});
        });
    }

    const addSongsToPlaylist = () => {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            const currentUrl = tabs[0].url;
            chrome.tabs.sendMessage(tabs[0].id, {action: 'addSongsToPlaylist', url: currentUrl});
        });
    }

    const addPlaylistsToPlaylist = () => {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            const currentUrl = tabs[0].url;
            chrome.tabs.sendMessage(tabs[0].id, {action: 'addPlaylistsToPlaylist', url: currentUrl});
        });
    }

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === 'clearSongsFromBasket') {
            chrome.storage.local.get(["songs"], function (result) {
                const updatedSongsWithoutSongs = (result.songs || []).filter(song => song.type !== "song");

                chrome.storage.local.set({"songs": updatedSongsWithoutSongs}, function () {
                    setSongs(updatedSongsWithoutSongs);
                });
            });
        } else if (request.action === 'clearPlaylistsFromBasket') {
            chrome.storage.local.get(["songs"], function (result) {
                const updatedSongsWithoutPlaylists = (result.songs || []).filter(song => song.type !== "playlist");

                chrome.storage.local.set({"songs": updatedSongsWithoutPlaylists}, function () {
                    setSongs(updatedSongsWithoutPlaylists);
                });
            });
        }
    });

    const compareSongs = () => {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'compareSongs'});
        });
    }

    const showWorldMap = () => {
        setWorldMapController(!worldMapController);
    }

    return (
        <div>
            <SpotifyButton text="Download playlist" onClick={playlistToJson}/>
            <SpotifyButton text="Delete songs" onClick={deleteSongs}/>
            <SpotifyButton text="Remove Duplicate Songs" onClick={removeDuplicates}/>
            <SpotifyButton text="Add Songs to Basket" onClick={addSongsToBasket}/>
            <SpotifyButton text="Add Playlist to Basket" onClick={addPlaylistToBasket}/>
            <SpotifyButton text="Add Songs to Playlist" onClick={addSongsToPlaylist}/>
            <SpotifyButton text="Add Playlists to Playlist" onClick={addPlaylistsToPlaylist}/>
            <SpotifyButton text={"Basket " + songs.length} onClick={showBasket}/>
            {basketController && (
                <Basket songsInput={songs} setSongsInput={setSongs}/>
            )}
            <SpotifyButton text="Compare Songs" onClick={compareSongs}/>
            <SpotifyButton text="World Map" onClick={showWorldMap}/>
            {worldMapController && (<WorldMap/>)}
        </div>
    )
}

export default PlaylistTab;