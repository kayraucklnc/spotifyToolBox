chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url) {
        // The URL has changed
        const newUrl = changeInfo.url;
        console.log('URL changed:', newUrl);

        if (newUrl.split("/")[3].charAt(0) === '#'){
            const accessToken = newUrl.split("#")[1].split("&")[0].split("=")[1];
            chrome.storage.local.set({ "accessToken": accessToken });
            chrome.storage.local.get(["accessToken"], function(result) {
                console.log(result.accessToken); // Output: 'value'
            });
            chrome.tabs.remove(tabId);
            chrome.tabs.create({ url: 'https://open.spotify.com' });
        }

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
    console.log(message.type)
});