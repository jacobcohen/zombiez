import store from '../store.js';
import { updateCurrentPlayer } from '../reducers/players-reducer';

const CLIENT_EMIT_INTERVAL = 1000 / 30;


let emitID;
export default (socket) => {
    emitID = setInterval(() => {
    let state = store.getState();
    let currentPlayerObj = state.players.currentPlayer;
    if (state.lobby.currentLobbyer.name && state.game.gamePlaying){
      //TODO: emit zombie Events, refactor sercver to take in zombies and the events
      socket.emit('clientUpdate', {player: currentPlayerObj, zombies: state.zombies.localZombies});
    }
  }, CLIENT_EMIT_INTERVAL);
  return emitID;
}

export const stopClientBroadcast = () => {
  clearInterval(emitID);
}
