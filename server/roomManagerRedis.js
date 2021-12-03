export default class RoomManager {

  constructor(redis) {
    this.rooms = {};
    this.redis = redis;
  }

  async init() {
    const rooms = await this.redis.get('_rooms');
    if (!rooms) await this.redis.set('_rooms', JSON.stringify({}));
  }

  async getRooms() {
    const rooms = await this._getRooms();
    return rooms;
  }

  async getRoom(roomId) {
    const rooms = await this._getRooms();
    return rooms[roomId]||[];
  }

  async creatRoom(roomId, clientId) {
    const rooms = await this._getRooms();
    this.removeClientId(clientId, rooms);
    rooms[roomId] = [clientId];
    await this._setRooms(rooms);
    return rooms;
  }

  async joinRoom(roomId, clientId) {
    const rooms = await this._getRooms();
    this.removeClientId(clientId, rooms);
    if (!rooms[roomId]) return [];
    rooms[roomId].push(clientId);
    await this._setRooms(rooms);
    return rooms[roomId];
  }

  async leaveRoom(roomId, clientId) {
    const rooms = await this._getRooms();
    if (!rooms[roomId]) return null;
    const index = rooms[roomId].indexOf(clientId);
    if (index !== -1) {
      rooms[roomId].splice(index, 1);
      if (!rooms[roomId].length) {
        delete rooms[roomId];
      }
    }
    await this._setRooms(rooms);
    return null;
  }

  removeClientId(clientId, rooms) {
    for (let roomId in rooms) {
      const room = rooms[roomId];
      if (room.includes(clientId)) {
        const index = room.indexOf(clientId);
        room.splice(index, 1);
        if (!room.length) {
          delete rooms[roomId];
        }
      }
    }
  }

  async removeRoom(roomId) {
    const rooms = await this._getRooms();
    if (!rooms[roomId]) return;
    delete rooms[roomId];
    await this._setRooms(rooms);
    return;
  }

  async _getRooms() {
    const rooms = await this.redis.get('_rooms');
    return JSON.parse(rooms);
  }

  async _setRooms(room) {
    await this.redis.set('_rooms', JSON.stringify(room));
  }

}
