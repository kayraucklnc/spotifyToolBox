import React from 'react';

const SpotifyButton = ({ label, onClick }) => {
    console.log("button");
    return (
        <button onClick={onClick}>{label}</button>
    );
};

export default SpotifyButton;