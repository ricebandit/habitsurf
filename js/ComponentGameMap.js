class ComponentGameMap{
	constructor(data, queue, character, callbackFinish, callbackEnd, callbackEvent, pageScope){
		this.pageScope = pageScope;
		this.callbackFinish = callbackFinish;
		this.callbackEnd = callbackEnd;
		this.callbackEvent = callbackEvent;
		this.top = 0;
		this.topBoundary = this.top;
		this.bottom = window.innerHeight;
		this.ingame = false;

		// Game Essentials
		this.assets = queue;
		//this.finishX = data.finish;
		this.speed = 0;
		this.itemIntervalDuration = 1500;
		this.itemIntervalDurationMin = 600;
		this.originalScaleWidth = 1200;
		this.characterWidth = 250;
		this.factor = 1;

		// Components
		this.stage = new createjs.Stage("cvs");
		this.map = new createjs.Container();
		this.bg = new createjs.Container();
		this.bgOcean = new createjs.Container();
		this.items = new createjs.Container();
		this.itemsOver = new createjs.Container();
		this.character = new createjs.Container();
		this.fg = new createjs.Container();

		// Data
		this.characterData = character;
		this.characterData.setMapElement(this.character);
		this.characterY = 0; // Used for map display purposes only
		this.itemCollection = [];
		this.itemsData = [];
		this.data = data;
		this.objId = 0;


		// Top-Level Elements
		this.stage.addChild(this.bg);
		this.stage.addChild(this.bgOcean);


		// Create bg
		const bgSky = new createjs.Bitmap(this.assets.getResult('bg-sky'));
		this.bg.addChild(bgSky);

		const waveSpritesheet = new createjs.SpriteSheet(data.sprites.wave);
		this.waveAnimation = new createjs.Sprite(waveSpritesheet, "roll");
		this.bgOcean.addChild(this.waveAnimation);

/*
		const waveTest = new createjs.Bitmap(this.assets.getResult('wave-test'));
		waveTest.alpha = 0.5;
		this.bgOcean.addChild(waveTest);
*/

		// Create FG
		const fgChair = new createjs.Bitmap(this.assets.getResult('fg-chair'));
		this.fg.addChild(fgChair);



		this.stage.addChild(this.map);
		this.map.addChild(this.items);
		this.map.addChild(this.character);
		this.map.addChild(this.itemsOver);

		this.stage.addChild(this.fg);


		createjs.Ticker.addEventListener('tick', this.stage);

		window.addEventListener('focus', () => {
			console.log('FOCUS!');

			if(this.ingame === true){
				this.setNewItemInterval(this.itemIntervalDuration);
			}

		});

		window.addEventListener('blur', () => {
			console.log('BLUR!');
			clearInterval(this.itemInterval);
		});
	}

	getFactor(){
		return this.factor;
	}

	setSpeed(num){
		this.speed = num;
	}

	start(){
		this.ingame = true;
	}

	setCharacter(index){
		/*
			Character data is already updated from PageGame.setCharacter();

			This method only sets the map-related properties (scale and position).
		*/

		const charScale = this.characterWidth / 1000; // 1000 = character img width

		this.character.scaleX = this.character.scaleY = charScale;

		this.character.x = this.characterData.getPosition().x;
		this.character.y = this.characterData.getPosition().y;

		this.characterY = this.characterData.getPosition().y;

		const charOriginalHeight = 1000;
		this.bottom = window.innerHeight - (charOriginalHeight * this.character.scaleY);

	}

	setItemSequence(){
		//this.itemSequence =[];

		// create unrandomized list
		let unrandomized = [];

		for(let i = 0; i < this.data.items.length; i++){
			const category = this.data.items[i];

			for(let j = 0; j < category.amt; j++){
				unrandomized.push(category);
			}
		}

		this.randomizedItems = [];

		while(unrandomized.length > 0){
			const rand = Math.floor( Math.random() * unrandomized.length );

			const randItem = unrandomized[rand];

			unrandomized.splice(rand, 1);

			this.randomizedItems.push(randItem);

		}

	}

	setupGame(){
		this.setItemSequence();


		// Add initial items, amount based on window size
		const windowW = window.innerWidth;
		const normalizedScale = 1 + (1 - this.map.scaleX); // this.map is scaled on resize, calculate actual width by normalizing scale width
		const mapWidth = windowW * normalizedScale;
		const distBetweenItems = 800;
		let itemX = 700;
		this.itemNum = 0;


		while(itemX < mapWidth){

			// Randomly pick item type
			const itemData = this.randomizedItems[this.itemNum];

			this.itemNum++;

			const item = new ComponentItem(itemData, this.assets, itemX, this.topBoundary, this.bottom, this.objId);
			this.itemsData.push(item);

			this.items.addChild(item.getArt());

			itemX += distBetweenItems;
			this.objId ++;
		}


		// Wait 4000ms (while countdown happens) before generating more items
		setTimeout( () => {
			this.setNewItemInterval(this.itemIntervalDuration);
		}, 4000 );

	}

	setNewItemInterval(duration){
		clearInterval(this.itemInterval);

		const windowAR = window.innerWidth / window.innerHeight;
		const windowARInverted = window.innerHeight / window.innerWidth;
		const windowW = window.innerWidth;
		let normalizedScale = this.originalScaleWidth / windowW;
		let mapWidth = windowW * normalizedScale;


		if(windowAR > 1.3){ // scale is height-based
			normalizedScale = (this.originalScaleWidth * windowAR) / windowW;
			mapWidth = windowW * normalizedScale;
		}

		this.itemInterval = setInterval( () => {
			//mapWidth

			// Randomly pick item type
			const itemData = this.randomizedItems[this.itemNum];

			this.itemNum++;

			// If reached end of item sequence, reshuffle and increase difficulty
			if(this.itemNum == this.randomizedItems.length){
				this.itemNum = 0;
				this.setItemSequence();

				// Next Level
				this.speed += (this.speed * 0.25);
				this.setSpeed(this.speed);


				// Increase item generation frequency
				this.itemIntervalDuration -= (this.itemIntervalDuration * 0.1);

				if(this.itemIntervalDuration < this.itemIntervalDurationMin){
					this.itemIntervalDuration = this.itemIntervalDurationMin;
				}

				this.setNewItemInterval(this.itemIntervalDuration);

				this.factor += 0.4;
			}

			const item = new ComponentItem(itemData, this.assets, mapWidth, this.topBoundary, this.bottom, this.objId);
			this.itemsData.push(item);

			this.items.addChild(item.getArt());

			this.objId ++;
		}, duration );
	}

	reset(){


		clearInterval(this.itemInterval);

		// BG
		this.bg.x = 0;

		// ITEMS
		this.items.x = 0;

		// Iterate through items for removal
		for(let itemsI = 0; itemsI < this.itemsData.length; itemsI++){
			const collisionItem = this.itemsData[itemsI];
			collisionItem.deactivate();


			this.items.removeChild( collisionItem.getArt() );
			this.itemsOver.removeChild( collisionItem.getArt() );

			collisionItem.kill();
		}

		this.itemsData = [];

		this.itemIntervalDuration = 1500;

		this.factor = 1;

	}

	stopGame(){
		console.log('Map, stopGame()', this.itemInterval);
		clearInterval(this.itemInterval);

		this.ingame = false;
	}

	update(){

		/*
		CHARACTER
		*/
		// NOTE: CharacterData position is updated by PageGame class, which then calls update() here

		// Only update tween values if there's a change from the previous loop.
		if(this.characterData.getPosition().y != this.characterY){
			
			this.charTween = createjs.Tween.get(this.character).to({y:this.characterData.getPosition().y}, 500, createjs.Ease.cubicOut);
		}

		this.character.x = this.characterData.getPosition().x;

		this.characterY = this.characterData.getPosition().y;

		const charHitRect = this.characterData.getHitArea();
		const charGlobalHitArea = new createjs.Rectangle( this.character.x + charHitRect.x, this.character.y + charHitRect.y, charHitRect.width, charHitRect.height );

		// Iterate through items for collisions
		for(let itemsI = 0; itemsI < this.itemsData.length; itemsI++){
			const collisionItem = this.itemsData[itemsI];

			collisionItem.updateX( collisionItem.getArt().x - this.speed);

			const charHotBottom = 951;
			const charBottom = this.character.y + (this.character.scaleY * charHotBottom);

			const itemBottom = collisionItem.getArt().y + (collisionItem.getArt().scaleY * 950);
			if(itemBottom > charBottom){
				this.itemsOver.addChild( collisionItem.getArt() );
			}else{
				this.items.addChild( collisionItem.getArt() );
			}

			// If object has already passed the left side of the screen,
			//   remove display item and mark for garbage collection
			if(collisionItem.getArt().x < -500){
				collisionItem.deactivate();

				this.items.removeChild(collisionItem.getArt());
				this.itemsOver.removeChild(collisionItem.getArt());
			}

			const collisionItemGlobalCoords = {
				x: collisionItem.getArt().x,
				y: collisionItem.getArt().y 
			};

			const itemGlobalHitArea = new createjs.Rectangle(collisionItemGlobalCoords.x + collisionItem.getItem().hitArea.x, collisionItemGlobalCoords.y + collisionItem.getItem().hitArea.y, collisionItem.getItem().hitArea.width, collisionItem.getItem().hitArea.height);



			const collided = this.checkCollisions(itemGlobalHitArea, charGlobalHitArea);

			if(collided === true){
				if(collisionItem.isActivated() === true){
					// Deactivate.
					collisionItem.deactivate();
					collisionItem.getArt().alpha = 0; 

					// Register event to PageGame parent class
					this.callbackEvent(this.pageScope, collisionItem);
				}
				break;
			}

		}

		// Now that all out-of-bounds/collided objects have been deactivated, 
		// re-iterate through objects and only include the active ones
		let aliveItems = [];
		for(let itemsJ = 0; itemsJ < this.itemsData.length; itemsJ++){
			const itemCheck = this.itemsData[itemsJ];

			if(itemCheck.isActivated() === true){
				aliveItems.push(itemCheck);
			}
		}

		// Update itemsData with active items only
		this.itemsData = aliveItems;


	}

	checkCollisions(rect1, rect2){
	  return !(rect2.x > rect1.x + rect1.width || 
	           rect2.x + rect2.width < rect1.x || 
	           rect2.y > rect1.y + rect1.height ||
	           rect2.y + rect2.height  < rect1.y);
	}

	getMinMax(){
		return {top:this.topBoundary, bottom:this.bottom};
	}

	resize(){
		const breakpoint = 0.8;

		const originalGameWidth = 1200;
		const originalGameHeight = 900;
		const aspectRatio = 1.333; // 4:3 aspect ratio
		const aspectRatioInverted = 0.75; // 4:3 aspect ratio
		const windowAR = window.innerWidth / window.innerHeight;

		// Scale game container to window
		let scale = 1;


		if(windowAR > breakpoint){

			this.top = 200;

			//fill height
			scale = window.innerHeight / originalGameHeight;

			// Consider height of game at scale
			const currentGameWidth = (originalGameHeight * scale) * aspectRatioInverted;

			if( currentGameWidth > window.innerWidth ){
				// set scale to height
				scale = window.innerWidth / originalGameWidth;
			}

		}else{

			// fill width
			scale = window.innerWidth / originalGameWidth;

			// Consider height of game at scale
			const currentGameHeight = (originalGameWidth * scale) * aspectRatio;

			if( currentGameHeight > window.innerHeight ){
				// set scale to height
				scale = window.innerHeight / originalGameHeight;
			}
		}

		// BG & FG scaling
		const windowARInverted = window.innerHeight / window.innerWidth;
		const windowW = window.innerWidth;
		let normalizedScale = windowW / this.originalScaleWidth;

		const bgSkyOriginalHeight = 330;
		const bgOceanWidthOriginal = 1442;
		const bgOceanHeightOriginal = 1634;
		const fgChairHeightOriginal = 304;
		this.bg.scaleX = this.bg.scaleY = normalizedScale;

		if(windowAR <= breakpoint){
			this.top = bgSkyOriginalHeight * this.bg.scaleY;
		}

		// Scale BG Ocean (width first)
		let oceanScale = window.innerWidth / bgOceanWidthOriginal;
		const oceanTopOffsetOriginalScale = 100;


		let oceanTop = this.top - (oceanTopOffsetOriginalScale * oceanScale);
		let requiredHeight = window.innerHeight - oceanTop;

		// If current height of ocean is going to be too short, scale up by height
		if(bgOceanHeightOriginal * oceanScale < requiredHeight){
			oceanScale = requiredHeight / bgOceanHeightOriginal;
			oceanTop = this.top - (oceanTopOffsetOriginalScale * oceanScale);
		}


		this.bgOcean.scaleX = this.bgOcean.scaleY = oceanScale;
		this.bgOcean.y = oceanTop;

		this.bg.y = 0;

		if(windowAR > breakpoint){
			// Horizontal - wider than 3:4
			console.log('windowAR greater');
			

			// If ocean background is shorter than window height (minus top boundary)
			if(this.bgOcean.scaleY * bgOceanHeightOriginal < ( window.innerHeight - this.top ) ){
				
				requiredHeight = window.innerHeight - this.top;
			}
		}else{
			// Vertical - less wider than 4:3
			console.log('windowAR lesser', this.top, this.bg.scaleY);

			requiredHeight = window.innerHeight - this.top;
		}


		this.fg.scaleX = this.fg.scaleY = normalizedScale;
		this.fg.y = window.innerHeight - (fgChairHeightOriginal * this.fg.scaleY);


		this.map.scaleX = scale;
		this.map.scaleY = scale;

		const playBoundaryPadding = 80;
		this.topBoundary = this.top;

		console.log('topBoundary', this.topBoundary, this.map.scaleY);
		
	}




}