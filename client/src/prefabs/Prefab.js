/**
 * Created by CharlieShi on 3/17/17.
 */

export default class Prefab extends Phaser.Sprite {
	constructor(game, name, position, properties) {
		super(game.game, position.x, position.y, properties.texture, +properties.initial);
		//TODO: Hacky fix, what can we do??

		this.gameState = game;
		this.name = name;

		//Add prefab to its group
		// this.gameState.groups[properties.group].add(this);
    this.gameState.groups[properties.group].children.push(this);
		this.initial = +properties.initial;

		//Enable physics for each prefab, we enable it in other prefabs but this is a check
		this.game.physics.arcade.enable(this);

		this.gameState.prefabs[name] = this;
	}
}