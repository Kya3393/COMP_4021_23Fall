const Bullet = function(ctx, x, y, cursor_x, cursor_y) {

    let speed = 5;
    let angle = 0;
    const origin_x = x;
    const origin_y = y;

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

    const setDestination = function(x, y){
        destination.x = x;
        destination.y = y;
    }

    const range = 1000;
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
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Update the bullet's position based on the angle and speed, unless it exceeds the maximum distance
        if (distance <= range) {
        const velocityX = Math.cos(angle) * speed;
        const velocityY = Math.sin(angle) * speed;
        x += velocityX;
        y += velocityY;
        }

        ctx.fillStyle = "yellow";
        ctx.fillRect(x, y, 10, 10);

        /* Restore saved settings */
        ctx.restore();
    };

    const update = function() {// handle hit or outside
   
    };


    // The methods are returned as an object here.
    return {
        getXY: getXY,
        setXY: setXY,
        setDestination: setDestination,
        draw: draw,
        update: update
    };
};
