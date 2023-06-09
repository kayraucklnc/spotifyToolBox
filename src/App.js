import './App.css';
import './components/SpotifyButton';
import SpotifyButton from "./components/SpotifyButton";

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
    const handleClick = () => {
        alert('Button clicked!');
    };
    return (
        <div className="App">
            <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>
                Login to Spotify
            </a>
            <SpotifyButton label="KAYRA!" onClick={handleClick} />

        </div>
    );
}



export default App;
