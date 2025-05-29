import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { isElectron, url } from '@/http';
import { WS_EVENTS } from '@server/utils/Const';

interface UseWebSocketProps {
  isAuth: boolean;
  clientId: string;
  database: string;
  onCollectionUpdate: (data: any) => void; // Define a more specific type if possible
}

export const useWebSocket = ({
  isAuth,
  clientId,
  database, // Added database dependency
  onCollectionUpdate,
}: UseWebSocketProps) => {
  const socket = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const clearSocket = () => {
      setConnected(false);
      socket.current?.offAny();
      socket.current?.disconnect();
      socket.current = null;
    };

    if (isAuth && clientId) {
      const extraHeaders = {
        'milvus-client-id': clientId,
      };

      // Ensure previous connection is cleaned up before creating a new one
      if (socket.current) {
        clearSocket();
      }

      // For Electron, use default config, for web use path configuration
      socket.current = isElectron
        ? io(url as string, { extraHeaders, query: extraHeaders })
        : io(url as string, {
            extraHeaders,
            query: extraHeaders,
            path: '/socket.io', // Add path configuration for proxy usage
          });

      socket.current.on('connect', () => {
        // console.info('--- ws connected ---', clientId);
        setConnected(true);
      });

      socket.current.on('disconnect', () => {
        // console.info('--- ws disconnected ---');
        setConnected(false);
      });

      socket.current.on('error', error => {
        console.error('WebSocket error:', error);
        clearSocket(); // Clear on error as well
      });
    } else {
      clearSocket();
    }

    // Cleanup function for when isAuth or clientId changes
    return () => {
      clearSocket();
    };
  }, [isAuth, clientId]); // Removed database from dependency array here, connection depends on auth/client

  useEffect(() => {
    if (connected && socket.current) {
      // Clear previous listener before adding a new one
      socket.current.off(WS_EVENTS.COLLECTION_UPDATE, onCollectionUpdate);
      // Listen to backend collection event
      socket.current.on(WS_EVENTS.COLLECTION_UPDATE, onCollectionUpdate);
    }

    // Cleanup listener when connection state or callback changes
    return () => {
      socket.current?.off(WS_EVENTS.COLLECTION_UPDATE, onCollectionUpdate);
    };
    // Add database here if the listener logic depends on it,
    // but the current onCollectionUpdate is passed from DataProvider which already depends on database
  }, [connected, onCollectionUpdate]);

  return { connected };
};
