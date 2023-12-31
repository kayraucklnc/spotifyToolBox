import React, {useState} from 'react';
import Navigation from "../components/Navigation";
import Login from "./Login";
import Home from "./HomePage";
import PlaylistTab from "./Playlist/PlaylistTab";
import ArtistTab from "./Artist/ArtistTab";
import SongTab from "./Song/SongTab";

const Layout = () => {
    const [currentTab, setCurrentTab] = useState("home")
    return (
        <div className="layout-container">
            <Navigation currentTab={currentTab} setCurrentTab={setCurrentTab}/>
            {currentTab === "home" && <Home/>}
            {currentTab === "song" && <SongTab/>}
            {currentTab === "playlist" && <PlaylistTab/>}
            {currentTab === "artist" && <ArtistTab/>}
        </div>
    );
};

export default Layout;