import { Dispatch } from 'react';
import { INodeTreeStructure } from './Types';

const Topology = ({
  tree,
  selectedNode,
  setSelectedNode,
}: {
  tree: INodeTreeStructure;
  selectedNode: string;
  setSelectedNode: Dispatch<string>;
}) => {
  return <div></div>;
};

export default Topology;
