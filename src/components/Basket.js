/*global chrome*/

import React from 'react';

const Basket = ({ songsInput, setSongsInput }) => {

    const removeSong = (index) => {
        setSongsInput(songsInput.filter((song, i) => i !== index));
        chrome.storage.local.set({songs: songsInput.filter((song, i) => i !== index)});
    }
    return (
        <div className="basket">
            <ul>
                {songsInput.map((song, index) => (
                    <div key={index} className="song-item">
                        <img src={song.imageUrl} alt={`${song.name} cover`} width="50" height="50" style={{display: "inline-block"}}/>
                        <div className="song-details" style={{display: "inline-block"}}>
                            <span><p className="song-name">{song.name}</p>
                            <p className="artist">{song.artist}</p></span>
                        </div>
                        <button className="remove-song" onClick={() => removeSong(index)}>Remove</button>
                    </div>
                ))}
            </ul>
        </div>
    );
};
export default Basket;