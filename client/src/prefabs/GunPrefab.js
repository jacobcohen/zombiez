export default class GunPrefab extends Phaser.Sprite {
  constructor(game, name, position, properties) {
    super(game, position.x, position.y, properties.texture, +properties.initial);
    this.gameState = game;
    this.name = name;

    this.damage = properties.damage ? properties.damage : 10;
    //Add prefab to its group
    //this.gameState.groups[properties.group].add(this);
    //this.gameState.groups[properties.group].children.push(this);
    this.initial = +properties.initial;
	  this.smoothed = false;

	  //Add to existing
	  this.gameState.add.existing(this);

	  //Push all prefabs to the mapSprite lighting overlay
	  // this.pushToOverlay = true;

    //Enable physics for each prefab, we enable it in other prefabs but this is a check
    this.game.physics.arcade.enable(this);
    this.gameState.prefabs[name] = this;
  }
}
