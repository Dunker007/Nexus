import { Server as SocketIOServer } from 'socket.io';
let io;
export function initSocket(server) {
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
