import './style.css';
import PlayerSyncClient from './../../client';
const host = 'http://localhost:3030';

window.addEventListener('load', async () => {
  const input = document.getElementById('inputMessage');
  const buttonCreate = document.getElementById('buttonCreate');
  const buttonLeave = document.getElementById('buttonLeave');
  const view1 = document.getElementById('view1');
  const view2 = document.getElementById('view2');
  view2.style.display = 'none';
  const usernames = ['Shunio', 'Xante', 'Sirtus', 'FireFall', 'Azra', 'Nederis', 'Frog', 'Cerus', 'Xadal', 'Shino', 'Lakepo', 'Tino'];
  const yourUsername = usernames[Math.floor(Math.random()*usernames.length)];

  const psc = new PlayerSyncClient(host);

  const yourPlayerId = await psc.connect(yourUsername);

  psc.onData((data, clientId)=>{
    drawMessage(data.text, clientId);
  });

  psc.onRoomUpdated((room)=> {
    view1.style.display = 'none';
    view2.style.display = 'block';
    drawRoom(room);
  });

  async function joinRoom(roomId) {
    const room = await psc.joinRoom(roomId);
    if(!room) {
      refreshRooms();
    }else {
      view1.style.display = 'none';
      view2.style.display = 'block';
      drawRoom(room);
    }
  }

  async function refreshRooms() {
    view1.style.display = 'block';
    view2.style.display = 'none';
    const rooms = await psc.getRooms();
    drawRooms(rooms);
  }

  async function createRoom() {
    const room = await psc.createRoom();
    drawRoom(room);
    refreshRooms();
    drawChatContainer();
    view1.style.display = 'none';
    view2.style.display = 'block';
  }

  function sendMessage() {
    psc.sendData({text:input.value});
    drawMessage(input.value, psc.id);
    input.value = '';
  }

  async function leave() {
    await psc.leaveRoom();
    drawChatContainer();
    await refreshRooms();
    view1.style.display = 'block';
    view2.style.display = 'none';
  }

  buttonCreate.addEventListener('click', createRoom.bind(this));


  input.addEventListener('keyup', event => {
    if (event.keyCode === 13) {
      sendMessage();
      event.preventDefault();
    }
  });

  buttonLeave.addEventListener('click', leave.bind(this));

  ///////////////////////////////DRAW DOM///////////////////////////////////////

  function drawMessage(mgs, clientId) {
    const container = document.getElementById('containerChat');
    const node = document.createElement('div');
    node.textContent =  `${clientId.split('-')[1]} : ${mgs}`;
    container.appendChild(node);
  }

  async function drawRoom(room) {
    const clientList = document.getElementById('containerClient');
    while (clientList.firstChild) {
      clientList.removeChild(clientList.firstChild);
    }
    for(let i =0; i<room.length; i++) {
      const player = room[i].split('-')[1] + (room[i] === yourPlayerId ? ' (you)': '');
      createDiv('user', player, null, clientList);
    }
  }

  function drawRooms(rooms) {
    const roomList = document.getElementById('containerRoom');
    while (roomList.firstChild) {
      roomList.removeChild(roomList.firstChild);
    }
    for(let key in rooms) {
      createDiv('item', key + '(' + rooms[key].length+')', ()=>{joinRoom(key)}, roomList);
    }
  }

  function drawChatContainer() {
    const chatList = document.getElementById('containerChat');
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
