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
    let songName = elem.children[0].children[1].children[1].children[0].children[0].innerHTML
    console.log(songName);
    nameArr = songName.split()
    let songNameElement = elem.children[0].children[1]
    addCheckbox(songNameElement, songName)
    addLink(songNameElement, "https://www.youtube.com/results?search_query=" + nameArr.join("+"))

    addHoverButton(songNameElement, 'ⓘ');
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

function addHoverButton(targetElement, buttonText) {
    const overlayContent = document.createElement('div');
    overlayContent.innerHTML = "This is a lorem ipsum text.";
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
    overlayElement.style.borderRadius = '20px';
    overlayElement.style.transition = '.3s ease-in-out';
    overlayElement.style.width = '300px';
    overlayElement.style.height = '200px';
    overlayElement.style.zIndex = '1';
    overlayElement.style.left = '25%';
    overlayElement.style.top = '90%';
    overlayElement.style.display = 'none';

    overlayElement.appendChild(overlayContent);

    // Add event listeners for hover
    buttonElement.addEventListener('mouseenter', () => {
        overlayElement.style.display = 'block';
        buttonElement.style.color = '#1DB954'
    });

    buttonElement.addEventListener('mouseleave', () => {
        overlayElement.style.display = 'none';
        buttonElement.style.color = 'white'
    });

    // Append button and overlay to the target element
    targetElement.appendChild(buttonElement);
    targetElement.appendChild(overlayElement);
}