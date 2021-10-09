let pacman;
let blinky;
let pinky;
let inky;
let clyde;
let current_move_input = new Phaser.Math.Vector2(0, 0);
let key_queue = Phaser.Input.Keyboard.KeyCodes.BACKSPACE;
let map;
let tileset;
let layer;
let tilesize = 12;
let pacsize = tilesize;
let speed = tilesize / 4;
let blinky_speed = tilesize / 8;
let pinky_speed = tilesize / 8;
let inky_speed = tilesize / 8;
let clyde_speed = tilesize / 8;
let prevx;
let prevy;
let graphics;
let oranges;
let isanimiplay;
let debug = false;
let blinkymove = false;
let pinkymove = false;
let inkymove = false;
let clydemove = false;
let clydetime = Date.now();
let clydedirection = 0;
let clydetimeswap = 3000;

let mapq = new Array(100);
for (let i = 0; i < mapq.length; i++) {
  mapq[i] = new Array(100);
}
let blinkypath = [];
let pinkypath = [];
let inkypath = [];
let clydepath = [];

let scatter_clydepath = [
    [15, 1],
    [15, 2],
    [15, 3],
    [15, 4],
    [15, 5],
    [14, 5],
    [13, 5],
    [12, 5],
    [12, 4],
    [12, 3],
    [12, 2],
    [12, 1],
    [13, 1],
    [14, 1]
];

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
  
  inky_update() {
    let pacy = Math.round((pacman.x - pacsize / 2) / tilesize);
    let pacx = Math.round((pacman.y - pacsize / 2) / tilesize);
    let iny = Math.round((inky.x - tilesize / 2) / tilesize);
    let inx = Math.round((inky.y - tilesize / 2) / tilesize);
    let bliy = Math.round((blinky.x - tilesize / 2) / tilesize);
    let blix = Math.round((blinky.y - tilesize / 2) / tilesize);
    if(prevx != pacman.x || prevy != pacman.y){
        if(prevx > pacman.x){
            if(this.ok(pacx, pacy - 2)){
                pacy -= 2;
            }
        }
        else if(prevx < pacman.x){
            if(this.ok(pacx, pacy + 2)){
                pacy += 2;
            }
        }
        else if(prevy < pacman.y){
            if(this.ok(pacx + 2, pacy)){
                pacx += 2;
            }
        }
        else{ // Up
            if(this.ok(pacx - 2, pacy)){
                pacx -= 2;
            }
        }
    }
    pacx += (pacx - blix);
    pacy += (pacy - bliy);

    let maxx = 1;
    let maxy = 1;
    for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
            if(mapq[x][y] === 0){
                if(Math.abs(pacy - x) + Math.abs(pacx - y) < Math.abs(pacy - maxy) + Math.abs(pacx - maxx)){
                    maxx = y;
                    maxy = x;
                }
            }
        }
    }
    pacx = maxx;
    pacy = maxy;
    if(mapq[iny][inx] == 1){
        inkypath = [];
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
    q.enqueue([inx, iny]);
    d.enqueue(0);
    used[inx][iny] = 1;
    wave[inx][iny] = 0;
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
        inkypath = [];
        return;
    }
    inkypath = [];
    inkypath.push([pacx, pacy]);
    while(!(inx == pacx && iny == pacy)){
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
        inkypath.push([pacx, pacy]);
    }
  }
  pinky_update(){
    let pacy = Math.round((pacman.x - pacsize / 2) / tilesize);
    let pacx = Math.round((pacman.y - pacsize / 2) / tilesize);
    if(prevx != pacman.x || prevy != pacman.y){
        if(prevx > pacman.x){
            if(this.ok(pacx, pacy - 4)){
                pacy -= 4;
            }
        }
        else if(prevx < pacman.x){
            if(this.ok(pacx, pacy + 4)){
                pacy += 4;
            }
        }
        else if(prevy < pacman.y){
            if(this.ok(pacx + 4, pacy)){
                pacx += 4;
            }
        }
        else{ // Up
            if(this.ok(pacx - 4, pacy)){
                pacx -= 4;
            }
        }
    }
    let piny = Math.round((pinky.x - tilesize / 2) / tilesize);
    let pinx = Math.round((pinky.y - tilesize / 2) / tilesize);
    if(mapq[piny][pinx] == 1){
        pinkypath = [];
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
    q.enqueue([pinx, piny]);
    d.enqueue(0);
    used[pinx][piny] = 1;
    wave[pinx][piny] = 0;
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
        pinkypath = [];
        return;
    }
    pinkypath = [];
    pinkypath.push([pacx, pacy]);
    while(!(pinx == pacx && piny == pacy)){
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
        pinkypath.push([pacx, pacy]);
    }
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
  clyde_update(){
    let pacy = Math.round((pacman.x - pacsize / 2) / tilesize);
    let pacx = Math.round((pacman.y - pacsize / 2) / tilesize);
    let clyy = Math.round((clyde.x - tilesize / 2) / tilesize);
    let clyx = Math.round((clyde.y - tilesize / 2) / tilesize);
    // direction = 1(to pacman), 2(to corner);
    if((Math.abs(pacy - clyy) + Math.abs(pacx - clyx) <= 8 && ((clydedirection == 1 && Date.now() - clydetime >= clydetimeswap) || clydedirection == 2)) || (Math.abs(pacy - clyy) + Math.abs(pacx - clyx) > 8 && ((clydedirection == 2 && Date.now() - clydetime >= clydetimeswap) || clydedirection == 1)) != true){
        clydedirection = 2;
        if(Date.now() - clydetime >= clydetimeswap) clydetime = Date.now();
        for(let i = 0; i < scatter_clydepath.length; i++){
            if(clyx == scatter_clydepath[i][0] && clyy == scatter_clydepath[i][1]){
                clydepath = [];
                clydepath.push(scatter_clydepath[(i + 1) % scatter_clydepath.length]);
                clydepath.push(scatter_clydepath[i]);
                return;
            }
        }
        pacy = scatter_clydepath[0][1];
        pacx = scatter_clydepath[0][0];
    }
    if(mapq[clyy][clyx] == 1){
        clydedirection = 0;
        clydepath = [];
        return;
    }
    if(Math.abs(pacy - clyy) + Math.abs(pacx - clyx) > 8 && ((clydedirection == 2 && Date.now() - clydetime >= clydetimeswap) || clydedirection == 1)){
        clydedirection = 1;
        if(Date.now() - clydetime >= clydetimeswap) clydetime = Date.now();
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
    q.enqueue([clyx, clyy]);
    d.enqueue(0);
    used[clyx][clyy] = 1;
    wave[clyx][clyy] = 0;
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
        clydepath = [];
        return;
    }
    clydepath = [];
    clydepath.push([pacx, pacy]);
    while(!(clyx == pacx && clyy == pacy)){
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
        clydepath.push([pacx, pacy]);
    };
  }
  preload() {
    this.load.atlas("pacman", "JS/images/pacman2.png", "JS/entities/pacman/pacman.json");
    this.load.atlas("blinky", "JS/images/pacman2.png", "JS/entities/blinky/blinky.json");
    this.load.atlas("pinky", "JS/images/pacman2.png", "JS/entities/pinky/pinky.json");
    this.load.atlas("inky", "JS/images/pacman2.png", "JS/entities/inky/inky.json");
    this.load.atlas("clyde", "JS/images/pacman2.png", "JS/entities/clyde/clyde.json");
    this.load.image("tiles", "JS/images/blocks2.png");
    this.load.tilemapCSV("map", "JS/maps/csv/newmap.csv");
    dynamicallyLoadScript("JS/stl.js");
  }
  create() {
    graphics = this.add.graphics({ x: 0, y: 0 });
    this.physics.world.setBounds(0, 0, 800, 600);
    // let spriteBounds = Phaser.Geom.Rectangle.Inflate(
    //   Phaser.Geom.Rectangle.Clone(this.physics.world.bounds),
    //   -100,
    //   -100
    // );
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
    pinky = this.physics.add.sprite(
      tilesize + tilesize / 2,
      tilesize + tilesize / 2,
      "pinky"
    );
    inky = this.physics.add.sprite(
      tilesize + tilesize / 2,
      tilesize + tilesize / 2,
      "inky"
    );
    clyde = this.physics.add.sprite(
      tilesize + tilesize / 2,
      tilesize + tilesize / 2,
      "clyde"
    );
    pacman.setScale((pacsize / 32) * 1.1);
    blinky.setScale((pacsize / 13) * 1.2);
    pinky.setScale((pacsize / 13) * 1.2);
    inky.setScale((pacsize / 13) * 1.2);
    clyde.setScale((pacsize / 13) * 1.2);
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
    {
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
            duration: 300,
            frames: this.anims.generateFrameNames("blinky", {
                prefix: "blinkyright_",
                end: 1,
                zeroPad: 4,
            }),
            repeat: -1,
        });
        this.anims.create({
            key: "blinkyleft",
            duration: 300,
            frames: this.anims.generateFrameNames("blinky", {
                prefix: "blinkyleft_",
                end: 1,
                zeroPad: 4,
            }),
            repeat: -1,
        });
        this.anims.create({
            key: "blinkyup",
            duration: 300,
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
        this.anims.create({
            key: "pinkyright",
            duration: 300,
            frames: this.anims.generateFrameNames("pinky", {
            prefix: "pinkyright_",
            end: 1,
            zeroPad: 4,
            }),
            repeat: -1,
        });
        this.anims.create({
        key: "pinkyleft",
        duration: 300,
        frames: this.anims.generateFrameNames("pinky", {
            prefix: "pinkyleft_",
            end: 1,
            zeroPad: 4,
        }),
        repeat: -1,
        });
        this.anims.create({
        key: "pinkyup",
        duration: 300,
        frames: this.anims.generateFrameNames("pinky", {
            prefix: "pinkyup_",
            end: 1,
            zeroPad: 4,
        }),
        repeat: -1,
        });
        this.anims.create({
        key: "pinkydown",
        duration: 300,
        frames: this.anims.generateFrameNames("pinky", {
            prefix: "pinkydown_",
            end: 1,
            zeroPad: 4,
        }),
        repeat: -1,
        });
        this.anims.create({
            key: "inkyright",
            duration: 300,
            frames: this.anims.generateFrameNames("inky", {
            prefix: "inkyright_",
            end: 1,
            zeroPad: 4,
            }),
            repeat: -1,
        });
        this.anims.create({
            key: "inkyleft",
            duration: 300,
            frames: this.anims.generateFrameNames("inky", {
                prefix: "inkyleft_",
                end: 1,
                zeroPad: 4,
            }),
            repeat: -1,
        });
        this.anims.create({
            key: "inkyup",
            duration: 300,
            frames: this.anims.generateFrameNames("inky", {
                prefix: "inkyup_",
                end: 1,
                zeroPad: 4,
            }),
            repeat: -1,
        });
        this.anims.create({
            key: "inkydown",
            duration: 300,
            frames: this.anims.generateFrameNames("inky", {
                prefix: "inkydown_",
                end: 1,
                zeroPad: 4,
            }),
            repeat: -1,
        });
        this.anims.create({
            key: "clyderight",
            duration: 300,
            frames: this.anims.generateFrameNames("clyde", {
            prefix: "clyderight_",
            end: 1,
            zeroPad: 4,
            }),
            repeat: -1,
        });
        this.anims.create({
            key: "clydeleft",
            duration: 300,
            frames: this.anims.generateFrameNames("clyde", {
                prefix: "clydeleft_",
                end: 1,
                zeroPad: 4,
            }),
            repeat: -1,
        });
        this.anims.create({
            key: "clydeup",
            duration: 300,
            frames: this.anims.generateFrameNames("clyde", {
                prefix: "clydeup_",
                end: 1,
                zeroPad: 4,
            }),
            repeat: -1,
        });
        this.anims.create({
            key: "clydedown",
            duration: 300,
            frames: this.anims.generateFrameNames("clyde", {
                prefix: "clydedown_",
                end: 1,
                zeroPad: 4,
            }),
            repeat: -1,
        });
    } 
    pacman.play("pacman");
    blinky.play("blinkyup");
    pinky.play("pinkyup");
    inky.play("inkyup");
    clyde.play("clydeup");
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
    debug = false;
    blinkymove = true;
    inkymove = true;
    // setTimeout("pinkymove = true", 5000);
    pinkymove = true;
    clydemove = true;
    clydetime = Date.now();
    clydedirection = 0;
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
    if(Phaser.Input.Keyboard.JustDown(this.keys_addit.c)){
        debug = !debug;
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
    if(blinkymove){
        this.blinky_update();
    }
    if(blinkypath.length > 1){
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
            blinky.x-=blinky_speed;
            if(blinky.anims.currentAnim.key != "blinkyleft") blinky.play("blinkyleft");
        }
        else if(blinky.x < blinkypath[blinkypath.length - 1][1] * tilesize + tilesize / 2){
            blinky.x+=blinky_speed;
            if(blinky.anims.currentAnim.key != "blinkyright") blinky.play("blinkyright");
        }
        else if(blinky.y > blinkypath[blinkypath.length - 1][0] * tilesize + tilesize / 2){
            blinky.y-=blinky_speed;
            if(blinky.anims.currentAnim.key != "blinkyup") blinky.play("blinkyup");
        }
        else{
            blinky.y+=blinky_speed;
            if(blinky.anims.currentAnim.key != "blinkydown") blinky.play("blinkydown");
        }
    }
    pinky.setDepth(3);
    if(pinkymove){
        this.pinky_update();
    }
    if(pinkypath.length > 1){
        let isgoingx = true;
        /// [1] is x, [0] is y
        // console.log(pinky.y);
        if(pinkypath[pinkypath.length - 1][0] != pinkypath[pinkypath.length - 2][0]){
            isgoingx = false;
        }
        if(isgoingx){
            if(pinky.y == pinkypath[pinkypath.length - 2][0] * tilesize + tilesize / 2){
                pinkypath.pop();
            }
        }
        else{
            if(pinky.x == pinkypath[pinkypath.length - 2][1] * tilesize + tilesize / 2){
                pinkypath.pop();
            }
        }
        if(pinky.x > pinkypath[pinkypath.length - 1][1] * tilesize + tilesize / 2){
            pinky.x-=pinky_speed;
            if(pinky.anims.currentAnim.key != "pinkyleft") pinky.play("pinkyleft");
        }
        else if(pinky.x < pinkypath[pinkypath.length - 1][1] * tilesize + tilesize / 2){
            pinky.x+=pinky_speed;
            if(pinky.anims.currentAnim.key != "pinkyright") pinky.play("pinkyright");
        }
        else if(pinky.y > pinkypath[pinkypath.length - 1][0] * tilesize + tilesize / 2){
            pinky.y-=pinky_speed;
            if(pinky.anims.currentAnim.key != "pinkyup") pinky.play("pinkyup");
        }
        else{
            pinky.y+=pinky_speed;
            if(pinky.anims.currentAnim.key != "pinkydown") pinky.play("pinkydown");
        }
    }
    inky.setDepth(4);
    if(inkymove){
        this.inky_update();
    }
    if(inkypath.length > 1){
        let isgoingx = true;
        /// [1] is x, [0] is y
        // console.log(inky.y);
        if(inkypath[inkypath.length - 1][0] != inkypath[inkypath.length - 2][0]){
            isgoingx = false;
        }
        if(isgoingx){
            if(inky.y == inkypath[inkypath.length - 2][0] * tilesize + tilesize / 2){
                inkypath.pop();
            }
        }
        else{
            if(inky.x == inkypath[inkypath.length - 2][1] * tilesize + tilesize / 2){
                inkypath.pop();
            }
        }
        if(inky.x > inkypath[inkypath.length - 1][1] * tilesize + tilesize / 2){
            inky.x-=inky_speed;
            if(inky.anims.currentAnim.key != "inkyleft") inky.play("inkyleft");
        }
        else if(inky.x < inkypath[inkypath.length - 1][1] * tilesize + tilesize / 2){
            inky.x+=inky_speed;
            if(inky.anims.currentAnim.key != "inkyright") inky.play("inkyright");
        }
        else if(inky.y > inkypath[inkypath.length - 1][0] * tilesize + tilesize / 2){
            inky.y-=inky_speed;
            if(inky.anims.currentAnim.key != "inkyup") inky.play("inkyup");
        }
        else{
            inky.y+=inky_speed;
            if(inky.anims.currentAnim.key != "inkydown") inky.play("inkydown");
        }
    }
    clyde.setDepth(5);
    if(clydemove){
        this.clyde_update();
    }
    if(clydepath.length > 1){
        let isgoingx = true;
        /// [1] is x, [0] is y
        // console.log(clyde.y);
        if(clydepath[clydepath.length - 1][0] != clydepath[clydepath.length - 2][0]){
            isgoingx = false;
        }
        if(isgoingx){
            if(clyde.y == clydepath[clydepath.length - 2][0] * tilesize + tilesize / 2){
                clydepath.pop();
            }
        }
        else{
            if(clyde.x == clydepath[clydepath.length - 2][1] * tilesize + tilesize / 2){
                clydepath.pop();
            }
        }
        if(clyde.x > clydepath[clydepath.length - 1][1] * tilesize + tilesize / 2){
            clyde.x-=clyde_speed;
            if(clyde.anims.currentAnim.key != "clydeleft") clyde.play("clydeleft");
        }
        else if(clyde.x < clydepath[clydepath.length - 1][1] * tilesize + tilesize / 2){
            clyde.x+=clyde_speed;
            if(clyde.anims.currentAnim.key != "clyderight") clyde.play("clyderight");
        }
        else if(clyde.y > clydepath[clydepath.length - 1][0] * tilesize + tilesize / 2){
            clyde.y-=clyde_speed;
            if(clyde.anims.currentAnim.key != "clydeup") clyde.play("clydeup");
        }
        else{
            clyde.y+=clyde_speed;
            if(clyde.anims.currentAnim.key != "clydedown") clyde.play("clydedown");
        }
    }
    prevx = pacman.x;
    prevy = pacman.y;
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
    if(debug){
        // Draw blinky path
        graphics.lineStyle(5, 0xff0000, 1);
        for(let i = 0; i < blinkypath.length; i++){
            let circle = graphics.strokeCircle(
                blinkypath[i][1] * tilesize + tilesize / 2,
                blinkypath[i][0] * tilesize + tilesize / 2,
                0.5
            );
            circle.setDepth(3);
        }
        // Draw pinky path
        graphics.lineStyle(5, 0xffc0cb, 1);
        for(let i = 0; i < pinkypath.length; i++){
            let circle = graphics.strokeCircle(
                pinkypath[i][1] * tilesize + tilesize / 2,
                pinkypath[i][0] * tilesize + tilesize / 2,
                0.5
            );
            circle.setDepth(3);
        }
        // Draw inky path
        graphics.lineStyle(5, 0x0000ff, 1);
        for(let i = 0; i < inkypath.length; i++){
            let circle = graphics.strokeCircle(
                inkypath[i][1] * tilesize + tilesize / 2,
                inkypath[i][0] * tilesize + tilesize / 2,
                0.5
            );
            circle.setDepth(3);
        }
        graphics.lineStyle(5, 0xeeff00, 1);
        for(let i = 0; i < clydepath.length; i++){
            let circle = graphics.strokeCircle(
                clydepath[i][1] * tilesize + tilesize / 2,
                clydepath[i][0] * tilesize + tilesize / 2,
                0.5
            );
            circle.setDepth(3);
        }
    }
    let paccy = Math.round((pacman.x - pacsize / 2) / tilesize);
    let paccx = Math.round((pacman.y - pacsize / 2) / tilesize);
    if(paccy == 57 && paccx == 8 && pacman.angle == 0){
        paccy = 1;
        pacman.x = paccy * tilesize + pacsize / 2;
    }
    if(paccy == 0 && paccx == 8 && pacman.angle == -180){
        paccy = 57;
        pacman.x = paccy * tilesize + pacsize / 2;
    }
    // console.log(pacman.angle);
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
