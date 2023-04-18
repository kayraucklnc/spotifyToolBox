// Content script code

// Create a new div element
const newDiv = document.createElement("div");

// Set the content of the div element
newDiv.innerHTML = "Hello, world!";
newDiv.className = "anan"

// Add the new div element to the Spotify web player's body element
document.body.appendChild(newDiv);



a = document.querySelector("#main > div > div.Root__top-container.Root__top-container--right-sidebar-hidden > div.Root__main-view > div.main-view-container > div.os-host.os-host-foreign.os-theme-spotify.os-host-resize-disabled.os-host-scrollbar-horizontal-hidden.main-view-container__scroll-node.os-host-transition.os-host-overflow.os-host-overflow-y > div.os-padding > div > div > div.main-view-container__scroll-node-child > main > div.GlueDropTarget.GlueDropTarget--tracks.GlueDropTarget--local-tracks.GlueDropTarget--episodes.GlueDropTarget--albums > section > div.contentSpacing.NXiYChVp4Oydfxd7rT5r.RMDSGDMFrx8eXHpFphqG > div.RP2rRchy4i8TIp1CTmb7 > span.rEN7ncpaUeSGL9z0NGQR > button > span > h1")
console.log(a.innerHTML)

console.log(a.innerHTML)
console.log("deneme")
