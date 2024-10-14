import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material';
import { cloneObj } from '@/utils';

export type GraphNode = { id: string; data: any; x?: number; y?: number }; // Add optional x, y for SimulationNodeDatum
export type GraphLink = { source: string; target: string; score: number };

export type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

interface DataExplorerProps {
  data: GraphData;
  width?: number;
  height?: number;
  onNodeClick?: (node: any) => void;
}

// Helper function to check if node already exists
function nodeExists(nodes: any[], vector: any) {
  return nodes.some(node => node.id === `${vector.id || 'root'}`);
}

// Helper function to check if a link already exists
function linkExists(links: any[], source: string, target: string) {
  return links.some(link => link.source === source && link.target === target);
}

// Format Milvus search result to graph data
export const formatMilvusData = (
  graphData: GraphData,
  searchedVector: {
    id: string;
    [key: string]: any;
  },
  results: any[]
) => {
  const graphDataCopy = cloneObj(graphData);

  // Add searched vector as a node if not present
  if (!nodeExists(graphDataCopy.nodes, searchedVector)) {
    graphDataCopy.nodes.push({
      id: `${searchedVector.id || 'root'}`,
      data: searchedVector,
    });
  }

  results.forEach(result => {
    // Add result vector as a node if not present
    if (!nodeExists(graphDataCopy.nodes, result)) {
      graphDataCopy.nodes.push({
        id: `${result.id}`,
        data: result,
      });
    }

    // Create a link between the searched vector and the result vector if not present
    const sourceId = `${searchedVector.id || 'root'}`;
    const targetId = `${result.id}`;
    if (!linkExists(graphDataCopy.links, sourceId, targetId)) {
      graphDataCopy.links.push({
        source: sourceId,
        target: targetId,
        score: result.score,
      });
    }
  });

  // Return formatted graph data
  return graphDataCopy;
};

const DataExplorer = ({
  data,
  width = 800,
  height = 600,
  onNodeClick,
}: DataExplorerProps) => {
  const theme = useTheme();

  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

    // Clear previous nodes and links before rendering new data
    g.selectAll('*').remove(); // This removes all children of the <g> element

    // Define zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 10]) // Limit zoom scale
      .on('zoom', event => {
        // Apply transform to the g element (where the graph is)
        g.attr('transform', event.transform);
      });

    // Apply zoom behavior to the svg
    svg.call(zoom as any);

    // clone data to avoid mutating the original data
    const links = cloneObj(data.links);
    const nodes = cloneObj(data.nodes);

    const simulation = d3
      .forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance((d: any) => {
            const maxDistance = 150;
            const minDistance = 50;
            return maxDistance - d.score * (maxDistance - minDistance);
          })
      )
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Draw links
    const link = g
      .selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke-width', 1)
      .attr('stroke', theme.palette.divider);

    // Draw nodes
    const node = g
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', 8)
      .attr('fill', theme.palette.primary.main)
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        onNodeClick && onNodeClick(d);
      })
      .call(
        d3
          .drag<SVGCircleElement, any>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => (d.source as any).x)
        .attr('y1', (d: any) => (d.source as any).y)
        .attr('x2', (d: any) => (d.target as any).x)
        .attr('y2', (d: any) => (d.target as any).y);

      node.attr('cx', d => (d as any).x).attr('cy', d => (d as any).y);
    });
  }, [data, width, height]);

  return (
    <svg ref={svgRef} width={width} height={height}>
      <g ref={gRef} />
    </svg>
  );
};

export default DataExplorer;
