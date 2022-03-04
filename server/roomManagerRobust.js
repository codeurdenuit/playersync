export default class RoomManager {

  constructor(duration) {
    this.rooms = {};
    this.roomsDate = {};
    this.maxDuration = duration;
  }

  getRooms() {
    this.removeOldRooms();
    return this.rooms;
  }

  getRoom(roomId) {
    return this.rooms[roomId] || [];
  }

  creatRoom(roomId, clientId) {
    this.removeClientId(clientId);
    if (this.rooms[roomId]) {
      this.rooms[roomId].push(clientId);
    } else {
      this.rooms[roomId] = [clientId];
    }
    this.roomsDate[roomId] = new Date();
    return this.rooms;
  }

  joinRoom(roomId, clientId) {
    this.removeClientId(clientId);
    if (!this.rooms[roomId]) return [];
    this.rooms[roomId].push(clientId);
    this.roomsDate[roomId] = new Date();
    return this.rooms[roomId];
  }

  leaveRoom(roomId, clientId) {
    if (!this.rooms[roomId]) return [];
    const index = this.rooms[roomId].indexOf(clientId);
    if (index !== -1) {
      this.rooms[roomId].splice(index, 1);
      this.roomsDate[roomId] = new Date();
      if (!this.rooms[roomId].length) {
        delete this.rooms[roomId];
        delete this.roomsDate[roomId];
        return [];
      }
      return this.rooms[roomId];
    }
    return [];
  }

  removeClientId(clientId) {
    for (let roomId in this.rooms) {
      const room = this.rooms[roomId];
      if (room.includes(clientId)) {
        const index = room.indexOf(clientId);
        room.splice(index, 1);
        if (!room.length) {
          delete this.rooms[roomId];
          delete this.roomsDate[roomId];
        }
        return;
      }
    }
  }

  removeOldRooms() {
    const currentDate = new Date();
    for (let roomId in this.roomsDate) {
      if (currentDate - this.roomsDate[roomId] > this.maxDuration) {
        delete this.rooms[roomId];
        delete this.roomsDate[roomId];
      }
    }
  }

  removeRoom(roomId) {
    if (!this.rooms[roomId]) return;
    delete this.rooms[roomId];
    delete this.roomsDate[roomId];
    return;
  }
}
