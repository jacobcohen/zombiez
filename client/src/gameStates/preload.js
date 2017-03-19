export default class Preload extends Phaser.State {
  init (levelData) {
    this.levelData = levelData;
  }

  preload () {
    let assets, assetKey, asset;

    console.log(this.levelData);
    //Access assets object from level json
    assets = this.levelData.assets;

    // load assets according to asset key
    for (assetKey in assets) {
      if (assets.hasOwnProperty(assetKey)) {
        asset = assets[assetKey];
        switch (asset.type) {
          case 'image':
            this.load.image(assetKey, asset.source);
            break;
          case 'spritesheet':
            this.load.spritesheet(assetKey, asset.source, asset.frame_width, asset.frame_height, asset.frames, asset.margin, asset.spacing);
            break;
          case 'spritesheetAtlas':
            this.load.atlasJSONHash(assetKey, asset.sourcePNG, asset.sourceJSON);
            break;
          case 'tilemap':
            this.load.tilemap(assetKey, asset.source, null, Phaser.Tilemap.TILED_JSON);
            break;
          default:
            break;
        }
      }
    }

    //Preload Bar
    this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, 'preloadbar', 0);
    this.preloadBar.anchor.setTo(0.5);
    this.preloadBar.scale.setTo(5);

    //Other Sprites
    this.load.setPreloadSprite(this.preloadBar);
  }

  create () {
      this.state.start('ZombieGameState', true, false, this.levelData);
  }
}
