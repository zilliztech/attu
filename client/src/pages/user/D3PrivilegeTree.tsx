import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTranslation } from 'react-i18next';
import { useTheme, Box } from '@mui/material';
import CustomButton from '@/components/customButton/CustomButton';
import type { DBCollectionsPrivileges, RBACOptions } from '@server/types';

interface Props {
  privileges: DBCollectionsPrivileges;
  role: string;
  margin?: { top: number; right: number; bottom: number; left: number };
  rbacOptions: RBACOptions;
}

interface TreeNode {
  name: string;
  children?: TreeNode[];
  value?: boolean;
  type?: string;
}

const D3PrivilegeTree: React.FC<Props> = ({
  role,
  privileges,
  margin = { top: 20, right: 20, bottom: 20, left: 60 },
  rbacOptions,
}) => {
  // i18n
  const { t: btnTrans } = useTranslation('btn');
  const { t: userTrans } = useTranslation('user');

  // theme
  const theme = useTheme();

  // Refs for SVG and G elements
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);

  // Derive the options arrays as in DBCollectionSelector.
  const rbacEntries = Object.entries(rbacOptions) as [
    string,
    Record<string, string>
  ][];

  // privileges of the privilege groups
  const privilegeGroups = rbacEntries.filter(([key]) =>
    key.endsWith('PrivilegeGroups')
  );
  const groupPrivileges = new Set(
    privilegeGroups.reduce(
      (acc, [_, group]) => acc.concat(Object.values(group)),
      [] as string[]
    )
  );

  // Transform privileges data into d3.hierarchy structure
  const transformData = (
    privileges: DBCollectionsPrivileges
  ): { nodeCount: number; treeNode: TreeNode } => {
    let nodeCount = 0;

    const res = {
      name: role,
      type: 'role',
      children: Object.entries(privileges).map(([dbKey, dbValue]) => ({
        name: dbKey === '*' ? 'All Databases(*)' : dbKey,
        type: 'database',
        children: Object.entries(dbValue.collections).map(
          ([colKey, colValue]) => {
            const children = Object.entries(colValue).map(([priv, val]) => {
              nodeCount += 1;
              return {
                name: priv,
                value: val,
              };
            });

            children.sort((a, b) => {
              const aInGroup = groupPrivileges.has(a.name);
              const bInGroup = groupPrivileges.has(b.name);
              return aInGroup === bInGroup ? 0 : aInGroup ? -1 : 1;
            });

            return {
              name: colKey === '*' ? 'All Collections(*)' : colKey,
              children,
              type: 'collection',
            };
          }
        ),
      })),
    };

    return {
      nodeCount,
      treeNode: res,
    };
  };

  useEffect(() => {
    if (!privileges) return;

    const transformedData = transformData(privileges);

    const width = 1000; // Fixed SVG width
    const defaultHeight = 580; // Default SVG height
    // calculate height based on number of nodes
    let height = transformedData.nodeCount * 15 + margin.top + margin.bottom;
    if (height < 500) height = defaultHeight; // Set a minimum height

    const fontSize = 12; // Font size for text labels
    const marginLeft = role.length * fontSize; // Adjust margin left based on role length

    // Clear SVG
    d3.select(svgRef.current).selectAll('*').remove();

    // Create hierarchy and layout
    const root = d3.hierarchy<TreeNode>(transformedData.treeNode);
    const treeLayout = d3
      .tree<TreeNode>()
      .size([height, width / 2])
      .separation((a: any, b: any) => {
        return a.parent === b.parent ? 3 : 4;
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

    // Calculate translateY to center the tree vertically
    const treeHeight = x1 - x0;
    const translateY = (height - treeHeight) / 2 - x0;

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
      .attr('transform', `translate(${marginLeft}, ${translateY})`);
    gRef.current = g.node();

    const colorMap: { [key: string]: any } = {
      role: theme.palette.primary.dark,
      database: theme.palette.primary.dark,
      collection: theme.palette.primary.dark,
    };

    // Create links (connections between nodes)
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', d => colorMap[d.source.data.type!])
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
      .attr('transform', d => `translate(${d.y! + 3},${d.x})`);

    // Add circles for nodes
    nodes
      .append('circle')
      .attr('r', 3)
      .attr('stroke', theme.palette.primary.main)
      .attr('fill', (d, index) =>
        d.children || index == 0 || groupPrivileges.has(d.data.name)
          ? `${theme.palette.primary.main}`
          : `transparent`
      );

    // Add text labels
    nodes
      .append('text')
      .attr('dy', d => (d.children && d.data.name !== role ? -3 : 3))
      .attr('x', d => (d.children ? -10 : 10))
      .attr('text-anchor', d => (d.children ? 'end' : 'start'))
      .attr('font-family', 'Inter')
      .attr('font-style', 'Italic')
      .attr('font-size', fontSize)
      .attr('fill', d =>
        groupPrivileges.has(d.data.name)
          ? `${theme.palette.primary.dark}`
          : `${theme.palette.text.primary}`
      )
      .text(d =>
        groupPrivileges.has(d.data.name) && d.data.type !== 'role'
          ? `${userTrans('privilegeGroup')}: ${d.data.name}`
          : d.data.name
      );

    // Add zoom functionality
    const zoom: any = d3
      .zoom()
      .scaleExtent([0.5, 3]) // Set zoom limits
      .on('zoom', event => {
        g.attr(
          'transform',
          `translate(${marginLeft}, ${translateY}) ${event.transform}`
        );
      });

    svg.call(zoom); // Apply zoom to the SVG

    svg.transition().duration(0).call(zoom.transform, d3.zoomIdentity);
  }, [JSON.stringify({ privileges, margin, theme, groupPrivileges, role })]);

  // UI handler
  const handleDownload = () => {
    if (!svgRef.current) return;

    const svgElement = svgRef.current;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);

    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `privilege_tree_${role}.svg`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative',
      }}
    >
      <CustomButton
        sx={{
          alignSelf: 'left',
          width: 'fit-content',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        onClick={handleDownload}
      >
        {btnTrans('downloadChart')}
      </CustomButton>
      <svg ref={svgRef}></svg>
    </Box>
  );
};

export default D3PrivilegeTree;
