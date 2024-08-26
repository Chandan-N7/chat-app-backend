const { Server } = require("socket.io");
const Message = require("./models/MessagesModel.js");

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.ORIGIN,
            methods: ["GET", "POST"],
            credentials: true,
        }
    });

    const userSocketMap = new Map();
    const disconnect = (socket) => {
        console.log(`Client Disconnected: ${socket.id} `)
        for (const [userId, socketId] of userSocketMap.entries()) {
            if (socket.id === socketId) {
                userSocketMap.delete(userId)
                break;
            }
        }
    }


    const sendMessage = async (message) => {
        try {
            const sendSocketId = userSocketMap.get(message.sender);
            const recipientSocketId = userSocketMap.get(message.recipient);

            const createMessage = await Message.create(message);

            const messageData = await Message.findById(createMessage._id)
                .populate("sender", "id email firstName lastName image color")
                .populate("recipient", "id email firstName lastName image color")

            if (recipientSocketId) {
                try {
                    io.to(recipientSocketId).emit("recieveMessage", messageData)
                } catch (error) {
                    console.log("a",error)

                }
            }
            if (sendSocketId) {
                try {
                    io.to(sendSocketId).emit("recieveMessage", messageData)

                } catch (error) {
                    console.log("b",error)

                }
            }
        } catch (error) {
            console.log("1a",error)

        }

    }

    io.on("connection", (socket) => {
        try {
            const userId = socket.handshake.query.userId;

            if (userId) {
                userSocketMap.set(userId, socket.id)
                console.log(`User connected: ${userId} with socket ID: ${socket.id}`)
            } else {
                console.log("User id not provided during connection")
            }
            socket.on("sendMessage", sendMessage)
            socket.on("disconnect", () => disconnect(socket))
        } catch (error) {
            console.log("2a",error)

        }

    })


}

module.exports = setupSocket;