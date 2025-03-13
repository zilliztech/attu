import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { DBCollectionsPrivileges } from '@server/types';

interface Props {
  privileges: DBCollectionsPrivileges;
  role: string;
  margin?: { top: number; right: number; bottom: number; left: number };
}

interface TreeNode {
  name: string;
  children?: TreeNode[];
  value?: boolean;
}

const D3PrivilegeTree: React.FC<Props> = ({
  role,
  privileges,
  margin = { top: 20, right: 20, bottom: 20, left: 60 },
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);

  // Transform privileges data into d3.hierarchy structure
  const transformData = (privileges: DBCollectionsPrivileges): TreeNode => {
    return {
      name: role,
      children: Object.entries(privileges).map(([dbKey, dbValue]) => ({
        name: dbKey,
        children: Object.entries(dbValue.collections).map(
          ([colKey, colValue]) => ({
            name: colKey,
            children: Object.entries(colValue).map(([priv, val]) => ({
              name: priv,
              value: val,
            })),
          })
        ),
      })),
    };
  };

  useEffect(() => {
    if (!privileges) return;

    const width = 1000; // Fixed SVG width
    const height = 1000; // Fixed SVG height
    const fontSize = 10; // Font size for text labels
    const marginLeft = role.length * fontSize; // Adjust margin left based on role length

    // Clear SVG
    d3.select(svgRef.current).selectAll('*').remove();

    // Create hierarchy and layout
    const root = d3.hierarchy<TreeNode>(transformData(privileges));
    const treeLayout = d3
      .tree<TreeNode>()
      .size([height, width / 2])
      .separation((a: any, b: any) => {
        return a.parent === b.parent ? 3: 4
      }); // Swap width and height for vertical layout
    treeLayout(root);

    // Calculate the bounds of the tree
    let x0 = Infinity;
    let x1 = -Infinity;
    let y0 = Infinity;
    let y1 = -Infinity;
    root.each((d: any) => {
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
      if (d.y > y1) y1 = d.y;
      if (d.y < y0) y0 = d.y;
    });

    // Create SVG container
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height].join(' ')) // Add viewBox for scaling
      .attr('style', 'max-width: 100%; height: auto;'); // Make SVG responsive

    // Add a group for zoomable content
    const g = svg
      .append('g')
      .attr('transform', `translate(${marginLeft}, ${margin.top})`);
    gRef.current = g.node();

    // Create links (connections between nodes)
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1)
      .attr(
        'd',
        (d: any) =>
          `M${d.source.y},${d.source.x} C${(d.source.y + d.target.y) / 2},${
            d.source.x
          } ` +
          `${(d.source.y + d.target.y) / 2},${d.target.x} ${d.target.y},${
            d.target.x
          }`
      );

    // Create nodes
    const nodes = g
      .selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`);

    // Add circles for nodes
    nodes
      .append('circle')
      .attr('r', 3)
      .attr('fill', d => (d.children ? '#fff' : '#fff'))
      .attr('stroke', '#ccc');

    // Add text labels
    nodes
      .append('text')
      .attr('dy', 3)
      .attr('x', d => (d.children ? -10 : 10))
      .attr('text-anchor', d => (d.children ? 'end' : 'start'))
      .attr('font-family', 'Inter')
      .attr('font-style', 'Italic')
      .attr('font-size', fontSize)
      .text(d => d.data.name);

    // Add zoom functionality
    const zoom: any = d3
      .zoom()
      .scaleExtent([0.5, 3]) // Set zoom limits
      .on('zoom', event => {
        g.attr(
          'transform',
          `translate(${marginLeft}, ${margin.top}) ${event.transform}`
        );
      });

    svg.call(zoom); // Apply zoom to the SVG

    // **🔥 Reset zoom transform on re-render**
    svg.transition().duration(0).call(zoom.transform, d3.zoomIdentity);
  }, [privileges, margin]);

  return <svg ref={svgRef}></svg>;
};

export default D3PrivilegeTree;
