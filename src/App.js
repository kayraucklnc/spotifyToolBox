import './App.css';
import SpotifyButton from "./components/spotifyButton";
import React from "react";

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
        alert("anan")
    }

    return (
        <div className="App">
            {/*<a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>*/}
            {/*    Login to Spotify*/}
            {/*</a>*/}
            <div style={{height:500}} >
                <SpotifyButton name="Bu bir deneme" func={test}/>
            </div>
        </div>
    );
}

export default App;
