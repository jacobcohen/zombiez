const PLAYER_HEALTH = 100;
const EVENT_LOOP_DELETE_TIME = 10000;
const STARTING_BULLET_SPEED = 500;
const PLAYER_DAMAGE_TINT = rgbToHex(255, 0, 0);

module.exports = { PLAYER_HEALTH, EVENT_LOOP_DELETE_TIME, STARTING_BULLET_SPEED, PLAYER_DAMAGE_TINT };



function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return  '0x' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}