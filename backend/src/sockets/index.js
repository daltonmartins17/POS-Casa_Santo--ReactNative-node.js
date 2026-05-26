function setupSockets(io) {
  io.on("connection", (socket) => {
    console.log("🔌 Novo cliente conectado:", socket.id);

    socket.on("join_kitchen", () => {
      socket.join("kitchen");
      console.log("👨‍🍳 Cliente entrou na sala da cozinha:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("🔌 Cliente desconectado:", socket.id);
    });
  });

  global.io = io;
  console.log("✅ WebSocket configurado e pronto");
}

module.exports = { setupSockets };
