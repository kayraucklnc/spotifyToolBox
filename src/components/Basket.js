/*global chrome*/

import React from 'react';

const Basket = ({songsInput, setSongsInput}) => {

    const removeSong = (index) => {
        setSongsInput(songsInput.filter((song, i) => i !== index));
        chrome.storage.local.set({songs: songsInput.filter((song, i) => i !== index)});
    }
    return (

        <div className="basket">
            <h2 className="basket-title">Your Basket</h2>
            <ul>
                {songsInput.map((song, index) => (
                    <div key={index} className="song-item">
                        <span className="song-number">{index + 1}</span>
                        <img className="song-img" src={song.imageUrl} alt={`${song.name} cover`} width="40"
                             height="40"/>
                        <div className="song-details">
                              <span>
                                <p className="song-name">{song.name}</p>
                                <p className="artist">{song.artist}</p>
                              </span>
                        </div>
                            <i className="remove-song fa-light fa-trash" onClick={() => removeSong(index)}></i>
                    </div>
                ))}
            </ul>
        </div>
    );
};
export default Basket;