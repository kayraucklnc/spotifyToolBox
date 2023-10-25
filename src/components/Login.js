/*global chrome*/
import "../style/components/Login.css";
import "../style/components/SpotifyLogo.css";
import SpotifyLogo from "./SpotifyLogo";
function LoginButton() {
    const client_id = '239ae9d556f74055af35304e818d9ae6';
    const redirect_uri = 'http://localhost:3000/';

    const handleLogin = () => {
        const scope = 'user-read-private user-read-email';

        const queryParams = new URLSearchParams({
            response_type: 'code',
            client_id,
            scope,
            redirect_uri
        });

        // const authorizationUrl = `https://accounts.spotify.com/authorize?${queryParams}`;
        const authorizationUrl = `https://www.google.com`;

        // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        //     const tabId = tabs[0].id;
        //     chrome.tabs.update(tabId, { url: authorizationUrl });
        // });
        chrome.tabs.create({ url: authorizationUrl });

    };


    return (

        <div className={"login"}>
            <SpotifyLogo/>
            <h2>Welcome to Spotify Toolbox!</h2>
            <p>Press the button to login and unlock the features!</p>
            <button onClick={handleLogin}>
                Login with Spotify
            </button>

        </div>
        )

}

    export default LoginButton;