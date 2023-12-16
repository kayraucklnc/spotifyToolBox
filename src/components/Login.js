/*global chrome*/
import "../style/components/Login.css";
import "../style/components/logos.css";
import {useState} from "react";

function LoginButton() {

    const clientId = 'c9c3145563c64380abab5d1ee47fdd09';
    const redirectUri = 'https://open.spotify.com/';
    const authEndpoint = "https://accounts.spotify.com/authorize"
    const scopes = [
        "user-read-currently-playing",
        "user-read-email",
        "user-read-private",
        "user-read-recently-played",
        "user-read-playback-state",
        "user-top-read",
        "user-modify-playback-state",
        "playlist-read-private",
        "playlist-modify-private",
        "playlist-modify-public",
        "user-library-read",
        "streaming"
    ]

    const handleLogin = () => {
        const authUrl = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&response_type=token&show_dialog=true`
        chrome.tabs.create({url: authUrl});
    }


    return (
        <div className={"login"}>
            <div className="spotify-logo"/>
            <h2>Welcome to Spotify Toolbox!</h2>
            <p>Press the button to login and unlock the features!</p>
            <a onClick={handleLogin}>
                Login with Spotify
            </a>
        </div>
    )
}

export default LoginButton;