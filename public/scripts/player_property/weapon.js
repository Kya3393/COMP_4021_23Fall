const Weapon = function(ctx, x, y) {

    const types = {
        pistol:  { range: 500, speed: 2, rate: 5, dmg: 20 },
        rifle:    { range: 1000, speed: 5, rate: 10, dmg: 40 },
        shotgun: { range: 200, speed: 2, rate: 1, dmg: 10 }
    };

    let stats = {range: 0, speed: 0, rate: 0, dmg: 0};
    // This function sets the position.
    // - `xvalue` - The new x position
    // - `yvalue` - The new y position
    const getXY = function() {
        return {x, y};
    };

    // This function sets the position.
    // - `xvalue` - The new x position
    // - `yvalue` - The new y position
    const setXY = function(xvalue, yvalue) {
        [x, y] = [xvalue, yvalue];
        return this;
    };

    const setType = function(type){
        stats = types[type];
    }

    const getStats = function(){
        return stats;
    }
    
    // This function randomizes the type and position.
    const randomize = function(area) {
        /* Randomize the color */
        const key = ["pistol", "rifle", "shotgun"];
        this.setType(key[Math.floor(Math.random() * 3)]);
        /* Randomize the position */
        const {x, y} = area.randomPoint();
        this.setXY(x, y);
    };

    const draw = function() {
        /* Save the settings */
        ctx.save();

        if(stats == types["pistol"])ctx.fillStyle = "blue";
        if(stats == types["rifle"])ctx.fillStyle = "red";
        if(stats == types["shotgun"])ctx.fillStyle = "green";
        ctx.fillRect(x, y, 10, 10);

        /* Restore saved settings */
        ctx.restore();
    };

    // The methods are returned as an object here.
    return {
        getXY: getXY,
        setXY: setXY,
        setType: setType,
        getStats: getStats,
        randomize: randomize,
        draw: draw,
    };
};
