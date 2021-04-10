var pacman;
var current_move_input = new Phaser.Math.Vector2(0, 0);
var speed = 2;
var key_queue = Phaser.Input.Keyboard.KeyCodes.BACKSPACE;
var map;
var tileset;
var layer;
var tilesize = 48;
class Game extends Phaser.Scene {
    constructor() {
        super();
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


        pacman = this.physics.add.sprite(tilesize + tilesize / 2, tilesize + tilesize / 2, 'pacman');
        pacman.setScale(.5);
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
            margy = -(tilesize / 2);
        }
        if (Math.abs(pacman.angle) == 180) {
            margx = -(tilesize / 2);
        }
        if (pacman.angle == 90) {
            margy = tilesize / 2;
        }
        if (pacman.angle == 0) {
            margx = tilesize / 2;
        }
        // console.log(margx + " " + margy + " " + pacman.angle);
        if (key_queue != Phaser.Input.Keyboard.KeyCodes.BACKSPACE) {
            // if ((pacman.x - tilesize / 2) % tilesize == 0 && (pacman.y - tilesize / 2) % tilesize == 0) {
            if (key_queue == Phaser.Input.Keyboard.KeyCodes.W) {
                current_move_input = new Phaser.Math.Vector2(0, 0);
                current_move_input.y = -1 * speed;
                pacman.angle = 270;
                margy = -(tilesize / 2);
                margx = 0;
            } else if (key_queue == Phaser.Input.Keyboard.KeyCodes.S) {
                current_move_input = new Phaser.Math.Vector2(0, 0);
                current_move_input.y = 1 * speed;
                pacman.angle = 90;
                margy = tilesize / 2;
                margx = 0;
            } else if (key_queue == Phaser.Input.Keyboard.KeyCodes.D) {
                current_move_input = new Phaser.Math.Vector2(0, 0);
                current_move_input.x = 1 * speed;
                pacman.angle = 0;
                margx = tilesize / 2;
                margy = 0;
            } else if (key_queue == Phaser.Input.Keyboard.KeyCodes.A) {
                current_move_input = new Phaser.Math.Vector2(0, 0);
                current_move_input.x = -1 * speed;
                pacman.angle = 180;
                margx = -(tilesize / 2);
                margy = 0;
            }
            key_queue = Phaser.Input.Keyboard.KeyCodes.BACKSPACE;
            // }
        }
        var tile = layer.getTileAtWorldXY(pacman.x + margx + current_move_input.x,
            pacman.y + margy + current_move_input.y, true);
        var tile1;
        var tile2;
        var tile3;
        if (margx == 0) {
            tile1 = layer.getTileAtWorldXY(pacman.x,
                pacman.y + margy + current_move_input.y, true);
            tile2 = layer.getTileAtWorldXY(pacman.x + tilesize / 2,
                pacman.y + margy + current_move_input.y, true);
            tile3 = layer.getTileAtWorldXY(pacman.x - tilesize / 2,
                pacman.y + margy + current_move_input.y, true);
        } else if (margy == 0) {
            tile1 = layer.getTileAtWorldXY(pacman.x + margx + current_move_input.x,
                pacman.y, true);
            tile2 = layer.getTileAtWorldXY(pacman.x + margx + current_move_input.x,
                pacman.y + tilesize / 2, true);
            tile3 = layer.getTileAtWorldXY(pacman.x + margx + current_move_input.x,
                pacman.y - tilesize / 2, true);
        }
        console.log(tile);
        if (tile1 != null && tile2 != null && tile3 != null &&
            tile1.index != 0 && tile2.index != 0 && tile3.index != 0) {
            pacman.x += current_move_input.x;
            pacman.y += current_move_input.y;
        }
        // if (pacman.x < tilesize / 2) pacman.x = tilesize / 2;
        // if (pacman.y < tilesize / 2) pacman.y = tilesize / 2;
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