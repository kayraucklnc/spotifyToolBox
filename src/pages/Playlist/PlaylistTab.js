/*global chrome*/

import React, {useEffect, useState} from 'react';
import SpotifyButton from "../../components/SpotifyButton";
import Basket from "../../components/Basket";


function PlaylistTab() {
    const [songs, setSongs] = useState([]);
    const [basketController, setBasketController] = useState(false);

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

    const removeDuplicates = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const currentUrl = tabs[0].url;
            chrome.tabs.sendMessage(tabs[0].id, { action: 'removeDuplicates', url: currentUrl });
        });
    }

    const addSongsToPlaylist = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const currentUrl = tabs[0].url;
            chrome.tabs.sendMessage(tabs[0].id, { action: 'addSongsToPlaylist', url: currentUrl });
        });
    }


    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if(request.action === 'clearBasket'){
            chrome.storage.local.remove("songs", function() {
                setSongs([]);
            });
        }
    });

    return (<div><SpotifyButton text="Download playlist" onClick={playlistToJson}/>
        <SpotifyButton text="Delete songs" onClick={deleteSongs}/>
        <SpotifyButton text="Remove Duplicate Songs" onClick={removeDuplicates}/>
        <SpotifyButton text="Add Songs to Playlist" onClick={addSongsToPlaylist}/>
        <SpotifyButton text="Add Songs to Basket" onClick={addSongsToBasket}/>
        <SpotifyButton text={"Song Basket " + songs.length} onClick={showBasket}/>
        {basketController && (
            <Basket songsInput={songs} setSongsInput={setSongs}/>
        )}</div>)
}

export default PlaylistTab;