const Bullet = function(ctx, x, y, cursor_x, cursor_y, id, stats) {

    const speed = stats.speed;
    const range = stats.range;
    const dmg = stats.dmg;
    let angle = 0;
    let shotgun_spread = false;
    const origin_x = x;
    const origin_y = y;
    let Hit = false;
    let reach_range = false;

    const bulletImage = new Image();
    bulletImage.src = "./Assets/TopDown/bullet.png";

    // This function sets the position.
    // - `xvalue` - The new x position
    // - `yvalue` - The new y position
    const getXY = function() {
        return {x, y};
    };

    const getId = function() {
        return id;
    };

    const isHit = function() {
        return Hit;
    };

    const setHit = function() {
        Hit = true;
    };

    const getDmg = function() {
        return dmg;
    };

    // This function sets the position.
    // - `xvalue` - The new x position
    // - `yvalue` - The new y position
    const setXY = function(xvalue, yvalue) {
        [x, y] = [xvalue, yvalue];
        return this;
    };

    const setDestination = function(x, y){
        destination.x = x;
        destination.y = y;
    }

    // This function draws the bullet.
    const draw = function() {
        /* Save the settings */
        ctx.save();


        /* TODO */
        const dx = cursor_x - origin_x;
        const dy = cursor_y - origin_y;
        angle = Math.atan2(dy, dx);
        //console.log(angle);

        // Calculate the distance to the cursor position
        const trv_x = x - origin_x;
        const trv_y = y - origin_y;
        const travel_distance = Math.sqrt(trv_x * trv_x + trv_y * trv_y);

        // Update the bullet's position based on the angle and speed, unless it exceeds the maximum distance
        if (travel_distance <= range) {
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;
            x += velocityX;
            y += velocityY;
        }else{
            reach_range = true;
        }

        // ctx.fillStyle = "yellow";
        // ctx.fillRect(x, y, 10, 10);
        ctx.drawImage(bulletImage,0, 0, 7, 2, x, y, 10, 10)

        /* Restore saved settings */
        ctx.restore();
    };

    const inRange = function() {// handle hit or outside
        return !reach_range;
    };


    // The methods are returned as an object here.
    return {
        getXY: getXY,
        getId: getId,
        isHit: isHit,
        getDmg: getDmg,
        setHit: setHit,
        setXY: setXY,
        setDestination: setDestination,
        draw: draw,
        inRange: inRange
    };
};
