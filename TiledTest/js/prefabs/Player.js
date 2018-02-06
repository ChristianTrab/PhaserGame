var Platformer = Platformer || {};
 
Platformer.Player = function (game_state, position, properties) {
    "use strict";
    Platformer.Prefab.call(this, game_state, position, properties);
    
	game.world.setBounds(0,0,800,600);
	game.camera.follow(this.game_state);
    this.walking_speed = +properties.walking_speed;
    this.jumping_speed = +properties.jumping_speed;
    this.bouncing = +properties.bouncing;
    
    this.game_state.game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    
    //this.animations.add("walking", [0, 1, 2, 1], 6, true);
	this.animations.add('left', [0, 1, 2, 3], 10, true);
    this.animations.add('right', [5, 6, 7, 8], 10, true);
    
    this.frame = 4;
    
    this.anchor.setTo(0.5);
    
    this.cursors = this.game_state.game.input.keyboard.createCursorKeys();
};
 
Platformer.Player.prototype = Object.create(Platformer.Prefab.prototype);
Platformer.Player.prototype.constructor = Platformer.Player;
 
Platformer.Player.prototype.update = function () {
    "use strict";

    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.enemies, this.hit_enemy, null, this);
	this.game_state.game.physics.arcade.collide(this, this.game_state.groups.traps, this.hit_trap, null, this);
    
    if (this.cursors.right.isDown && this.body.velocity.x >= 0) {
        // move right
        this.body.velocity.x = this.walking_speed;
        this.animations.play("right");
        this.scale.setTo(1, 1);
    } else if (this.cursors.left.isDown && this.body.velocity.x <= 0) {
        // move left
        this.body.velocity.x = -this.walking_speed;
        this.animations.play("left");
        this.scale.setTo(1, 1);
    } else {
        // stop
        this.body.velocity.x = 0;
        this.animations.stop();
        this.frame = 4;
    }
    
    // jump only if touching a tile
    if (this.cursors.up.isDown && this.body.blocked.down) {
        this.body.velocity.y = -this.jumping_speed;
    }
    
    // dies if touches the end of the screen
    if (this.bottom >= this.game_state.game.world.height) {
        this.game_state.restart_level();
    }
};
 
Platformer.Player.prototype.hit_enemy = function (player, enemy) {
    "use strict";
    // if the player is above the enemy, the enemy is killed, otherwise the player dies
    if (enemy.body.touching.up) {
        enemy.kill();
        player.y -= this.bouncing;
    } else {
        this.game_state.restart_level();
    }
};

Platformer.Player.prototype.hit_trap = function (player, trap) {
    "use strict";
    // touch it you die.
        this.game_state.restart_level();
	
};




