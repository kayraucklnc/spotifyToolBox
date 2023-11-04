// Get the target element to observe
const SELECTOR_OF_LIST = '#main > div > div.ZQftYELq0aOsg6tPbVbV > div.jEMA2gVoLgPQqAFrPhFw > div.main-view-container > div.os-host.os-host-foreign.os-theme-spotify.os-host-resize-disabled.os-host-scrollbar-horizontal-hidden.main-view-container__scroll-node.os-host-transition.os-host-overflow.os-host-overflow-y > div.os-padding > div > div > div.main-view-container__scroll-node-child > main > div.GlueDropTarget.GlueDropTarget--tracks.GlueDropTarget--local-tracks.GlueDropTarget--episodes.GlueDropTarget--albums > section > div.rezqw3Q4OEPB1m4rmwfw > div.contentSpacing > div.ShMHCGsT93epRGdxJp2w.Ss6hr6HYpN4wjHJ9GHmi > div.JUa6JJNj7R_Y3i4P8YUX > div:nth-child(2)'


function getMusicListHolder() {
    return document.querySelector(SELECTOR_OF_LIST);
}

function addSubElement(targetElement) {
    childElements = targetElement.children
    for (let i = 0; i < childElements.length; i++) {
        const childElement = childElements[i];
        addButton(childElement)
    }
}


setTimeout(start, 2000);

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'triggerFunction') {
        // Call the desired function in the content script
        setTimeout(start, 1000);
    }
});


function start() {
    let targetElement = getMusicListHolder();
    addSubElement(targetElement);
    watchContentChanges(targetElement)
}

// Function to watch for changes in the target element's content
function watchContentChanges(targetElement) {
    // Create a new MutationObserver instance
    const observer = new MutationObserver((mutations) => {
        // This callback function will be called whenever a mutation occurs in the target element

        // Check each mutation for added nodes
        mutations.forEach((mutation) => {
            const addedNodes = mutation.addedNodes;

            // Loop through the added nodes
            Array.from(addedNodes).forEach((addedNode) => {
                // Check if the added node is an element node
                if (addedNode.nodeType === Node.ELEMENT_NODE) {
                    // Add the button to the child element
                    addButton(addedNode)
                }
            });
        });
    });

    // Configure the observer to watch for childList changes in the target element
    const observerConfig = {
        childList: true,
        subtree: true
    };

    // Start observing the target element with the specified configuration
    observer.observe(targetElement, observerConfig);
}

function addButton(elem) {
    let songWrapper = elem.children[0].children[1].children[1].children[0];
    let songName = songWrapper.children[0].innerHTML
    nameArr = songName.split()
    let songNameElement = elem.children[0].children[1]
    addCheckbox(songNameElement, songName)
    addLink(songNameElement, "https://www.youtube.com/results?search_query=" + nameArr.join("+"))

    addHoverButton(songNameElement, 'ⓘ', songWrapper);
}

function addLink(targetElement, href) {
    const linkElementWrapper = document.createElement('a');
    const linkElement = document.createElement('img');
    linkElementWrapper.appendChild(linkElement);

    linkElement.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png";
    linkElement.draggable = true;
    linkElement.style.height = "20px";
    linkElement.classList.add("standalone-ellipsis-one-line", "ytbutton", "youtube-logo");
    linkElement.setAttribute('dir', 'auto');
    linkElement.tabIndex = -1;
    linkElement.style.color = "#ff0000"

    linkElementWrapper.href = href;
    targetElement.appendChild(linkElementWrapper);
}

function addCheckbox(targetElement, songName) {
    const checkboxElement = document.createElement('input');
    checkboxElement.type = 'checkbox';
    checkboxElement.classList.add('checkbox');
    checkboxElement.id = songName;
    checkboxElement.style.accentColor = '#1DB954';

    targetElement.appendChild(checkboxElement);
}

function addHoverButton(targetElement, buttonText, songWrapper) {
    const overlayContent = document.createElement('div');

    trackID = getSpotifyTrackID(songWrapper.href)

    getSongDataFromSpotify(trackID)
        .then(data => {
            overlayContent.innerHTML = generateTextOfOverlay(data);
        })
        .catch(error => {
            console.error('Error: ', error);
        });

    overlayContent.style.margin = '10px';
    overlayContent.style.color = 'white';
    overlayContent.style.fontWeight = 'bold';


    const buttonElement = document.createElement('div');
    buttonElement.innerText = buttonText;
    buttonElement.style.color = 'white'

    // Create overlay element
    const overlayElement = document.createElement('div');

    overlayElement.style.position = 'absolute';
    overlayElement.style.backgroundColor = '#1DB954';
    overlayElement.style.borderRadius = '5px 30px 30px 30px';
    overlayElement.style.transition = '.3s ease-in-out';
    overlayElement.style.width = '0px';
    overlayElement.style.height = '0px';
    overlayElement.style.zIndex = '1';
    overlayElement.style.left = '300px';
    overlayElement.style.top = '90%';
    overlayElement.style.display = 'block';
    overlayElement.style.overflow = 'hidden';


    overlayElement.appendChild(overlayContent);

    // Add event listeners for hover
    buttonElement.addEventListener('mouseenter', () => {
        buttonElement.style.color = '#1DB954'
        overlayElement.style.width = '200px';
        overlayElement.style.height = '220px';
    });

    buttonElement.addEventListener('mouseleave', () => {
        overlayElement.style.height = '0px';
        overlayElement.style.width = '0px';
        buttonElement.style.color = 'white'
    });

    // Append button and overlay to the target element
    targetElement.appendChild(buttonElement);
    overlayElement.style.left = buttonElement.getBoundingClientRect().left - 450 + 'px';
    targetElement.appendChild(overlayElement);
}

function getSpotifyTrackID(spotifyTrackURL) {
    const parts = spotifyTrackURL.split('/'); // Split the URL by '/'
    return parts[parts.length - 1];
}

function getSongDataFromSpotify(trackId) {
    return new Promise(async (resolve, reject) => {
        try {
            const accessToken = await getAccessToken();

            const response = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                }
            });

            if (response.ok) {
                const data = await response.json();
                resolve(data);
            } else {
                reject(`Error: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            reject(error);
        }
    });
}

function generateTextOfOverlay(data) {
    return mapDanceability(data.danceability) + '<br>' +
        mapEnergy(data.energy) + '<br>' +
        mapLoudness(data.loudness) + '<br>' +
        mapSpeechiness(data.speechiness) + '<br>' +
        mapAcousticness(data.acousticness) + '<br>' +
        mapInstrumentalness(data.instrumentalness) + '<br>' +
        mapLiveness(data.liveness) + '<br>' +
        mapValence(data.valence) + '<br>';
}

function mapDanceability(value) {
    if (value < 0.3) {
        return "Not Danceable";
    } else if (value < 0.7) {
        return "Moderately Danceable";
    } else {
        return "Very Danceable";
    }
}

function mapEnergy(value) {
    if (value < 0.3) {
        return "Low Energy";
    } else if (value < 0.7) {
        return "Moderate Energy";
    } else {
        return "High Energy";
    }
}

function mapLoudness(value) {
    if (value < -10) {
        return "Very Quiet";
    } else if (value < -5) {
        return "Moderate Loudness";
    } else {
        return "Very Loud";
    }
}

function mapSpeechiness(value) {
    if (value < 0.33) {
        return "Low Speechiness";
    } else if (value < 0.66) {
        return "Moderate Speechiness";
    } else {
        return "High Speechiness";
    }
}

function mapAcousticness(value) {
    if (value < 0.2) {
        return "Not Acoustic";
    } else if (value < 0.7) {
        return "Moderately Acoustic";
    } else {
        return "Very Acoustic";
    }
}

function mapInstrumentalness(value) {
    if (value < 0.2) {
        return "Not Instrumental";
    } else if (value < 0.7) {
        return "Moderately Instrumental";
    } else {
        return "Very Instrumental";
    }
}

function mapLiveness(value) {
    if (value < 0.3) {
        return "Low Liveliness";
    } else if (value < 0.7) {
        return "Moderate Liveliness";
    } else {
        return "High Liveliness";
    }
}

function mapValence(value) {
    if (value < 0.3) {
        return "Low Valence";
    } else if (value < 0.7) {
        return "Moderate Valence";
    } else {
        return "High Valence";
    }
}