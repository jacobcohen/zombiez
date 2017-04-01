import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

//Containers
import Layout from './containers/layout';
import Leaderboard from './components/Leaderboard';
import LobbyView from './containers/lobbyView.js';
import MultiplayerLobbySelect from './containers/lobbySelect.js';

import {Provider} from 'react-redux';
import{ Router, Route, browserHistory, IndexRoute } from 'react-router';

import store from './store.js';

/* Actions to Dispatch */
import attachFunctions from './sockets.js';


//Attach all client socket functions to socket on the global namespace
attachFunctions(socket);


const getLobby = () => {
  socket.emit('getLobby');
  socket.emit('getGameState');
}

ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/" component={Layout} onEnter={getLobby} >
      </Route>
      <Route path="/lobbyView" component={LobbyView}></Route>
      <Route path="/multiplayer" component={MultiplayerLobbySelect}></Route>
      <Route path='/singleplayer' component={LobbyView}></Route>
    </Router>
  </Provider>,
  document.getElementById('root')
);
