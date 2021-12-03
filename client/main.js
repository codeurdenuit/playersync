import Peer from 'peerjs';

class PlayerSyncClient {

  constructor(host, ) {
    this.peer = null;
    this.id = null;
    this.conns = [];
    this.host = host||'';
    this.roomId = null;
    this.initialize();
  }

  initialize() {
    this.peer = new Peer();

      this.peer.on('open', id => {
        this.id = id;
      });
    
      this.peer.on('connection', c => {
        this._initConn(c);
        this.refreshRoom();
      });
    
      this.peer.on('error', async err => {
        if(err.type === 'peer-unavailable') {
          const clientId = err.message.split('peer ')[1];
          const room = await this.leaveRoom(this.roomId, clientId);
          this._onRoomUpdated(room);
        }
        console.log('error : ' + err);
      });

      window.addEventListener('beforeunload', () => {
        if(this.roomId) {
          const xhttp = new XMLHttpRequest();
          xhttp.open("POST", `${this.host}/api/room/${this.roomId}/leave`, true);
          xhttp.setRequestHeader('Content-type', 'application/json');
          xhttp.send(JSON.stringify({clientId:this.id}));
        }
      });
  }

  async joinRoom(roomId) {
    await this.leaveRoom();
    const room = await this.getRoom(roomId);
    for(let i=0; i<room.length; i++) {
      const clientId = room[i];
      if(clientId && clientId != this.id) {
        this.joinClient(clientId);
      }
    }
    this.roomId = roomId;
    this.refreshRoom();
    await this._joinRoom(roomId, this.id);
  }

  joinClient(userId) {
    if(userId === this.id) return;
    const conn = this.peer.connect(userId, { reliable: true });
    conn.on('open', () => {
      var command = this._getUrlParam("command");
      if (command) conn.send(command);
      this._initConn(conn);
      this.refreshRoom();
    });
  }

  async leaveRoom() {
    if(!this.roomId) return
    await this._leaveRoom(this.roomId, this.id);
    this.roomId = null;
    this.conns.forEach(c => c.close());
    this.conns = [];
    this.refreshRoom();
  }

  _initConn(conn) {
    this.conns.push(conn);
    conn.on('data', data => {
      this._onData(data, conn.peer);
    });
    conn.on('close', async () => {
      if(!this.roomId) return;
      const index = this.conns.indexOf(conn);
      this.conns.splice(index, 1);
      const clientId = conn.peer;
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
    for(let i = 0; i<this.conns.length; i++ ) {
      this.conns[i].send(value);
    }
  }

  onData(callback) {
    this._onData = callback;
  }

  refreshRoom() {
    if(this.roomId) {
      const room = this.conns.map(c=>c.peer);
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
    return this.requestPost(`${this.host}/api/room/${roomId}/join`, {clientId});
  }

  async _leaveRoom(roomId, clientId) {
    return this.requestPost(`${this.host}/api/room/${roomId}/leave`, {clientId});
  }

  async getRooms() {
    return this.requestGet(`${this.host}/api/room`);
  }

  async createRoom() {
    if(!this.id) return;
    await this.leaveRoom();
    const clientId = this.id;
    const rooms = await this.requestPost(`${this.host}/api/room/`, {clientId})
    for(let roomId in rooms) {
      const room = rooms[roomId];
      if(room.includes(clientId)) {
        this.roomId = roomId;
        break;
      }
    }
    return rooms[this.roomId];
  }

  async requestPost(url, body) {
    try {
      const fetchResponse = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      return fetchResponse.json();
    } catch(e) {
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
        }
      });
      return fetchResponse.json();
    } catch(e) {
      console.log(e);
      return null;
    }
  }

} 


export {PlayerSyncClient} 
