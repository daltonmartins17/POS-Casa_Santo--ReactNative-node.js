require("dotenv").config();
const app = require("./app");
const http = require("http");
const socketio = require("socket.io");
const { setupSockets } = require("./sockets");

const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
  allowEIO3: true,
  transports: ["websocket", "polling"],
});

setupSockets(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor HTTP + WebSocket na porta ${PORT}`);
});
