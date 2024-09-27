import { CollectionObject, DatabaseObject } from '@server/types';
import { Params } from 'react-router-dom';

export type TreeNodeType = 'db' | 'collection' | 'partition' | 'segment';
export type TreeNodeObject = CollectionObject | DatabaseObject | null;

export interface DatabaseTreeItem {
  children?: DatabaseTreeItem[];
  id: string;
  name: string;
  type: TreeNodeType;
  expanded?: boolean;
  data?: CollectionObject;
}

export interface DatabaseToolProps {
  database: string;
  collections: CollectionObject[];
  params: Readonly<Params<string>>;
}

export type ContextMenu = {
  mouseX: number; // x position
  mouseY: number; // y position
  nodeId: string | null; // node id
  nodeType: TreeNodeType; // node type
  object: TreeNodeObject; // object
};
