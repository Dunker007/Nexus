import { Server as SocketIOServer } from 'socket.io';
let io;
export function initSocket(server, allowedOrigins) {
    io = new SocketIOServer(server, {
        cors: {
            origin: allowedOrigins,
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
