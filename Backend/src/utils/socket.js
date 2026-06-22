import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log(`User Connected: ${socket.id}`);

        socket.on("join_room", (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined their private notification room`);
        });

        socket.on("disconnect", () => {
            console.log("User Disconnected");
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};