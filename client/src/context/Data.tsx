import { createContext, useEffect, useState, useContext } from 'react';
import { Database, User, MilvusService } from '@/http';
import { parseJson, getNode, getSystemConfigs } from '@/utils';
import { MILVUS_NODE_TYPE } from '@/consts';
import { authContext } from '@/context';
import { DataContextType } from './Types';

export const dataContext = createContext<DataContextType>({
  database: 'default',
  databases: ['default'],
  data: {},
  setDatabase: () => {},
  setDatabaseList: () => {},
});

const { Provider } = dataContext;
export const DataProvider = (props: { children: React.ReactNode }) => {
  const { isAuth } = useContext(authContext);
  const [database, setDatabase] = useState<string>('default');
  const [databases, setDatabases] = useState<string[]>(['default']);
  const [data, setData] = useState<any>({});

  const fetchData = async () => {
    try {
      // fetch all data
      const [databases, metrics, users, roles] = await Promise.all([
        Database.getDatabases(),
        MilvusService.getMetrics(),
        User.getUsers(),
        User.getRoles(),
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
      const deployMode = rootCoord.infos.system_info.deploy_mode;
      const systemInfo = rootCoord.infos.system_info;

      const data = {
        users: users.usernames,
        roles: roles.results,
        queryNodes,
        dataNodes,
        indexNodes,
        rootCoord,
        deployMode,
        parsedJson,
        systemConfig,
        systemInfo,
      };

      // store databases
      setDatabases(databases.db_names);
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
        database,
        databases,
        setDatabase,
        setDatabaseList: setDatabases,
      }}
    >
      {props.children}
    </Provider>
  );
};
