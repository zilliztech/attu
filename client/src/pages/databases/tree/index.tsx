import { useTranslation } from 'react-i18next';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import icons from '@/components/icons/Icons';
import { makeStyles, Theme, Tooltip, Typography } from '@material-ui/core';
import { useNavigate, Params } from 'react-router-dom';
import { CollectionObject } from '@server/types';
import clcx from 'clsx';
import { formatNumber } from '@/utils';

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
  },
  collectionNode: {
    minHeight: '24px',
    lineHeight: '24px',
    position: 'relative',
  },
  collectionName: {
    display: 'flex',
    alignItems: 'center',
    width: 'calc(100% - 50px)',
  },
  count: {
    fontSize: '13px',
    fontWeight: 500,
    marginLeft: theme.spacing(0.5),
    color: theme.palette.attuGrey.main,
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    position: 'absolute',
    left: 160,
    top: 8,
    zIndex: 1,
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
    border: `1px solid ${theme.palette.attuGrey.light}`,
    backgroundColor: theme.palette.attuGrey.light,
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
        <Tooltip title={data.collection_name}>
          <Typography noWrap>{data.collection_name}</Typography>
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
            params.collectionPage || 'info'
          }`
    );
  };

  // render children
  const renderTree = (nodes: DatabaseTreeItem[]) => {
    return nodes.map(node => {
      if (node.children && node.children.length > 0) {
        return (
          <TreeItem
            key={node.id}
            nodeId={node.id}
            icon={<CollectionIcon />}
            label={node.name}
            className={classes.treeItem}
            onClick={event => {
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
          nodeId={node.id}
          icon={<CollectionIcon />}
          label={<CollectionNode data={node.data!} />}
          className={classes.treeItem}
          onClick={event => {
            event.stopPropagation();
            if (onNodeClick) {
              onNodeClick(node);
            }
          }}
        />
      );
    });
  };

  return (
    <TreeView
      expanded={[database]}
      multiSelect={false}
      disableSelection={false}
      selected={
        params.collectionName
          ? `c_${params.collectionName}`
          : params.databaseName
      }
      className={classes.root}
    >
      {
        <TreeItem
          key={tree.id}
          nodeId={tree.id}
          label={tree.name}
          className={classes.treeItem}
          icon={<DatabaseIcon />}
          onClick={event => {
            event.stopPropagation();
            if (onNodeClick) {
              onNodeClick(tree);
            }
          }}
        >
          {tree.children && tree.children.length > 0
            ? renderTree(tree.children)
            : [<div key="stub" />]}
        </TreeItem>
      }
    </TreeView>
  );
};

export default DatabaseTree;
