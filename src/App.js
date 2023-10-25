import './style/index.css';
import LoginButton from "./components/Login";

function App() {

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
            <LoginButton/>

        </div>
    );
}



export default App;
