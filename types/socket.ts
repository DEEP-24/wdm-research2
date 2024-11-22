import type { Server as NetServer, Socket } from "node:net";
import type { NextApiResponse } from "next";
import type { Server as SocketIOServer } from "socket.io";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  sentAt: Date;
  isRead: boolean;
}
