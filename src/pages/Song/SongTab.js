/*global chrome*/
import React, {useState, useEffect} from 'react';
import SpotifyButton from "../../components/SpotifyButton";
import {getLyrics, getSong} from 'genius-lyrics-api';
import * as d3 from "d3";
import * as cloud from "d3-cloud";

const SongTab = () => {
    const [songLyrics, setSongLyrics] = useState('');
    const [currentlyPlayingTrack, setCurrentlyPlayingTrack] = useState(null);
    const [showWordCloud, setShowWordCloud] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getSongLyrics = () => {
        setLoading(true);
        setError(null);
        if (currentlyPlayingTrack) {
            const options = {
                apiKey: '4seie7dfD8gr8vUlgupEhrh-DUx03hbEK0KP4d1DfGHykYA3aZT0Da4-Kligh2eu',
                title: currentlyPlayingTrack.title,
                artist: currentlyPlayingTrack.artist,
                optimizeQuery: true
            };

            getLyrics(options).then((lyrics) => setSongLyrics(lyrics))
                .catch((err) => setError('Error fetching lyrics. Please try again.'))
                .finally(() => setLoading(false));
        } else {
            console.error('No currently playing track available.');
            setLoading(false);
        }
    };

    const fetchCurrentlyPlayingTrack = () => {
        setLoading(true);
        setError(null);
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            const currentUrl = tabs[0].url;

            chrome.tabs.sendMessage(tabs[0].id, {action: 'getCurrentlyPlayingTrack', currentUrl}, function (response) {
                if (response && response.success) {
                    setCurrentlyPlayingTrack(response.currentlyPlayingTrack);
                } else {
                    console.error('Error fetching currently playing track:', response?.error || 'Unknown error');
                    setError(response?.error || 'Unknown error');

                }
                setLoading(false);

            });
        });
    };

    const generateWordCloud = () => {
        if (!songLyrics) {
            console.error('No lyrics available to generate a word cloud.');
            return;
        }

        // Split the lyrics into an array of words
        const wordsArray = songLyrics.split(/\s+/);

        // Calculate word frequencies
        const wordFrequencies = {};
        wordsArray.forEach((word) => {
            const normalizedWord = word.toLowerCase();
            wordFrequencies[normalizedWord] = (wordFrequencies[normalizedWord] || 0) + 1;
        });

        // Convert word frequencies to an array of objects
        const wordCloudData = Object.keys(wordFrequencies).map((word) => ({
            text: word,
            size: wordFrequencies[word] * 10, // Adjust the size as needed
        }));

        // Set up d3-cloud layout
        const layout = cloud()
            .size([400, 400]) // Adjust the size as needed
            .words(wordCloudData)
            .padding(5)
            .rotate(() => (Math.random() < 0.5 ? 0 : 90)) // Random rotation
            .fontSize((d) => d.size)
            .on('end', draw);

        // Remove existing content in the #wordcloud div
        document.getElementById('wordcloud').innerHTML = '';

        // Append an SVG element to #wordcloud and call the layout to generate the cloud
        const svg = d3.select('#wordcloud').append('svg')
            .attr('width', 400)
            .attr('height', 400)
            .append('g')
            .attr('transform', 'translate(250,250)');

        layout.start();

        function draw(words) {
            const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

            svg.selectAll('text')
                .data(words)
                .enter().append('text')
                .style('font-size', (d) => `${d.size}px`)
                .style('fill', (d, i) => colorScale(i))
                .attr('text-anchor', 'middle')
                .attr('transform', (d) =>
                    `translate(${[d.x, d.y]})rotate(${d.rotate})`)
                .text((d) => d.text);
        }

        setShowWordCloud(true)
        setLoading(false)
    };

    return (
        <div>
            <SpotifyButton text="Show Currently playing Track" onClick={fetchCurrentlyPlayingTrack}/>
            <SpotifyButton text="Show Lyrics" onClick={getSongLyrics}/>
            <SpotifyButton text="Word Frequencies" onClick={generateWordCloud}/>

            {currentlyPlayingTrack && (
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
                </div>
            )}

            {loading && <p>Loading...</p>}

            {songLyrics && !showWordCloud && (
                <div id="lyrics-container">
                    <pre>{songLyrics}</pre>
                </div>
            )}
            <div id={showWordCloud ? "wordcloud-container" : ""}>
                <div id="wordcloud"
                     style={{width: showWordCloud ? '400px' : '0', height: showWordCloud ? '400px' : '0'}}></div>
            </div>
        </div>
    );
};

export default SongTab;
