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
  const transformData = (privileges: DBCollectionsPrivileges): TreeNode => {
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

    return res;
  };

  useEffect(() => {
    if (!privileges) return;

    const treeNode = transformData(privileges);

    // get svg width and height by accessing dom element
    const svgWidth = svgRef.current?.clientWidth || 0;
    const svgHeight = svgRef.current?.clientHeight || 0;

    // Calculate height based on tree structure rather than total node count
    // Max nodes at any level would be a better indication for vertical space needed
    const maxNodesAtLevel = Math.max(
      1, // Role level
      Object.keys(privileges).length, // Database level
      ...Object.values(privileges).map(
        db => Object.keys(db.collections).length
      ), // Collection level
      ...Object.values(privileges).reduce(
        (acc, db) =>
          acc.concat(
            Object.values(db.collections).map(col => Object.keys(col).length)
          ),
        [] as number[] // Privilege level
      )
    );

    // Increase the multiplier to provide more space between nodes
    const nodeSpacing = 30;
    let height =
      maxNodesAtLevel * nodeSpacing + margin.top + margin.bottom + 120; // Added extra padding

    // Ensure minimum height for better visualization
    height = Math.max(height, svgHeight);

    // Add additional padding for large datasets
    if (maxNodesAtLevel > 15) {
      height += maxNodesAtLevel * 10; // Extra space for very large datasets
    }

    const fontSize = 12; // Font size for text labels
    const marginLeft = role.length * fontSize; // Adjust margin left based on role length

    // Clear SVG
    d3.select(svgRef.current).selectAll('*').remove();

    // Create hierarchy and layout
    const root = d3.hierarchy<TreeNode>(treeNode);
    const treeLayout = d3
      .tree<TreeNode>()
      .size([height - margin.top - margin.bottom, svgWidth / 2])
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

    // Create SVG container with expanded height
    const svg = d3.select(svgRef.current);

    // Add a group for zoomable content
    const g = svg.append('g').attr('transform', `translate(0, ${margin.top})`); // Add top margin
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

    // Calculate scale to fit the entire tree
    const treeWidth = y1 - y0 + marginLeft + 50; // Add some padding
    const treeHeight = x1 - x0 + 60; // Increased padding
    const scaleX = svgWidth / treeWidth;
    const scaleY = svgHeight / treeHeight;
    const scale = Math.min(scaleX, scaleY, 0.95); // Slightly reduce to ensure visibility

    // Calculate translation to center the tree
    const centerX = (svgWidth - treeWidth * scale) / 2 - 60;
    const centerY =
      (svgHeight - treeHeight * scale) / 2 - x0 * scale + margin.top;

    // Add zoom functionality
    const zoom: any = d3
      .zoom()
      .scaleExtent([scale, 4]) // Set minimum zoom to fit entire tree
      .on('zoom', event => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom); // Apply zoom to the SVG

    // Apply initial transform to show the entire tree
    svg
      .transition()
      .duration(250)
      .call(
        zoom.transform,
        d3.zoomIdentity.translate(centerX, centerY).scale(scale)
      );
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
        width: '100%',
        height: '100%',
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
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </Box>
  );
};

export default D3PrivilegeTree;
