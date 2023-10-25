/*global chrome*/
import "../style/components/Login.css";
import "../style/components/SpotifyLogo.css";

function LoginButton() {

    const clientId = '239ae9d556f74055af35304e818d9ae6';
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