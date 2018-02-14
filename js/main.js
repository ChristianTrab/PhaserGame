var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {

	//Loading image assets
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
	game.load.image('ghost', 'assets/images/ghost.png');
	game.load.image('tiles', 'assets/images/generic_platformer_tiles.png');
	game.load.image('leverImage', 'assets/images/lever.png');
	game.load.spritesheet('doorImage', 'assets/images/doorAnimation.png', 96, 96);
	game.load.image('spikeC', 'assets/images/spike C.png');
	
	//tiled map information
	this.load.text('tiledData1', 'assets/data/tiled1.json');
	game.load.tilemap('tiledMap1', 'assets/data/tiled1.json', null, Phaser.Tilemap.TILED_JSON);
	
	this.load.text('tiledData2', 'assets/data/tiled2.json');
	game.load.tilemap('tiledMap2', 'assets/data/tiled2.json', null, Phaser.Tilemap.TILED_JSON);
	
	this.load.text('tiledData3', 'assets/data/tiled3.json');
	game.load.tilemap('tiledMap3', 'assets/data/tiled3.json', null, Phaser.Tilemap.TILED_JSON);
	
	this.load.text('tiledData4', 'assets/data/tiled4.json');
	game.load.tilemap('tiledMap4', 'assets/data/tiled4.json', null, Phaser.Tilemap.TILED_JSON);
	
	this.load.text('tiledData100', 'assets/data/tiled100.json');
	game.load.tilemap('tiledMap100', 'assets/data/tiled100.json', null, Phaser.Tilemap.TILED_JSON);
	
	//Game music and audio
	game.load.audio('backgroundMusic', ['assets/music/falienFunk.mp3', 'assets/music/falienFunk.mp3']);
	game.load.audio('coin', ['assets/music/coin3.wav' , 'assets/music/coin3.wav']);
	game.load.audio('dying', ['assets/music/dying.mp3' , 'assets/music/dying.mp3']);
	game.load.audio('leverAudio', ['assets/music/lever.mp3', 'assets/music/lever.mp3']);

}
//Service API

//var App42Log = require();

var apiKey = "c2fe490ced0cee1e2301d31d25ac4cbce0b4bde8ff7d263b463234564d21db74"
var secretKey = "0738c756ce5b367be98a26ce2ae2f6510cf5eeeb7ff51be44a89cf9deeaa2302"
var userName = prompt("Pleaser enter your username", "username");
var pwd = "demoPassword";
var emailId = "demo.emailId@shephertz.co.in"; 
//App42.initialize("c2fe490ced0cee1e2301d31d25ac4cbce0b4bde8ff7d263b463234564d21db74","0738c756ce5b367be98a26ce2ae2f6510cf5eeeb7ff51be44a89cf9deeaa2302");




//Key bindings
var enterKey;
var spaceKey;

//Player and game variable
var player;
var platforms;
var cursors;
var map;
var collisionLayer;

//Level data
var stars;
var score;
var scoreText;
var succeededText;
var deathCount = 0;
var deathCountText;
var scoreToWin;
var scoreToGet = 10;

//Level controller
var currentLevel = 1;
var totalLevels = 1;

//Json data
var levelData;
var playerData

//Timer 
var counter = 0;
var timerText;

//Music
var music;
var coinSound;
var death;
var leverSound;

//Trigger
var lever;
var leverStatus = false;

//Door
var door; 
var dooStatus = false;

//Leaderboard
var leaderboardList = new Array();
var leaderboardText;
var userNameText;
var pointsText;



function create() {
	
	//Creating our map from data and parses our level Data
	levelData = JSON.parse(this.game.cache.getText('tiledData' + currentLevel));
	map = game.add.tilemap('tiledMap' + currentLevel);
	map.addTilesetImage('generic_platformer_tiles', 'tiles');

	layer = map.createLayer('background');
	layer = map.createLayer('midground');
	
	//Gets collision data from JSON file "levelData" as an array
	var collisionData = levelData.layers.filter(function( obj ) {
		return obj.name == "collision";
	});
	
	//Stores indexes for which tiles in collision layer have collision set
	var collision_tiles = [];
	collisionData[0].data.forEach(function(element){
	if(element >= 0 && collision_tiles.indexOf(element) === -1){
		collision_tiles.push(element);
	 }
	}, this);
	map.setCollision(collision_tiles, true, 'collision');
	collisionLayer = map.createLayer('collision');
	map.setLayer('collision');
	layer.resizeWorld();	
	
	//Style for completed level text
	var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);
	
	//Retrieving player starting position data from our JSON file
	playerData = levelData.layers.filter(function( obj ) {
		return obj.name == "Player";
	});
	
	// The player and its settings
	player = game.add.sprite(playerData[0].objects[0].x, playerData[0].objects[0].y, 'dude');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.05;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    //  Finally some object groups
    stars = game.add.group();
	enemies = game.add.group();
	traps = game.add.group();

     //  We will enable physics for any star that is created in this group
    stars.enableBody = true;
	map.createFromObjects('Items','', 'star', 0, true, false, stars);
	
	//Setting the gravity for all the stars
	stars.forEach(function (element){
	   element.body.gravity.y = 300;
	}, this);
	
	// Creating and loading our spikes
	traps.enableBody = true;
	map.createFromObjects('Traps', '', 'spikeC', 0, true, false, traps);

	//enemies creation
	enemies.enableBody = true;
	
	//Retrieving enemyData array with properties from JSON file
	var enemyData = levelData.layers.filter(function( obj ) {
		return obj.name == "Enemies";
	});
	
	//Using the enemy data properties to create and set enemy properties
	enemyData[0].objects.forEach(function (element){
		var enemyProp = enemies.create(element.x, element.y, 'ghost');
		enemyProp.anchor.setTo(0.5, 0.5);
		enemyProp.scale.setTo(0.1);
		direction = element.properties.direction;
		length = element.properties.length;
		speed = element.properties.speed;
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
    scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '24px', fill: '#000' });
	scoreText.fixedToCamera = true;
	
	//The timer
	timerText = game.add.text(28, 45, 'Time: 0', {fontSize: '24px', fill: '#000'});
	timerText.fixedToCamera = true;

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
	//Enter key
	enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
	
	//Succeed Text
	succeededText = game.add.text(0, 0, '', style);
	succeededText.setTextBounds(0, 100, 800, 100);
	succeededText.fixedToCamera = true;
	
	//Death Counter text
	deathCountText = game.add.text(665,16, 'deaths: ' + deathCount, { fontSize: '24px', fill: '#000' });
	deathCountText.fixedToCamera = true;
	
	
	// Sets the score to 0
	score = 0;
	
	
	//Retrieving star data from our JSON file
	var starData = levelData.layers.filter(function( obj ) {
		return obj.name == "Items";
	});
	
	//Score to complete the level #Currently all stars
	scoreToWin = starData[0].length * 10;

	game.time.events.loop(Phaser.Timer.SECOND, updateCounter, this);
	
	//Triggering special objects key
	spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	
	
	//Add lever
	levers = game.add.group();
	map.createFromObjects('Items', 'lever', 'leverImage', 0, true, false, levers);
	lever = levers.getTop();
	lever.anchor.setTo(0.5,0);
	leverStatus = false;
	
	//Add door
	doors = game.add.group();
	map.createFromObjects('Items', 'door', 'doorImage', 0, true, false, doors);
	door = doors.getTop();
	door.animations.add('open', [0, 3, 6, 9], 3, false);
	
	playMusic();
	addSoundEffects();
	
	game.camera.follow(player);
	player.bringToTop();
	
	if(currentLevel == 100){
		displayLeaderBoard();
		score = 10;
	}
	

};


function playMusic()
{
	this.music = this.game.add.audio('backgroundMusic');
	this.music.play('', 0, 1, true);
	toggleMusic();
}

function addSoundEffects()
{
	this.coinSound = this.game.add.audio('coin');
	this.death = this.game.add.audio('dying');
	this.leverSound = this.game.add.audio('leverAudio');
}

function toggleMusic()
{
	if(this.music.isPlaying)
	{
		music.pause();
	}
	else 
	{
		music.resume();
	}
}

function update() {

    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, collisionLayer);
    game.physics.arcade.collide(stars, collisionLayer);
	
    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, stars, collectStar, null, this);
	game.physics.arcade.overlap(player, enemies, ResetPlayer, null, this);
	game.physics.arcade.overlap(player, traps, ResetPlayer, null, this);
	
    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;
	
	
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
	
	triggerLever();
	triggerDoor();
	
	
	
	//nextLevel(player, score);

};

function triggerDoor()
{
	if(checkOverlap(player, door) && enterKey.isDown && score >= scoreToGet && leverStatus == true)
	{
		nextLevel(player, score);
	}
}

function triggerLever()
{
	if (checkOverlap(player, lever) && spaceKey.isDown && leverStatus == false)
	{
		leverSound.play();
		door.key
		this.door.animations.play('open');
		this.lever.scale.x*=-1;
		leverStatus = true;
	}
}

function checkOverlap(spriteA, spriteB)
{
	var boundA = spriteA.getBounds();
	var boundB = spriteB.getBounds();
	
	return Phaser.Rectangle.intersects(boundA, boundB);
}

function ResetPlayer()
{
	death.play();
	console.log("Killed");
	deathCount++;
	counter = 0;
	toggleMusic();
	game.state.restart();
}

function collectStar (player, star) {
    
    // Removes the star from the screen
    star.kill();
	coinSound.play();
    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;
	//completedLevel(player, score);
	

};

function updateCounter() 
{
	counter ++;
	timerText.text = 'Time: ' + counter;
}


 // function completedLevel(player, score) {
	 // if(score == scoreToWin) {
	 // succeededText.text = 'You Succeeded with: ' + score + ' points! \n        Press Enter to advance';
	 // } else {
		 // //Do nothing
	 // }
 // }

 // function completedLevel(player, score) {
	 // if(score == 100) {
	 // succeededText.text = 'You Succeeded with: ' + score + ' points! \n        Press Enter to advance';
	 // scoreText.text = 'Level by ' + levelData.author;
	 // } else {
		 // //Do nothing
	 // }
 // };

 function nextLevel(player, score) {
	if(score >= scoreToGet) {
		toggleMusic();
		//Do shit
		if(currentLevel < totalLevels)
		{
			currentLevel++;	
		}
		else if(currentLevel == 100){
			currentLevel = 1;
		}
		else if (currentLevel >= totalLevels){
			death = 0;
			counter = 0;
			currentLevel = 100;
		}
		game.state.restart();
	};
 }
	
function displayLeaderBoard() 
{	
	getTopRankers(10);
	
	//Leaderboard text
	leaderboardText = game.add.text(200, 100, '', {fontSize: '24px', fill: '#000'});
	leaderboardText.fixedToCamera = true;
	
	userNameText = game.add.text(200, 100, '', {fontSize: '24px', fill: '#FFF'});
	userNameText.fixedToCamera = true;
	
	pointsText = game.add.text(405, 100, '', {fontSize: '24px', fill: '#FFF'});
	pointsText.fixedToCamera = true;
	
};
	

function onUserOperationCompleted(object)
{
	var result_JSON = JSON.parse( object );
	if(result_JSON.app42){
		var user = result_JSON.app42.response.users.user
		console.log("User Name is : ",user.userName)
		console.log("SessionId is : ",user.sessionId)
		console.log("Email Id is : ",user.email)
		console.log("Created On is : ",user.createdOn)
	}else{
		console.log("Error Message is: ", result_JSON.app42Fault.message)
		console.log("Error Detail is: ", result_JSON.app42Fault.details)
		console.log("Error Code is: ", result_JSON.app42Fault.appErrorCode)
	}
}
	


 
 function buildGame() 
 {
	 var gameName = "PhaserTest",
	 description = "beskrivelsen",
	 result;
	 App42.initialize(apiKey, secretKey);
	 var gameService = new App42Game();
	 gameService.createGame(gameName,description,{
		 success: function(object) {
			 var game = JSON.parse(object);
			 result = game.app42.response.games.game;
			 console.log("GameName is :" + result.name)
			 console.log("Gamedescription is : " + result.description)
		 },
		 error: function(error) {
			 
		 }
	 });
 }
 
 function sendScore(name, gamescore) 
 {
	 var gameName = "PhaserTest",
	 userName = name,
	 gameScore = gamescore,
	 result;
	 App42.initialize(apiKey, secretKey);
	 var scoreBoardService = new App42ScoreBoard();
	scoreBoardService.saveUserScore(gameName,userName,gameScore,{
		success: function(object)
		{
			console.log("AddScore");
			var game = JSON.parse(object);
			result = game.app42.response.games.game;
			console.log("GameName is : " + result.name)
			var scoreList = result.scores.score;
			console.log("userName is : " + scoreList.userName)
			console.log("scoreId is : " + scoreList.scoreId)
			console.log("Value is : " + scoreList.value)
			
		},
		error: function(error) {
			
		}
	});
	 
 }
 
 function getTopRankers(amount) {
	 var gameName = "PhaserTest",
	 max = amount, 
	 result;
	 App42.initialize(apiKey, secretKey);
	 var scoreBoardService = new App42ScoreBoard();
	 scoreBoardService.getTopNRankers(gameName,max,{
		 success: function(object)
		 {
			 var game = JSON.parse(object);
			 result = game.app42.response.games.game;
			 console.log("gameName is :" + result.name)
			 leaderboardList = result.scores.score;
			 if(leaderboardList instanceof Array) 
			 {
				 for(var i = 0; i < leaderboardList.length; i++)
				 {
					 console.log("GetToPrankers");
					 console.log("userName is : " + leaderboardList[i].userName)
					 console.log("scorId is : " + leaderboardList[i].scoreId)
					 console.log("value is : " + leaderboardList[i].value)
					 
				 } 
			 } else 
			 {
				console.log("GetToPrankers");
				console.log("userName is : " + leaderboardList.userName)
				console.log("scorId is : " + leaderboardList.scoreId)
				console.log("value is : " + leaderboardList.value)
			 }
			 //Change and set leaderboard text
			 leaderboardText.text = 'Leaderboard         Points';
			 leaderboardList.reverse();
			 leaderboardList.forEach(function (element) 
				{
					userNameText.text+= '\n' + element.userName;
					pointsText.text+= '\n' + element.value;
				});
		 },
		 error: function(error){
			 
		 }
	 });
 }
	
	
	// function saveScore(n) 
	// {
		// var gameName = "Phaser Game";
		// var userName = facebookName;
		// if(userName == ""){
			// userName = "Guest";
		// }
		// var gameScore = n;
		// var result;
		// var scoreBoardService = new App42ScoreBoard()
		// ScoreBoardService.saveUserScore(gameName,userName,gameScore,{ success: function(object) {} });
		
	// }