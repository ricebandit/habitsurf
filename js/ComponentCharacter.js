class ComponentCharacter{
	constructor(data, container){
		this.character = {};
		this.position = {x:data.player.x, y:data.player.y};
		this.previousPosition = this.position;

		this.data = data;

		this.displayedDirection = 'side';

		this.debug = true;

	}

	setMapElement(container){
		this.container = container;

		// Set Sprite
		const characterSpritesheet = new createjs.SpriteSheet(this.data.sprites.characters);
		this.characterAnimation = new createjs.Sprite(characterSpritesheet, "side/character0");

		this.container.addChild(this.characterAnimation);
	}

	setCharacter(data){
		this.character = data;

		this.characterId = this.character.id;

		this.hitarea = new createjs.Rectangle(245, 631, 312, 260);

		/*
		switch(this.character.id){
			case 0:
				this.hitarea = new createjs.Rectangle(111,236,102, 50);
			break;
			case 1:
				this.hitarea = new createjs.Rectangle(116,227,89, 47);
			break;
			case 2:
				this.hitarea = new createjs.Rectangle(133,223,90, 61);
			break;
			
		}
		*/

		this.hitarea.x = this.hitarea.x * this.container.scaleX;
		this.hitarea.y = this.hitarea.y * this.container.scaleX;
		this.hitarea.width = this.hitarea.width * this.container.scaleX;
		this.hitarea.height = this.hitarea.height * this.container.scaleX;
	}

	showDirection(orientation){

		if(orientation != this.displayedDirection){
			this.displayedDirection = orientation;
			this.showNewDirection();
		}
	}

	showNewDirection(){
		this.characterAnimation.gotoAndPlay(this.displayedDirection + '/character' + this.characterId);
	}

	resetDirection(){
		this.characterAnimation.gotoAndPlay('side/character' + this.characterId);
	}

	getHitArea(){
		return this.hitarea;
	}

	getPosition(){
		return this.position;
	}

	getPreviousPosition(){
		return this.previousPosition;
	}

	updatePosition(data){
		this.previousPosition = {x:this.position.x, y: this.position.y};
		this.position = data;

	}

	resetPosition(data){
		this.position = data;

	}

}