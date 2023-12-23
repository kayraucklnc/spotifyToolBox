/*global chrome*/

import React from 'react';
import SpotifyButton from "../../components/SpotifyButton";
import {useState} from "react";

const Artist = () => {

    const [artists, setArtists] = useState({});


    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === 'getRecursiveRelationsReturn') {
            console.log(request.artists);
            setArtists(request.artists);
        }
    });

    const getRecursiveRelations = () => {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            const currentUrl = tabs[0].url;
            chrome.tabs.sendMessage(tabs[0].id, {action: 'getRecursiveRelations', url: currentUrl});
        });
    }

    return (
        <div>
            <SpotifyButton text={"Artist Relations"} onClick={getRecursiveRelations}/>
            <div>
                {Object.keys(artists).length > 0 && Object.keys(artists).map((artist) => (
                    <div>
                        <p>-------------{artist}-------------</p>
                        {artists[artist].map((relatedArtist) => (
                            <p>
                                {relatedArtist}
                            </p>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Artist;