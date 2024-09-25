import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import icons from '@/components/icons/Icons';
import {
  Theme,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
  Grow,
  Popover,
} from '@mui/material';
import { useNavigate, Params } from 'react-router-dom';
import { CollectionObject } from '@server/types';
import clcx from 'clsx';
import { formatNumber } from '@/utils';
import { makeStyles } from '@mui/styles';

export type TreeNodeType = 'db' | 'collection' | 'partition' | 'segment';

export interface DatabaseTreeItem {
  children?: DatabaseTreeItem[];
  id: string;
  name: string;
  type: TreeNodeType;
  expanded?: boolean;
  data?: CollectionObject;
}

interface DatabaseToolProps {
  database: string;
  collections: CollectionObject[];
  params: Readonly<Params<string>>;
}

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

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    fontSize: '15px',
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.default,
    '& .MuiTreeItem-iconContainer': {
      width: 'auto',
    },
    '& .MuiTreeItem-group': {
      marginLeft: 0,
      '& .MuiTreeItem-content': {
        padding: '0 0 0 8px',
      },
    },
    '& .MuiTreeItem-label:hover': {
      backgroundColor: 'none',
    },
    '& .MuiTreeItem-content': {
      width: 'auto',
      padding: '0',

      '&:hover': {
        backgroundColor: 'rgba(10, 206, 130, 0.08)',
      },
      '& .MuiTreeItem-label': {
        background: 'none',
      },
    },
    '& .Mui-selected': {
      '& > .MuiTreeItem-content': {
        backgroundColor: 'rgba(10, 206, 130, 0.08)',

        '& .MuiTreeItem-label': {
          background: 'none',
        },
      },
      '&:focus': {
        '& .MuiTreeItem-content': {
          '& .MuiTreeItem-label': {
            background: 'none',
          },
        },
      },
    },
  },
  treeItem: {
    '& .MuiTreeItem-iconContainer': {
      color: '#888',
    },
    '& .right-selected-on': {
      '& .MuiTreeItem-content': {
        backgroundColor: 'rgba(10, 206, 130, 0.08)',
      },
    },
  },
  collectionNode: {
    minHeight: '24px',
    lineHeight: '24px',
    position: 'relative',
  },
  collectionName: {
    display: 'flex',
    alignItems: 'center',
    width: 'calc(100% - 45px)',
    '& .collectionName': {
      minWidth: 36,
    },
  },
  dbName: {
    width: 'calc(100% - 30px)',
  },
  count: {
    fontSize: '13px',
    fontWeight: 500,
    marginLeft: theme.spacing(0.5),
    color: theme.palette.text.secondary,
    pointerEvents: 'none',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    position: 'absolute',
    left: 160,
    top: 8,
    zIndex: 1,
    pointerEvents: 'none',
  },
  loaded: {
    border: `1px solid ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.primary.main,
  },
  unloaded: {
    border: `1px solid ${theme.palette.primary.main}`,
    background: '#fff !important',
  },
  loading: {
    border: `1px solid ${theme.palette.primary.light}`,
    backgroundColor: `${theme.palette.primary.light} !important`,
  },
  noIndex: {
    border: `1px solid ${theme.palette.text.disabled}`,
    backgroundColor: theme.palette.text.disabled,
  },
}));

const CollectionNode: React.FC<{ data: CollectionObject }> = ({ data }) => {
  // i18n collectionTrans
  const { t: commonTrans } = useTranslation();
  const statusTrans = commonTrans('status');

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
      ? statusTrans.loaded
      : statusTrans.unloaded
    : statusTrans.noVectorIndex;

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
      <Tooltip title={loadStatus}>
        <div className={loadClass}></div>
      </Tooltip>
    </div>
  );
};

const DatabaseTree: React.FC<DatabaseToolProps> = props => {
  // state
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    nodeId: string | null;
  } | null>(null);
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
            params.collectionPage || 'overview'
          }`
    );
    // close context menu
    setContextMenu(null);
  };

  const handleContextMenu = (event: any, nodeId: string) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      nodeId,
    });
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  const handleMenuClick = (action: string) => {
    if (contextMenu?.nodeId) {
      console.log(`Action ${action} on node ${contextMenu.nodeId}`);
    }
    handleClose();
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
          onContextMenu={event => handleContextMenu(event, node.id)}
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
              <Tooltip title={tree.name}>
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
            onContextMenu={event => handleContextMenu(event, tree.id)}
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
        // disableAutoFocusItem
        sx={{ pointerEvents: 'none' }} // 使 Popover 外部不可交互
        PaperProps={{
          sx: { pointerEvents: 'auto', boxShadow: 3 },
        }}
      >
        <MenuItem onClick={() => handleMenuClick('Rename')}>
          Rename Collection
        </MenuItem>
        <MenuItem onClick={() => handleMenuClick('Delete')}>
          Delete Collection
        </MenuItem>
      </Popover>
    </>
  );
};

export default DatabaseTree;
