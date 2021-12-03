
import RoomManagerRobust from './roomManagerRobust.js';
import RoomManagerRedisRobust from './roomManagerRedisRobust.js';
import RoomManager from './roomManager.js';
import RoomManagerRedis from './roomManagerRedis.js';

const playersync = function roomrtcpop(app, duration, redis) {
  if(redis) {
    const roomManager = duration ? new RoomManagerRedisRobust(redis, duration) : new RoomManagerRedis(redis);
    roomManager.init();
    
    app.get("/api/room/:roomId", async (req, res) => {
      const roomId = req.params.roomId;
      const room = await roomManager.getRoom(roomId);
      res.json(room);
    });
  
    app.get("/api/room", async (req, res) => {
      const rooms = await roomManager.getRooms();
      res.json(rooms);
    });
  
    app.post("/api/room/:roomId/join", async (req, res) => {
      const clientId = req.body.clientId;
      const roomId = req.params.roomId;
      const room = await roomManager.joinRoom(roomId, clientId);
      res.json(room);
    });
  
    app.post("/api/room/:roomId/leave", async (req, res) => {
      const clientId = req.body.clientId;
      const roomId = req.params.roomId;
      const room = await roomManager.leaveRoom(roomId, clientId);
      res.json(room);
    });

    app.post("/api/room/:roomId/close", async (req, res) => {
      const roomId = req.params.roomId;
      await roomManager.removeRoom(roomId);
      res.json({});
    });
  
    app.post("/api/room", async (req, res) => {
      const roomId = req.body.roomId || `room${Math.floor(Math.random() * 100000)}`;
      const clientId = req.body.clientId;
      const rooms = await roomManager.creatRoom(roomId, clientId);
      res.json(rooms);
    });
  } else {
    const roomManager = duration ? new RoomManagerRobust(duration) : new RoomManager();

    app.get("/api/room/:roomId", (req, res) => {
      const roomId = req.params.roomId;
      const room = roomManager.getRoom(roomId);
      res.json(room);
    });
  
    app.get("/api/room", (req, res) => {
      const rooms = roomManager.getRooms();
      res.json(rooms);
    });
  
    app.post("/api/room/:roomId/join", (req, res) => {
      const clientId = req.body.clientId;
      const roomId = req.params.roomId;
      const room = roomManager.joinRoom(roomId, clientId);
      res.json(room);
    });
  
    app.post("/api/room/:roomId/leave", (req, res) => {
      const clientId = req.body.clientId;
      const roomId = req.params.roomId;
      const room = roomManager.leaveRoom(roomId, clientId);
      res.json(room);
    });

    app.post("/api/room/:roomId/close", (req, res) => {
      const roomId = req.params.roomId;
      roomManager.removeRoom(roomId);
      res.json({});
    });
  
    app.post("/api/room", (req, res) => {
      const roomId = req.body.roomId || `room${Math.floor(Math.random() * 100000)}`;
      const clientId = req.body.clientId;
      const rooms = roomManager.creatRoom(roomId, clientId);
      res.json(rooms);
    });
  }
}

export default playersync;
