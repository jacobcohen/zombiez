import axios from 'axios';
import R from 'ramda';
const throttle = require('lodash.throttle');

/* Action Types */
// const ADD_PLAYER = 'ADD_PLAYER';
const LOAD_PLAYERS = 'LOAD_PLAYERS';
const SET_GAME_PLAYING_BOOL = 'SET_GAME_PLAYING_BOOL';
const UPDATE_PLAYER_SCORE = 'UPDATE_PLAYER_SCORE';
const UPDATE_PLAYERS = 'UPDATE_PLAYERS';
const UPDATE_CURRENT_PLAYER = 'UPDATE_CURRENT_PLAYER';
const PLAYER_LEAVE_GAME = 'PLAYER_LEAVE_GAME';
const RESET_PLAYERS = 'RESET_PLAYERS';
const REMOVE_CURRENT_PLAYER = 'REMOVE_CURRENT_PLAYER';
const ADD_PICKUP_EVENT = 'ADD_PICKUP_EVENT';
const REMOVE_PICKUP_EVENT = 'REMOVE_PICKUP_EVENT';

/* Action Creators */
export const loadMessage = message => ({ type: CHANGE_MESSAGE, message });
// export const addPlayer = player => ({type: ADD_PLAYER, player});
export const loadPlayers = playersFromServer => ({type: LOAD_PLAYERS, players: playersFromServer})
export const changeGamePlaying = gameStatus => ({type: SET_GAME_PLAYING_BOOL, gameStatus});
export const changePlayerScore = (socketId, newScore) => ({type: UPDATE_PLAYER_SCORE, id: socketId, newScore: newScore})
export const updatePlayers = serverPlayersState => ({
  type: UPDATE_PLAYERS,
  players: serverPlayersState
})
export const updateCurrentPlayer = currentPlayerState => ({
  type: UPDATE_CURRENT_PLAYER,
  currentPlayerState
});
export const playerLeaveGame = playerSocketId => ({
  type: PLAYER_LEAVE_GAME,
  id: playerSocketId
});
export const resetPlayers = () => ({
  type: RESET_PLAYERS
})
export const removeCurrentPlayer = () => ({
  type: REMOVE_CURRENT_PLAYER
})
export const addPickupEvent = (eventInfo) => ({
  type: ADD_PICKUP_EVENT,
  eventInfo
})

export const removePickupEvent = (eventId) => ({
  type: REMOVE_PICKUP_EVENT,
  eventId
})
//will look like this on the front end
//addPickupEvent({type: 'speed', event:'create', x: 100, y: 100})

//Note: addPlayer can probably be removed from file but will keep for now in case we change structure
const initialState = {
  score: 0,
  playerStates: {},
  currentPlayer: {
    bulletHash: {},
    playerDamageHash: {},
    playerPickupHash: {
      'fakeId': 'fakeEvent'
    }
  }
};

const remoteBulletEvents = {};

// const throttleLog = throttle( (cpState) => console.log('newState: ', cpState), 5000);
/* Reducer */
export default (state = initialState, action) => {

  let newPlayerStates = Object.assign({}, state.playerStates);
  let newState = Object.assign({}, state, {playerStates: newPlayerStates}, {currentPlayer: state.currentPlayer});
  // throttleLog(newState.currentPlayer);

  switch (action.type) {

    case LOAD_PLAYERS:
      //if there is a socket id, make it current player and remove him from playerStates
      if (action.players[socket.id]) {
        newState.currentPlayer = action.players[socket.id];
        delete action.players[socket.id];
      }
      newState.playerStates = action.players;
      break;

    case SET_GAME_PLAYING_BOOL:
      newState.gamePlaying = action.gameStatus;
      break;

    case ADD_PICKUP_EVENT:
      let eventId = action.eventInfo.eventId;
      newState.currentPlayer = Object.assign({}, newState.currentPlayer)
      if (Object.keys(newState.currentPlayer.playerPickupHash).length < 1){
        newState.currentPlayer.playerPickupHash = {
          eventId: action.eventInfo
        }
      } else {
        newState.currentPlayer.playerPickupHash[action.eventInfo.eventId] = action.eventInfo;
      }
      break;

    case REMOVE_PICKUP_EVENT:
      newState.currentPlayer = Object.assign({}, newState.currentPlayer, {playerPickupHash: state.currentPlayer.playerPickupHash});
      delete newState.currentPlayer.playerPickupHash[action.eventId];
      break;

    case UPDATE_PLAYERS:
      //filter through players and make sure no undefined
      newState.playerStates = action.players;
      R.forEachObjIndexed( (playerState) => {
          if (playerState.bulletHash && Object.keys(playerState.bulletHash).length > 0){
            R.forEachObjIndexed( (bulletEvent, bulletEventId) => {
              if (remoteBulletEvents[bulletEventId] !== true){
                // console.log('hashEventId we will process: ', bulletEventId);
                // console.dir(bulletEvent);
                remoteBulletEvents[bulletEventId] = true;
              }
            }, playerState.bulletHash);
          }
        }, action.players);
      break;

    case UPDATE_CURRENT_PLAYER:
      let updatedPlayerState = Object.assign({}, state.currentPlayer, action.currentPlayerState, { bulletHash: action.currentPlayerState.bulletHash}, { playerDamageHash: action.currentPlayerState.playerDamageHash});
      newState.currentPlayer = updatedPlayerState;
      // console.log('updated CP to ', newState.currentPlayer);
      // console.log('updated Current Player to: ', newState.currentPlayer);
      break;

    case PLAYER_LEAVE_GAME:
      //TODO: is this immutable?
      let playerStates = Object.assign({}, state.playerStates);
      if (playerStates[action.id]) {
        delete playerStates[action.id];
      }
      newState.playerStates = playerStates;
      break;

    case RESET_PLAYERS:
      newState.playerStates = {};
      newState.currentPlayer = {};
      break;

    case REMOVE_CURRENT_PLAYER:
      newState.currentPlayer = {};
      break;

    default:
      return state;
  }

  return newState;
};
