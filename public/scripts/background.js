chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url) {
        // The URL has changed
        const newUrl = changeInfo.url;
        console.log('URL changed:', newUrl);



        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, { action: 'triggerFunction' }).then(() => {console.log("message sent")});
        });

    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'spotifyLoginSuccess') {
        // Open your extension's popup when Spotify login is successful
        chrome.browserAction.openPopup();
    }
});