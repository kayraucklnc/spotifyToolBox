chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'spotifyLoginSuccess') {
        // Open your extension's popup when Spotify login is successful
        chrome.browserAction.openPopup();
    }
});