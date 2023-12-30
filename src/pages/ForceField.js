import React, { Component } from "react";
import * as d3 from "d3";
import Chart1 from "./Chart1";

function ForceField({ data }) {
  function makeSenseOfData(data) {
    const result = {};

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const subItems = data[key];
        subItems.forEach((item, index) => {
          if (!result[`${item.name}`]) {
            result[`${item.name}`] = {
              followers: item.followers,
              popularity: item.popularity,
            };
          }
        });
      }
    }
    return result;
  }

  function mapValue(
    inputValue,
    inputRangeStart,
    inputRangeEnd,
    outputRangeStart,
    outputRangeEnd
  ) {
    return (
      ((inputValue - inputRangeStart) * (outputRangeEnd - outputRangeStart)) /
        (inputRangeEnd - inputRangeStart) +
      outputRangeStart
    );
  }

  function getData(data) {
    const n = Object.keys(data).length;

    let max = Math.max(...Object.keys(data).map((d) => data[d].followers));
    let min = Math.min(...Object.keys(data).map((d) => data[d].followers));

    return Object.keys(data).map((d, i) => ({
      r: mapValue(data[d].followers, min, max, 20, 100),
      group: i % n,
      text: d, // Set text from the 'name' field
    }));
  }

  return (
    <div className="App">
      <Chart1 data={getData(makeSenseOfData(data))} size={500} />
    </div>
  );
}
export default ForceField;
