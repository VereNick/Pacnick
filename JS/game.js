let pacman;
let blinky;
let current_move_input = new Phaser.Math.Vector2(0, 0);
let key_queue = Phaser.Input.Keyboard.KeyCodes.BACKSPACE;
let map;
let tileset;
let layer;
let tilesize = 12;
let pacsize = tilesize;
let speed = tilesize / 4;
let prevx;
let prevy;
let graphics;
let oranges;
let isanimiplay;
let mapq = new Array(100);
for (let i = 0; i < mapq.length; i++) {
  mapq[i] = new Array(100);
}
let blinkypath = [];
function dynamicallyLoadScript(url) {
  let script = document.createElement("script");
  script.src = url;
  document.head.appendChild(script);
}
class Game extends Phaser.Scene {
  constructor() {
    super();
  }
  check(x, y) {
    let tile = layer.getTileAtWorldXY(x, y, true);
    if (tile != null && tile.index != 5) {
      return true;
    }
    return false;
  }
  ok(x, y){
    return ((x >= 0) && (y >= 0) && (x < map.height) && (y < map.width) && (mapq[y][x] == 0));
  }
  blinky_update() {
    let pacy = Math.round((pacman.x - pacsize / 2) / tilesize);
    let pacx = Math.round((pacman.y - pacsize / 2) / tilesize);
    let bliy = Math.round((blinky.x - tilesize / 2) / tilesize);
    let blix = Math.round((blinky.y - tilesize / 2) / tilesize);
    if(mapq[bliy][blix] == 1){
      blinkypath = [];
      return;
    }
    let used = new Array(100);
    for (let i = 0; i < used.length; i++) {
        used[i] = new Array(100);
        for (let j = 0; j < used[i].length; j++) {
            used[i][j] = 0;
        }
    }
    let wave = new Array(100);
    for (let i = 0; i < wave.length; i++) {
        wave[i] = new Array(100);
        for (let j = 0; j < wave[i].length; j++) {
            wave[i][j] = 1000000000;
        }
    }
    let q = new Queue();
    let d = new Queue();
    q.enqueue([blix, bliy]);
    d.enqueue(0);
    used[blix][bliy] = 1;
    wave[blix][bliy] = 0;
    while(q.head != null){
        let cur = q.dequeue();
        let dist = d.dequeue();
        if(this.ok(cur[0] + 1, cur[1]) && (used[cur[0] + 1][cur[1]] == 0)){
            used[cur[0] + 1][cur[1]] = 1;
            wave[cur[0] + 1][cur[1]] = dist + 1;
            q.enqueue([cur[0] + 1, cur[1]]);
            d.enqueue(dist + 1);
        }
        if(this.ok(cur[0] - 1, cur[1]) && (used[cur[0] - 1][cur[1]] == 0)){
            used[cur[0] - 1][cur[1]] = 1;
            wave[cur[0] - 1][cur[1]] = dist + 1;
            q.enqueue([cur[0] - 1, cur[1]]);
            d.enqueue(dist + 1);
        }
        if(this.ok(cur[0], cur[1] + 1) && (used[cur[0]][cur[1] + 1] == 0)){
            used[cur[0]][cur[1] + 1] = 1;
            wave[cur[0]][cur[1] + 1] = dist + 1;
            q.enqueue([cur[0], cur[1] + 1]);
            d.enqueue(dist + 1);
        }
        if(this.ok(cur[0], cur[1] - 1) && (used[cur[0]][cur[1] - 1] == 0)){
            used[cur[0]][cur[1] - 1] = 1;
            wave[cur[0]][cur[1] - 1] = dist + 1;
            q.enqueue([cur[0], cur[1] - 1]);
            d.enqueue(dist + 1);
        }
    }
    if(used[pacx][pacy] == 0){
      blinkypath = [];
      return;
    }
    blinkypath = [];
    blinkypath.push([pacx, pacy]);
    while(!(blix == pacx && bliy == pacy)){
        if((this.ok(pacx + 1, pacy)) && (wave[pacx + 1][pacy] + 1 == wave[pacx][pacy])){
            pacx++;
        }
        else if(this.ok(pacx - 1, pacy) && wave[pacx - 1][pacy] + 1 == wave[pacx][pacy]){
            pacx--;
        }
        else if(this.ok(pacx, pacy + 1) && wave[pacx][pacy + 1] + 1 == wave[pacx][pacy]){
            pacy++;
        }
        else if(this.ok(pacx, pacy - 1) && wave[pacx][pacy - 1] + 1 == wave[pacx][pacy]){
            pacy--;
        }
        blinkypath.push([pacx, pacy]);
    }
  }
  preload() {
    this.load.atlas(
      "pacman",
      "JS/images/pacman2.png",
      "JS/entities/pacman/pacman.json"
    );

    this.load.atlas(
      "blinky",
      "JS/images/pacman2.png",
      "JS/entities/blinky/blinky.json"
    );

    this.load.image("tiles", "JS/images/blocks2.png");
    this.load.tilemapCSV("map", "JS/maps/csv/newmap.csv");
    dynamicallyLoadScript("JS/stl.js");
  }
  create() {
    graphics = this.add.graphics({ x: 0, y: 0 });
    this.physics.world.setBounds(0, 0, 800, 600);
    let spriteBounds = Phaser.Geom.Rectangle.Inflate(
      Phaser.Geom.Rectangle.Clone(this.physics.world.bounds),
      -100,
      -100
    );
    map = this.make.tilemap({
      key: "map",
      tileWidth: tilesize,
      tileHeight: tilesize,
    });
    tileset = map.addTilesetImage("tiles", null, 48, 48);
    layer = map.createLayer(0, tileset, 0, 0);
    prevx = -100;
    prevy = -100;
    pacman = this.physics.add.sprite(
      tilesize + tilesize / 2,
      tilesize + tilesize / 2,
      "pacman"
    );
    blinky = this.physics.add.sprite(
      tilesize + tilesize / 2,
      tilesize + tilesize / 2,
      "blinky"
    );
    pacman.setScale((pacsize / 32) * 1.1);
    blinky.setScale((pacsize / 13) * 1.2);
    oranges = new Map();
    pacman.setCollideWorldBounds(true);
    this.keys_arrows = this.input.keyboard.createCursorKeys();
    this.keys_wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.keys_addit = this.input.keyboard.addKeys({
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      c: Phaser.Input.Keyboard.KeyCodes.C,
    });
    this.anims.on(
      Phaser.Animations.Events.ADD_ANIMATION,
      function () {
        return undefined;
      },
      this
    );
    this.anims.create({
      key: "pacman",
      duration: 200,
      frames: this.anims.generateFrameNames("pacman", {
        prefix: "pacman_",
        end: 2,
        zeroPad: 4,
      }),
      repeat: -1,
    });
    this.anims.create({
      key: "blinkyright",
      duration: 200,
      frames: this.anims.generateFrameNames("blinky", {
        prefix: "blinkyright_",
        end: 1,
        zeroPad: 4,
      }),
      repeat: -1,
    });
    this.anims.create({
      key: "blinkyleft",
      duration: 200,
      frames: this.anims.generateFrameNames("blinky", {
        prefix: "blinkyleft_",
        end: 1,
        zeroPad: 4,
      }),
      repeat: -1,
    });
    this.anims.create({
      key: "blinkyup",
      duration: 400,
      frames: this.anims.generateFrameNames("blinky", {
        prefix: "blinkyup_",
        end: 1,
        zeroPad: 4,
      }),
      repeat: -1,
    });
    this.anims.create({
      key: "blinkydown",
      duration: 300,
      frames: this.anims.generateFrameNames("blinky", {
        prefix: "blinkydown_",
        end: 1,
        zeroPad: 4,
      }),
      repeat: -1,
    });
    pacman.play("pacman");
    blinky.play("blinkyup");
    isanimiplay = 1;
    for (let x = 0; x < map.width; x++) {
      oranges[x] = new Map();
    }
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (map.getTileAt(x, y) == null) {
          oranges[x][y] = 1;
          mapq[x][y] = 0;
        } else {
          oranges[x][y] = 0;
          mapq[x][y] = 1;
        }
      }
    }
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
    else if(this.keys_addit.space.isDown){
      blinky.y++;
    }
    else if(this.keys_addit.c.isDown){
      blinky.x++;
    }
    let margx = 0;
    let margy = 0;
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
    if (key_queue != Phaser.Input.Keyboard.KeyCodes.BACKSPACE) {
      if (
        (pacman.x - pacsize / 2) % tilesize == 0 &&
        (pacman.y - pacsize / 2) % tilesize == 0
      ) {
        if (
          key_queue == Phaser.Input.Keyboard.KeyCodes.W &&
          this.check(pacman.x, pacman.y - tilesize)
        ) {
          current_move_input = new Phaser.Math.Vector2(0, 0);
          current_move_input.y = -1 * speed;
          pacman.angle = 270;
          margy = -(pacsize / 2);
          margx = 0;
          key_queue = Phaser.Input.Keyboard.KeyCodes.BACKSPACE;
        } else if (
          key_queue == Phaser.Input.Keyboard.KeyCodes.S &&
          this.check(pacman.x, pacman.y + tilesize)
        ) {
          current_move_input = new Phaser.Math.Vector2(0, 0);
          current_move_input.y = 1 * speed;
          pacman.angle = 90;
          margy = pacsize / 2;
          margx = 0;
          key_queue = Phaser.Input.Keyboard.KeyCodes.BACKSPACE;
        } else if (
          key_queue == Phaser.Input.Keyboard.KeyCodes.D &&
          this.check(pacman.x + tilesize, pacman.y)
        ) {
          current_move_input = new Phaser.Math.Vector2(0, 0);
          current_move_input.x = 1 * speed;
          pacman.angle = 0;
          margx = pacsize / 2;
          margy = 0;
          key_queue = Phaser.Input.Keyboard.KeyCodes.BACKSPACE;
        } else if (
          key_queue == Phaser.Input.Keyboard.KeyCodes.A &&
          this.check(pacman.x - tilesize, pacman.y)
        ) {
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
      let tile1;
      let tile2;
      let tile3;
      if (margx == 0) {
        tile1 = layer.getTileAtWorldXY(
          pacman.x,
          pacman.y + margy + current_move_input.y,
          true
        );
        tile2 = layer.getTileAtWorldXY(
          pacman.x + pacsize / 2 - 1,
          pacman.y + margy + current_move_input.y,
          true
        );
        tile3 = layer.getTileAtWorldXY(
          pacman.x - pacsize / 2 + 1,
          pacman.y + margy + current_move_input.y,
          true
        );
      } else if (margy == 0) {
        tile1 = layer.getTileAtWorldXY(
          pacman.x + margx + current_move_input.x,
          pacman.y,
          true
        );
        tile2 = layer.getTileAtWorldXY(
          pacman.x + margx + current_move_input.x,
          pacman.y + pacsize / 2 - 1,
          true
        );
        tile3 = layer.getTileAtWorldXY(
          pacman.x + margx + current_move_input.x,
          pacman.y - pacsize / 2 + 1,
          true
        );
      }
      if (
        tile1 != null &&
        tile2 != null &&
        tile3 != null &&
        tile1.index != 5 &&
        tile2.index != 5 &&
        tile3.index != 5
      ) {
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
      pacman.x =
        Math.round((pacman.x - pacsize / 2) / tilesize) * tilesize +
        pacsize / 2;
      pacman.y =
        Math.round((pacman.y - pacsize / 2) / tilesize) * tilesize +
        pacsize / 2;
    }
    let pacx = Math.round((pacman.x - pacsize / 2) / tilesize);
    let pacy = Math.round((pacman.y - pacsize / 2) / tilesize);
    if (oranges[pacx][pacy] == 1) {
      oranges[pacx][pacy] = 0;
    }

    if (pacman.x == prevx && pacman.y == prevy) {
      if (isanimiplay == 1) {
        pacman.stop();
        pacman.setFrame("pacman_0001");
        isanimiplay = 0;
      }
    } else if (isanimiplay == 0) {
      pacman.play("pacman");
      isanimiplay = 1;
    }
    prevx = pacman.x;
    prevy = pacman.y;
    graphics.clear();
    graphics.lineStyle(5, 0xffaa00, 1);
    for (let x = 0; x < map.width; x++) {
      for (let y = 0; y < map.height; y++) {
        if (oranges[x][y] == 1) {
          let circle = graphics.strokeCircle(
            x * tilesize + tilesize / 2,
            y * tilesize + tilesize / 2,
            1
          );
          circle.setDepth(1);
        }
      }
    }
    blinky.setDepth(2);
    this.blinky_update();
    if(blinkypath.length > 1){
      let blinx = blinky.x;
      let bliny = blinky.y;
      let isgoingx = true;
      /// [1] is x, [0] is y
      // console.log(blinky.y);
      if(blinkypath[blinkypath.length - 1][0] != blinkypath[blinkypath.length - 2][0]){
        isgoingx = false;
      }
      if(isgoingx){
        if(blinky.y == blinkypath[blinkypath.length - 2][0] * tilesize + tilesize / 2){
          blinkypath.pop();
        }
      }
      else{
        if(blinky.x == blinkypath[blinkypath.length - 2][1] * tilesize + tilesize / 2){
          blinkypath.pop();
        }
      }
      if(blinky.x > blinkypath[blinkypath.length - 1][1] * tilesize + tilesize / 2){
        blinky.x--;
        if(blinky.anims.currentAnim.key != "blinkyleft") blinky.play("blinkyleft");
      }
      else if(blinky.x < blinkypath[blinkypath.length - 1][1] * tilesize + tilesize / 2){
        blinky.x++;
        if(blinky.anims.currentAnim.key != "blinkyright") blinky.play("blinkyright");
      }
      else if(blinky.y > blinkypath[blinkypath.length - 1][0] * tilesize + tilesize / 2){
        blinky.y--;
        if(blinky.anims.currentAnim.key != "blinkyup") blinky.play("blinkyup");
      }
      else{
        blinky.y++;
        if(blinky.anims.currentAnim.key != "blinkydown") blinky.play("blinkydown");
      }
    }
    // Go into the pacman cell completely
    // if(blinkypath.length == 1){
    //   let bliy = Math.round((pacman.x - tilesize / 2) / tilesize);
    //   let blix = Math.round((pacman.y - tilesize / 2) / tilesize);
    //   if(blinky.x > blix * tilesize + tilesize / 2){
    //     blinky.x--;
    //   }
    //   else if(blinky.x < blix * tilesize + tilesize / 2){
    //     blinky.x++;
    //   }
    //   else if(blinky.y < bliy * tilesize + tilesize / 2){
    //     blinky.y++;
    //   }
    //   else if(blinky.y > bliy * tilesize + tilesize / 2){
    //     blinky.y--;
    //   }
    // }
    // Draw blinky path
    // graphics.lineStyle(5, 0xff0000, 1);
    // for(let i = 0; i < blinkypath.length; i++){
    //     let circle = graphics.strokeCircle(
    //         blinkypath[i][1] * tilesize + tilesize / 2,
    //         blinkypath[i][0] * tilesize + tilesize / 2,
    //         0.5
    //       );
    //       circle.setDepth(3);
    // }
  }
}
const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Game],
};
const game = new Phaser.Game(config);
