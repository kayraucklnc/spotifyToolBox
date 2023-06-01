chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url) {
        // The URL has changed
        const newUrl = changeInfo.url;
        console.log('URL changed:', newUrl);
        alert("anan")
        // Add your logic here
    }
});