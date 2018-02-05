function game() {}

Game.prototype = {
	start: function() {
		var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game-area');
		
		game.state.add('boot', BootState);
		game.state.add('preload', PreloadState);
		game.state.add('Level1', Level1);
		game.state.add('Level2', Level2);
		game.state.add('Level3', Level3);
		game.state.add('Level4', Level4);
		game.state.add('Level5', Level5);
		game.state.add('Level6', Level6);
		game.state.start('boot');
		
		
	}
	
	
}