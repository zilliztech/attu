import { MILVUS_NODE_TYPE } from '@/consts';

export const parseJson = (jsonData: any) => {
  const nodes: any[] = [];
  const childNodes: any[] = [];

  const system = {
    // qps: Math.random() * 1000,
    latency: Math.random() * 1000,
    disk: 0,
    diskUsage: 0,
    memory: 0,
    memoryUsage: 0,
  };

  const workingNodes = jsonData?.response?.nodes_info.filter(
    (node: any) => node?.infos?.has_error !== true
  );

  const allNodes = jsonData?.response?.nodes_info;

  console.log(workingNodes,
    // workingNodes.map((d: any) => ({
    //   name: d.infos.name,
    //   ip: d.infos.hardware_infos.ip,
    // }))
  );

  workingNodes.forEach((node: any) => {
    const type = node?.infos?.type;
    if (node.connected) {
      node.connected = node.connected.filter((v: any) =>
        workingNodes.find(
          (item: any) => v.connected_identifier === item.identifier
        )
      );
    }
    // coordinator node
    if (
      type?.toLowerCase().includes('coord') ||
      type?.toLowerCase().includes('proxy')
    ) {
      nodes.push(node);
      // other nodes
    } else {
      childNodes.push(node);
    }

    const info = node.infos.hardware_infos || {};
    system.memory += info.memory || 0;
    system.memoryUsage += info.memory_usage;
    system.disk += info.disk || 0;
    system.diskUsage += info.disk_usage;
  });
  return { nodes, childNodes, system, workingNodes, allNodes };
};

// get nodes
export const getNode = (nodes: any, type: MILVUS_NODE_TYPE) => {
  return nodes.filter((n: any) => n.infos.type === type);
};

export const getSystemConfigs = (workingNodes: any) => {
  return workingNodes.map((n: any) => n.infos.system_configurations);
};
