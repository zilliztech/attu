// socket.ts
import { Server, Socket } from 'socket.io';
import * as http from 'http';
import chalk from 'chalk';
import { serverEvent } from './events';
import { WS_EVENTS } from './utils';
export let io: Server;

export function initWebSocket(server: http.Server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.info(
      chalk.green(`ws client connected ${socket.client.conn.remoteAddress}`)
    );

    socket.on(WS_EVENTS.COLLECTION, (message: any) => {
      socket.emit(WS_EVENTS.COLLECTION, { data: message });
    });

    // frontend emit -> serverEvent.emit -> server event handler
    socket.on(WS_EVENTS.TO_SERVER, (msg: any) => {
      serverEvent.emit(msg.event, msg);
    });

    // server emit -> socket emit -> frontend event handler
    serverEvent.on(WS_EVENTS.TO_CLIENT, (msg: any) => {
      socket.emit(msg.event, msg.data);
    });

    socket.on('disconnect', () => {
      console.info(
        chalk.green(
          `ws client disconnected ${socket.client.conn.remoteAddress}`
        )
      );
    });
  });
}
