import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import icons from '@/components/icons/Icons';
import { Tooltip, Typography, Grow, Popover } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CollectionObject } from '@server/types';
import clcx from 'clsx';
import { formatNumber } from '@/utils';
import { useStyles } from './style';
import {
  DatabaseTreeItem,
  TreeNodeType,
  DatabaseToolProps,
  ContextMenu,
  TreeNodeObject,
} from './types';
import { TreeContextMenu } from './TreeContextMenu';

// get expanded nodes from data
const getExpanded = (nodes: DatabaseTreeItem[]) => {
  const expanded: string[] = [];
  nodes.forEach(node => {
    if (node.expanded) {
      expanded.push(node.id);
    }
    if (node.children && node.children.length > 0) {
      expanded.push(...getExpanded(node.children));
    }
  });
  return expanded;
};

const CollectionNode: React.FC<{ data: CollectionObject }> = ({ data }) => {
  // i18n collectionTrans
  const { t: commonTrans } = useTranslation();

  // styles
  const classes = useStyles();

  // class
  const loadClass = clcx(classes.dot, {
    [classes.loaded]: data.loaded,
    [classes.unloaded]: !data.loaded,
    [classes.loading]: data.status === 'loading',
    [classes.noIndex]: !data.schema || !data.schema.hasVectorIndex,
  });

  //  status tooltip
  const hasIndex = data.schema && data.schema.hasVectorIndex;
  const loadStatus = hasIndex
    ? data.loaded
      ? commonTrans('status.loaded')
      : commonTrans('status.unloaded')
    : commonTrans('status.noVectorIndex');

  return (
    <div className={classes.collectionNode}>
      <div className={classes.collectionName}>
        <Tooltip
          title={data.collection_name}
          placement="top"
          PopperProps={{
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, -10],
                },
              },
            ],
          }}
        >
          <Typography noWrap className="collectionName">
            {data.collection_name}
          </Typography>
        </Tooltip>
        <span className={classes.count}>
          ({formatNumber(data.rowCount || 0)})
        </span>
      </div>
      <Tooltip title={loadStatus} placement="top">
        <div className={loadClass} title={loadStatus}></div>
      </Tooltip>
    </div>
  );
};

const DatabaseTree: React.FC<DatabaseToolProps> = props => {
  // state
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  // props
  const { database, collections, params } = props;

  // format tree data
  const children = collections.map(c => {
    return {
      id: `c_${c.collection_name}`,
      name: c.collection_name,
      type: 'collection' as TreeNodeType,
      data: c,
    };
  });

  // tree data
  const tree: DatabaseTreeItem = {
    id: database,
    name: database,
    expanded: children.length > 0,
    type: 'db',
    children: children,
  };

  // Icons
  const DatabaseIcon = icons.database;
  const CollectionIcon = icons.navCollection;

  // hooks
  const navigate = useNavigate();
  const classes = useStyles();

  // on node click
  const onNodeClick = (node: DatabaseTreeItem) => {
    navigate(
      node.type === 'db'
        ? `/databases/${database}/${params.databasePage || 'collections'}`
        : `/databases/${database}/${node.name}/${
            params.collectionPage || 'schema'
          }`
    );
    // close context menu
    setContextMenu(null);
  };

  const handleContextMenu = (
    event: any,
    nodeId: string,
    nodeType: string,
    object: TreeNodeObject
  ) => {
    // prevent default
    event.preventDefault();
    event.stopPropagation();

    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      nodeId,
      nodeType: nodeType as TreeNodeType,
      object: object,
    });
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  // render children
  const renderTree = (nodes: DatabaseTreeItem[]) => {
    return nodes.map(node => {
      if (node.children && node.children.length > 0) {
        return (
          <TreeItem
            key={node.id}
            itemId={node.id}
            slots={{
              icon: CollectionIcon,
            }}
            label={node.name}
            className={clcx(classes.treeItem, {
              ['right-selected-on']: contextMenu?.nodeId === node.id,
            })}
            onClick={(event: any) => {
              event.stopPropagation();
              if (onNodeClick) {
                onNodeClick(node);
              }
            }}
          >
            {renderTree(node.children)}
          </TreeItem>
        );
      }

      return (
        <TreeItem
          key={node.id}
          itemId={node.id}
          slots={{
            icon: CollectionIcon,
          }}
          label={<CollectionNode data={node.data!} />}
          onContextMenu={event =>
            handleContextMenu(event, node.id, node.type, node.data!)
          }
          className={clcx(classes.treeItem, {
            ['right-selected-on']: contextMenu?.nodeId === node.id,
          })}
          onClick={(event: any) => {
            event.stopPropagation();
            if (onNodeClick) {
              onNodeClick(node);
            }
          }}
        />
      );
    });
  };

  // useEffect
  useEffect(() => {
    // register click event on document, close context menu if click outside
    document.addEventListener('click', handleClose);

    return () => {
      document.removeEventListener('click', handleClose);
    };
  }, []);

  return (
    <>
      <SimpleTreeView
        expandedItems={[database]}
        multiSelect={false}
        disableSelection={false}
        selectedItems={
          params.collectionName
            ? `c_${params.collectionName}`
            : params.databaseName
        }
        className={classes.root}
      >
        {
          <TreeItem
            key={tree.id}
            itemId={tree.id}
            label={
              <Tooltip
                title={tree.name}
                placement="top"
                PopperProps={{
                  modifiers: [
                    {
                      name: 'offset',
                      options: {
                        offset: [0, -10],
                      },
                    },
                  ],
                }}
              >
                <Typography noWrap className={classes.dbName}>
                  {tree.name}
                </Typography>
              </Tooltip>
            }
            className={classes.treeItem}
            slots={{
              icon: DatabaseIcon,
            }}
            onClick={(event: any) => {
              event.stopPropagation();
              if (onNodeClick) {
                onNodeClick(tree);
              }
            }}
            onContextMenu={event =>
              handleContextMenu(event, tree.id, tree.type, null)
            }
          >
            {tree.children && tree.children.length > 0
              ? renderTree(tree.children)
              : [<div key="stub" />]}
          </TreeItem>
        }
      </SimpleTreeView>
      <Popover
        open={Boolean(contextMenu)}
        onClose={handleClose}
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
        <TreeContextMenu onClick={handleClose} contextMenu={contextMenu!} />
      </Popover>
    </>
  );
};

export default DatabaseTree;
