// This function defines the Player module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the player
// - `y` - The initial y position of the player
// - `gameArea` - The bounding box of the game area
const Player = function(ctx, x, y, gameArea, id) {

    // This is the sprite sequences of the player facing different directions.
    // It contains the idling sprite sequences `idleLeft`, `idleUp`, `idleRight` and `idleDown`,
    // and the moving sprite sequences `moveLeft`, `moveUp`, `moveRight` and `moveDown`.
    const sequences = {
        /* Idling sprite sequences for facing different directions */
        idleLeft:  { x: 0, y: 25, width: 24, height: 25, count: 3, timing: 2000, loop: false },
        idleUp:    { x: 0, y: 50, width: 24, height: 25, count: 1, timing: 2000, loop: false },
        idleRight: { x: 0, y: 75, width: 24, height: 25, count: 3, timing: 2000, loop: false },
        idleDown:  { x: 0, y:  0, width: 24, height: 25, count: 3, timing: 2000, loop: false },

        /* Moving sprite sequences for facing different directions */
        moveLeft:  { x: 0, y: 125, width: 24, height: 25, count: 10, timing: 50, loop: true },
        moveUp:    { x: 0, y: 150, width: 24, height: 25, count: 10, timing: 50, loop: true },
        moveRight: { x: 0, y: 175, width: 24, height: 25, count: 10, timing: 50, loop: true },
        moveDown:  { x: 0, y: 100, width: 24, height: 25, count: 10, timing: 50, loop: true },

        /* Single Image */
        single: {x: 0, y: 0, width: 267, height: 461, count: 0, timing: 2000, loop: false},
        bruh: {x: 0, y: 0, width: 2048, height: 2048, count: 6, timing: 50, loop: true},
    };

    // Player attributes
    const player_id = id;
    let speed = 150;
    let hp = 3;
    let kills = 0;

    // This is the sprite object of the player created from the Sprite module.
    const sprite = Sprite(ctx, x, y);

    // The sprite object is configured for the player sprite here.
    sprite.setSequence(sequences.idleDown)
          .setScale(2)
          .setShadowScale({ x: 0.75, y: 0.20 })
          .useSheet("./Assets/TopDown/lab4.png");

    // This is the moving direction, which can be a number from 0 to 4:
    // - `0` - not moving
    // - `1` - moving to the left
    // - `2` - moving up
    // - `3` - moving to the right
    // - `4` - moving down

    //  Might change to this?
    // - `0` - not moving
    // - `1` - moving to the left
    // - `2` - moving up
    // - `3` - moving to the right
    // - `4` - moving down
    // - `5` - moving down left
    // - `6` - moving up left
    // - `7` - moving up right
    // - `8` - moving down right

    let direction = 0;

    // This function sets the player's moving direction.
    // - `dir` - the moving direction (1: Left, 2: Up, 3: Right, 4: Down)
    const move = function(dir) {
        if (dir >= 1 && dir <= 8 && dir != direction) {
            switch (dir) {
                case 1: sprite.setSequence(sequences.moveLeft); break;
                case 2: sprite.setSequence(sequences.moveUp); break;
                case 3: sprite.setSequence(sequences.moveRight); break;
                case 4: sprite.setSequence(sequences.moveDown); break;
                case 5: sprite.setSequence(sequences.moveLeft); break;
                case 6: sprite.setSequence(sequences.moveUp); break;
                case 7: sprite.setSequence(sequences.moveUp); break;
                case 8: sprite.setSequence(sequences.moveRight); break;
            }
            direction = dir;
        }
    };

    // This function stops the player from moving.
    // - `dir` - the moving direction when the player is stopped (1: Left, 2: Up, 3: Right, 4: Down)
    const stop = function(dir) {
        if (direction == dir) {
            switch (dir) {
                case 1: sprite.setSequence(sequences.idleLeft); break;
                case 2: sprite.setSequence(sequences.idleUp); break;
                case 3: sprite.setSequence(sequences.idleRight); break;
                case 4: sprite.setSequence(sequences.idleDown); break;
                case 5: sprite.setSequence(sequences.idleLeft); break;
                case 6: sprite.setSequence(sequences.idleUp); break;
                case 7: sprite.setSequence(sequences.idleUp); break;
                case 8: sprite.setSequence(sequences.idleRight); break;
            }
            direction = 0;
        }
    };

    // This function speeds up the player.
    const speedUp = function() {
        speed = 250;
    };

    // This function slows down the player.
    const slowDown = function() {
        speed = 150;
    };

    // This function updates the player depending on his movement.
    // - `time` - The timestamp when this function is called
    const update = function(time) {
        /* Update the player if the player is moving */
        if (direction != 0) {
            let { x, y } = sprite.getXY();

            console.log(direction)
            /* Move the player */
            switch (direction) {
                case 1: x -= speed / 60; break;
                case 2: y -= speed / 60; break;
                case 3: x += speed / 60; break;
                case 4: y += speed / 60; break;
                case 5: x -= Math.sqrt(2) *speed / 120; y += Math.sqrt(2) *speed / 120; break;
                case 6: y -= Math.sqrt(2) *speed / 120; x -= Math.sqrt(2) *speed / 120; break;
                case 7: x += Math.sqrt(2) *speed / 120; y -= Math.sqrt(2) *speed / 120; break;
                case 8: y += Math.sqrt(2) *speed / 120; x += Math.sqrt(2) *speed / 120; break;
            }

            /* Set the new position if it is within the game area */
            if (gameArea.isPointInBox(x, y)){
                //console.log("Updating pos of :" + player_id)
                Socket.update_player_pos(x, y, player_id)
                sprite.setXY(x, y);
            }
        }

        /* Update the sprite object */
        sprite.update(time);
    };

    const getId = function(){
        return player_id;
    }
    const setDirection = function(dir){
        direction = dir
    }

    const decreaseHp = function(dmg){
        hp -= dmg;
    }
    const setHp = function(cheat_hp){
        hp = cheat_hp;
        //console.log("set hp to " + hp)
    }
    const getHp = function(){
        console.log(id+"hp:"+hp);
        return hp;
    }
    const increaseKill = function(){
        kills +=1;
        console.log(id+"increase kills:"+kills);
    }
    const getKills = function(){// for printing score
        return kills;
    }

    // The methods are returned as an object here.
    return {
        move: move,
        stop: stop,
        speedUp: speedUp,
        slowDown: slowDown,
        getBoundingBox: sprite.getBoundingBox,
        draw: sprite.draw,
        update: update,
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        setDirection: setDirection,
        getId: getId,
        decreaseHp: decreaseHp,
        setHp: setHp,
        getHp: getHp,
        increaseKill: increaseKill,
        getKills: getKills

    };
};
