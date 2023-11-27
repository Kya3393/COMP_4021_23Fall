// This function defines a Sprite module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the sprite
// - `y` - The initial y position of the sprite
const Obstacle = function(ctx, x, y) {

    const ObstacleImage = new Image();
    ObstacleImage.src = "./Assets/TopDown/Tile.png";
    let height = 100;
    let width = 100;

    // This function gets the current sprite position.
    const getXY = function() {
        return {x, y};
    };

    // This function sets the sprite position.
    // - `xvalue` - The new x position
    // - `yvalue` - The new y position
    const setXY = function(xvalue, yvalue) {
        [x, y] = [xvalue, yvalue];
    };

    // This function gets the bounding box of the sprite.
    const getBoundingBox = function() {

        /* Find the box coordinates */
        const top = y - height / 2;
        const left = x - width / 2;
        const bottom = y + height / 2;
        const right = x + width / 2;

        return BoundingBox(ctx, top, left, bottom, right);
    };

    const draw = function() {
        /* Save the settings */
        ctx.save();


        // ctx.fillStyle = "red";
        // ctx.globalAlpha = 0.6;
        // ctx.fillRect(parseInt(x - width / 2), parseInt(y - height / 2),
        //              width, height);
        // ctx.imageSmoothingEnabled = false;
        
        ctx.drawImage(ObstacleImage, 0, 1792-256, 256, 256, x - width / 2, y - height / 2, 100, 100);

        /* Restore saved settings */
        ctx.restore();
    };
    
    return {
        getXY: getXY,
        setXY: setXY,
        getBoundingBox: getBoundingBox,
        draw: draw,

    };
};
