import React from 'react';

const SpotifyButton = (props) => {
    console.log("button");
    return (
        <button onClick={props.onClick}>{props.label}</button>
    );
};

export default SpotifyButton;