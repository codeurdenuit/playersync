import './style.css';
import {PlayerSyncClient} from './../../client/main';
const host = 'http://localhost:3030';

window.addEventListener('load', async () => {
  const input = document.getElementById("inputMessage");
  const buttonCreate = document.getElementById("buttonCreate");
  const buttonSend = document.getElementById("buttonSend");
  const buttonLeave = document.getElementById("buttonLeave");

  const psc = new PlayerSyncClient(host);

  psc.onData((data)=>{
    drawMessage(data.text);
  });

  psc.onRoomUpdated((room)=> {
    drawRoom(room);
  });

  async function joinRoom(roomId) {
    await psc.joinRoom(roomId);
  }

  async function refreshRooms() {
    const rooms = await psc.getRooms();
    drawRooms(rooms);
  }

  async function createRoom() {
    const room = await psc.createRoom();
    drawRoom(room);
    refreshRooms();
    drawChatContainer();
  }

  function sendMessage() {
    psc.sendData({text:input.value});
    drawMessage(input.value);
    input.value = '';
  }

  async function leave() {
    await psc.leaveRoom();
    drawChatContainer();
    await refreshRooms();
  }

  buttonCreate.addEventListener('click', createRoom.bind(this));

  buttonSend.addEventListener('click', sendMessage.bind(this));

  buttonLeave.addEventListener('click', leave.bind(this));

  ///////////////////////////////DRAW DOM///////////////////////////////////////

  function drawMessage(mgs) {
    const container = document.getElementById("containerChat");
    const node = document.createElement('div');
    node.textContent = mgs;
    container.appendChild(node);
  }

  async function drawRoom(room) {
    const clientList = document.getElementById("containerClient");
    while (clientList.firstChild) {
      clientList.removeChild(clientList.firstChild);
    }
    for(let i =0; i<room.length; i++) {
      createDiv('item', room[i], null, clientList);
    }
  }

  function drawRooms(rooms) {
    const roomList = document.getElementById("containerRoom");
    while (roomList.firstChild) {
      roomList.removeChild(roomList.firstChild);
    }
    for(let key in rooms) {
      createDiv('item', key + ' users : ' + rooms[key].length, ()=>{joinRoom(key)}, roomList);
    }
  }

  function drawChatContainer() {
    const chatList = document.getElementById("containerChat");
    while (chatList.firstChild) {
      chatList.removeChild(chatList.firstChild);
    }
  }

  function createDiv(className, text, fct, parent) {
    const node = document.createElement('div');
    node.className = className;
    if(text) node.textContent = text;
    if(fct) node.addEventListener('click', fct);
    if(parent) parent.appendChild(node);
    return node;
  }

  refreshRooms();

});
