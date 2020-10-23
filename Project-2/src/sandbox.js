(function(){
	"use strict";

    // variables
    const canvasWidth = 500, canvasHeight = 500;
	let ctx;

    // mouse
    let mouseDown = false;
    let mouseX, mouseY;

    const simplex = new SimplexNoise();
    let time = 0;
    let fps = 30;

    // map
    let rows = 50, cols = 50;
    let squareWidth = 10;
    let map = new Uint8Array(rows*cols);
    let oldmap = new Uint8Array(rows*cols);
    let emptyAcc = 0;
    let spawnAcc = 0;

    // drawing
    let color = "fire";
    let drawRadius = 5;

    // spiders
    let maxRed = 3, maxGreen = 3, maxBlue = 3;
    let bigSpiders;
    let redSpiders = [];
    let greenSpiders = [];
    let blueSpiders = [];

    let colorKey = {
        "fire"       : 0,
        "plant"     : 1,
        "water"      : 2,
        "empty"      : 3,
        0           : "fire",
        1           : "plant",
        2           : "water",
        3           : "empty"
    }

    window.onload = init;

	function init(){
        // canvas goodness
        let canvas = document.querySelector("#sandbox");
		ctx = canvas.getContext("2d");
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;

        // mouse controls
        canvas.onmousedown = startDrag;
        canvas.onmouseup = endDrag;
        canvas.onmousemove = mouseMoved;

        // sets up map
        for (let i = 0; i < rows*cols; i++){
            map[i] = colorKey['empty'];
        }

        // controls
        let colorChooser = document.querySelector("#colorChooser");
        colorChooser.onchange = function(e) {
            color = e.target.value;
        }
        
        let radiusSlider = document.querySelector("#drawRadius");
        radiusSlider.onchange = function(e) {
            drawRadius = parseInt(e.target.value);
        }

        bigSpiders = [new Spider('red', {x:250,y:100}, 0, 'big'), new Spider('green', {x:100,y:400}, 1, 'big'), new Spider('blue', {x:400,y:400}, 2, 'big')];

        // loop
        update();
	}

    // mouse
    function startDrag(e){
        // gathers inportant mouse info
        let rect = e.target.getBoundingClientRect();
        mouseX = e.clientX - rect.x;
        mouseY = e.clientY - rect.y;

        mouseDown = true;
    }
    function endDrag(e){
        mouseDown = false;
    }
    function mouseMoved(e){
        if (mouseDown)
        {
            let rect = e.target.getBoundingClientRect();

            let x = e.clientX - rect.x;
            let y = e.clientY - rect.y;

            mouseX = x;
            mouseY = y;
        }
    }

    // is called repeatedly for cool-math animation purposes
    function update(){
        setTimeout(update,1000/fps);
        time += 1.0/fps;


        updateBoard();
        drawBoard();

        for (let i = 0; i < redSpiders.length; i++){
            redSpiders[i].Update(simplex, time);
            redSpiders[i].Draw(ctx);
        }
        for (let i = 0; i < greenSpiders.length; i++){
            greenSpiders[i].Update(simplex, time);
            greenSpiders[i].Draw(ctx);
        }
        for (let i = 0; i < blueSpiders.length; i++){
            blueSpiders[i].Update(simplex, time);
            blueSpiders[i].Draw(ctx);
        }

        for (let i = 0; i < 3; i++){
            bigSpiders[i].Update(simplex, time);
            bigSpiders[i].Draw(ctx);
        }
    }

    function updateBoard(){
        // update

        // copies the array to avoid some funky fresh logic errors
        for (let i = 0; i < rows*cols; i++){
            oldmap[i] = map[i];
        }

        // does logic for the map where tiles interact
        for (let i = 0; i < rows*cols; i++){
            let tile = colorKey[oldmap[i]];
/*
            if (tile == "fire"){
                // 4 sides 
                // top
                if (i > rows && colorKey[oldmap[i - rows]] == 'plant'){
                    map[i - rows] = colorKey['fire'];
                }
                // bottom
                if (i < rows*cols - rows && colorKey[oldmap[i + rows]] == 'plant'){
                    map[i + rows] = colorKey['fire'];
                }
                // left
                if (i % rows > 0 && colorKey[oldmap[i - 1]] == 'plant'){
                    map[i - 1] = colorKey['fire'];
                }
                // right
                if (i % rows < rows - 1 && colorKey[oldmap[i + 1]] == 'plant'){
                    map[i + 1] = colorKey['fire'];
                }
            }
        

            if (time > emptyAcc && tile == 'empty'){
                // 4 sides 
                // top
                if (i > rows && colorKey[oldmap[i - rows]] != 'empty'){
                    map[i - rows] = colorKey['empty'];
                }
                // bottom
                if (i < rows*cols - rows && colorKey[oldmap[i + rows]] != 'empty'){
                    map[i + rows] = colorKey['empty'];
                }
                // left
                if (i % rows > 0 && colorKey[oldmap[i - 1]] != 'empty'){
                    map[i - 1] = colorKey['empty'];
                }
                // right
                if (i % rows < rows - 1 && colorKey[oldmap[i + 1]] != 'empty'){
                    map[i + 1] = colorKey['empty'];
                }
            }
*/
        }

        if (time > emptyAcc){
            emptyAcc += 0.3;
        }

        // spider birthing 
        if (time > spawnAcc){
            spawnAcc += 5;
            if (redSpiders.length < maxRed){
                redSpiders[redSpiders.length] = new Spider('red', {x:bigSpiders[0].position.x, y:bigSpiders[0].position.y}, Math.random()*500);
            }
            if (greenSpiders.length < maxGreen){
                greenSpiders[greenSpiders.length] = new Spider('green', {x:bigSpiders[1].position.x, y:bigSpiders[1].position.y}, Math.random()*500);
            }
            if (blueSpiders.length < maxBlue){
                blueSpiders[blueSpiders.length] = new Spider('blue', {x:bigSpiders[2].position.x, y:bigSpiders[2].position.y}, Math.random()*500);
            }
        }

        // little spiders paint
        paintSpidersFromArray(redSpiders, 'fire', 'water', 2);
        paintSpidersFromArray(greenSpiders, 'plant', 'fire', 2);
        paintSpidersFromArray(blueSpiders, 'water', 'plant', 2);

        // big spiders paint 
        Paint(bigSpiders[0].position.x, bigSpiders[0].position.y, 'fire', 4);
        Paint(bigSpiders[2].position.x, bigSpiders[2].position.y, 'water', 4);
        Paint(bigSpiders[1].position.x, bigSpiders[1].position.y, 'plant', 4);

        if (mouseDown){
            Paint(mouseX,mouseY,color,drawRadius);
        }

        // checks for spider death
        killSpiders(redSpiders, 'water', bigSpiders[0]);
        killSpiders(greenSpiders, 'fire', bigSpiders[1]);
        killSpiders(blueSpiders, 'plant', bigSpiders[2]);
    }

    function killSpiders(spiders, deathKey, parent){
        for (let i = 0; i < spiders.length; i++){ 
            let index = Math.floor(spiders[i].position.x/squareWidth) + Math.floor(spiders[i].position.y/squareWidth)*cols;
            if (colorKey[map[index]] == deathKey){
                spiders[i] = new Spider(parent.color, {x:parent.position.x, y:parent.position.y}, Math.random()*500);
            }
        }
    }

    function paintSpidersFromArray(spiders, key, ignore, radius){
        for (let i = 0; i < spiders.length; i++){ 
            Paint(spiders[i].position.x, spiders[i].position.y, key, radius, ignore); 
        }
    }

    function Paint (x, y, key, radius, ignore = '') {
        let index = Math.floor(x/squareWidth) + Math.floor(y/squareWidth)*cols;

        let indexX = Math.floor(index/rows);
        let indexY = Math.floor(index%rows);
        for (let i = 0; i < rows*cols; i++){
            let x = Math.floor(i/rows);
            let y = Math.floor(i%cols);
            let radiusSquared = (x - indexX) * (x - indexX) + (y - indexY) * (y - indexY);
            if (colorKey[map[i]] != ignore && radiusSquared < radius * radius){
                map[i] = colorKey[key];
            }
        }
    }

    function drawBoard() {
        for (let i = 0; i < rows*cols; i++){
            ctx.save();
            ctx.beginPath();
            ctx.rect(Math.floor(i%cols) * squareWidth, Math.floor(i/rows) * squareWidth, squareWidth, squareWidth);

            let tint = Math.random() * 75;
            if (colorKey[map[i]] == 'fire'){
                ctx.fillStyle = `rgb(255,${tint},${tint})`;
            }
            if (colorKey[map[i]] == 'plant'){
                ctx.fillStyle = `rgb(${tint*1.5},255,${tint*1.5})`;
            }
            if (colorKey[map[i]] == 'water'){ 
                ctx.fillStyle = `rgb(${tint},${tint}, 255)`;
            }
            if (colorKey[map[i]] == 'empty'){ 
                ctx.fillStyle = 'white';
            }
            
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

    }
 
})();