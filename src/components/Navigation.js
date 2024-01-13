import React from 'react';
import './../style/index.css';


const Navigation = ({currentTab, setCurrentTab}) => {

    return (
        <div className="navbar">
            <div className="navbar-links">
                <a onClick={() => setCurrentTab("home")}  className={`navbar-link ${currentTab === "home" ? "active" : ""}`}>Home</a>
                <a onClick={() => setCurrentTab("playlist")} className={`navbar-link ${currentTab === "playlist" ? "active" : ""}`}>Playlist</a>
                <a onClick={() => setCurrentTab("artist")} className={`navbar-link ${currentTab === "artist" ? "active" : ""}`}>Artist</a>
                <a onClick={() => setCurrentTab("song")} className={`navbar-link ${currentTab === "song" ? "active" : ""}`}>Song</a>
            </div>
        </div>
    );
}

export default Navigation;