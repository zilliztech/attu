import { Params } from 'react-router-dom';
import type { CollectionObject, DatabaseObject } from '@server/types';

export type TreeNodeType = 'db' | 'collection' | 'partition' | 'segment' | 'search';
export type TreeNodeObject = CollectionObject | DatabaseObject | null;

export interface DatabaseTreeItem {
  children?: DatabaseTreeItem[];
  id: string;
  name: string;
  type: TreeNodeType;
  expanded?: boolean;
  data?: CollectionObject;
}

export interface DatabaseTreeProps {
  database: string;
  collections: CollectionObject[];
  params: Readonly<Params<string>>;
  treeHeight?: number;
}

export type ContextMenu = {
  mouseX: number; // x position
  mouseY: number; // y position
  nodeId: string | null; // node id
  nodeType: TreeNodeType; // node type
  object: TreeNodeObject; // object
};
