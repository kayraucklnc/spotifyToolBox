import React from 'react';

const Header = ({ user }) => {
    return (
        <div className="header">
            <img src="path/to/spotify-logo.png" alt="Spotify Logo" className="logo" />
            <div className="user-info">
                <img src={user.profilePicture} alt="User Profile" className="profile-picture" />
                <p className="welcome-message">Welcome, {user.username}!</p>
            </div>
        </div>
    );
}

export default Header;