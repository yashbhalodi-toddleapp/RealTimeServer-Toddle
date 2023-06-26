const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const { Server } = require("socket.io");
const redisClient = require("./redis/redisClient");
const handleUserPresenceSocket = require("./socket_server/userPresenceController");

const app = express();
app.use(cors());
app.use(morgan("combined"));
const expressServer = http.createServer(app);

app.get("/", async (req, res) => {
  try {
    await redisClient.incr("test");
    const data = await redisClient.get("test");
    res.json({ message: "Hello World", count: data });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/isUserOnline", async (req, res) => {
  res.json({ message: "wip" });
});

app.post("/fetchOnlineUsers", async (req, res) => {
  res.json({ message: "wip" });
});

const socketServer = http.createServer();
const io = new Server(socketServer, {
  cors: { origin: "*" },
  pingInterval: 1000,
  pingTimeout: 5000,
});

handleUserPresenceSocket(io, redisClient);

const expressPort = 3000;
const socketPort = 4000;

expressServer.listen(expressPort, () => {
  console.log(`Express server is running on http://localhost:${expressPort}`);
});

socketServer.listen(socketPort, () => {
  console.log(`Socket.IO server is running on http://localhost:${socketPort}`);
});
