/* global chrome */
import React, { useState, useEffect } from "react";
import { ZoomableGroup, ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import SpotifyButton from "../../components/SpotifyButton";

// Dünya haritasının topoJSON URL'si
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const WorldMap = () => {
    const [selectedCountry, setSelectedCountry] = useState("");
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hoveredCountry, setHoveredCountry] = useState("-");
    const [top3Songs, setTop3Songs] = useState({country: "", songs: [], url: ""});

    const countryPlaylists = [
        {country: 'Argentina', playlistLink: '/playlist/37i9dQZEVXbMMy2roB9myp'},

        {country: 'Australia', playlistLink: '/playlist/37i9dQZEVXbJPcfkRz0wJ0'},

        {country: 'Austria', playlistLink: '/playlist/37i9dQZEVXbKNHh6NIXu36'},

        {country: 'Belarus', playlistLink: '/playlist/37i9dQZEVXbIYfjSLbWr4V'},

        {country: 'Belgium', playlistLink: '/playlist/37i9dQZEVXbJNSeeHswcKB'},

        {country: 'Bolivia', playlistLink: '/playlist/37i9dQZEVXbJqfMFK4d691'},

        {country: 'Brazil', playlistLink: '/playlist/37i9dQZEVXbMXbN3EUUhlg'},

        {country: 'Bulgaria', playlistLink: '/playlist/37i9dQZEVXbNfM2w2mq1B8'},

        {country: 'Canada', playlistLink: '/playlist/37i9dQZEVXbKj23U1GF4IR'},

        {country: 'Chile', playlistLink: '/playlist/37i9dQZEVXbL0GavIqMTeb'},

        {country: 'Colombia', playlistLink: '/playlist/37i9dQZEVXbOa2lmxNORXQ'},

        {country: 'Costa Rica', playlistLink: '/playlist/37i9dQZEVXbMZAjGMynsQX'},

        {country: 'Czechia', playlistLink: '/playlist/37i9dQZEVXbIP3c3fqVrJY'},

        {country: 'Denmark', playlistLink: '/playlist/37i9dQZEVXbL3J0k32lWnN'},

        {country: 'Dominican Republic', playlistLink: '/playlist/37i9dQZEVXbKAbrMR8uuf7'},

        {country: 'Ecuador', playlistLink: '/playlist/37i9dQZEVXbJlM6nvL1nD1'},

        {country: 'Egypt', playlistLink: '/playlist/37i9dQZEVXbLn7RQmT5Xv2'},

        {country: 'El Salvador', playlistLink: '/playlist/37i9dQZEVXbLxoIml4MYkT'},

        {country: 'Estonia', playlistLink: '/playlist/37i9dQZEVXbLesry2Qw2xS'},

        {country: 'Finland', playlistLink: '/playlist/37i9dQZEVXbMxcczTSoGwZ'},

        {country: 'France', playlistLink: '/playlist/37i9dQZEVXbIPWwFssbupI'},

        {country: 'Germany', playlistLink: '/playlist/37i9dQZEVXbJiZcmkrIHGU'},

        {country: 'Greece', playlistLink: '/playlist/37i9dQZEVXbJqdarpmTJDL'},

        {country: 'Guatemala', playlistLink: '/playlist/37i9dQZEVXbLy5tBFyQvd4'},

        {country: 'Honduras', playlistLink: '/playlist/37i9dQZEVXbJp9wcIM9Eo5'},

        {country: 'Hong Kong', playlistLink: '/playlist/37i9dQZEVXbLwpL8TjsxOG'},

        {country: 'Hungary', playlistLink: '/playlist/37i9dQZEVXbNHwMxAkvmF8'},

        {country: 'Iceland', playlistLink: '/playlist/37i9dQZEVXbKMzVsSGQ49S'},

        {country: 'India', playlistLink: '/playlist/37i9dQZEVXbLZ52XmnySJg'},

        {country: 'Indonesia', playlistLink: '/playlist/37i9dQZEVXbObFQZ3JLcXt'},

        {country: 'Ireland', playlistLink: '/playlist/37i9dQZEVXbKM896FDX8L1'},

        {country: 'Israel', playlistLink: '/playlist/37i9dQZEVXbJ6IpvItkve3'},

        {country: 'Italy', playlistLink: '/playlist/37i9dQZEVXbIQnj7RRhdSX'},

        {country: 'Japan', playlistLink: '/playlist/37i9dQZEVXbKXQ4mDTEBXq'},

        {country: 'Kazakhstan', playlistLink: '/playlist/37i9dQZEVXbM472oKPNKzS'},

        {country: 'Latvia', playlistLink: '/playlist/37i9dQZEVXbJWuzDrTxbKS'},

        {country: 'Lithuania', playlistLink: '/playlist/37i9dQZEVXbMx56Rdq5lwc'},

        {country: 'Luxembourg', playlistLink: '/playlist/37i9dQZEVXbKGcyg6TFGx6'},

        {country: 'Malaysia', playlistLink: '/playlist/37i9dQZEVXbJlfUljuZExa'},

        {country: 'Mexico', playlistLink: '/playlist/37i9dQZEVXbO3qyFxbkOE1'},

        {country: 'Morocco', playlistLink: '/playlist/37i9dQZEVXbJU9eQpX8gPT'},

        {country: 'Netherlands', playlistLink: '/playlist/37i9dQZEVXbKCF6dqVpDkS'},

        {country: 'New Zealand', playlistLink: '/playlist/37i9dQZEVXbM8SIrkERIYl'},

        {country: 'Nicaragua', playlistLink: '/playlist/37i9dQZEVXbISk8kxnzfCq'},

        {country: 'Nigeria', playlistLink: '/playlist/37i9dQZEVXbKY7jLzlJ11V'},

        {country: 'Norway', playlistLink: '/playlist/37i9dQZEVXbJvfa0Yxg7E7'},

        {country: 'Pakistan', playlistLink: '/playlist/37i9dQZEVXbJkgIdfsJyTw'},

        {country: 'Panama', playlistLink: '/playlist/37i9dQZEVXbKypXHVwk1f0'},

        {country: 'Paraguay', playlistLink: '/playlist/37i9dQZEVXbNOUPGj7tW6T'},

        {country: 'Peru', playlistLink: '/playlist/37i9dQZEVXbJfdy5b0KP7W'},

        {country: 'Philippines', playlistLink: '/playlist/37i9dQZEVXbNBz9cRCSFkY'},

        {country: 'Poland', playlistLink: '/playlist/37i9dQZEVXbN6itCcaL3Tt'},

        {country: 'Portugal', playlistLink: '/playlist/37i9dQZEVXbKyJS56d1pgi'},

        {country: 'Romania', playlistLink: '/playlist/37i9dQZEVXbNZbJ6TZelCq'},

        {country: 'Saudi Arabia', playlistLink: '/playlist/37i9dQZEVXbLrQBcXqUtaC'},

        {country: 'Singapore', playlistLink: '/playlist/37i9dQZEVXbK4gjvS1FjPY'},

        {country: 'Slovakia', playlistLink: '/playlist/37i9dQZEVXbKIVTPX9a2Sb'},

        {country: 'South Africa', playlistLink: '/playlist/37i9dQZEVXbMH2jvi6jvjk'},

        {country: 'South Korea', playlistLink: '/playlist/37i9dQZEVXbNxXF4SkHj9F'},

        {country: 'Spain', playlistLink: '/playlist/37i9dQZEVXbNFJfN1Vw8d9'},

        {country: 'Sweden', playlistLink: '/playlist/37i9dQZEVXbLoATJ81JYXz'},

        {country: 'Switzerland', playlistLink: '/playlist/37i9dQZEVXbJiyhoAPEfMK'},

        {country: 'Taiwan', playlistLink: '/playlist/37i9dQZEVXbMnZEatlMSiu'},

        {country: 'Thailand', playlistLink: '/playlist/37i9dQZEVXbMnz8KIWsvf9'},

        {country: 'Turkey', playlistLink: '/playlist/37i9dQZEVXbIVYVBNw9D5K'},

        {country: 'United Arab Emirates', playlistLink: '/playlist/37i9dQZEVXbM4UZuIrvHvA'},

        {country: 'United States of America', playlistLink: '/playlist/37i9dQZEVXbLRQDuF5jeBp'},

        {country: 'Ukraine', playlistLink: '/playlist/37i9dQZEVXbKkidEfWYRuD'},

        {country: 'United Kingdom', playlistLink: '/playlist/37i9dQZEVXbLnolsZ8PSNw'},

        {country: 'Uruguay', playlistLink: '/playlist/37i9dQZEVXbMJJi3wgRbAy'},

        {country: 'Venezuela', playlistLink: '/playlist/37i9dQZEVXbNLrliB10ZnX'},

        {country: 'Vietnam', playlistLink: '/playlist/37i9dQZEVXbLdGSmz6xilI'}
    ]

    useEffect(() => {
        if (dialogVisible) {
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 1500); // 1.5 saniye sonra isLoading'i false yap

            return () => clearTimeout(timer); // Unmount edildiğinde timer'ı temizle
        }
    }, [dialogVisible]);

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === 'top3SongsReturn') {
            console.log(request.top3Songs);
            setTop3Songs(request.top3Songs);
        }
    });

    const isCountryInList = (countryName) => {
        return countryPlaylists.some(playlist => playlist.country === countryName);
    };

    const handleCountryClick = (countryName) => {
        console.log("clicked" + countryName)
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'getCountriesTopThreeSongs', country: countryName});
        });
        setSelectedCountry(countryName);
        setDialogVisible(true);
        setIsLoading(true);
    };

    const hideDialog = () => {
        setDialogVisible(false);
        setIsLoading(true); // Dialog kapatıldığında yükleme durumunu sıfırla
    };

    const handleMouseEnter = (countryName) => {
        setHoveredCountry(countryName);
    };

    const handleMouseLeave = () => {
        setHoveredCountry("-");
    };

    return (
        <div>
            <h3>Countries' Top 3 Songs</h3>
            <h4>{hoveredCountry}</h4>
            <ComposableMap>
                <ZoomableGroup>
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map(geo => (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    onClick={() => {isCountryInList(geo.properties.name) && handleCountryClick(geo.properties.name)}}
                                    onMouseEnter={() => handleMouseEnter(geo.properties.name)}
                                    onMouseLeave={handleMouseLeave}
                                    style={{
                                        default: {
                                            fill: isCountryInList(geo.properties.name) ? "#1DB954" : "#D6D6DA",
                                            stroke: "#212121",
                                            strokeWidth: 0.5,
                                        },
                                        hover: isCountryInList(geo.properties.name)
                                            ? { fill: "#114623" }
                                            : {},
                                        pressed: isCountryInList(geo.properties.name)
                                            ? { fill: "#114623" }
                                            : {},
                                    }}
                                />
                            ))
                        }
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>

            <Dialog
                header={"Top 3 Songs - " + selectedCountry}
                visible={dialogVisible}
                style={{border: '1px solid #D6D6DA', borderRadius: '8px', height: '70%',
                    width: '80%', backgroundColor: '#212121', padding: '10px'}}
                onHide={hideDialog}
            >
                {isLoading
                    ? <ProgressSpinner aria-label="Getting Songs" style={{width: '30px', height: '30px', marginTop: '20%'}}/>
                    : (
                        <div>
                            {top3Songs.songs.map((song, index) => (
                                <div key={index} className="song-item" style={{justifyContent: 'start'}}>
                                    <span className="song-number">{index + 1}</span>
                                    <img className="song-img" src={song.imageUrl} alt={`${song.name} cover`} width="40"
                                         height="40"/>
                                    <div className="song-details">
                                        <div>
                                            <p className="song-name">{song.name}</p>
                                            <p className="artist">{song.artist}</p>
                                        </div>
                                    </div>
                                    <SpotifyButton text="View" onClick={() => window.open(song.url, "_blank")}/>
                                </div>
                            ))}
                            <div>
                                <SpotifyButton text="Discover the remaining songs on Spotify" onClick={() => window.open("https://open.spotify.com" + top3Songs.url, "_blank")}/>
                            </div>
                        </div>
                    )
                }
            </Dialog>
        </div>
    );
};

export default WorldMap;
