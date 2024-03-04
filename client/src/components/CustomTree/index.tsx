import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

export type TreeNodeType = 'db' | 'collection' | 'partition' | 'segment';

export interface CustomTreeItem {
  children?: CustomTreeItem[];
  id: string;
  name: string;
  type: TreeNodeType;
  expanded?: boolean;
}

interface CustomToolProps {
  data: CustomTreeItem;
  onNodeToggle?: (event: React.ChangeEvent<{}>, nodeIds: string[]) => void;
  multiSelect?: true;
  disableSelection?: boolean;
  defaultSelected?: string[];
  onNodeClick?: (node: CustomTreeItem) => void;
}

// get expanded nodes from data
const getExpanded = (nodes: CustomTreeItem[]) => {
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

const CustomTree: React.FC<CustomToolProps> = ({
  data,
  onNodeToggle,
  multiSelect,
  disableSelection,
  defaultSelected = [],
  onNodeClick,
}) => {
  // UI data
  const expanded = getExpanded([data]);
  // render children
  const renderTree = (nodes: CustomTreeItem[]) => {
    return nodes.map(node => {
      if (node.children && node.children.length > 0) {
        return (
          <TreeItem
            key={node.id}
            nodeId={node.id}
            label={node.name}
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
          label={node.name}
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
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      expanded={expanded}
      onNodeToggle={onNodeToggle}
      selected={defaultSelected}
      multiSelect={multiSelect}
      disableSelection={disableSelection}
    >
      {data && (
        <TreeItem
          key={data.id}
          nodeId={data.id}
          label={data.name}
          onClick={event => {
            event.stopPropagation();
            if (onNodeClick) {
              onNodeClick(data);
            }
          }}
        >
          {data.children && data.children.length > 0
            ? renderTree(data.children)
            : [<div key="stub" />]}
        </TreeItem>
      )}
    </TreeView>
  );
};

export default CustomTree;
