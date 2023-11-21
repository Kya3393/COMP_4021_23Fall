const GAME = (function() {
    let totalGameTime= 60*3;   // Total game time in seconds
    let gameStartTime= 0;     // The timestamp when the game starts
    let killCounts= 0;      // The number of gems collected in the game
    let cv= null;
    let ctx= null;
    let gameArea= null;
    let mouse_pos= { x: 0, y: 0 };
    let player= null;
    let bullets=[];
    let weapons=[];//<< Put at server side?

    const gamePageInit = function(){
        cv = $("canvas").get(0);
        ctx = cv.getContext("2d");
        /* Create the game area */
        gameArea = BoundingBox(ctx, 50, 50, 950, 950);

        /* Create the sprites in the game */
        player = Player(ctx, 500, 500, gameArea, "username"); // The player
        //weapons.push(Weapon(ctx, 500, 500));
        //weapons[0].randomize(gameArea);

        cv.addEventListener('mousemove', function(event) {
            // Get the position of the mouse relative to the canvas
            const rect = cv.getBoundingClientRect();
            mouse_pos.x = event.clientX - rect.left;
            mouse_pos.y = event.clientY - rect.top;
            //console.log('Mouse position:', mouse_pos.x, mouse_pos.y);
        });

        /* Handle the keydown of arrow keys and spacebar */
        $(document).on("keydown", function(event) {
        /* Handle the key down */
        // W key
        if (event.keyCode === 87) {
            player.move(2); // Move up
        }
        // S key
        if (event.keyCode === 83) {
            player.move(4); // Move down
        }
        // A key
        if (event.keyCode === 65) {
            player.move(1); // Move left
        }
        // D key
        if (event.keyCode === 68) {
            player.move(3); // Move right
        }
        // B key shoot bullet
        if (event.keyCode === 66) {
            let{x, y} = player.getXY();
            const test_bullet = Bullet(ctx, x, y, mouse_pos.x, mouse_pos.y);
            bullets.push(test_bullet);
            //console.log("shoot");
        }

        // // spacebar key ( cheat )
        // if(event.keyCode == 32){
        //     player.speedUp();
        // }

        });

        /* Handle the keyup of arrow keys and spacebar */
        $(document).on("keyup", function(event) {
        /* Handle the key up */
        // W key
        if (event.keyCode === 87) {
            player.stop(2); // Move up
        }
        // S key
        if (event.keyCode === 83) {
            player.stop(4); // Move down
        }
        // A key
        if (event.keyCode === 65) {
            player.stop(1); // Move left
        }
        // D key
        if (event.keyCode === 68) {
            player.stop(3); // Move right
        }
        // // spacebar key ( cheat )
        // if(event.keyCode == 32){
        //     player.slowDown();
        // }
        });

        /* Start the game */
        requestAnimationFrame(doFrame);
    }

    /* The main processing of the game */
    const doFrame = function(now) {
        if (gameStartTime == 0) gameStartTime = now;
        
        /* Update the time remaining */
        const gameTimeSoFar = now - gameStartTime;
        const timeRemaining = Math.ceil((totalGameTime * 1000 - gameTimeSoFar) / 1000);
        $("#time-remaining").text(timeRemaining);

        /* TODO */
        /* Handle the game over situation here */
        /*if(timeRemaining <= 0){
            $("#final-gems").text(collectedGems.toString());
            $("#game-over").show();
            sounds.gameover.play();
            return;
        }*/

        /* Update the sprites */
        //for( const player of players){
            player.update(now);
        //}
        /* Delete out of bound bullets */
        for( const del_bullet of bullets){
            const bullet_pos = del_bullet.getXY();
            if(!gameArea.isPointInBox(bullet_pos.x, bullet_pos.y)){
                console.log("delete bullet");
                bullets.splice(bullets.findIndex(bullet => bullet == del_bullet), 1);
            }
            
        }

        // Pick up weapon
        //let weapon_pos = weapons[0].getXY();
        //if( (player.getBoundingBox()).isPointInBox(weapon_pos.x, weapon_pos.y)){    
        //    weapons[0].randomize(gameArea);
        //}

        /* Clear the screen */
        ctx.clearRect(0, 0, cv.width, cv.height);

        /* Draw the objects */
        //1. Player
       // for( const player of players){
            player.draw();
        //}
        //2. Bullets
        for( const bullet of bullets){
            bullet.draw();
        }
        //3. Weapons
        for( const weapon of weapons){
            weapon.draw();
        }

        requestAnimationFrame(doFrame);
    }

    return { gamePageInit, doFrame};
})();