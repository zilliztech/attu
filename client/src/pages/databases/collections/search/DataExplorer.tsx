import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material';
import { cloneObj } from '@/utils';
import { getDataExplorerStyle } from './Styles';
import { GraphData } from '../../types';

interface DataExplorerProps {
  data: GraphData;
  width?: number;
  height?: number;
  onNodeClick?: (node: any) => void;
}

// Helper function to check if node already exists
function findNodes(nodes: any[], vector: any) {
  return nodes.filter(node => node.id === vector.id);
}

// Helper function to check if a link already exists
function linkExists(links: any[], source: string, target: string) {
  return links.some(link => link.source === source && link.target === target);
}

// d3 color scale for node color
const color = d3.scaleOrdinal(d3.schemeCategory10);

// Format Milvus search result to graph data
export const formatMilvusData = (
  graphData: GraphData,
  searchedVector: {
    id: string;
    [key: string]: any;
  },
  results: any[]
) => {
  const graphDataCopy = cloneObj(graphData) as GraphData;
  // if searchedVector's id is 'root', color = 0
  // otherwise, find the largest color in the graphDataCopy.nodes, and color = largest color + 1
  const color =
    searchedVector.id === 'root'
      ? 0
      : Math.max(...graphDataCopy.nodes.map(node => node.color)) + 1;

  console.log('color', color);

  // Add searched vector as a node if not present
  const existingNodes = findNodes(graphDataCopy.nodes, searchedVector);
  if (!existingNodes.length) {
    graphDataCopy.nodes.push({
      id: searchedVector.id,
      data: searchedVector,
      searchIds: [searchedVector.id],
      color: color,
    });
  } else {
    // Update existing node with new data
    existingNodes.forEach(node => {
      if (!node.searchIds.includes(searchedVector.id)) {
        node.searchIds.push(searchedVector.id);
      }
    });
  }

  results.forEach(result => {
    // Add result vector as a node if not present
    const existingNodes = findNodes(graphDataCopy.nodes, result);
    if (!existingNodes.length) {
      graphDataCopy.nodes.push({
        id: result.id,
        data: result,
        searchIds: [searchedVector.id],
        color: color,
      });
    } else {
      // Update existing node with new data
      existingNodes.forEach(node => {
        if (!node.searchIds.includes(searchedVector.id)) {
          node.searchIds.push(searchedVector.id);
        }
      });
    }

    // Create a link between the searched vector and the result vector if not present
    const sourceId = searchedVector.id;
    const targetId = result.id;
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
  // states
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  // theme
  const theme = useTheme();
  // classes
  const classes = getDataExplorerStyle();

  // ref
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);

  // d3 effect
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    // states
    let _isDragging = false;

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
    svg.call(zoom as any).on('dblclick.zoom', null);

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
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 3, height / 3));

    // Draw links
    const link = g
      .selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke-width', 2)
      .attr('stroke', theme.palette.divider);

    // Draw nodes
    const node = g
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', (d: any) => (d.id === selectedNode?.id ? 16 : 8))
      .attr('fill', (d: any) => color(d.color))
      .attr('cursor', 'pointer')
      .attr('stroke', (d: any) =>
        d.id === selectedNode?.id ? color(d.color) : 'transparent'
      )
      .attr('stroke-width', (d: any) => (d.id === selectedNode?.id ? 2 : 0))
      .on('mouseover', (event, d) => {
        // Highlight the hovered node, keeping selected node unaffected
        d3.select(event.target).attr('stroke', 'black').attr('stroke-width', 2);
        // calcuate the position of the hovered node, place the tooltip accordingly, it should
        // get parent node's position and the mouse position
        const parentPosition = rootRef.current?.getBoundingClientRect();
        const nodeX = event.clientX - parentPosition!.left;
        const nodeY = event.clientY - parentPosition!.top;

        if (!_isDragging) {
          setHoveredNode({ nodeX, nodeY, d });
        }
      })
      .on('mouseout', () => {
        // Revert the hover stroke without affecting the selected node
        g.selectAll('.node')
          .attr('stroke', (d: any) =>
            d.id === selectedNode?.id ? color(d.color) : 'transparent'
          )
          .attr('stroke-width', (d: any) =>
            d.id === selectedNode?.id ? 2 : 0
          );
        setHoveredNode(null);
      })
      .on('click', (event, d: any) => {
        // Add circle around the selected node, reset others
        g.selectAll('.selected')
          .classed('selected', false)
          .attr('r', 8)
          .attr('stroke', 'transparent')
          .attr('stroke-width', 0);

        d3.select(event.target)
          .classed('selected', true)
          .attr('r', 16)
          .attr('stroke', color(d.color))
          .attr('stroke-width', 2);

        setSelectedNode(d);
      })
      .on('dblclick', (event, d) => {
        onNodeClick && onNodeClick(d);
        // remove the selected node
        setHoveredNode(null);
      })
      .call(
        d3
          .drag<SVGCircleElement, any>()
          .on('start', (event, d) => {
            _isDragging = true;
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            _isDragging = true;
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
            _isDragging = false;
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
  }, [JSON.stringify(data), width, height, theme]);

  return (
    <div className={classes.root} ref={rootRef}>
      <svg ref={svgRef} width={width} height={height}>
        <g ref={gRef} />
      </svg>
      {selectedNode && (
        <DataPanel data={selectedNode.data} node={selectedNode} />
      )}
      {hoveredNode && (
        <DataPanel data={hoveredNode.d.data} node={hoveredNode} />
      )}
    </div>
  );
};

export default DataExplorer;

const DataPanel = (props: any) => {
  // styles
  const classes = getDataExplorerStyle();
  // props
  const { data, node } = props;

  // format data to json
  const json = JSON.stringify(data, null, 2);
  const image = [
    'https://randomuser.me/api/portraits/men/50.jpg',
    'https://randomuser.me/api/portraits/men/40.jpg',
  ];

  // loop through the object find any value is an image url, add it into an image array;
  for (const key in data) {
    if (
      typeof data[key] === 'string' &&
      data[key].match(/\.(jpeg|jpg|gif|png)$/) != null
    ) {
      image.push(data[key]);
    }
  }

  const styleObj = node.nodeY
    ? {
        top: node.nodeY + 16,
        left: node.nodeX + 16,
        right: 'auto',
      }
    : {
        top: 8,
        right: 8,
      };

  return (
    <div key={node.id} className={classes.nodeInfo} style={styleObj}>
      <div className="wrapper">
        {image.map((url, i) => (
          <img key={i} src={url} />
        ))}
      </div>
      <pre>{json}</pre>
    </div>
  );
};
