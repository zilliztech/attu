import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { CollectionHttp } from '../http/Collection';

export const navContext = createContext<{}>({});

const { Provider } = navContext;

export const WebSocketProvider = (props: { children: React.ReactNode }) => {
  // test code for socket
  useEffect(() => {
    console.log('----in websocket-----');
    const socket = io('http://localhost:3000');
    socket.on('connect', function () {
      console.log('Connected');

      socket.emit('identity', 0, (res: any) => console.log(res));

      socket.emit('events', { test: 'events' });

      socket.emit('senddata', { test: 'senddata' });
    });
    socket.on('COLLECTION', (data: any) => {
      const collections = data.map((v: any) => new CollectionHttp(v));
      console.log('event', collections);
    });
  }, []);
  return <Provider value={{}}>{props.children}</Provider>;
};
