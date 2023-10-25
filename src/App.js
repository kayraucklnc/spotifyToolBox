import './App.css';
import SpotifyButton from "./components/spotifyButton";
import React, {useEffect, useRef} from "react";
import { saveAs } from 'file-saver';
/*global chrome*/

function App() {
    const CLIENT_ID = "239ae9d556f74055af35304e818d9ae6"
    const REDIRECT_URI = "http://localhost:3000"
    const AUTH_ENDPOINT = "https://accounts.spotify.com/api/token"
    const RESPONSE_TYPE = "token"

    // const [token, setToken] = useState("")
    // const [searchKey, setSearchKey] = useState("")
    // const [artists, setArtists] = useState([])

    // function test() {
    //     /* eslint-disable no-undef */
    //     chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    //         const activeTabId = tabs[0].id
    //         chrome.scripting.executeScript(
    //             {
    //                 target: {tabId: activeTabId},
    //                 function: () => alert("React Chrome Extension Alert"),
    //             })
    //     })
    // }

    const test = () => {
        alert("baban");
    }

    const playlistToJson = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const currentUrl = tabs[0].url;
            chrome.tabs.sendMessage(tabs[0].id, { action: 'downloadJson', url: currentUrl });
        });
    }

    return (
        <div className="App">
            {/*<a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>*/}
            {/*    Login to Spotify*/}
            {/*</a>*/}
            <div style={{height:150, width:150}} >
                <SpotifyButton name="Bu bir deneme" func={test}/>
                <SpotifyButton name="Download playlsit as a json file" func={playlistToJson}/>
            </div>
        </div>
    );
}

export default App;
