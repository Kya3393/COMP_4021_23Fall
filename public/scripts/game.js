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
    let bullet_amount = 30;
    let weapons =[];//<< Put at server side?
    let reload_timeout = 2000


    const sounds = {
        reload: new Audio("Assets/sfx/reload.mp3"),
        pistol: new Audio("Assets/sfx/pistol_shot.mp3"),
        pistol_no_ammo: new Audio("Assets/sfx/pistol_no_ammo.mp3"),
    }

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
        cv.addEventListener("click", function(event) {
            let{x, y} = self.getXY();
            if(bullet_amount > 0){
                const new_bullet = Bullet(ctx, x, y, mouse_pos.x, mouse_pos.y,self.getId());
                Socket.add_new_bullet(x, y, mouse_pos.x, mouse_pos.y,self.getId());// emit
                
                bullets.push(new_bullet);
                bullet_amount--;

                sounds.pistol.currentTime = 0
                sounds.pistol.play()
                $("#bullet-remaining").text(bullet_amount);
            }else{
                sounds.pistol_no_ammo.currentTime=0
                sounds.pistol_no_ammo.play()
                $("#bullet-remaining").text("Press R to reload");
            }
        });

        var map = {}; // You could also use an array
        var last_dir = 0;
        onkeydown = onkeyup = function(e){
            map[e.key] = e.type == 'keydown';
            /* insert conditional here */
            switch(true){
                //
                case !map['w'] && map['a'] && map['s'] && !map['d']: self.move(5);  last_dir = 5;break;

                case map['w'] && map['a'] && !map['s'] && !map['d']: self.move(6);  last_dir = 6;break;
                
                case map['w'] && !map['a'] && !map['s'] && map['d']: self.move(7);  last_dir = 7;break;
                
                case !map['w'] && !map['a'] && map['s'] && map['d']: self.move(8);  last_dir = 8;break;

                // left (a)
                case !map['w'] && map['a'] && !map['s'] && !map['d']: self.move(1);  last_dir = 1;break;
                // up (w)
                case map['w'] && !map['a'] && !map['s'] && !map['d']: self.move(2);  last_dir = 2;break;
                // right (d)
                case !map['w'] && !map['a'] && !map['s'] && map['d']: self.move(3);  last_dir = 3;break;
                // down (s)
                case !map['w'] && !map['a'] && map['s'] && !map['d']: self.move(4);  last_dir = 4;break;
                
                case !map['w'] && !map['a'] && !map['s'] && !map['d']: self.stop(last_dir); map = {}; last_dir = 0;break;
            }
            
        }


        // weapon reload with timeout
        var reloading = false
        $(document).on("keypress", function(event){
            // console.log("reloading: " + reloading)
            // console.log("event : " + event.keyCode)
            
            if(reloading == false){
                if (event.keyCode == 114  ||  event.keyCode  ==  82) {
                    reloading = true
                    sounds.reload.play()
                    setTimeout(async function(){
                        if(bullet_amount < 30){
                            bullet_amount = 30;
                            await $("#bullet-remaining").text(bullet_amount);
                        }
                        reloading = false
                    }, reload_timeout)
                    
                }
            }
        })

        /* Handle the keydown of arrow keys and spacebar */
        $(document).on("keydown", function(event) {
        // /* Handle the key down */
        // // W key
        // if (event.keyCode == 87) {
        //     self.move(2); // Move up
        // }
        // // S key
        // if (event.keyCode == 83) {
        //     self.move(4); // Move down
        // }
        // // A key
        // if (event.keyCode == 65) {
        //     self.move(1); // Move left
        // }
        // // D key
        // if (event.keyCode == 68) {
        //     self.move(3); // Move right
        // }
        // R key reload bullet
        
        // var reloading = false
        // if(reloading === false){
        //     if (event.keyCode == 82) {
        //         reloading = true
        //         sounds.reload.play()
        //         setTimeout(async function(){
        //             if(bullet_amount < 30){
        //                 bullet_amount = 30;
        //                 await $("#bullet-remaining").text(bullet_amount);
        //             }
        //             reloading = false
        //         }, reload_timeout)
                
        //     }
        // }

        // // // spacebar key ( cheat )
        // // if(event.keyCode == 32){
        // //     player.speedUp();
        // // }

        // });

        // /* Handle the keyup of arrow keys and spacebar */
        // $(document).on("keyup", function(event) {
        // /* Handle the key up */
        // // W key
        // if (event.keyCode == 87) {
        //     self.stop(2); // Move up
        // }
        // // S key
        // if (event.keyCode == 83) {
        //     self.stop(4); // Move down
        // }
        // // A key
        // if (event.keyCode == 65) {
        //     self.stop(1); // Move left
        // }
        // // D key
        // if (event.keyCode == 68) {
        //     self.stop(3); // Move right
        // }
        // // // spacebar key ( cheat )
        // // if(event.keyCode == 32){
        // //     player.slowDown();
        // // }
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

        /* Handle the game over situation here */
        if(timeRemaining <= 0 ){
            Socket.endGame();
            //sounds.gameover.play();
            return;
        }
        /* Update the sprites */
        for( const player of players){
            player.update(now);
            //emit
        }
        /* Delete bullets */
        for( const del_bullet of bullets){
            const bullet_pos = del_bullet.getXY();
            if(!gameArea.isPointInBox(bullet_pos.x, bullet_pos.y)){
                //console.log("delete bullet");
                bullets.splice(bullets.findIndex(bullet => bullet == del_bullet), 1);
            }else{
                for( const player of players){
                    if(player.getBoundingBox().isPointInBox(bullet_pos.x, bullet_pos.y) && del_bullet.getId()!=player.getId()){// avoid hitting owner
                        if(player.getId() == self.getId() && !del_bullet.isHit()){// handle self is hit
                            //console.log("hit");
                            del_bullet.setHit();
                            self.decreaseHp(1);
                            $("#hp-remaining").text(self.getHp());
                            Socket.update_player_hp(self.getId(), self.getHp());// emit
            
                            if( self.getHp() <= 0){// use getHp to display Hp bar for each player?
                                let killer = players.find(player => player.getId() == del_bullet.getId())
                                //killer.increaseKill();
                                Socket.update_player_kills(killer.getId(),killer.getKills());// emit for server record
                                self.setHp(3);// respawn
                                $("#hp-remaining").text(self.getHp());
                                Socket.update_player_hp(self.getId(), self.getHp());// emit
                            }
                        }
                        bullets.splice(bullets.findIndex(bullet => bullet == del_bullet), 1);// remove hit bullets
                    }
                }
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
        //console.log("updateOtherHp")
        if(player_id != self.getId()){
            players.find(player => player.getId() == player_id).setHp(hp)
        }
    }

    const updateOtherKills = function(player_id) {
        //console.log("updateOtherKills")
        if(player_id != self.getId()){
            players.find(player => player.getId() == player_id).increaseKill()
        }
    }

    const addOtherBullets = function(x, y, mouse_x, mouse_y, id) {
        if(id != self.getId()){
            bullets.push(Bullet(ctx, x, y, mouse_x, mouse_y, id));
        }
    }

    const showSelfKills = function() {
        return self.getKills();
    }

    return { gamePageInit, doFrame, updateOtherPlayers, addOtherBullets, updateOtherHp, updateOtherKills, showSelfKills};
})();