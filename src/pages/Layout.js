import React, {useState} from 'react';
import Navigation from "../components/Navigation";
import Login from "./Login";
import Home from "./HomePage";
import PlaylistTab from "./Playlist/PlaylistTab";

const Layout = () => {
    const [currentTab, setCurrentTab] = useState("home")
    return (
        <div>
            <Navigation currentTab={currentTab} setCurrentTab={setCurrentTab}/>
            {currentTab === "home" && <Home/>}
            {currentTab === "user" && <div/>}
            {currentTab === "playlist" && <PlaylistTab/>}
            {currentTab === "artist" && <div/>}
        </div>
    );
};

export default Layout;