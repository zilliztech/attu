import React from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import icons from '@/components/icons/Icons';
import { NodeContent, CollectionCount, TreeNodeBox } from './StyledComponents';

interface DatabaseNodeProps {
  database: string;
  collectionCount: number;
  isSelected: boolean;
  isContextMenuTarget: boolean;
  onNodeClick: () => void;
  onContextMenu: (event: React.MouseEvent) => void;
  onSearchClick: (event: React.MouseEvent) => void;
}

const DatabaseNode: React.FC<DatabaseNodeProps> = ({
  database,
  collectionCount,
  isSelected,
  isContextMenuTarget,
  onNodeClick,
  onContextMenu,
  onSearchClick,
}) => {
  const DatabaseIcon = icons.database;
  const SearchIcon = icons.search;

  return (
    <TreeNodeBox
      isSelected={isSelected}
      isContextMenuTarget={isContextMenuTarget}
      isCollectionNoSchema={false}
      depth={0}
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 2,
      }}
      onClick={onNodeClick}
      onContextMenu={onContextMenu}
    >
      <Box sx={{ width: 0 }} />
      <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
        <DatabaseIcon />
      </Box>
      <NodeContent>
        <Tooltip title={database} placement="top">
          <Typography noWrap sx={{ flex: 1 }}>
            {database}
            <CollectionCount>({collectionCount})</CollectionCount>
          </Typography>
        </Tooltip>
        <IconButton
          size="small"
          onClick={onSearchClick}
          sx={{
            padding: '4px',
            ml: 0.5,
            position: 'relative',
            right: '-8px',
            '&:hover': {
              backgroundColor: 'transparent',
            },
          }}
        >
          <SearchIcon sx={{ fontSize: '16px', color: 'text.secondary' }} />
        </IconButton>
      </NodeContent>
    </TreeNodeBox>
  );
};

export default DatabaseNode;
