/*global chrome*/
import React, {useEffect, useState} from 'react';
import SpotifyWebApi from "spotify-web-api-js";
import LoginButton from "./components/Login";
import SpotifyButton from "./components/SpotifyButton";

const Spotify = () => {
    const spotify = new SpotifyWebApi();
    const [spotifyToken, setSpotifyToken] = useState("");
    const [spotifyUser, setSpotifyUser] = useState("");
    const [id, setId] = useState(0)
    const [username, setUsername] = useState('')
    const [playlists, setPlaylists] = useState([])
    const [songs, setSongs] = useState([])
    const [token, setToken] = useState(null)


    const [accessToken, setAccessToken] = useState("");
    const [showLogout, setShowLogout] = useState(false);

    const user = {
        id: id,
        username: username,
        playlists: playlists,
        songs: songs,
        token: token,
        spotifyToken: spotifyToken,
        spotifyUser: spotifyUser
    }

    useEffect(() => {
        chrome.storage.local.get(["accessToken"]).then(result => {
            console.log(result.accessToken);
            if(result.accessToken !== undefined){
                setAccessToken(result.accessToken);
                setShowLogout(true);
            }
        })
    }, [])

    const getTokenFromUrl = () => {
        return window.location.hash
            .substring(1)
            .split('&')
            .reduce((initial, item) => {
                let parts = item.split("=");
                initial[parts[0]] = decodeURIComponent(parts[1])
                return initial
            }, {})
    }

    useEffect(() => {
        console.log("This is what we derived from the URL: " + getTokenFromUrl())
        const _spotifyToken = getTokenFromUrl().access_token;
        window.location.hash = "";

        if (_spotifyToken) {
            setSpotifyToken(_spotifyToken)
            spotify.setAccessToken(spotifyToken)
            // In your content script or popup script after a successful Spotify login

            spotify.getMe().then((user) => {
                setSpotifyUser(user)
                console.log("Me: ", user)
            })

            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'token', url: _spotifyToken });
            });
        }

    }, []);

    // chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    //     if(request.action === 'setAccessToken'){
    //        setAccessToken(request.url)
    //     }
    //     console.log(request.url)
    // });

    console.log(accessToken);

    function logout(){
        chrome.storage.local.clear();
        setAccessToken("");
        setShowLogout(false)
    }

    return (
        <div>
            {accessToken === "" && (
                <div>
                    <LoginButton/>
                </div>
            )}
            {showLogout && (
                <SpotifyButton text="Log out" onClick={logout}/>
            )}
        </div>
    );
};

export default Spotify;