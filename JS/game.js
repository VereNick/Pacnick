var pacman;
var current_move_input = new Phaser.Math.Vector2(0, 0);
var speed = 3;
class Game extends Phaser.Scene {
    constructor() {
        super();
    }

    preload() {
        this.load.atlas('pacman', 'JS/pacman2.png',
            'JS/pacman.json');
        this.load.image('tiles', 'JS/blocks2.png');
        this.load.tilemapTiledJSON('pacmap', 'JS/pacmap.json');
    }
    create() {
        this.physics.world.setBounds(0, 0, 800, 600);
        var map = this.make.tilemap({ key: 'pacmap' });
        var spriteBounds = Phaser.Geom.Rectangle.Inflate(
            Phaser.Geom.Rectangle.Clone(this.physics.world.bounds), -100, -100);
        pacman = this.physics.add.sprite(250, 250, 'pacman');
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
            current_move_input = new Phaser.Math.Vector2(0, 0);
            current_move_input.y = -1 * speed;
            pacman.angle = 270;
        } else if (this.keys_arrows.down.isDown || this.keys_wasd.down.isDown) {
            current_move_input = new Phaser.Math.Vector2(0, 0);
            current_move_input.y = 1 * speed;
            pacman.angle = 90;
        } else if (this.keys_arrows.right.isDown || this.keys_wasd.right.isDown) {
            current_move_input = new Phaser.Math.Vector2(0, 0);
            current_move_input.x = 1 * speed;
            pacman.angle = 0;
        } else if (this.keys_arrows.left.isDown || this.keys_wasd.left.isDown) {
            current_move_input = new Phaser.Math.Vector2(0, 0);
            current_move_input.x = -1 * speed;
            pacman.angle = 180;
        }
        pacman.x += current_move_input.x;
        pacman.y += current_move_input.y;
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