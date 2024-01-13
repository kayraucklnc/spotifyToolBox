import React, {useEffect, useRef} from 'react';
import * as d3 from 'd3';

const ForceDirectedGraph = ({musicData}) => {
    var min = Number.MAX_VALUE;
    var max = Number.MIN_VALUE;

    function mapValue(inputValue, inputRangeStart, inputRangeEnd, outputRangeStart, outputRangeEnd) {
        return (((inputValue - inputRangeStart) * (outputRangeEnd - outputRangeStart)) / (inputRangeEnd - inputRangeStart) + outputRangeStart);
    }

    function transformJsonToGraphFormat(jsonData) {
        const nodes = [];
        const links = [];

        function getNodeIndex(nodeId, pop) {
            const existingNodeIndex = nodes.findIndex((node) => node.id === nodeId);
            if (existingNodeIndex !== -1) {
                return existingNodeIndex;
            }

            const newNode = {id: nodeId, group: nodes.length + 1, followers: pop};
            nodes.push(newNode);
            return nodes.length - 1;
        }

        for (const band in jsonData) {
            const bandData = jsonData[band];
            const bandNodeIndex = getNodeIndex(band);

            for (const artist of bandData) {
                const artistNodeIndex = getNodeIndex(artist.name, artist.followers);
                max = Math.max(max, artist.followers);
                min = Math.min(min, artist.followers);
                links.push({
                    source: band, target: artist.name, value: 1,
                });
            }
        }

        return {nodes, links};
    }

    const data = transformJsonToGraphFormat(musicData);

    const svgRef = useRef();

    useEffect(() => {
        d3.select(svgRef.current).selectAll('*').remove();
        const width = 700;
        const height = 700;
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const links = data.links.map((d) => ({...d}));
        const nodes = data.nodes.map((d) => ({...d}));

        const simulation = d3
            .forceSimulation(nodes)
            .force('link', d3.forceLink(links).id((d) => d.id).distance(20))
            .force('charge', d3.forceManyBody().strength(-500))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .on('tick', ticked);

        const svg = d3.select(svgRef.current);

        const graphContainer = svg.append('g').attr('class', 'graph-container'); // Create a container for the graph elements

        const zoom = d3
            .zoom()
            .scaleExtent([0.1, 10])
            .on('zoom', (event) => {
                graphContainer.attr('transform', event.transform);
                simulation.alpha(0.3).restart(); // Restart the simulation to adjust for the zoom
            });

        svg.call(zoom);

        const link = graphContainer
            .append('g')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6)
            .selectAll()
            .data(links)
            .join('line')
            .attr('stroke-width', d => 2)
            .attr('stroke-linecap', 'round');

        const node = graphContainer
            .append('g')
            .selectAll()
            .data(nodes)
            .join('g');

        const circles = node
            .append('circle')
            .attr('r', d => mapValue(d.followers, min, max, 15, 40)) // Adjusted radius values
            .attr('fill', d => color(d.group));

        const textLabels = node
            .append('text')
            .text(d => d.id)
            .attr('dy', 4) // Adjusted text position relative to the circle
            .attr('text-anchor', 'middle')
            .attr('font-size', d => mapValue(d.followers, min, max, 10, 16)) // Adjusted font size
            .attr('fill', '#fff'); // Light-colored text

        node.call(d3
            .drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));

        function ticked() {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            circles.attr('cx', d => d.x).attr('cy', d => d.y);

            textLabels.attr('x', d => d.x).attr('y', d => d.y);
        }

        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return () => {
            simulation.stop();
        };
    }, [data]);

    return (<svg
        ref={svgRef}
        width="700px"
        height="700px"
        viewBox={`0 0 ${700} ${700}`}
        style={{border: '1px solid #ccc', borderRadius: '4px'}}
    />);
};

export default ForceDirectedGraph;
