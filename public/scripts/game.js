const GAME = (function() {
    let totalGameTime = 60*3;   // Total game time in seconds
    let gameStartTime = 0; 
    let cv = null;
    let ctx = null;
    let gameArea = null;
    let mouse_pos = { x: 0, y: 0 };
    let players = [];
    let self = null;
    let bullets =[];
    let weapons =[];//<< Put at server side?

    const gamePageInit = function(users){
        $("counter").show();
        cv = $("canvas").get(0);
        ctx = cv.getContext("2d");
        /* Create the game area */
        gameArea = BoundingBox(ctx, 50, 50, 950, 950);

        /* Create the sprites in the game */
        for( const player_id of Object.values(users)){
            console.log("drawing "+ player_id);
            players.push(Player(ctx, 500, 500, gameArea, player_id));
        }
        self = players.find(player => player.getId() == Authentication.getUser().username);
        

        weapons.push(Weapon(ctx, 500, 500, self.getId()));
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
            self.move(2); // Move up
        }
        // S key
        if (event.keyCode === 83) {
            self.move(4); // Move down
        }
        // A key
        if (event.keyCode === 65) {
            self.move(1); // Move left
        }
        // D key
        if (event.keyCode === 68) {
            self.move(3); // Move right
        }
        // B key shoot bullet
        if (event.keyCode === 66) {
            let{x, y} = self.getXY();
            const new_bullet = Bullet(ctx, x, y, mouse_pos.x, mouse_pos.y,self.getId());
            Socket.add_new_bullet(x, y, mouse_pos.x, mouse_pos.y,self.getId());// emit
            bullets.push(new_bullet);
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
            self.stop(2); // Move up
        }
        // S key
        if (event.keyCode === 83) {
            self.stop(4); // Move down
        }
        // A key
        if (event.keyCode === 65) {
            self.stop(1); // Move left
        }
        // D key
        if (event.keyCode === 68) {
            self.stop(3); // Move right
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
        for( const player of players){
            player.update(now);
            //emit
        }
        /* Delete out of bound bullets */
        for( const del_bullet of bullets){
            const bullet_pos = del_bullet.getXY();
            if(!gameArea.isPointInBox(bullet_pos.x, bullet_pos.y)){
                console.log("delete bullet");
                bullets.splice(bullets.findIndex(bullet => bullet == del_bullet), 1);
            }
        }
        /* Handle bullet hits */
        for( const hit_bullet of bullets){
            const bullet_pos = hit_bullet.getXY();
            if(self.getBoundingBox().isPointInBox(bullet_pos.x, bullet_pos.y) && hit_bullet.getId()!=self.getId() && !hit_bullet.isHit()){
                //console.log("hit");
                hit_bullet.setHit();
                self.decreaseHp(1);
                Socket.update_player_hp(self.getId(), self.getHp());// emit
                if( self.getHp() <= 0){// use getHp to display Hp bar for each player?
                    players.find(player => player.getId() == hit_bullet.getId()).increaseKill();
                    //Socket.update_player_kills(hit_bullet.getId());// emit
                    self.setHp(3);// respawn
                    Socket.update_player_hp(self.getId(), self.getHp());// emit
                }
                bullets.splice(bullets.findIndex(bullet => bullet == hit_bullet), 1);
            }
        }
        // Pick up weapon
        //let weapon_pos = weapons[0].getXY();
        //if( (player.getBoundingBox()).isPointInBox(weapon_pos.x, weapon_pos.y)){    
        //    weapons[0].randomize(gameArea);
        //}
        weapons.find(weapon => weapon.getId() == self.getId()).setXY(self.getXY().x,self.getXY().y);

        /* Clear the screen */
        ctx.clearRect(0, 0, cv.width, cv.height);

        /* Draw the objects */
        //1. Player
        for( const player of players){
            player.draw();
        }
        //2. Bullets
        for( const bullet of bullets){
            bullet.draw();
        }
        //3. Weapons
        for( const weapon of weapons){
            weapon.draw(mouse_pos.x, mouse_pos.y);
        }

        requestAnimationFrame(doFrame);
    }

    const updateOtherPlayers = function(x, y, player_id) {
        //console.log("updateOtherPlayers");
        //console.log(player_id);
        if(player_id != self.getId()){
            players.find(player => player.getId() == player_id).setXY(x, y);
            //players.find(player => player.getId() == player_id).setDirection(direction)
        }
    }

    const updateOtherHp = function(player_id, hp) {
        console.log("updateOtherHp")
        if(player_id != self.getId()){
            players.find(player => player.getId() == player_id).setHp(hp)
        }
    }

    const updateOtherKills = function(player_id) {
        console.log("updateOtherKills")
        if(player_id != self.getId()){
            players.find(player => player.getId() == player_id).increaseKill()
        }
    }

    const addOtherBullets = function(x, y, mouse_x, mouse_y, id) {
        if(id != self.getId()){
            bullets.push(Bullet(ctx, x, y, mouse_x, mouse_y, id));
        }
    }

    return { gamePageInit, doFrame, updateOtherPlayers, addOtherBullets, updateOtherHp, updateOtherKills};
})();