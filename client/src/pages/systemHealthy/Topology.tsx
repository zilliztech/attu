import { Dispatch } from 'react';
import { INodeTreeStructure } from './Types';

const Topology = ({
  nodes,
  selectedNode,
  setSelectedNode,
}: {
  nodes: INodeTreeStructure[];
  selectedNode: INodeTreeStructure;
  setSelectedNode: Dispatch<INodeTreeStructure>;
}) => {
  return <div>Topology</div>;
};

export default Topology;
