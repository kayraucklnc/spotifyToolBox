/*global chrome*/
import React, {useState, useEffect} from 'react';
import SpotifyButton from "../../components/SpotifyButton";
import {getLyrics} from 'genius-lyrics-api';
import * as d3 from "d3";
import * as cloud from "d3-cloud";
import Loading from "../../components/Loading";

const SongTab = () => {
    const [songLyrics, setSongLyrics] = useState('');
    const [currentlyPlayingTrack, setCurrentlyPlayingTrack] = useState(null);
    const [showWordCloud, setShowWordCloud] = useState(false);
    const [trackLoading, setTrackLoading] = useState(false);
    const [lyricsLoading, setLyricsLoading] = useState(false);
    const [cloudLoading, setCloudLoading] = useState(false);

    const [error, setError] = useState(null);
    const [showLyrics, setShowLyrics] = useState(false)
    const [showTrack, setShowTrack] = useState(false)

    useEffect(() => {
        fetchCurrentlyPlayingTrack();
        const intervalId = setInterval(fetchCurrentlyPlayingTrack, 10000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (showLyrics && showWordCloud) {
            generateWordCloud()
        }
    }, [songLyrics]);

    const handleShowCurrentlyPlayingTrack = () => {
        fetchCurrentlyPlayingTrack();
        setShowTrack(true)
    };

    const handleShowLyrics = () => {
        setShowLyrics(true)
    };

    const handleGenerateWordCloud = () => {
        if (!songLyrics) {
            getSongLyrics();
        }
        generateWordCloud();
    };

    const fetchCurrentlyPlayingTrack = () => {
        setTrackLoading(true);
        setError(null);

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const currentUrl = tabs[0].url;

            chrome.tabs.sendMessage(tabs[0].id, { action: 'getCurrentlyPlayingTrack', currentUrl }, function (response) {
                if (response && response.success) {
                    setCurrentlyPlayingTrack(prevTrack => {
                        console.log("currentlyPlayingTrack ", prevTrack)
                        console.log("response ", response.currentlyPlayingTrack)
                        console.log("equal?  ", response.currentlyPlayingTrack?.title === prevTrack?.title && response.currentlyPlayingTrack?.artist === prevTrack?.artist)

                        if (!prevTrack || response.currentlyPlayingTrack?.title !== prevTrack?.title || response.currentlyPlayingTrack?.artist !== prevTrack?.artist) {
                            getSongLyrics(response.currentlyPlayingTrack);
                            return response.currentlyPlayingTrack;
                        } else {
                            return prevTrack;
                        }
                    });
                } else {
                    console.error('Error fetching currently playing track:', response?.error || 'Unknown error');
                    setError('No currently playing song. Play a song on Spotify to see details.');
                }
                setTrackLoading(false);
            });
        });
    };

    const getSongLyrics = (track) => {
        setLyricsLoading(true);
        setError(null);
        if (track) {
            const options = {
                apiKey: '4seie7dfD8gr8vUlgupEhrh-DUx03hbEK0KP4d1DfGHykYA3aZT0Da4-Kligh2eu',
                title: track.title,
                artist: track.artist,
                optimizeQuery: true
            };
            getLyrics(options).then((lyrics) => setSongLyrics(lyrics))
                .catch(() => setError("No lyrics for this song is available"))
                .finally(() => setLyricsLoading(false));
        } else {
            setLyricsLoading(false);
        }
    };

    const generateWordCloud = () => {
        setCloudLoading(true);

        if (!currentlyPlayingTrack) {
            setError('No currently playing song. Play a song on Spotify to see details.');
            return;
        }
        if (currentlyPlayingTrack && !songLyrics) {
            if(!lyricsLoading) {
                setError("No lyrics for this song is available");
                return;
            }
        }

        const wordsArray = songLyrics.replace(/\[[^\]]+\]/g, '').split(/\s+/);

        const wordFrequencies = {};
        wordsArray.forEach((word) => {
            const normalizedWord = word.toLowerCase();
            wordFrequencies[normalizedWord] = (wordFrequencies[normalizedWord] || 0) + 1;
        });

        const wordCloudData = Object.keys(wordFrequencies).map((word) => ({
            text: word, size: wordFrequencies[word] * 7,
        }));

        const layout = cloud()
            .size([320, 300])
            .words(wordCloudData)
            .padding(5)
            .rotate(() => (Math.random() < 0.5 ? 0 : 90))
            .fontSize((d) => d.size)
            .on('end', draw);

        document.getElementById('wordcloud').innerHTML = '';

        const svgContainer = d3.select('#wordcloud');
        const svg = svgContainer.append('svg')
            .attr('width', 320)
            .attr('height', 300)
            .append('g');

        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on('zoom', zoomed);

        svgContainer.call(zoom)
            .call(zoom.transform, d3.zoomIdentity.translate(160, 150).scale(1));

        function zoomed(event) {
            svg.attr('transform', event.transform);
        }

        layout.start();

        function draw(words) {
            const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
            svg.selectAll('text')
                .data(words)
                .enter().append('text')
                .style('font-size', (d) => `${d.size}px`)
                .style('fill', (d, i) => colorScale(i))
                .attr('text-anchor', 'middle')
                .attr('transform', (d) => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
                .text((d) => d.text);
        }

        setCloudLoading(false);
        setShowWordCloud(true);
    };


    return (<div>

        {error && <p>{error}</p>}

        <div>
            <SpotifyButton text="Show Currently playing Track" onClick={handleShowCurrentlyPlayingTrack}/>
        </div>

        {trackLoading && showTrack && <Loading/>}

        {!trackLoading && showTrack && currentlyPlayingTrack && (
            <div className="currently-playing-container">
                <h2 className="currently-playing-title">Currently Playing Song</h2>
                <div className="playing-song-item">
                    <img className="song-img" src={currentlyPlayingTrack.imageUrl}
                         alt={`${currentlyPlayingTrack.title} cover`} width="50" height="50"/>
                    <div className="song-details">
                        <span>
                            <p className="song-name">{currentlyPlayingTrack.title}</p>
                            <p className="artist">{currentlyPlayingTrack.artist}</p>
                        </span>
                    </div>
                </div>
            </div>)}

        <div>
            <SpotifyButton text="Show Lyrics" onClick={handleShowLyrics} disable={!currentlyPlayingTrack}/>
            <SpotifyButton text="Word Frequencies" onClick={handleGenerateWordCloud} disable={!currentlyPlayingTrack}/>
        </div>

        {lyricsLoading && showLyrics && <Loading/>}

        {!lyricsLoading && showLyrics && songLyrics && (
            <div id="lyrics-container">
                <pre>{songLyrics}</pre>
            </div>
        )}

        <div id={showWordCloud ? "wordcloud-container" : ""}>
            <div id="wordcloud"
                 style={{width: showWordCloud ? '320px' : '0', height: showWordCloud ? '300px' : '0'}}></div>
        </div>



    </div>);
};

export default SongTab;