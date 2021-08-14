class Ghost{
    constructor(name, phaser){
        this.name = name;
        this.phaser = phaser;
        this.load();
    }
    load(){
        // this.phaser.load.atlas(this.name, "../images/pacman2.png", "blinky/blinky.json");
        this.phaser.load.atlas("blinky2", "pacman2.png", "blinky.json");
        this.sprite = this.phaser.physics.add.sprite(100, 100, this.name);
      
        let getTxt = function (){
            $.ajax({
                url:"blinky.json",
                success: function (data){
                    console.log(data);
                }
            });
        }
        getTxt();
        // let dirs = ['right', 'left', 'down', 'up'];
        // dirs.forEach(dir => {
        //     this.phaser.anims.create({
        //         key: `${this.name}${dir}`,
        //         duration: 200,
        //         frames: this.phaser.anims.generateFrameNames(`${this.name}`, {
        //         prefix: `${this.name}${dir}_`,
        //         end: 1,
        //         zeroPad: 4,
        //         }),
        //         repeat: -1,
        //     });
        // });
        this.phaser.anims.create({
            key: "blinkyright",
            duration: 300,
            frames: this.phaser.anims.generateFrameNames("blinky", {
                prefix: "blinkyright_",
                end: 1,
                zeroPad: 4,
            }),
            repeat: -1,
        });
        this.phaser.anims.create({
            key: "blinkyleft",
            duration: 300,
            frames: this.phaser.anims.generateFrameNames("blinky", {
                prefix: "blinkyleft_",
                end: 1,
                zeroPad: 4,
            }),
            repeat: -1,
        });
        this.phaser.anims.create({
            key: "blinkyup",
            duration: 300,
            frames: this.phaser.anims.generateFrameNames("blinky", {
                prefix: "blinkyup_",
                end: 1,
                zeroPad: 4,
            }),
            repeat: -1,
        });
        this.phaser.anims.create({
            key: "blinkydown",
            duration: 300,
            frames: this.phaser.anims.generateFrameNames("blinky", {
                prefix: "blinkydown_",
                end: 1,
                zeroPad: 4,
            }),
            repeat: -1,
        });
    }
}
class Blinky extends Ghost{
    constructor(name, phaser) {
        super(name, phaser);
    }
}
// class Pinky extends Ghost{

// }
// class Inky extends Ghost{

// }
// class Clyde extends Ghost{

// }