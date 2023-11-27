const Weapon = function(ctx, x, y, type, stats, id) {

    let owner_id = null;
    const spawn_x = x;
    const spawn_y = y;
    let rotate_angle;

    // const types = {
    //     pistol:  { range: 500, speed: 2, rate: 5, dmg: 20 },
    //     rifle:    { range: 1000, speed: 5, rate: 10, dmg: 40 },
    //     shotgun: { range: 200, speed: 2, rate: 1, dmg: 10 }
    // };

    // let stats = {range: 0, speed: 0, rate: 0, dmg: 0};
    const getXY = function() {
        return {x, y};
    };

    // This function sets the position.
    // - `xvalue` - The new x position
    // - `yvalue` - The new y position
    const setXY = function(xvalue, yvalue) {
        //console.log("Weapon setXY")
        x = xvalue
        y = yvalue;
    };

    const setOwner = function(player_id) {
        owner_id = player_id;
        //console.log(owner_id)
    };

    const getOwner = function() {
        return owner_id;
    };

    const getId = function() {
        return id;
    };

    const setType = function(type){
        stats = types[type];
    }

    const getStats = function(){
        return stats;
    }
    
    const setAngle = function(Angle) {
        rotate_angle = Angle;
        //console.log(owner_id)
    };

    const getAngle = function() {
        return rotate_angle;
    };

    // This function randomizes the type and position.
    const randomize = function(area) {
        /* Randomize the color */
        const key = ["pistol", "rifle", "shotgun"];
        this.setType(key[Math.floor(Math.random() * 3)]);
        /* Randomize the position */
        const {x, y} = area.randomPoint();
        this.setXY(x, y);
    };

    const update = function(direction) {

    };

    const draw = function(mouse_x ,mouse_y, self) {
        /* Save the settings */
        ctx.save();

        if(type == "pistol")ctx.fillStyle = "blue";
        if(type == "rifle")ctx.fillStyle = "red";
        if(type == "shotgun")ctx.fillStyle = "green";

        if( owner_id != null){
            
            ctx.setTransform(1, 0, 0, 1, x, y);
            //console.log(angle)
            
            if( owner_id != self){
                ctx.rotate(rotate_angle);
            }else{
                const dx = mouse_x - x;
                const dy = mouse_y - y;

                const angle = Math.atan2(dy, dx);
                Socket.broadcastMouseAngle(id, angle);
                ctx.rotate(angle);
            }
            ctx.fillRect(0, 0, 100, 10);
        }
        else{
           ctx.fillRect(x, y, 10, 10); 
        }

        

        /* Restore saved settings */
        ctx.restore();
    };

    // The methods are returned as an object here.
    return {
        getXY: getXY,
        setXY: setXY,
        getId: getId,
        setOwner: setOwner,
        getOwner: getOwner,
        setAngle: setAngle,
        getAngle: getAngle,
        setType: setType,
        getStats: getStats,
        update: update,
        randomize: randomize,
        draw: draw,
    };
};
