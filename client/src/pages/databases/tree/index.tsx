import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import icons from '@/components/icons/Icons';
import { makeStyles, Theme } from '@material-ui/core';
import { useNavigate, Params } from 'react-router-dom';
import { CollectionObject } from '@server/types';

export type TreeNodeType = 'db' | 'collection' | 'partition' | 'segment';

export interface DatabaseTreeItem {
  children?: DatabaseTreeItem[];
  id: string;
  name: string;
  type: TreeNodeType;
  expanded?: boolean;
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
    '& .MuiTreeItem-iconContainer': {
      width: 'auto',
    },
    '& .MuiTreeItem-group': {
      marginLeft: 0,
      '& .MuiTreeItem-content': {
        padding: '0 0 0 16px',
      },
    },
    '& .MuiTreeItem-label:hover': {
      backgroundColor: 'none',
    },
    '& .MuiTreeItem-content': {
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
}));

const DatabaseTree: React.FC<DatabaseToolProps> = props => {
  // props
  const { database, collections, params } = props;

  // format tree data
  const children = collections.map(c => {
    return {
      id: `c_${c.collection_name}`,
      name: c.collection_name,
      type: 'collection' as TreeNodeType,
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
        : `/databases/${database}/${node.name}/${params.collectionPage || 'data'}`
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
          label={node.name}
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
      selected={params.collectionName || params.databaseName}
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
