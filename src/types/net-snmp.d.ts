declare module 'net-snmp' {
  export const Version1: number;
  export const Version2c: number;
  export const Version3: number;

  export function createSession(target: string, options: any): Session;

  export interface Session {
    get(oids: string[], callback: (error: Error | null, varbinds: any[]) => void): void;
    close(): void;
  }

  export function isVarbindError(varbind: any): boolean;
  export function varbindError(varbind: any): string;
}
