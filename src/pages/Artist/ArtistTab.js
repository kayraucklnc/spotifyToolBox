/*global chrome*/

import React from "react";
import SpotifyButton from "../../components/SpotifyButton";
import { useState } from "react";
import ForceDirectedGraph from "../ForceDirectedGraph";
import Loading from "../../components/Loading";


const Artist = () => {
  const [artists, setArtists] = useState({});
  const [isLoading, setIsloading] = useState(false);

  chrome.runtime.onMessage.addListener(function (
    request
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
      {isLoading && <Loading/>}
      {/*{Object.keys(artists).length > 0 && <ForceField data={artists} />}*/}
      {Object.keys(artists).length > 0 && <ForceDirectedGraph musicData={artists} />}
    </div>
  );
};

export default Artist;
