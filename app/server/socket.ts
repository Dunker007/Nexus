import { Server as SocketIOServer } from 'socket.io';
import type { Server as HttpServer } from 'http';

let io: SocketIOServer;

export function initSocket(server: HttpServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*', // Allow all origins since it acts as a local rig
      methods: ['GET', 'POST']
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
  
  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized. Please call initSocket first.');
  }
  return io;
}
