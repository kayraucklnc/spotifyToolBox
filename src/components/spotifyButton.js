import React from 'react';

const SpotifyButton = ({name, func}) => {
    return (
        <div>
            <button onClick={func}> {name} </button>
        </div>
    );
};

export default SpotifyButton;