const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const R = require('ramda');
const throttle = require('lodash.throttle');

//Import Store
const store = require('./store.js');

//Store Dispatchers
const {receiveJoinLobby, receiveLobbyerLeave} = require('./reducers/lobby.js');
const {updatePlayer, removePlayer} = require('./reducers/players.js');

//Import helper functions
const startGame = require('./engine/updateClientLoop.js').startGame;


const server = app.listen(3000, () => {
  console.log('listening on *:3000');
})

const io = require('socket.io')(server);


/* initiate middleware */
(function(){
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());
  // serve static assets normally
  app.use(express.static(path.resolve(__dirname, '..', 'client')));
}());


//SERVER IN MEMORY STORAGE FOR GAME STATE MANAGEMENT & CHAT
let players = [];

//Initiate Socket with all functions for server
io.on('connection', (socket) => {
  console.log('a user connected with socketID', socket.id);
  // emit player update to specific socket

  //TODO: Call function that attaches all functions to socket
  socket.on('disconnect', () => {
    handleLobbyerLeave(socket);
  })

  socket.on('lobbyerJoinLobby', (lobbyObj) => {
    //TODO: Customize Player Obj for server purposes
    lobbyObj.socketId = socket.id;
    let state = store.getState();
    lobbyObj.playerNumber = state.lobby.lobbyers.length + 1;
    lobbyObj.host = lobbyObj.playerNumber === 1 ? true : false;
    store.dispatch(receiveJoinLobby(lobbyObj));
    state = store.getState();
    io.emit('lobbyUpdate', state.lobby.lobbyers);
  });

  socket.on('lobbyerLeaveLobby', () => {
    handleLobbyerLeave(socket);
    //if game is playing, tell that socket to destroy its sprite;
    let state = store.getState();
    if (state.game.gamePlaying){
      socket.emit('destroyCurrentPlayerSprite');
      io.emit('playerLeaveGame', socket.id);
    }
  });

  socket.on('getGameState', () => {
    let state = store.getState();
    socket.emit('gamePlayingUpdate', state.game.gamePlaying);
  })

  socket.on('getLobby', () => {
    //emit lobby state
    //NOTE: NOT IMPLEMENTED
    let state = store.getState();
    socket.emit('lobbyUpdate', state.lobby.lobbyers);
  })

  socket.on('newChatMessage', (msgObjFromClient) => {
    //emit message
    //dispatch new message to chat
    io.emit('messagesUpdate', msgObjFromClient);
  })

  socket.on('gameIsStarting', () => {
    startGame(io);
  });

  //revisit below socket methods
  // socket.on('getPlayers', () => {
  //   //emiting player.state
  //   console.log("server heard 'getPlayers' ");
  //   socket.emit('playerUpdate', players);
  // })
  //
  // socket.on('playerScored', (playerId, score) => {
  //   io.emit('updateLeaderboard', playerId, score);
  // })

  socket.on('clientUpdate', (state) => {
    //TODO: break state down and dispatch to appropriate reducers
    console.log('server heard client update with: ', state);
    console.log('this client told the server to update: ', socket.id);
    store.dispatch(updatePlayer(state.player));
  });

  socket.on('userFire', (fireObj) => {
    socket.broadcast.emit('remoteFire', fireObj);
  })


  socket.on('shotPlayer', (hitPlayerSocketId, dmgToTake) => {
      //NOTE: We could validate the hit by checking location of players here
      //When validated, tell all players to damage the hit players
      io.emit('damagePlayer', hitPlayerSocketId, dmgToTake);
  });

  //TODO: folllow skinners chain here and evaluate
  // socket.on('playerReceiveDamage', (damageObj) => {
  //   socket.broadcast.emit('remoteReceiveDamage', damageObj);
  // })

})


//create functions for sockets
function findPlayer(socketId){
  return R.findIndex(R.propEq('socketId', socketId))(players);
}

function handleLobbyerLeave(socket){
  let state = store.getState();
  let userWhoLeft = state.lobby.lobbyers.filter(lobbyer => lobbyer.socketId === socket.id)[0];
  if (userWhoLeft){
    store.dispatch(receiveLobbyerLeave(userWhoLeft.socketId));
    state = store.getState();
    io.emit('lobbyUpdate', state.lobby.lobbyers);
    store.dispatch(removePlayer(socket.id));
    if (state.game.gamePlaying){
      io.emit('playerLeaveGame', socket.id);
      state = store.getState();
      socket.emit('destroyCurrentPlayerSprite');
    }
  }
}

// handle every other route with index.html, which will contain
// a script tag to our application's JavaScript file(s).
app.get('*', function (request, response){
  response.sendFile(path.resolve(__dirname, '..', 'client', 'index.html'))
})
