import GunPrefab from './GunPrefab';
import Bullet from './bullet';
import {playerFired} from '../reducers/players-reducer.js';
import store from '../store.js';


import { EVENT_LOOP_DELETE_TIME } from '../engine/gameConstants.js';


let bulletCount = 0;
let gameObj;

export default class Gun extends GunPrefab {
  constructor(game, name, position, properties) {
    super(game, name, position, properties);
    this.enableBody = true;
    this.game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    this.anchor.setTo(0.5);
    //how much time in miliseconds do you want the player to wait
    this.rateOfFire = properties.rateOfFire;
    this.ammo = properties.clip;
    this.clip = properties.clip;
    this.reloadSpeed = properties.reloadSpeed;
    this.nextFire = 0;
    this.isReloading = false;
    this.pivot.x = -10;
    this.rotation;
    gameObj = this.game;
    console.log('HOW MANY TIMES DOES THIS SHIT HAPPEN');
    this.minDistanceSound = 30;
    this.maxDistanceSound = 600;
  }

  playSound (player, whatSound, volume)  {
    player.game.state.callbackContext[whatSound].play('',0,volume,false);
  }

  //TODO: move bullet speed to the gun, and have shoot method go off of player.gun.bulletSpeed
  shoot(player) {
    //NOTE: shoot gets called with currentPlayerSprite.gun.gunBullets OR game.remoteBulletGroup, if shoot is being called due to a server 'remoteFire' emit
    let bulletGroup = player.bulletGroup;

    if (this.ammo === 0 || this.game.time.time < this.nextFire) {
      if(this.isReloading) {
        return null;
      } else if (this.ammo === 0 && !this.isReloading){
        this.isReloading = true;
        this.reloadGun();
        this.playSound(player, 'pistolReload', 1);
      }
      return;
    }
    let bullet = bulletGroup.getFirstExists(false);
    this.nextFire = this.game.time.time + this.rateOfFire;
    let x = player.x;
    let y = player.y;
    if(!bullet){
      bullet = new Bullet(this.game, 'bullet', {x : this.x , y: this.y}, {
        //NOTE: we can reimplement 'group' here if needed
        initial: 9,
        texture: 'pistolSpriteSheet'
      });
      bulletGroup.add(bullet);
    } else {
      bullet.reset(x, y);
    }
    bullet.rotation = this.game.physics.arcade.moveToXY(bullet, player.pointerX, player.pointerY, bulletGroup.bulletSpeed);
    bullet.shooterSocketId = player.socketId;
    this.ammo--;
    let bulletId;

    //Handle bullet if shot by CP so that it gets emitted to server correctly
    if (player.socketId === socket.id){
      this.playSound(player,'heavyPistol',1);
      player.gameState.camera.shake(0.005,40);
      bulletId = socket.id + bulletCount;
      this.game.currentPlayerSprite.bulletHash[bulletId] = {
        toX:      player.pointerX,
        toY:      player.pointerY,
        socketId: socket.id,
        bulletId: bulletId
      }
      bulletCount++;

      setTimeout( () => {
        delete this.game.currentPlayerSprite.bulletHash[bulletId];
    }, EVENT_LOOP_DELETE_TIME)
      // store.dispatch(playerFired(player.pointerX, player.pointerY, socket.id, bulletId));
      //Change bullet ui for current player
      player.clipUpdate();
    } else {
      const distX = x - player.gameState.currentPlayerSprite.x;
      const distY = y - player.gameState.currentPlayerSprite.y;
      const distance = Math.sqrt(Math.pow(distX,2)+Math.pow(distY,2));
      const perc = 1 - ((distance-this.minDistanceSound)/this.maxDistanceSound);
      console.log('perc',perc)
      if (perc > 1) this.playSound(player,'heavyPistol',1);
      else if(perc <= 0);
      else this.playSound(player,'heavyPistol',perc);
      //Render the bullet for the remote player
      // console.log('remote player just fired!');
    }
  }


  reloadGun(){
    setTimeout(() => {
      this.ammo = this.clip;
      this.isReloading = false;
      this.game.currentPlayerSprite.clipUpdate();
    }, this.reloadSpeed)
  }
}
