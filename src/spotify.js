import React, {useEffect, useState} from 'react';
import SpotifyWebApi from "spotify-web-api-js";
import LoginButton from "./components/Login";

const Spotify = () => {
    const spotify = new SpotifyWebApi();
    const [spotifyToken, setSpotifyToken] = useState("");
    const [spotifyUser, setSpotifyUser] = useState("");
    const [id, setId] = useState(0)
    const [username, setUsername] = useState('')
    const [playlists, setPlaylists] = useState([])
    const [songs, setSongs] = useState([])
    const [token, setToken] = useState(null)

    const user = {
        id: id,
        username: username,
        playlists: playlists,
        songs: songs,
        token: token,
        spotifyToken: spotifyToken,
        spotifyUser: spotifyUser
    }

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
        //console.log("This is what we derived from the URL: ", getTokenFromUrl())
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

            const message = {type: 'spotifyLoginSuccess'};
            chrome.runtime.sendMessage(message);
        }

    }, []);
    console.log("This is our spotify token: ", spotifyToken)


    const handleResponse = (resp) => {
        console.log("this is coming from handleResponse: ", resp)
        if (resp.token) {
            setId(resp.user.id)
            setUsername(resp.user.username)
            setPlaylists(resp.user.playlists)
            setSongs(resp.user.songs)
            setToken(resp.token)
            localStorage.token = resp.token
        } else {
            alert(resp.errors)
        }
    }

    return (<LoginButton/>);
};

export default Spotify;