import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { authContext } from '@/context';
import { url, Collection, MilvusService } from '@/http';
import { checkIndexBuilding, checkLoading } from '@/utils';
import { WebSocketType } from './Types';
import { WS_EVENTS, WS_EVENTS_TYPE } from '@server/utils/Const';

export const webSocketContext = createContext<WebSocketType>({
  collections: [],
  setCollections: data => {},
});

const { Provider } = webSocketContext;

export const WebSocketProvider = (props: { children: React.ReactNode }) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const { isAuth, clientId } = useContext(authContext);
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    if (isAuth) {
      // connect to socket server
      socket.current = io(url as string);
      // register client
      socket.current.emit(WS_EVENTS.REGISTER, clientId);

      socket.current.on('connect', function () {
        console.log('--- ws connected ---', clientId);
      });

      /**
       * Because of collections data may be big, so we still use ajax to fetch data.
       * Only when collection list includes index building or loading collection,
       * server will keep push collections data from milvus every seconds.
       * After all collections are not loading or building index, tell server stop pulling data.
       */
      socket.current.on(WS_EVENTS.COLLECTION, (data: any) => {
        const collections: Collection[] = data.map(
          (v: any) => new Collection(v)
        );

        const hasLoadingOrBuildingCollection = collections.some(
          v => checkLoading(v) || checkIndexBuilding(v)
        );

        setCollections(collections);
        // If no collection is building index or loading collection
        // stop server cron job
        if (!hasLoadingOrBuildingCollection) {
          MilvusService.triggerCron({
            name: WS_EVENTS.COLLECTION,
            type: WS_EVENTS_TYPE.STOP,
          });
        }
      });
    } else {
      socket.current?.disconnect();
    }
  }, [isAuth]);

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
