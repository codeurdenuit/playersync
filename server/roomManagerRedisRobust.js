export default class RoomManager {

  constructor(redis, duration) {
    this.rooms = {};
    this.roomsAge = {};
    this.maxDuration = duration;
    this.redis = redis;
  }

  async init() {
    const rooms = await this.redis.get('_rooms');
    const roomsAge = await this.redis.get('_roomsage');
    if (!rooms) await this.redis.set('_rooms', JSON.stringify({}));
    if (!roomsAge) await this.redis.set('_roomsage', JSON.stringify({}));
  }

  async getRooms() {
    const rooms = await this._getRooms();
    const roomsAge = await this._getRoomsAge();
    await this.removeOldRooms(rooms, roomsAge);
    return rooms;
  }

  async getRoom(roomId) {
    const rooms = await this._getRooms();
    return rooms[roomId]||[];
  }

  async creatRoom(roomId, clientId) {
    const rooms = await this._getRooms();
    const roomsAge = await this._getRoomsAge();
    this.removeClientId(clientId, rooms, roomsAge);
    rooms[roomId] = [clientId];
    roomsAge[roomId] = new Date();
    await this._setRooms(rooms);
    await this._setRoomsAge(roomsAge);
    return rooms;
  }

  async joinRoom(roomId, clientId) {
    const rooms = await this._getRooms();
    const roomsAge = await this._getRoomsAge();
    this.removeClientId(clientId, rooms, roomsAge);
    if (!rooms[roomId]) return [];
    rooms[roomId].push(clientId);
    roomsAge[roomId] = new Date();
    await this._setRooms(rooms);
    await this._setRoomsAge(roomsAge);
    return rooms[roomId];
  }

  async leaveRoom(roomId, clientId) {
    const rooms = await this._getRooms();
    const roomsAge = await this._getRoomsAge();
    if (!rooms[roomId]) return null;
    const index = rooms[roomId].indexOf(clientId);
    if (index !== -1) {
      rooms[roomId].splice(index, 1);
      roomsAge[roomId] = new Date();
      if (!rooms[roomId].length) {
        delete rooms[roomId];
        delete roomsAge[roomId];
      }
    }
    await this._setRooms(rooms);
    await this._setRoomsAge(roomsAge);
    return null;
  }

  removeClientId(clientId, rooms, roomsAge) {
    for (let roomId in rooms) {
      const room = rooms[roomId];
      if (room.includes(clientId)) {
        const index = room.indexOf(clientId);
        room.splice(index, 1);
        if (!room.length) {
          delete rooms[roomId];
          delete roomsAge[roomId];
        }
      }
    }
  }

  async removeOldRooms(rooms, roomsAge) {
    const currentDate = new Date();
    let updated = false;
    for (let roomId in roomsAge) {
      if (currentDate - new Date(roomsAge[roomId]) > this.maxDuration) {
        delete rooms[roomId];
        delete roomsAge[roomId];
        updated = true;
      }
    }
    if (updated) {
      await this._setRooms(rooms);
      await this._setRoomsAge(roomsAge);
    }
  }

  async removeRoom(roomId) {
    const rooms = await this._getRooms();
    const roomsAge = await this._getRoomsAge();
    if (!rooms[roomId]) return;
    delete rooms[roomId];
    delete roomsAge[roomId];
    await this._setRooms(rooms);
    await this._setRoomsAge(roomsAge);
    return;
  }

  async _getRooms() {
    const rooms = await this.redis.get('_rooms');
    return JSON.parse(rooms);
  }

  async _setRooms(room) {
    await this.redis.set('_rooms', JSON.stringify(room));
  }

  async _getRoomsAge() {
    const roomsAge = await this.redis.get('_roomsage');
    return JSON.parse(roomsAge);
  }

  async _setRoomsAge(roomsAge) {
    await this.redis.set('_roomsage', JSON.stringify(roomsAge));
  }

}
