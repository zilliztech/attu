import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useContext,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import icons from '@/components/icons/Icons';
import { Grow, Popover, Box, IconButton, Fade } from '@mui/material';
import { CollectionObject } from '@server/types';
import {
  DatabaseTreeItem as OriginalDatabaseTreeItem,
  TreeNodeType,
  DatabaseTreeProps,
  ContextMenu,
  TreeNodeObject,
} from './types';
import { TreeContextMenu } from './TreeContextMenu';
import { useVirtualizer } from '@tanstack/react-virtual';
import { dataContext } from '@/context';
import CollectionNode from './CollectionNode';
import DatabaseNode from './DatabaseNode';
import SearchBox from './SearchBox';
import {
  TreeContainer,
  TreeContent,
  NoResultsBox,
  TreeNodeBox,
  SearchBoxContainer,
} from './StyledComponents';

interface FlatTreeItem {
  id: string;
  name: string;
  depth: number;
  type: TreeNodeType;
  data: TreeNodeObject | null;
  isExpanded: boolean;
  hasChildren: boolean;
  originalNode: OriginalDatabaseTreeItem;
}

const DatabaseTree: React.FC<DatabaseTreeProps> = props => {
  const { database, collections, params } = props;

  const navigate = useNavigate();
  const { collectionName = '' } = useParams<{ collectionName: string }>();
  const { batchRefreshCollections } = useContext(dataContext);
  const { t } = useTranslation();

  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set([database])
  );
  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    params.collectionName ? `c_${params.collectionName}` : database
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const parentRef = useRef<HTMLDivElement>(null);

  const ExpandIcon = icons.rightArrow;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const filteredCollections = useMemo(() => {
    if (!debouncedSearchQuery) return collections;
    const query = debouncedSearchQuery.toLowerCase();
    return collections.filter(c =>
      c.collection_name.toLowerCase().includes(query)
    );
  }, [collections, debouncedSearchQuery]);

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

  const flattenedNodes = useMemo(() => {
    const children = filteredCollections.map(c => ({
      id: `c_${c.collection_name}`,
      name: c.collection_name,
      type: 'collection' as TreeNodeType,
      data: c,
      children: [],
      expanded: false,
    }));

    const tree: OriginalDatabaseTreeItem = {
      id: database,
      name: database,
      expanded: expandedItems.has(database),
      type: 'db',
      children: children,
      data: undefined,
    };

    const allNodes = flattenTree(tree, 0, expandedItems);

    return allNodes.filter(
      node => node.type !== 'db' && node.type !== 'search'
    );
  }, [database, filteredCollections, expandedItems, flattenTree, isSearchOpen]);

  const rowVirtualizer = useVirtualizer({
    count: flattenedNodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 30,
    overscan: 5,
  });

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
    setContextMenu(null);
  };

  const skipNextScrollRef = useRef(false);

  const handleNodeClick = (node: FlatTreeItem) => {
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

  const handleContextMenu = (event: React.MouseEvent, node: FlatTreeItem) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      nodeId: node.id,
      nodeType: node.type,
      object: node.data,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    document.addEventListener('click', handleCloseContextMenu);
    return () => {
      document.removeEventListener('click', handleCloseContextMenu);
    };
  }, []);

  useEffect(() => {
    if (!collections.length) return;

    let isScrolling = false;
    let scrollTimeoutId: NodeJS.Timeout | null = null;

    const currentFlattenedNodes = flattenedNodes;

    const refreshVisibleCollections = () => {
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

    const handleScrollStart = () => {
      if (!isScrolling) {
        isScrolling = true;
        refreshVisibleCollections();
      }

      if (scrollTimeoutId) {
        clearTimeout(scrollTimeoutId);
      }

      scrollTimeoutId = setTimeout(() => {
        isScrolling = false;
        refreshVisibleCollections();
        scrollTimeoutId = null;
      }, 500);
    };

    const initialRefreshTimeout = setTimeout(() => {
      refreshVisibleCollections();
    }, 100);

    const scrollElement = parentRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScrollStart);

      return () => {
        scrollElement.removeEventListener('scroll', handleScrollStart);
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
  }, [
    collections.length,
    batchRefreshCollections,
    rowVirtualizer,
    debouncedSearchQuery,
  ]);

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

  // Add scroll handler for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (!parentRef.current) return;
      const scrollTop = parentRef.current.scrollTop;
      setShowScrollTop(scrollTop > 200); // Show button when scrolled more than 200px
    };

    const scrollElement = parentRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleScrollToTop = () => {
    if (parentRef.current) {
      parentRef.current.scrollTo({
        top: 0,
        // behavior: 'smooth',
      });
    }
  };

  return (
    <>
      <TreeContainer ref={parentRef}>
        {isSearchOpen ? (
          <SearchBoxContainer
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 2,
              backgroundColor: 'inherit',
            }}
          >
            <SearchBox
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onClose={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
            />
          </SearchBoxContainer>
        ) : (
          <DatabaseNode
            database={database}
            collectionCount={collections.length}
            isSelected={selectedItemId === database}
            isContextMenuTarget={contextMenu?.nodeId === database}
            onNodeClick={() =>
              handleNodeClick({
                id: database,
                name: database,
                depth: 0,
                type: 'db',
                data: null,
                isExpanded: false,
                hasChildren: false,
                originalNode: {
                  id: database,
                  name: database,
                  type: 'db',
                  children: [],
                  expanded: false,
                },
              })
            }
            onContextMenu={e =>
              handleContextMenu(e, {
                id: database,
                name: database,
                depth: 0,
                type: 'db',
                data: null,
                isExpanded: false,
                hasChildren: false,
                originalNode: {
                  id: database,
                  name: database,
                  type: 'db',
                  children: [],
                  expanded: false,
                },
              })
            }
            onSearchClick={e => {
              e.stopPropagation();
              setIsSearchOpen(!isSearchOpen);
            }}
          />
        )}

        <TreeContent
          sx={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            marginTop: 0,
          }}
        >
          {flattenedNodes.length === 0 ? (
            <NoResultsBox>{t('search.noResults')}</NoResultsBox>
          ) : (
            rowVirtualizer.getVirtualItems().map(virtualItem => {
              const node = flattenedNodes[virtualItem.index];
              if (!node) return null;

              const isSelected = node.id === selectedItemId;
              const isContextMenuTarget = contextMenu?.nodeId === node.id;
              const isCollectionNoSchema =
                node.type === 'collection' &&
                (!node.data || !(node.data as CollectionObject).schema);

              return (
                <TreeNodeBox
                  key={node.id}
                  isSelected={isSelected}
                  isContextMenuTarget={isContextMenuTarget}
                  isCollectionNoSchema={isCollectionNoSchema}
                  depth={node.depth}
                  sx={{
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  onClick={() => handleNodeClick(node)}
                  onContextMenu={e => handleContextMenu(e, node)}
                >
                  {node.hasChildren && node.type !== 'db' ? (
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
                    <Box sx={{ width: 0 }} />
                  )}

                  {node.type === 'collection' && node.data && (
                    <CollectionNode
                      data={node.data as CollectionObject}
                      highlight={debouncedSearchQuery}
                      isSelected={isSelected}
                      isContextMenuTarget={isContextMenuTarget}
                      hasChildren={node.hasChildren}
                      isExpanded={node.isExpanded}
                      depth={node.depth}
                      onToggleExpand={e => {
                        e.stopPropagation();
                        handleToggleExpand(node.id);
                      }}
                      onClick={() => handleNodeClick(node)}
                      onContextMenu={e => handleContextMenu(e, node)}
                    />
                  )}
                </TreeNodeBox>
              );
            })
          )}
        </TreeContent>
      </TreeContainer>

      <Fade in={showScrollTop}>
        <IconButton
          onClick={handleScrollToTop}
          size="small"
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            },
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000,
            width: 32,
            height: 32,
            border: '1px solid rgba(0,0,0,0.1)',
          }}
        >
          <ExpandIcon sx={{ transform: 'rotate(-90deg)', fontSize: 20 }} />
        </IconButton>
      </Fade>

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
        slotProps={{
          paper: {
            sx: { pointerEvents: 'auto', borderRadius: 2 },
          },
        }}
      >
        <TreeContextMenu
          onClick={handleCloseContextMenu}
          contextMenu={contextMenu!}
        />
      </Popover>
    </>
  );
};

export default DatabaseTree;
