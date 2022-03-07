import Peer from 'peerjs';

class PlayerSyncClient {

  constructor(host) {
    this.peer = null;
    this.id = null;
    this.conns = [];
    this.host = host || '';
    this.roomId = null;
    this.username = '';
    this.baseId = 'f152ezr454rez56rdghdfg6465ezr6ez4_';
    this.preid = `${this.baseId}${Math.random().toString(36).substr(2, 3)}-`;
  }

  connect(username) {
    return new Promise((resolve, reject) => {
      if (username) {
        this.username = username.replace(/[^a-zA-Z ]|\s/g, '');
      } else {
        this.username = Math.random().toString(36).substr(2, 9);
      }

      this.peer = new Peer(`${this.preid}${this.username}`);

      this.peer.on('open', id => {
        this.id = id.split('_')[1];
        resolve(this.id);
      });

      this.peer.on('connection', c => {
        this._initConn(c);
        this.refreshRoom();
      });

      this.peer.on('error', async err => {
        if (err.type === 'peer-unavailable') {
          const clientId = err.message.split('peer ')[1];
          await this.leaveRoom(this.roomId, clientId);
          if (this._onJoinFail)
            this._onJoinFail();
          this._onJoinFail = null;
        }
        console.log('error : ' + err);
      });

      window.addEventListener('beforeunload', () => {
        if (this.roomId) {
          const xhttp = new XMLHttpRequest();
          xhttp.open("POST", `${this.host}/api/room/${this.roomId}/leave`, true);
          xhttp.setRequestHeader('Content-type', 'application/json');
          xhttp.send(JSON.stringify({ clientId: this.id }));
        }
      });
    });
  }

  async joinRoom(roomId) {
    await this.leaveRoom();
    const room = await this.getRoom(roomId);
    if (!room.length) return null;
    for (let i = 0; i < room.length; i++) {
      const clientId = room[i];
      try {
        if (clientId && clientId != this.id) {
          await this.joinClient(clientId);
        }
      } catch (e) {
        await this._leaveRoom(roomId, clientId);
      }
    }
    this.roomId = roomId;
    await this._joinRoom(roomId, this.id);

    const currentRoom = this.conns.map(c => c.peer.split('_')[1]);
    currentRoom.push(this.id);
    return currentRoom;
  }

  joinClient(clientId) {
    return new Promise((resolve, reject) => {
      if (clientId === this.id) return;
      const fullClientId = `${this.baseId}${clientId}`;
      const conn = this.peer.connect(fullClientId, { reliable: true });
      this._onJoinFail = reject;
      conn.on('open', () => {
        resolve();
        var command = this._getUrlParam("command");
        if (command) conn.send(command);
        this._initConn(conn);
      });
    });
  }

  async leaveRoom() {
    if (!this.roomId) return
    await this._leaveRoom(this.roomId, this.id);
    this.roomId = null;
    this.conns.forEach(c => c.close());
    this.conns = [];
    this.refreshRoom();
  }

  _initConn(conn) {
    this.conns.push(conn);
    conn.on('data', data => {
      this._onData(data, conn.peer.split('_')[1]);
    });
    conn.on('close', async () => {
      if (!this.roomId) return;
      const index = this.conns.indexOf(conn);
      this.conns.splice(index, 1);
      const clientId = conn.peer.split('_')[1];
      await this._leaveRoom(this.roomId, clientId);
      this.refreshRoom();
    });
  }

  _getUrlParam(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null)
      return null;
    else
      return results[1];
  };

  sendData(value) {
    for (let i = 0; i < this.conns.length; i++) {
      this.conns[i].send(value);
    }
  }

  onData(callback) {
    this._onData = callback;
  }

  refreshRoom() {
    if (this.roomId) {
      const room = this.conns.map(c => c.peer.split('_')[1]);
      room.push(this.id);
      this._onRoomUpdated(room);
    } else {
      this._onRoomUpdated([]);
    }
  }

  onRoomUpdated(callback) {
    this._onRoomUpdated = callback;
  }

  async getRoom(roomId) {
    return this.requestGet(`${this.host}/api/room/${roomId}`);
  }

  async _joinRoom(roomId, clientId) {
    return this.requestPost(`${this.host}/api/room/${roomId}/join`, { clientId });
  }

  async _leaveRoom(roomId, clientId) {
    return this.requestPost(`${this.host}/api/room/${roomId}/leave`, { clientId });
  }

  async getRooms() {
    return this.requestGet(`${this.host}/api/room`);
  }

  async createRoom(roomId) {
    if (!this.id) return;
    await this.leaveRoom();
    const clientId = this.id;
    const rooms = await this.requestPost(`${this.host}/api/room/`, { clientId, roomId })
    for (let roomId in rooms) {
      const room = rooms[roomId];
      if (room.includes(clientId)) {
        this.roomId = roomId;
        break;
      }
    }
    return rooms[this.roomId];
  }

  async closeRoom(roomId) {
    return this.requestPost(`${this.host}/api/room/${roomId}/close`);
  }

  async requestPost(url, body) {
    try {
      const fetchResponse = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'pragma': 'no-cache',
          'cache-control': 'no-cache'
        },
        body: body ? JSON.stringify(body) : null
      });
      return fetchResponse.json();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async requestGet(url) {
    try {
      const fetchResponse = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'pragma': 'no-cache',
          'cache-control': 'no-cache'
        }
      });
      return fetchResponse.json();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

}

export default PlayerSyncClient;
