# PlayerSync

This allows browsers to be connected to each other with Webrtc.
The procedure takes place without using a websocket.
The peering takes place via an API.
A player can create a room.
Other players can join this room.
As soon as a player joins a room, he is automatically connected with the other players of this room.


## Why 
PlayerSync makes it easy to create multiplayer games.
Players are directly connected to each other using PlayerSyncClient
Keep server architecture simple and avoid server load.
Connection is established from browser to browser.

## Setup
```sh
$ npm install playersync -s
```

## Usage

**Server Side**

Add an API to your express server.
This API allows to establish the connection between players.
It is used by PlayerSyncClient.

```js
import playersync from 'playersync';
const app = express();
/** your server code **/
playersync(app); 
/** your server code **/
```

**Client Side**


Use PlayerSyncClient to connect players

```js
import { PlayerSyncClient } from 'playersync/client';

const host = 'https://yourserver';
const psc = new PlayerSyncClient(host);

//Connect with a nickname
await psc.connect(yourUsername);

//See groups
const rooms = await psc.getRooms();

//Create a group
const room = await psc.createRoom();

//Join a group of player
const room = await psc.joinRoom(roomId);

//Send data to other players
psc.sendData(yourData);

//called when player receives data
psc.onData((oneData)=>{
  /** code **/
});

//called when a new player joins the group
psc.onRoomUpdated((room)=> { 
  /** code **/
});

```

## Documentation PlayerSyncClient


**PlayerId**
PlayerId allows to establish a PeerConnection with a another player.
PlayerId is a peerId.
PlayerId is generated when PlayerSyncClient is created.

**Room**
Array of playerIds. 
Each player in a room is connected to each other and can communicate.
Player connecting to each other can communicate even if the room no longer exists on the server side.
The room only allows the newcomer to know the playerIds of a group of connected players to connect to them.



### PlayerSyncClient
```js
const psc = new PlayerSyncClient(host);
```
**- Params :** [Optional] String : Add a host if the API server is on another host.
Instance which will manage connections between players.
Instance  also manage send / receive data between connected players.

### Connect()
```js
const playerId = await psc.connect(yourUsername);
```
**- Params :** [Optional] String :  Specify your username(no special characters and no space)
**- Return :** String : your playerId
Generate a playerId. Necessary to be able to use PlayerSyncClient

### GetRooms()
```js
const  rooms = await  psc.getRooms();
```
**- Params :** -
**- Return :** Object {[roomID]:[PlayerId1, PlayerId2, ....]}
Returns an object containing the roomId of existing rooms.


### CreateRoom()
```js
const  room = await  psc.createRoom();
```
**- Params :** -
**- Return :** Array [yourPlayerId]
Create a room.
Your PlayerId from your browser is automatically added to this room. The other browsers will be able to join this room and connect to you.
A room without PlayerId is automatically deleted.


### JoinRoom()
```js
const  room = await  psc.joinRoom(roomId);
```
**- Params :** String roomId : Room that you want to join
**- Return :** Array [PlayerId....]
Allows you to join an existing room.
Your browser is automatically connected with players of this room.
If the attempt fails, the function returns nothing.


### SendData()
```js
psc.sendData(yourData);
```
**- Params :** Object
**- Return :** -
Sends information to all players with which you are connected.


### LeaveRoom()
```js
await psc.leaveRoom();
```
**- Params :** -
**- Return :** -
Log out of all players you are logged in with.

### CloseRoom()
```js
await psc.closeRoom(roomId);
```
**- Params :** -
**- Return :** -
Make a room inaccessible.
But player already connected can continue to communicate.
Useful to limit the number of players in a room or avoid the arrival of new players after starting game.


### OnData()
```js
psc.onData((oneData, PlayerId)=>{
  /** code **/
});
```
**- Params :** Object and String(PlayerId)
Triggered when a player connected with you sends you data.


### OnRoomUpdated()
```js
  psc.onRoomUpdated((room)=> {
  /** code **/
  });
```
**- Params :** Array[String] => PlayerId
Triggered when a new player connects to you. He has just joined the room.

## Documentation playersync


```js
playersync(app); //App running on only one server
/** or **/
playersync(app, duration/**number ms**/);
/** or **/
playersync(app, duration, redisClient ); //App running on multiple servers
```

Add API To allow PlayerSyncClient to work.
Duration param configure the server to delete inactive rooms after the specified time, if the server has not been informed of the departure of all the room players.
The deleted rooms are not longer accessible. But player already connected can continue to communicate.
If your application is on multiple servers, you can use redis to synchronize the API.
