import React from 'react';

const buttonStyle = {
    backgroundColor: '#1DB954',
    color: '#191414',
    border: 'none',
    borderRadius: '20px',
    padding: '15px 20px',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    display: 'inline-block',
    outline: 'none',
    fontSize: 12,
    margin: 15,
};

const SpotifyButton = ({ text, onClick }) => {
    return (
        <button style={buttonStyle} onClick={onClick}>
            {text}
        </button>
    );
};

export default SpotifyButton;
