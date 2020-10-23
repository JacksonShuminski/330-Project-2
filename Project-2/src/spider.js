(function(){


let smallSpiderProperties = {
    size : 6,
    legWidth : 4,
    legHeight : 12,
    footspeed : 16,
    wanderSpeed : 6
};
let bigSpiderProperties = {
    size : 17,
    legWidth : 13,
    legHeight : 39,
    footspeed : 10,
    wanderSpeed : 2
};


class Spider {
    constructor(color, pos, delta, size = 'small'){
        // position
        this.position = pos;
        this.deltaSimplex = delta
        this.time = 0;

        // leg data
        this.footDist = [ 30, 60, 45, 37, 52, 45 ];
        this.footPos = [ //spiders have feet right? like it can't just all be leg and 'bottom of leg' is just waay too wordy so this is how it will be
            { x : pos.x + 75, y : pos.y }, 
            { x : pos.x + 50, y : pos.y + 30 }, 
            { x : pos.x + 50, y : pos.y - 30 }, 
            { x : pos.x - 75, y : pos.y }, 
            { x : pos.x - 50, y : pos.y + 30 }, 
            { x : pos.x - 50, y : pos.y - 30 }
        ];
        this.idealFootSpots = [
            { x :  75, y : 0 }, 
            { x :  50, y : 30 }, 
            { x :  50, y : -30 }, 
            { x :  -75, y : 0 }, 
            { x :  -50, y : 30 }, 
            { x :  -50, y : -30 }
        ];
        this.legUp = [ false, false, false, false, false, false, false, false ];
        this.color = color;
        
        if (size == 'small'){
            this.spiderProperties = smallSpiderProperties;
        }
        if (size == 'big'){
            this.spiderProperties = bigSpiderProperties;
        }

    }

    Update(simplex, time) {

        for (let i = 0; i < 6; i++) {
            let deltaFootx = this.footPos[i].x - this.position.x - this.idealFootSpots[i].x * this.spiderProperties.legWidth / 10;
            let deltaFooty = this.footPos[i].y - this.position.y - this.idealFootSpots[i].y * this.spiderProperties.legWidth / 10;
            
            // should this leg start to move?
            if (!this.legUp[i] && (Math.abs(deltaFootx) > this.footDist[i] * this.spiderProperties.legWidth / 10 || Math.abs(deltaFooty) > this.footDist[i] * this.spiderProperties.legWidth / 10)) {
                this.legUp[i] = true; // start moving!
            }

            // checks if leg is in motion
            if (this.legUp[i]) { 
                let mag = Math.sqrt(deltaFootx * deltaFootx + deltaFooty * deltaFooty);
                if (mag > this.spiderProperties.footspeed) {
                    this.footPos[i].x -= deltaFootx / mag * this.spiderProperties.footspeed;
                    this.footPos[i].y -= deltaFooty / mag * this.spiderProperties.footspeed;
                }
                else {
                    this.footPos[i].x + deltaFootx;
                    this.footPos[i].y + deltaFooty;
                    this.legUp[i] = false; // we made it!
                }
            }
        }


        this.position.x += simplex.noise3D(time + this.deltaSimplex * 500, 0, 0) * this.spiderProperties.wanderSpeed;
        this.position.y += simplex.noise3D(0, time - this.deltaSimplex * 500, 0) * this.spiderProperties.wanderSpeed;
        
        if (this.position.x < 50) { this.position.x = 50; }
        if (this.position.y < 50) { this.position.y = 50; }
        if (this.position.x > 500 - 50) { this.position.x = 500 - 50; }
        if (this.position.y > 500 - 50) { this.position.y = 500 - 50; }
    }

    Draw(ctx){
        // draws legs
        for (let i = 0; i < 6; i++) {
            this.drawLeg(ctx, this.footPos[i], `rgb(${i%3 * 10},${i%3 * 10},${i%3 * 10})`); 
        }

        // spider body
        this.drawCircle(ctx, this.position.x, this.position.y, this.spiderProperties.size, this.color, 'black')
    }

    drawLeg(ctx, data, color){
        ctx.save();
		ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = this.spiderProperties.legWidth;
        ctx.lineJoin = 'round'
        ctx.moveTo(this.position.x, this.position.y + 5);
        ctx.lineTo((data.x + this.position.x)/2, (data.y + this.position.y)/2 - this.spiderProperties.legHeight);
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
		ctx.restore();
    }

	drawCircle(ctx,x,y,radius,color,color2='rgba(0,0,0,0)'){
		ctx.save();
		ctx.fillStyle = color;
        ctx.strokeStyle=color2;
        ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.arc(x,y,radius,0,Math.PI * 2);
		ctx.closePath();
		ctx.fill();
        ctx.stroke();
		ctx.restore();
	}
}


if (window){
    window["Spider"] = Spider;
}
else {
    throw "'window' is not defined";
}

})();