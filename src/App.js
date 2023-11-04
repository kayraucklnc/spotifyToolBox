import './style/index.css';
import Spotify from "./spotify";
import SpotifyButton from "./components/SpotifyButton";

function App() {
    return (
        <div className="App">
            <SpotifyButton text="Play on Spotify" onClick={() => {console.log("anan")}}/>
            <Spotify/>
        </div>
    );
}



export default App;
