// socket.ts
import { Server, Socket } from 'socket.io';
import * as http from 'http';
import chalk from 'chalk';
import { isElectron } from './utils';

export let io: Server;
export let clients = new Map<string, Socket>();

export const logWebSocketRequest = (
  socket: Socket,
  event: string,
  message?: any,
  direction: 'in' | 'out' = 'in'
) => {
  if (isElectron()) {
    return;
  }
  const clientId = socket.handshake.query['milvus-client-id'] as string;
  const remoteAddress =
    socket.handshake.address === '::1' ? '127.0.0.1' : socket.handshake.address;
  const timestamp = new Date().toLocaleTimeString();
  const directionLabel = direction === 'in' ? '←' : '→';
  const mes =
    process.env.ATTU_LOG_LEVEL === 'debug'
      ? JSON.stringify(message)
      : message
        ? JSON.stringify(message).length
        : '';

  const logMessage = [
    chalk.blue.bold('WS'),
    chalk.magenta.bold(event),
    chalk.green.bold(`Client: ${clientId}`),
    chalk.yellow(remoteAddress),
    chalk.gray(`@ ${timestamp}`),
    direction === 'in'
      ? chalk.cyan(directionLabel)
      : chalk.magenta(directionLabel),
    message ? chalk.white(mes) : '',
  ]
    .filter(Boolean)
    .join(' ');

  console.log(logMessage);
};

export const initWebSocket = (server: http.Server) => {
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

      // Log connection event
      logWebSocketRequest(socket, 'CONNECT');

      socket.on('disconnect', () => {
        // Log disconnect event
        logWebSocketRequest(socket, 'DISCONNECT');
        clients.delete(clientId);
      });

      socket.on('error', (error: Error) => {
        // Log error event
        logWebSocketRequest(socket, 'error', error.message);
      });

      // Log custom events
      socket.onAny((event, ...args) => {
        logWebSocketRequest(socket, event, args);
      });
    }
  });

  io.use((socket, next) => {
    const originalEmit = socket.emit;
    // Convert the assigned function to an arrow function
    socket.emit = (event: string, ...args: any[]) => {
      logWebSocketRequest(socket, event, args, 'out');
      // Use .apply() with the correct context (socket)
      return originalEmit.apply(socket, [event, ...args]);
    };
    next();
  });

  // Handle server-level errors
  io.on('error', (error: Error) => {
    if (!isElectron()) {
      console.error(chalk.red(`ws server error: ${error.message}`));
    }
  });
};
