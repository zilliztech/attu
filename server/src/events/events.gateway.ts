import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server } from 'socket.io';

@WebSocketGateway(3002, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  }
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('senddata')
  data(@MessageBody() data: unknown): WsResponse<unknown> {
    const event = 'senddata';
    return { event, data };
  }

  @SubscribeMessage('events')
  event(@MessageBody() data: any): Observable<WsResponse<number>> {
    const event = 'events';
    const response = [1, 2, 3];

    return from(response).pipe(
      map(data => ({ event, data })),
    );
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: any): Promise<string> {
    return `identity data: ${data}`;
  }
}
