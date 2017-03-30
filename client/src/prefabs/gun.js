import GunPrefab from './GunPrefab';
import Bullet from './bullet';
import {playerFired} from '../reducers/players-reducer.js';
import store from '../store.js';


import {EVENT_LOOP_DELETE_TIME} from '../engine/gameConstants.js';


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
    this.isJammed = false;
    this.rotation;
    this.bulletFrame = 9;
    this.activeReloaded = false;
    gameObj = this.game;
    this.minDistanceSound = 30;
    this.maxDistanceSound = 600;
    this.player = this.game.currentPlayerSprite;
  }

  playSound(player, whatSound, volume) {
    player.game.state.callbackContext[whatSound].play('', 0, volume, false);
  }

  //TODO: move bullet speed to the gun, and have shoot method go off of player.gun.bulletSpeed
  shoot(player) {
    //NOTE: shoot gets called with currentPlayerSprite.gun.gunBullets OR game.remoteBulletGroup, if shoot is being called due to a server 'remoteFire' emit
    let bulletGroup = player.bulletGroup;

    if (this.ammo === 0 || this.game.time.time < this.nextFire) {
      if (this.isReloading) {
        return null;
      } else if (this.ammo === 0 && !this.isReloading) {
        this.reloadGun();
        if (player.socketId === socket.id) this.playSound(player, 'pistolReload', 1);
      }
      return;
    }
    let bullet = bulletGroup.getFirstExists(false);
    this.nextFire = this.game.time.time + this.rateOfFire;

    // if(bullet) bullet.destroy();

    let x = player.x;
    let y = player.y;
    if (!bullet) {
      console.log("INITIAL", this.bulletFrame);
      bullet = new Bullet(this.game, 'bullet', {x: this.x, y: this.y}, {
        //NOTE: we can reimplement 'group' here if needed
        initial: this.bulletFrame,
        texture: 'pistolSpriteSheet'
      });
      bulletGroup.add(bullet);
    } else {
      bullet.reset(x, y);
    }

    if (player.currentGunLevel === 2) bullet.frame = 0;

    if (player.currentGunLevel === 3) {
      bullet.frame = 1;
      setTimeout(() => {
        bullet.kill();
      }, 50)
    }

      bullet.rotation = this.game.physics.arcade.moveToXY(bullet, player.pointerX, player.pointerY, bulletGroup.bulletSpeed);

    bullet.shooterSocketId = player.socketId;
    this.ammo--;
    let bulletId;

    //Handle bullet if shot by CP so that it gets emitted to server correctly
    if (player.socketId === socket.id) {
      this.playSound(player, 'heavyPistol', 1);
      player.gameState.camera.shake(0.005, 40);
      bulletId = socket.id + bulletCount;
      this.game.currentPlayerSprite.bulletHash[bulletId] = {
        toX: player.pointerX,
        toY: player.pointerY,
        socketId: socket.id,
        bulletId: bulletId
      }
      bulletCount++;

      setTimeout(() => {
        delete this.game.currentPlayerSprite.bulletHash[bulletId];
      }, EVENT_LOOP_DELETE_TIME)
      // store.dispatch(playerFired(player.pointerX, player.pointerY, socket.id, bulletId));
      //Change bullet ui for current player
      player.clipUpdate();
    } else {
      const distX = x - player.gameState.currentPlayerSprite.x;
      const distY = y - player.gameState.currentPlayerSprite.y;
      const distance = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
      const perc = 1 - ((distance - this.minDistanceSound) / this.maxDistanceSound);
      console.log('perc', perc)
      if (perc > 1) this.playSound(player, 'heavyPistol', 1);
      else if (perc <= 0);
      else this.playSound(player, 'heavyPistol', perc);
    }
  }


  reloadGun() {
    this.isReloading = true;
    // console.log(this);
    // console.dir(this.game.currentPlayerSprite, { depth: 3 });
    // console.log(this.game.currentPlayerSprite.reloadBar);
    this.game.currentPlayerSprite.reloadingAnim = this.game.currentPlayerSprite.reloadBar.animations.play('playReload');

    this.game.currentPlayerSprite.reloadingAnim.onComplete.addOnce(() => {
      //if active reloaded do something
      if (this.activeReloaded) {
        //take off activeReloaded
        this.activeReloaded = false;
        this.game.currentPlayerSprite.reloadBar.visible = false;
        this.game.currentPlayerSprite.reloadBar.tint = 0xffffff;
        // this.game.currentPlayerSprite.reloadBar.animations.stop();
        return;
      } else if (this.isJammed) {
        this.ammo = this.clip;
        this.game.currentPlayerSprite.clipUpdate();
        this.isJammed = false;
        this.isReloading = false;
        //update clip to full
        this.game.currentPlayerSprite.reloadBar.visible = false;
        this.game.currentPlayerSprite.reloadBar.tint = 0xffffff;
      } else {
        //let the reload finish
        this.ammo = this.clip;
        this.game.currentPlayerSprite.clipUpdate();
        this.isReloading = false;
        this.game.currentPlayerSprite.reloadBar.visible = false;
        this.game.currentPlayerSprite.reloadBar.tint = 0xffffff;
      }
    });
  }

  hitZombie(zombie, bullet, player) {
    console.log("ZOMBZ", zombie);
    zombie.hit = true;
    bullet.kill();
    zombie.animations.stop();
    zombie.animations.play('dead');

    zombie.zombDeath.onComplete.add(() => zombie.kill(), this);
  }
}
