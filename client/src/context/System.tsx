import { createContext, useEffect, useState, useContext } from 'react';
import { UserService, MilvusService } from '@/http';
import { parseJson, getNode, getSystemConfigs } from '@/utils';
import { MILVUS_NODE_TYPE } from '@/consts';
import { authContext } from '@/context';
import type { SystemContextType } from './Types';

export const systemContext = createContext<SystemContextType>({
  data: {},
});

const { Provider } = systemContext;
export const SystemProvider = (props: { children: React.ReactNode }) => {
  const { isAuth, isServerless } = useContext(authContext);

  const [data, setData] = useState<any>({});

  const fetchData = async () => {
    try {
      // fetch all data
      const [metrics, users, roles] = await Promise.all([
        MilvusService.getMetrics(),
        !isServerless ? UserService.getUsers() : { usernames: [] },
        !isServerless ? UserService.getRoles() : { results: [] },
      ]);

      // parse data
      const parsedJson = parseJson(metrics);

      // get query nodes
      const queryNodes = getNode(
        parsedJson.allNodes,
        MILVUS_NODE_TYPE.QUERYNODE
      );

      // get data nodes
      const dataNodes = getNode(parsedJson.allNodes, MILVUS_NODE_TYPE.DATANODE);

      // get data nodes
      const indexNodes = getNode(
        parsedJson.allNodes,
        MILVUS_NODE_TYPE.INDEXNODE
      );

      // get root coord
      const rootCoord = getNode(
        parsedJson.allNodes,
        MILVUS_NODE_TYPE.ROOTCOORD
      )[0];

      // get system config
      const systemConfig = getSystemConfigs(parsedJson.workingNodes);
      const deployMode = rootCoord.infos.system_info?.deploy_mode;
      const systemInfo = rootCoord.infos.system_info;

      const data = {
        users: users,
        roles: roles,
        queryNodes,
        dataNodes,
        indexNodes,
        rootCoord,
        deployMode,
        parsedJson,
        systemConfig,
        systemInfo,
      };

      // store other datas
      setData(data);
    } catch (error) {
      // do nothing
      console.log('fetch data error', error);
    }
  };

  useEffect(() => {
    if (isAuth) {
      fetchData();
    } else {
      setData({});
    }
  }, [isAuth]);

  return (
    <Provider
      value={{
        data,
      }}
    >
      {props.children}
    </Provider>
  );
};
