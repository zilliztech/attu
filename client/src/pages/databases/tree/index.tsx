import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useContext,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import icons from '@/components/icons/Icons';
import {
  Tooltip,
  Typography,
  Grow,
  Popover,
  Box,
  IconButton,
} from '@mui/material'; // Added Box, IconButton
import { useNavigate } from 'react-router-dom';
import { CollectionObject } from '@server/types';
import clcx from 'clsx';
import { formatNumber } from '@/utils';
import { useStyles } from './style';
import {
  DatabaseTreeItem as OriginalDatabaseTreeItem, // Rename original type
  TreeNodeType,
  DatabaseTreeProps,
  ContextMenu,
  TreeNodeObject,
} from './types';
import { TreeContextMenu } from './TreeContextMenu';
import { useVirtualizer } from '@tanstack/react-virtual'; // Import virtualizer
import { dataContext } from '@/context';

// Define a type for the flattened list item
interface FlatTreeItem {
  id: string;
  name: string;
  depth: number;
  type: TreeNodeType;
  data: TreeNodeObject | null; // Allow null for DB node
  isExpanded: boolean; // Track if the node itself is expanded
  hasChildren: boolean; // Does it have children?
  originalNode: OriginalDatabaseTreeItem; // Keep original node ref if needed
}

// ... existing CollectionNode component (can be reused or integrated) ...
const CollectionNode: React.FC<{ data: CollectionObject }> = ({ data }) => {
  // i18n collectionTrans
  const { t: commonTrans } = useTranslation();
  const classes = useStyles();
  const loadClass = clcx(classes.dot, {
    [classes.loaded]: data.loaded,
    [classes.unloaded]: !data.loaded,
    [classes.loading]: data.status === 'loading',
    [classes.noIndex]: !data.schema || !data.schema.hasVectorIndex,
  });
  const hasIndex = data.schema && data.schema.hasVectorIndex;
  const loadStatus = hasIndex
    ? data.loaded
      ? commonTrans('status.loaded')
      : commonTrans('status.unloaded')
    : commonTrans('status.noVectorIndex');

  return (
    <div className={classes.collectionNode}>
      <div className={classes.collectionName}>
        <Tooltip title={data.collection_name} placement="top">
          <Typography noWrap className="collectionName">
            {data.collection_name}
          </Typography>
        </Tooltip>
        <span className={classes.count}>
          ({formatNumber(data.rowCount || 0)})
        </span>
      </div>
      <Tooltip title={loadStatus} placement="top">
        <div className={loadClass}></div>
      </Tooltip>
    </div>
  );
};

const DatabaseTree: React.FC<DatabaseTreeProps> = props => {
  const {
    database,
    collections,
    params,
    treeHeight = 'calc(100vh - 64px)',
  } = props;

  // context
  const classes = useStyles();
  const navigate = useNavigate();
  const { collectionName = '' } = useParams<{ collectionName: string }>();
  const { batchRefreshCollections } = useContext(dataContext);

  // State
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set([database])
  ); // Start with DB expanded
  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    params.collectionName ? `c_${params.collectionName}` : database
  );

  // Ref for the scrollable element
  const parentRef = useRef<HTMLDivElement>(null);

  // Icons
  const DatabaseIcon = icons.database;
  const CollectionIcon = icons.navCollection;
  const ExpandIcon = icons.rightArrow;

  // --- Tree Flattening Logic ---
  const flattenTree = useCallback(
    (
      node: OriginalDatabaseTreeItem,
      depth: number,
      expanded: Set<string>
    ): FlatTreeItem[] => {
      const isExpanded = expanded.has(node.id);
      const hasChildren = node.children && node.children.length > 0;

      const flatNode: FlatTreeItem = {
        id: node.id,
        name: node.name,
        depth: depth,
        type: node.type,
        data: node.data || null,
        isExpanded: isExpanded,
        hasChildren: Boolean(hasChildren),
        originalNode: node,
      };

      let childrenFlat: FlatTreeItem[] = [];
      if (hasChildren && isExpanded) {
        childrenFlat = node
          .children!.map(child => flattenTree(child, depth + 1, expanded))
          .reduce((acc, val) => acc.concat(val), []);
      }

      return [flatNode, ...childrenFlat];
    },
    []
  );

  // --- Memoized Flattened Data ---
  const flattenedNodes = useMemo(() => {
    // Rebuild the tree structure in the format needed for flattenTree
    const children = collections.map(c => ({
      id: `c_${c.collection_name}`,
      name: c.collection_name,
      type: 'collection' as TreeNodeType,
      data: c,
      children: [], // Collections don't have children in this structure
      expanded: false, // Not relevant for leaf nodes here
    }));

    const tree: OriginalDatabaseTreeItem = {
      id: database,
      name: database,
      expanded: expandedItems.has(database), // Use state here
      type: 'db',
      children: children,
      data: undefined, // DB node has no specific data object here
    };

    return flattenTree(tree, 0, expandedItems);
  }, [database, collections, expandedItems, flattenTree]); // Dependencies

  // --- Virtualizer Instance ---
  const rowVirtualizer = useVirtualizer({
    count: flattenedNodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 30, // Adjust this based on your average item height
    overscan: 5, // Render items slightly outside the viewport
  });

  // --- Event Handlers ---
  const handleToggleExpand = (nodeId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
    // Close context menu on expand/collapse
    setContextMenu(null);
  };

  // Scroll to the selected item
  const skipNextScrollRef = useRef(false);

  const handleNodeClick = (node: FlatTreeItem) => {
    // flag to skip the next scroll
    skipNextScrollRef.current = true;

    setSelectedItemId(node.id);
    navigate(
      node.type === 'db'
        ? `/databases/${database}/${params.databasePage || 'collections'}`
        : `/databases/${database}/${node.name}/${
            params.collectionPage || 'schema'
          }`
    );
    setContextMenu(null);
  };

  const handleContextMenu = (
    event: React.MouseEvent, // Use React.MouseEvent
    node: FlatTreeItem
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      nodeId: node.id,
      nodeType: node.type,
      object: node.data, // Pass the data associated with the flat node
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  // Effect for closing context menu on outside click
  useEffect(() => {
    document.addEventListener('click', handleCloseContextMenu);
    return () => {
      document.removeEventListener('click', handleCloseContextMenu);
    };
  }, []);

  // Track visible items for refreshing
  useEffect(() => {
    if (!collections.length) return;

    // Track whether we're currently scrolling
    let isScrolling = false;
    let scrollTimeoutId: NodeJS.Timeout | null = null;

    // Save references to stable values to avoid dependency changes
    const currentFlattenedNodes = flattenedNodes;

    const refreshVisibleCollections = () => {
      // Early return if the component is unmounted
      if (!parentRef.current) return;

      const visibleItems = rowVirtualizer.getVirtualItems();
      const visibleCollectionNames = visibleItems
        .map(item => {
          if (item.index >= currentFlattenedNodes.length) return null;
          const node = currentFlattenedNodes[item.index];
          if (node && node.type === 'collection' && node.name) {
            return node.name;
          }
          return null;
        })
        .filter(Boolean) as string[];

      if (visibleCollectionNames.length > 0) {
        batchRefreshCollections(visibleCollectionNames, 'collection-tree');
      }
    };

    // This will be called when scrolling starts
    const handleScrollStart = () => {
      if (!isScrolling) {
        isScrolling = true;
        // Execute on scroll start
        refreshVisibleCollections();
      }

      // Clear any existing timeout
      if (scrollTimeoutId) {
        clearTimeout(scrollTimeoutId);
      }

      // Set a new timeout for scroll end detection
      scrollTimeoutId = setTimeout(() => {
        isScrolling = false;
        // Execute on scroll end
        refreshVisibleCollections();
        scrollTimeoutId = null;
      }, 500); // Wait for scrolling to stop for 300ms
    };

    // Initial refresh when component mounts - with delay to ensure UI is ready
    const initialRefreshTimeout = setTimeout(() => {
      refreshVisibleCollections();
    }, 100);

    // Setup scroll listener
    const scrollElement = parentRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScrollStart);

      return () => {
        scrollElement.removeEventListener('scroll', handleScrollStart);
        // Clear timeout on cleanup
        if (scrollTimeoutId) {
          clearTimeout(scrollTimeoutId);
        }
        clearTimeout(initialRefreshTimeout);
      };
    }

    return () => {
      if (scrollTimeoutId) {
        clearTimeout(scrollTimeoutId);
      }
      clearTimeout(initialRefreshTimeout);
    };
  }, [collections.length, batchRefreshCollections, rowVirtualizer]);

  useEffect(() => {
    if (skipNextScrollRef.current) {
      skipNextScrollRef.current = false;
      setSelectedItemId(
        flattenedNodes.find(node => node.name === collectionName)?.id ||
          database
      );
      return;
    }
    const index = flattenedNodes.findIndex(
      node => node.name === collectionName
    );
    if (index >= 0) {
      rowVirtualizer.scrollToIndex(index, { align: 'center' });
      setSelectedItemId(flattenedNodes[index].id);
    } else {
      rowVirtualizer.scrollToIndex(0, { align: 'start' });
      setSelectedItemId(database);
    }
  }, [collectionName]);

  // --- Rendering ---
  return (
    <>
      <Box
        ref={parentRef}
        className={classes.root} // Apply root styles (ensure height and overflow)
        sx={{
          height: treeHeight, // Adjust this height based on your layout requirements
          overflow: 'auto',
        }}
      >
        <Box
          sx={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {rowVirtualizer.getVirtualItems().map(virtualItem => {
            const node = flattenedNodes[virtualItem.index];
            if (!node) return null; // Should not happen

            const isSelected = node.id === selectedItemId;
            const isContextMenuTarget = contextMenu?.nodeId === node.id;
            const isCollectionNoSchema =
              node.type === 'collection' &&
              (!node.data || !(node.data as CollectionObject).schema);

            return (
              <Box
                key={node.id}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `calc(100% - ${node.depth * 20}px)`, // Adjust for padding
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                  display: 'flex',
                  flex: 1,
                  alignItems: 'center',
                  cursor: 'pointer',
                  paddingLeft: `${node.depth * 20}px`, // Indent based on depth
                  // Apply selection/hover styles based on the original classes
                  backgroundColor: isSelected
                    ? 'rgba(10, 206, 130, 0.28)'
                    : isContextMenuTarget
                      ? 'rgba(10, 206, 130, 0.08)'
                      : 'transparent',
                  '&:hover': {
                    backgroundColor: isSelected
                      ? 'rgba(10, 206, 130, 0.28)'
                      : 'rgba(10, 206, 130, 0.08)',
                  },
                  opacity: isCollectionNoSchema ? 0.5 : 1,
                  color: isCollectionNoSchema ? 'text.disabled' : 'inherit',
                  pointerEvents: isCollectionNoSchema ? 'none' : 'auto',
                }}
                onClick={() => handleNodeClick(node)}
                onContextMenu={e => handleContextMenu(e, node)}
              >
                {/* Expand/Collapse Icon */}
                {node.hasChildren ? (
                  <IconButton
                    size="small"
                    onClick={e => {
                      e.stopPropagation();
                      handleToggleExpand(node.id);
                    }}
                    sx={{ mr: 0 }}
                  >
                    {node.isExpanded ? (
                      <ExpandIcon sx={{ transform: `rotate(90deg)` }} />
                    ) : (
                      <ExpandIcon />
                    )}
                  </IconButton>
                ) : (
                  // Placeholder for alignment if needed
                  <Box sx={{ width: 0, mr: 0.5 }} /> // Adjust width to match IconButton
                )}

                {/* Node Type Icon */}
                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                  {node.type === 'db' ? <DatabaseIcon /> : <CollectionIcon />}
                </Box>

                {/* Label */}
                {node.type === 'collection' && node.data ? (
                  <CollectionNode data={node.data as CollectionObject} />
                ) : (
                  <Tooltip title={node.name} placement="top">
                    <Typography noWrap className={classes.dbName}>
                      {/* Reuse dbName style or create a generic one */}
                      {node.name}
                    </Typography>
                  </Tooltip>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Context Menu Popover (keep existing) */}
      <Popover
        open={Boolean(contextMenu)}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        TransitionComponent={Grow}
        transitionDuration={0}
        sx={{ pointerEvents: 'none' }}
        PaperProps={{
          sx: { pointerEvents: 'auto', boxShadow: 4, borderRadius: 2 },
        }}
      >
        {/* Pass the correct contextMenu object */}
        <TreeContextMenu
          onClick={handleCloseContextMenu}
          contextMenu={contextMenu!}
        />
      </Popover>
    </>
  );
};

export default DatabaseTree;
