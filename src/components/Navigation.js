import React from 'react';
import './../style/index.css';


const Navigation = ({setCurrentTab}) => {

    return (
        <div className="navbar">
            <div className="navbar-links">
                <a onClick={() => setCurrentTab("home")} className="navbar-link">Home</a>
                <a onClick={() => setCurrentTab("playlist")} className="navbar-link">Playlist</a>
                <a onClick={() => setCurrentTab("artist")} className="navbar-link">Artist</a>
                <a onClick={() => setCurrentTab("user")} className="navbar-link">My Data</a>
            </div>
        </div>
    );
}

export default Navigation;