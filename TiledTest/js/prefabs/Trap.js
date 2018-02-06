var Platformer = Platformer || {};

Platformer.Trap = function (game_state, position, properties) {
    "use strict";

    Platformer.Prefab.call(this, game_state, position, properties);
	
    
    this.game_state.game.physics.arcade.enable(this);
    
    this.scale.setTo(-properties.direction, 1);
    
    this.anchor.setTo(0.5);
};

Platformer.Trap.prototype = Object.create(Platformer.Prefab.prototype);
Platformer.Trap.prototype.constructor = Platformer.Trap;

Platformer.Trap.prototype.update = function () {
    "use strict";
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision);
    
    // change the direction if walked the maximum distance
    if (Math.abs(this.x - this.previous_x) >= this.walking_distance) {
        this.body.velocity.x *= -1;
        this.previous_x = this.x;
        this.scale.setTo(-this.scale.x, 1);
    }
};