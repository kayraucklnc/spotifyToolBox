/*global chrome*/

import React from 'react';
import SpotifyButton from "../../components/SpotifyButton";

const Artist = () => {

    const getRecursiveRelations = () => {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            const currentUrl = tabs[0].url;
            chrome.tabs.sendMessage(tabs[0].id, {action: 'getRecursiveRelations', url: currentUrl});
        });
    }

    return (
        <div>
            <SpotifyButton text={"Artist Relations"} onClick={getRecursiveRelations}/>
        </div>
    );
};

export default Artist;