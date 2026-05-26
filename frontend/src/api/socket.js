import { io } from "socket.io-client";


const SOCKET_URL = "http://localhost:3000";

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

socket.on("connect_error", () => {});

export default socket;
