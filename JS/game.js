var pacman;
var current_move_input = new Phaser.Math.Vector2(0, 0);
var speed = 3;
var key_queue = Phaser.Input.Keyboard.KeyCodes.BACKSPACE;
var map;
var tileset;
var layer;
var tilesize = 48;
var pacsize = tilesize;
var prevx;
var prevy;
var dir;
var dir2;
class Game extends Phaser.Scene {
    constructor() {
        super();
    }

    check(x, y) {
        var tile = layer.getTileAtWorldXY(x, y, true);
        if (tile != null && tile.index != 0) {
            return true;
        }
        return false;
    }
    preload() {
        this.load.atlas('pacman', 'JS/pacman2.png',
            'JS/pacman.json');
        this.load.image('tiles', 'JS/blocks2.png');
        this.load.tilemapCSV('map', 'JS/PACMAP.csv');
    }
    create() {
        this.physics.world.setBounds(0, 0, 800, 600);
        var spriteBounds = Phaser.Geom.Rectangle.Inflate(Phaser.Geom.Rectangle.Clone(this.physics.world.bounds), -100, -100);

        map = this.make.tilemap({ key: 'map', tileWidth: tilesize, tileHeight: tilesize });
        tileset = map.addTilesetImage('tiles', null, tilesize, tilesize);
        layer = map.createLayer(0, tileset, 0, 0);
        prevx = -100;
        prevy = -100;

        pacman = this.physics.add.sprite(tilesize + tilesize / 2, tilesize + tilesize / 2, 'pacman');
        pacman.setScale(tilesize / 32);
        pacman.setCollideWorldBounds(true);
        this.keys_arrows = this.input.keyboard.createCursorKeys();
        this.keys_wasd = this.input.keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'right': Phaser.Input.Keyboard.KeyCodes.D
        });
        this.anims.on(Phaser.Animations.Events.ADD_ANIMATION, function() { return undefined; }, this);
        this.anims.create({
            key: 'pacman',
            duration: 300,
            frames: this.anims.generateFrameNames('pacman', { prefix: 'pacman_', end: 2, zeroPad: 4 }),
            repeat: -1
        });
        pacman.play('pacman');
    }
    update() {

        if (this.keys_arrows.up.isDown || this.keys_wasd.up.isDown) {
            key_queue = Phaser.Input.Keyboard.KeyCodes.W;
        } else if (this.keys_arrows.down.isDown || this.keys_wasd.down.isDown) {
            key_queue = Phaser.Input.Keyboard.KeyCodes.S;
        } else if (this.keys_arrows.right.isDown || this.keys_wasd.right.isDown) {
            key_queue = Phaser.Input.Keyboard.KeyCodes.D;
        } else if (this.keys_arrows.left.isDown || this.keys_wasd.left.isDown) {
            key_queue = Phaser.Input.Keyboard.KeyCodes.A;
        }
        var margx = 0;
        var margy = 0;
        if (pacman.angle == -90) {
            margy = -(pacsize / 2);
        }
        if (Math.abs(pacman.angle) == 180) {
            margx = -(pacsize / 2);
        }
        if (pacman.angle == 90) {
            margy = pacsize / 2;
        }
        if (pacman.angle == 0) {
            margx = pacsize / 2;
        }
        // console.log(margx + " " + margy + " " + pacman.angle);
        if (key_queue != Phaser.Input.Keyboard.KeyCodes.BACKSPACE) {
            dir = 0;
            dir2 = 0;
            if (pacman.angle == 90) dir = 1;
            else if (pacman.angle == -90) dir = 3;
            else dir = 2;
            if (key_queue == Phaser.Input.Keyboard.KeyCodes.W) dir2 = 1;
            else if (key_queue == Phaser.Input.Keyboard.KeyCodes.S) dir2 = 3;
            else dir2 = 2;
            if (((pacman.x - pacsize / 2) % tilesize == 0 && (pacman.y - pacsize / 2) % tilesize == 0) || dir % 2 == dir2 % 2) {
                if (key_queue == Phaser.Input.Keyboard.KeyCodes.W && this.check(pacman.x, pacman.y - tilesize)) {
                    current_move_input = new Phaser.Math.Vector2(0, 0);
                    current_move_input.y = -1 * speed;
                    pacman.angle = 270;
                    margy = -(pacsize / 2);
                    margx = 0;
                    key_queue = Phaser.Input.Keyboard.KeyCodes.BACKSPACE;
                } else if (key_queue == Phaser.Input.Keyboard.KeyCodes.S && this.check(pacman.x, pacman.y + tilesize)) {
                    current_move_input = new Phaser.Math.Vector2(0, 0);
                    current_move_input.y = 1 * speed;
                    pacman.angle = 90;
                    margy = pacsize / 2;
                    margx = 0;
                    key_queue = Phaser.Input.Keyboard.KeyCodes.BACKSPACE;
                } else if (key_queue == Phaser.Input.Keyboard.KeyCodes.D && this.check(pacman.x + tilesize, pacman.y)) {
                    current_move_input = new Phaser.Math.Vector2(0, 0);
                    current_move_input.x = 1 * speed;
                    pacman.angle = 0;
                    margx = pacsize / 2;
                    margy = 0;
                    key_queue = Phaser.Input.Keyboard.KeyCodes.BACKSPACE;
                } else if (key_queue == Phaser.Input.Keyboard.KeyCodes.A && this.check(pacman.x - tilesize, pacman.y)) {
                    current_move_input = new Phaser.Math.Vector2(0, 0);
                    current_move_input.x = -1 * speed;
                    pacman.angle = 180;
                    margx = -(pacsize / 2);
                    margy = 0;
                    key_queue = Phaser.Input.Keyboard.KeyCodes.BACKSPACE;
                }
                /// 31 32 33
            }
        }
        while (true) {
            var tile1;
            var tile2;
            var tile3;
            if (margx == 0) {
                tile1 = layer.getTileAtWorldXY(pacman.x,
                    pacman.y + margy + current_move_input.y, true);
                tile2 = layer.getTileAtWorldXY(pacman.x + pacsize / 2 - 1,
                    pacman.y + margy + current_move_input.y, true);
                tile3 = layer.getTileAtWorldXY(pacman.x - pacsize / 2 + 1,
                    pacman.y + margy + current_move_input.y, true);
            } else if (margy == 0) {
                tile1 = layer.getTileAtWorldXY(pacman.x + margx + current_move_input.x,
                    pacman.y, true);
                tile2 = layer.getTileAtWorldXY(pacman.x + margx + current_move_input.x,
                    pacman.y + pacsize / 2 - 1, true);
                tile3 = layer.getTileAtWorldXY(pacman.x + margx + current_move_input.x,
                    pacman.y - pacsize / 2 + 1, true);
            }
            if (tile1 != null && tile2 != null && tile3 != null &&
                tile1.index != 0 && tile2.index != 0 && tile3.index != 0) {
                pacman.x += current_move_input.x;
                pacman.y += current_move_input.y;
                break;
            }

            if (margx == 0) {
                if (current_move_input.y > 0) {
                    current_move_input.y--;
                } else if (current_move_input.y < 0) {
                    current_move_input.y++;
                }
                if (current_move_input.y <= 0) break;
            } else {
                if (current_move_input.x > 0) {
                    current_move_input.x--;
                } else if (current_move_input.x < 0) {
                    current_move_input.x++;
                }
                if (current_move_input.x <= 0) break;
            }
        }
        if (pacman.x == prevx && pacman.y == prevy) {
            pacman.x = Math.round((pacman.x - pacsize / 2) / tilesize) * tilesize + pacsize / 2;
            pacman.y = Math.round((pacman.y - pacsize / 2) / tilesize) * tilesize + pacsize / 2;
        }
        prevx = pacman.x;
        prevy = pacman.y;
    }
}
const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [Game]
};
const game = new Phaser.Game(config);