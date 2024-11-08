// socket.ts
import { Server, Socket } from 'socket.io';
import * as http from 'http';
import chalk from 'chalk';
import { isElectron } from './utils';

export let io: Server;
export let clients = new Map<string, Socket>();

export function initWebSocket(server: http.Server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    const clientId = socket.handshake.query['milvus-client-id'] as string;

    if (clientId) {
      clients.set(clientId, socket);
      if (!isElectron()) {
        console.info(chalk.green(`ws client connected ${clientId}`));
      }

      socket.on('disconnect', () => {
        if (!isElectron()) {
          console.info(chalk.green(`ws client disconnected ${clientId}`));
        }
        clients.delete(clientId);
      });

      socket.on('error', (error: Error) => {
        if (!isElectron()) {
          console.error(
            chalk.red(`ws client error ${clientId}: ${error.message}`)
          );
        }
      });
    }
  });

  // Handle server-level errors
  io.on('error', (error: Error) => {
    if (!isElectron()) {
      console.error(chalk.red(`ws server error: ${error.message}`));
    }
  });
}
