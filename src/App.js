/*global chrome*/
import "./style/index.css";
import Spotify from "./Spotify";
import ForceDirectedGraph from "./pages/ForceDirectedGraph";

function App() {


  return (
    <div className="App">
      <Spotify />
      {/*<ForceDirectedGraph />*/}
    </div>
  );
}

export default App;
