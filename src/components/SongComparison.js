/*global chrome*/

import React, {useEffect, useState} from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';

const SongComparison = () => {

    const [songComparison, setSongComparison] = useState([]);
    const [comparisonVisible, setComparisonVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === 'songComparisonReturn') {
            console.log(request.songDatas);
            setSongComparison(request.songDatas);
        }
    });

    useEffect(() => {
        if (comparisonVisible) {
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 1000); // 1 saniye sonra isLoading'i false yap

            return () => clearTimeout(timer); // Unmount edildiğinde timer'ı temizle
        }
    }, []);

    return (

        <div style={{border: '1px solid #D6D6DA', borderRadius: '8px',
            backgroundColor: '#212121', padding: '10px', margin: '10px'}}>
            <h3>Song Comparison</h3>
            {isLoading
                ? <ProgressSpinner aria-label="Getting Songs" style={{width: '30px', height: '30px', marginTop: '20%'}}/>
                : (
                    <div>
                        <div>
                            <table>
                                <thead></thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <img src={songComparison[0].imageUrl} alt={songComparison[0].name} width="100" height="100"/>
                                        </td>
                                        <td>
                                            <div style={{width: '100px', height: '100px'}}></div>
                                        </td>
                                        <td>
                                            <img src={songComparison[1].imageUrl} alt={songComparison[1].name} width="100" height="100"/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p>{songComparison[0].name}</p>
                                        </td>
                                        <td></td>
                                        <td>
                                            <p>{songComparison[1].name}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p>{songComparison[0].duration}</p>
                                        </td>
                                        <td>
                                            <p style={{ fontWeight: 'bold', color: '#1DB954' }}>Duration</p>
                                        </td>
                                        <td>
                                            <p>{songComparison[1].duration}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p>{songComparison[0].popularity}</p>
                                        </td>
                                        <td>
                                            <p style={{ fontWeight: 'bold', color: '#1DB954' }}>Popularity</p>
                                        </td>
                                        <td>
                                            <p >{songComparison[1].popularity}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p>{songComparison[0].danceability}</p>
                                        </td>
                                        <td>
                                            <p style={{ fontWeight: 'bold', color: '#1DB954' }}>Danceability</p>
                                        </td>
                                        <td>
                                            <p>{songComparison[1].danceability}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p>{songComparison[0].energy}</p>
                                        </td>
                                        <td>
                                            <p style={{ fontWeight: 'bold', color: '#1DB954' }}>Energy</p>
                                        </td>
                                        <td>
                                            <p>{songComparison[1].energy}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p>{songComparison[0].loudness}</p>
                                        </td>
                                        <td>
                                            <p style={{ fontWeight: 'bold', color: '#1DB954' }}>Loudness</p>
                                        </td>
                                        <td>
                                            <p>{songComparison[1].loudness}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p>{songComparison[0].speechiness}</p>
                                        </td>
                                        <td>
                                            <p style={{ fontWeight: 'bold', color: '#1DB954' }}>Speechiness</p>
                                        </td>
                                        <td>
                                            <p>{songComparison[1].speechiness}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p>{songComparison[0].acousticness}</p>
                                        </td>
                                        <td>
                                            <p style={{ fontWeight: 'bold', color: '#1DB954' }}>Acousticness</p>
                                        </td>
                                        <td>
                                            <p>{songComparison[1].acousticness}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p>{songComparison[0].instrumentalness}</p>
                                        </td>
                                        <td>
                                            <p style={{ fontWeight: 'bold', color: '#1DB954' }}>Instrumentalness</p>
                                        </td>
                                        <td>
                                            <p>{songComparison[1].instrumentalness}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p>{songComparison[0].liveness}</p>
                                        </td>
                                        <td>
                                            <p style={{ fontWeight: 'bold', color: '#1DB954' }}>Liveness</p>
                                        </td>
                                        <td>
                                            <p>{songComparison[1].liveness}</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default SongComparison;