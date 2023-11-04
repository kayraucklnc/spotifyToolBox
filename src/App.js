/*global chrome*/

import './style/index.css';
import Spotify from "./spotify";
import SpotifyButton from "./components/SpotifyButton";

const playlistToJson = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const currentUrl = tabs[0].url;
        chrome.tabs.sendMessage(tabs[0].id, { action: 'downloadJson', url: currentUrl });
    });
}

const deleteSongs = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const currentUrl = tabs[0].url;
        chrome.tabs.sendMessage(tabs[0].id, { action: 'deleteSongs', url: currentUrl });
    });
}

function App() {
    return (
        <div className="App">
            <SpotifyButton text="Download playlist" onClick={playlistToJson}/>
            <SpotifyButton text="Delete songs" onClick={deleteSongs}/>
            <Spotify/>
        </div>
    );
}



export default App;
