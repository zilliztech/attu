// socket.ts
import { Server, Socket } from 'socket.io';
import * as http from 'http';
import chalk from 'chalk';
import { WS_EVENTS } from './utils';

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
    // register client
    socket.on(WS_EVENTS.REGISTER, (clientId: string) => {
      clients.set(clientId, socket);
      console.info(chalk.green(`ws client connected ${clientId}`));

      socket.on('disconnect', () => {
        console.info(chalk.green(`ws client disconnected ${clientId}`));
        clients.delete(clientId);
      });
    });
  });
}
