/*global chrome*/

import React from "react";
import SpotifyButton from "../../components/SpotifyButton";
import { useState } from "react";
import ForceField from "../ForceField";

const Artist = () => {
  const [artists, setArtists] = useState({});
  const [isLoading, setIsloading] = useState(false);

  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.action === "getRecursiveRelationsReturn") {
      console.log(request.artists);
      setIsloading(false);
      setArtists(request.artists);
    } else if (request.action === "waitingRecursive") {
      setIsloading(true);
    }
  });

  const getRecursiveRelations = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentUrl = tabs[0].url;
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "getRecursiveRelations",
        url: currentUrl,
      });
    });
  };

  return (
    <div>
      <SpotifyButton
        text={"Artist Relations"}
        onClick={getRecursiveRelations}
      />
      {isLoading && <p>loading...</p>}
      {Object.keys(artists).length > 0 && <ForceField data={artists} />}
    </div>
  );
};

export default Artist;
