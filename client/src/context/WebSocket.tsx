import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { WS_EVENTS, WS_EVENTS_TYPE } from '../consts/Http';
import { CollectionHttp } from '../http/Collection';
import { MilvusHttp } from '../http/Milvus';
import { CollectionView } from '../pages/collections/Types';
import { checkIndexBuilding, checkLoading } from '../utils/Validation';
import { WebSocketType } from './Types';

export const webSokcetContext = createContext<WebSocketType>({
  collections: [],
  setCollections: data => {},
});

const { Provider } = webSokcetContext;

export const WebSocketProvider = (props: { children: React.ReactNode }) => {
  const [collections, setCollections] = useState<CollectionView[]>([]);

  // test code for socket
  useEffect(() => {
    const socket = io('http://localhost:3000');

    socket.on('connect', function () {
      console.log('--- ws connected ---');
    });

    /**
     * Because of collections data may be big, so we still use ajax to fetch data.
     * Only when collection list includes index building or loading collection,
     * server will keep push collections data from milvus every seconds.
     * After all collections are not loading or building index, tell server stop pulling data.
     */
    socket.on(WS_EVENTS.COLLECTION, (data: any) => {
      const collections: CollectionHttp[] = data.map(
        (v: any) => new CollectionHttp(v)
      );

      const hasLoadingOrBuildingCollection = collections.some(
        v => checkLoading(v) || checkIndexBuilding(v)
      );

      setCollections(collections);
      // If no collection is building index or loading collection
      // stop server cron job
      if (!hasLoadingOrBuildingCollection) {
        MilvusHttp.triggerCron({
          name: WS_EVENTS.COLLECTION,
          type: WS_EVENTS_TYPE.STOP,
        });
      }
    });
  }, []);
  return (
    <Provider
      value={{
        collections,
        setCollections,
      }}
    >
      {props.children}
    </Provider>
  );
};
