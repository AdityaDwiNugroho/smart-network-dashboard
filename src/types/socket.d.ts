declare module 'socket.io' {
  export interface ServerToClientEvents {
    'metrics_update': (metrics: NetworkMetrics) => void;
    'device_update': (device: Device) => void;
  }

  export interface ClientToServerEvents {
    'connect': () => void;
    'disconnect': () => void;
  }

  export class Server<
    ListenEvents extends EventsMap = EventsMap,
    EmitEvents extends EventsMap = EventsMap,
    ServerSideEvents extends EventsMap = EventsMap,
    SocketData = any
  > {
    on(event: string, listener: Function): this;
    emit(event: string, ...args: any[]): boolean;
  }

  export interface Socket<
    ListenEvents extends EventsMap = EventsMap,
    EmitEvents extends EventsMap = EventsMap,
    ServerSideEvents extends EventsMap = EventsMap,
    SocketData = any
  > {
    id: string;
    on(event: string, listener: Function): this;
    emit(event: string, ...args: any[]): boolean;
  }

  interface EventsMap {
    [event: string]: any;
  }
}
