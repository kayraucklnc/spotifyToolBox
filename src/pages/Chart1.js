import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const Chart1 = ({ data, size }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const width = size;
    const height = size;
    const color = d3.scaleOrdinal(d3.schemeTableau10);
    const context = canvasRef.current.getContext("2d");
    const nodes = data.map(Object.create);

    const simulation = d3
      .forceSimulation(nodes)
      .alphaTarget(0.3) // stay hot
      .velocityDecay(0.1) // low friction
      .force(
        "x",
        d3
          .forceX()
          .strength(0.01)
          .x((d) => Math.min(width - d.r, Math.max(d.r, d.x)))
      )
      .force(
        "y",
        d3
          .forceY()
          .strength(0.01)
          .y((d) => Math.min(height - d.r, Math.max(d.r, d.y)))
      )
      .force(
        "collide",
        d3
          .forceCollide()
          .radius((d) => d.r + 1)
          .iterations(3)
      ) // adjust the radius here
      .force(
        "charge",
        d3.forceManyBody().strength((d, i) => (i ? 0 : (-width * 1) / 6))
      )
      .on("tick", ticked);

    d3.select(context.canvas)
      .on("touchmove", (event) => event.preventDefault())
      .on("pointermove", pointermoved);

    const invalidation = new Promise((resolve) => {
      simulation.on("end", resolve);
    });

    invalidation.then(() => simulation.stop());

    function pointermoved(event) {
      const [x, y] = d3.pointer(event);

      // Adjust the strength by multiplying with a constant factor
      const strengthFactor = 1;

      nodes[0].fx = (x - width / 2) * strengthFactor;
      nodes[0].fy = (y - height / 2) * strengthFactor;
    }

    function ticked() {
      context.clearRect(0, 0, width, height);
      context.save();
      context.translate(width / 2, height / 2);
      for (let i = 1; i < nodes.length; ++i) {
        const d = nodes[i];
        context.beginPath();
        context.moveTo(d.x + d.r, d.y);
        context.arc(d.x, d.y, d.r, 0, 2 * Math.PI);
        context.fillStyle = color(d.group);
        context.fill();

        const fontSize = Math.max(10, d.r / 3); // Adjust the maximum font size (20 in this example)

        context.fillStyle = "#ffffff";
        context.font = `${fontSize}px Arial`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(d.text, d.x, d.y);
      }
      context.restore();
    }
  }, [data]);

  return <canvas ref={canvasRef} width={size} height={size} />;
};

export default Chart1;
