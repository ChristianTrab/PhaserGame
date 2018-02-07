var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {

    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
	game.load.image('ghost', 'assets/images/ghost.png');
	
	//Loads the level_1 json
	//this.load.text('level1', 'assets/data/level1.json');
	//this.load.text('level2', 'assets/data/level2.json');
	
	//tiled map information
	this.load.text('tiledData1', 'assets/data/tiled1.json');
	game.load.tilemap('tiledMap1', 'assets/data/tiled1.json', null, Phaser.Tilemap.TILED_JSON);
	
	this.load.text('tiledData2', 'assets/data/tiled2.json');
	game.load.tilemap('tiledMap2', 'assets/data/tiled2.json', null, Phaser.Tilemap.TILED_JSON);
	
	this.load.text('tiledData3', 'assets/data/tiled3.json');
	game.load.tilemap('tiledMap3', 'assets/data/tiled3.json', null, Phaser.Tilemap.TILED_JSON);
	
	this.load.text('tiledData4', 'assets/data/tiled4.json');
	game.load.tilemap('tiledMap4', 'assets/data/tiled4.json', null, Phaser.Tilemap.TILED_JSON);
	
	game.load.image('tiles', 'assets/images/generic_platformer_tiles.png');

}


//Key bindings
var enterKey;

//Variables
var player;
var platforms;
var cursors;
var map;
var collisionLayer;

var stars;
var score;
var scoreText;
var succeededText;
var deathCount = 0;
var deathCountText;
var scoreToWin;
var playerStartX;
var playerStartY;

var currentLevel = 1;
var totalLevels = 4;

var levelData;

function create() {
	
	levelData = JSON.parse(this.game.cache.getText('tiledData' + currentLevel));
	map = game.add.tilemap('tiledMap' + currentLevel);
	map.addTilesetImage('generic_platformer_tiles', 'tiles');

	layer = map.createLayer('background');
	layer = map.createLayer('midground');
	
	
	var collision_tiles = [];
	levelData.layers[2].data.forEach(function(element){
	if(element >= 0 && collision_tiles.indexOf(element) === -1){
		collision_tiles.push(element);
	 }
	}, this);
	map.setCollision(collision_tiles, true, 'collision');
	
	collisionLayer = map.createLayer('collision');
	map.setLayer('collision');
	layer.resizeWorld();

	
	//playerStartX = levelData.playerStart.x;
	//playerStartY = levelData.playerStart.y;
	
	
	//Style for completed level text
	var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);
	

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;
	
	
	
	//Sets the platform to not falling onto our heads
	platforms.setAll('body.immovable', true);

	
	// The player and its settings
	player = game.add.sprite(levelData.playerStart.x, levelData.playerStart.y, 'dude');
	

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.05;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    //  Finally some stars to collect
    stars = game.add.group();
	enemies = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < levelData.starData.amount; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * levelData.starData.spacing, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 300;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }

	//enemies creation
	
	enemies.enableBody = true;
	// this.levelData.enemyData.forEach(function (element) {
		// enemies.create(new EnemyGhost(0, game, element.x, element.y, element.direction, element.length, element.speed));
	// }, this);
	
	levelData.enemyData.forEach(function (element) {
		var enemyProp = enemies.create(element.x, element.y, 'ghost');
		enemyProp.anchor.setTo(0.5, 0.5);
		enemyProp.scale.setTo(0.1);
		direction = element.direction;
		length = element.length;
		speed = element.speed;
		if(direction == 1)
		{
			enemyProp.ghostTween = game.add.tween(enemyProp).to({
			y: enemyProp.y + length}, speed, 'Linear', true, 0, 100, true);
		}
		else if (direction == 2)
		{
			enemyProp.ghostTween = game.add.tween(enemyProp).to({
			x: enemyProp.x + length}, speed, 'Linear', true, 0, 100, true);
		}
	}, this);
	
    //  The score
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '24px', fill: '#000' });
	scoreText.fixedToCamera = true;

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
	
	//Succeed Text
	succeededText = game.add.text(0, 0, '', style);
	succeededText.setTextBounds(0, 100, 800, 100);
	succeededText.fixedToCamera = true;
	
	//Death Counter text
	deathCountText = game.add.text(665,16, 'deaths: ' + deathCount, { fontSize: '24px', fill: '#000' });
	deathCountText.fixedToCamera = true;
	
	
	//Enter key
	enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
	
	// Sets the score to 0
	score = 0;
	
	//Creates the next level
	scoreToWin = levelData.starData.amount * 10;

	
	game.camera.follow(player);
};

function update() {

    //  Collide the player and the stars with the platforms
    var hitPlatform = game.physics.arcade.collide(player, collisionLayer);
    game.physics.arcade.collide(stars, collisionLayer);
	
	// if(game.physics.arcade.collide(enemies, player)){
		// ResetPlayer();
	// }

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, stars, collectStar, null, this);
	game.physics.arcade.overlap(player, enemies, ResetPlayer, null, this);
	
    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;
	
	//Used to check x and y co-ordinates to place enemies
	// if (cursors.down.isDown)
    // {
        // scoreText.text = player.x + ' ' + (player.y +24)
    // }
	
	
    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;

        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;

        player.animations.play('right');
    }
    else
    {
        //  Stand still
        player.animations.stop();

        player.frame = 4;
    }
    
    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.onFloor())//&& player.body.touching.down)
    {
        player.body.velocity.y = -350;
    }
	
	if (player.bottom >= game.world.height) {
        ResetPlayer();
    }

	 nextLevel(player, score);

};

function ResetPlayer()
{
	console.log("Killed");
	deathCount++;
	game.state.restart();
}

function collectStar (player, star) {
    
    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;
	completedLevel(player, score);
	

};


 // function completedLevel(player, score) {
	 // if(score == scoreToWin) {
	 // succeededText.text = 'You Succeeded with: ' + score + ' points! \n        Press Enter to advance';
	 // } else {
		 // //Do nothing
	 // }
 // }

 function completedLevel(player, score) {
	 if(score == 100) {
	 succeededText.text = 'You Succeeded with: ' + score + ' points! \n        Press Enter to advance';
	 scoreText.text = 'Level by ' + levelData.author;
	 } else {
		 //Do nothing
	 }
 };

 function nextLevel(player, score) {
	if(score >= 100 && enterKey.isDown) {
		//Do shit
		if(currentLevel < totalLevels)
		{
			currentLevel++;	
		}
		else{
			currentLevel = 1;
		}
		game.state.restart();
	};
}