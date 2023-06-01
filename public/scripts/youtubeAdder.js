// Get the target element to observe
const SELECTOR_OF_LIST = '#main > div > div.ZQftYELq0aOsg6tPbVbV > div.jEMA2gVoLgPQqAFrPhFw.lPapCDz3v_LipgXwe8gi > div.main-view-container > div.os-host.os-host-foreign.os-theme-spotify.os-host-resize-disabled.os-host-scrollbar-horizontal-hidden.main-view-container__scroll-node.os-host-transition.os-host-overflow.os-host-overflow-y > div.os-padding > div > div > div.main-view-container__scroll-node-child > main > div.GlueDropTarget.GlueDropTarget--tracks.GlueDropTarget--local-tracks.GlueDropTarget--episodes.GlueDropTarget--albums > section > div.rezqw3Q4OEPB1m4rmwfw > div.contentSpacing > div.ShMHCGsT93epRGdxJp2w.Ss6hr6HYpN4wjHJ9GHmi > div.JUa6JJNj7R_Y3i4P8YUX > div:nth-child(2)'
function getMusicListHolder() {
    return  document.querySelector(SELECTOR_OF_LIST);
}
function addSubElement(targetElement) {
    childElements = targetElement.children
    for (let i = 0; i < childElements.length; i++) {
        const childElement = childElements[i];
        addButton(childElement)
    }
}



setTimeout(start, 2000);

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'triggerFunction') {
        // Call the desired function in the content script
        setTimeout(start, 1000);
    }
});


function start(){
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
    let songName = elem.children[0].children[1].children[1].children[0].children[0].innerHTML
    console.log(songName);
    nameArr = songName.split()
    let songNameElement = elem.children[0].children[1]
    addLink(songNameElement, "Youtube Link", "https://www.youtube.com/results?search_query=" + nameArr.join("+"))
}

function addLink(targetElement, text, href) {
    const linkElement = document.createElement('a');
    linkElement.draggable = true;
    linkElement.classList.add("standalone-ellipsis-one-line", "ytbutton");
    linkElement.setAttribute('dir', 'auto');
    linkElement.href = href;
    linkElement.tabIndex = -1;
    linkElement.textContent = text;

    targetElement.appendChild(linkElement);
}