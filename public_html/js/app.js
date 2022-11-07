class App{
	constructor(canvas){
		this.pages = document.querySelectorAll('.page');
		this.currentPage = document.querySelector('#preload');
		this.currentPageIndex = 0;
		this.pageIndexMax = this.pages.length;
		this.resultWin = false;


		this.score = 0;
		this.character = 0;

		//this.stage = stage;


		window.onresize = () => {
			this.resize();
		};

		// This is a test
	}

	init(assets, data){
		this.assets = assets;

		const scope = this;

		// PAGES
		this.preloader = new PagePreloader('preload', this);
		this.titlescreen = new PageTitleScreen('title', this);
		this.characterselect = new PageCharacterSelect('character', this);
		this.instructions = new PageInstructions('instructions', this);
		this.game = new PageGame('game', this, this.assets, data);
		this.results = new PageResults('results', this);


		this.pageObjects = [
			this.preloader,
			this.titlescreen, 
			this.characterselect, 
			this.instructions, 
			this.game,
			this.results
		];

		this.gotoNextPage();

		this.resize();


		// UI
		const audioButton = document.querySelector('.persistent .audio');
		audioButton.addEventListener('click', (evt) => {
			if( Audio.getMuted() === true ){
				Audio.mute(false);
				audioButton.classList.remove('toggled');
			}else{
				Audio.mute(true);
				audioButton.classList.add('toggled');
			}
		});
	}

	closeCurrentPage(){
		this.currentPage.classList.remove('on');
		this.pageObjects[this.currentPageIndex].off();
	}

	gotoNextPage(){
		this.closeCurrentPage();

		let index = this.currentPageIndex + 1;

		// If on last page, got to Title
		if( index >= this.pageIndexMax){
			index = 1;
		}

		const persistentUI = document.querySelector('.persistent');
		if(index === 0 || index === 1){ // If reload or Title screen
			persistentUI.classList.remove('visible');
		}else{
			persistentUI.classList.add('visible');
		}

		this.currentPageIndex = index;

		if(this.currentPageIndex === 2){
			Audio.startNextSong('audio-loop-menu', 1);
		}


		// If previous page = CHARACTER, set character
		if(this.currentPageIndex === 3){
			this.game.setCharacter(this.character);
		}

		if(this.currentPageIndex === 4){
			Audio.startNextSong('audio-loop-game', 1);
		}

		// If previous page = RESULT, set win/lose result
		if(this.currentPageIndex === 5){
			this.pageObjects[this.currentPageIndex].setResult(this.resultWin);

			Audio.startNextSong('audio-loop-menu', 1);
		}

		this.pages[this.currentPageIndex].classList.add('on');
		this.pageObjects[this.currentPageIndex].on();


		// SFX
		Audio.playIncidental('audio-sfx-paper', 1);
	}

	resetToTitle(){
		this.score = 0;
		this.resultWin = false;

		this.closeCurrentPage();

		this.currentPageIndex = 1;
		this.pages[this.currentPageIndex].classList.add('on');
		this.pageObjects[this.currentPageIndex].on();
	}

	setGameResult(win){
		this.resultWin = win;
	}

	setCharacter(index){
		this.character = index;
	}

	resize(){
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		if(this.game){
			this.game.resize(window.innerWidth, window.innerHeight);
		}
	}
}
class Audio{
	constructor(){
		const audio = {};

		createjs.Sound.alternateExtensions = ["mp3"];

		this.muted = false;
		this.interrupted = false;
		this.audioPath = "audio";

		// Used only if standalone CreateJS component. 
		// Usually, if used within a larger CreateJS app, 
		// audio files will already be loaded via manifest.
		this.numberLoaded = 0;
	}

	static registerSound(id, file){
		/* For future reference, this snippet is used during preload process, before manifest is called
			// If audio file (only audio files will have a "data" property in load manifest), register sound
			if(dataItem.data){
				console.log('preload dataItem', dataItem);

				Audio.registerSound(dataItem.id, dataItem.src);
			}
		*/
		createjs.Sound.registerSound({id: id, src: file});
	}

	static startNextSong(id, volume){
		if(this.currentSongId === id){return;}

        const songID = id;
        
        let musicVol = volume;
        if(volume == false || volume == "undefined" || volume == undefined){
            musicVol = 1;
        }
        
        
        // Check if there is already music playing
        if(this.music){
            // Tween volume down before starting next song

			createjs.Tween.get(this.music).to({volume:0}, 1000).call(() => {
				this.music.stop();
				this.playSong(songID, musicVol);
			});
        }else{
            // Play initial song
            this.playSong(id, musicVol);
        }
	}

	static playSong(id, musicVol){

		
        this.music = createjs.Sound.play(id, {loop:-1, volume:musicVol});
		this.currentSongId = id;
	}

	static quietMusic(delay){
        createjs.Tween.get(this.music).to({volume:0}, 100);

		setTimeout(() => {
			this.fadeIn();
		}, delay);
	}

	static fadeIn(){
        createjs.Tween.get(this.music).to({volume:1}, 1000);
    }

    static playIncidental(id, volume){
        // Play indicated sound effect, no looping
        if(this.muted){ return; }
        
        let sfxVol = volume;
        if(volume == false || volume == "undefined" || volume == undefined){
            sfxVol = 1;
        }
        
        createjs.Sound.play(id, {volume: sfxVol});
    }

    static mute(bool){
        if(bool){
            createjs.Sound.muted = true;
            this.muted = true;
        }else{
            createjs.Sound.muted = false;
            this.muted = false;
        }
    }

    static getMuted(){
        return this.muted;
    }

    static interrupt(){
        createjs.Sound.setMute(true);
        
        this.interrupted = true;
    }

    static uninterrupt(){
        if(this.muted == false){
            createjs.Sound.setMute(false);
        }
        
        this.interrupted = false;
    }

	// Used only if standalone CreateJS component. 
	// Usually, if used within a larger CreateJS app, 
	// audio files will already be loaded via manifest.
    static getProgress(){
        var loaded = this.numberLoaded / _audioManifest.length;
        return loaded;
    }



}
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
class ComponentControls{
	constructor(){
		console.log('ComponentControls');

		this.activeState = false;
		this.keypresses = '';
		this.touch = false;

		this.w = false;
		this.a = false;
		this.s = false;
		this.d = false;

		this.up = false;
		this.down = false;
		this.left = false;
		this.right = false;

		this.directionCode = '';

		// w = 87 (u)
		// a = 65 (l)
		// s = 68 (d)
		// d = 83 (r)
		// up = 38 (u)
		// down = 40 (d)
		// left = 37 (l)
		// right = 39 (r)


		document.addEventListener('keydown', (evt) => {
			console.log('------keydown', evt.keyCode);

			switch(evt.keyCode){
				case 87: // up
					this.w = true;
				break;

				case 65: // left
					this.a = true;
				break;

				case 68: // right
					this.d = true;
				break;

				case 83: // down
					this.s = true;
				break;

				case 38: // up
					this.up = true;
				break;

				case 40: // down
					this.down = true;
				break;

				case 37: // left
					this.left = true;
				break;

				case 39: // right
					this.right = true;
				break;
				
			}
		});

		document.addEventListener('keyup', (evt) => {
			//console.log('++++++keyup', evt.keyCode);

			switch(evt.keyCode){
				case 87: // up
					this.w = false;
				break;

				case 65: // left
					this.a = false;
				break;

				case 68: // right
					this.d = false;
				break;

				case 83: // down
					this.s = false;
				break;

				case 38: // up
					this.up = false;
				break;

				case 40: // down
					this.down = false;
				break;

				case 37: // left
					this.left = false;
				break;

				case 39: // right
					this.right = false;
				break;
				
			}

		});

		// Check for TOUCH
		if ("ontouchstart" in document.documentElement){
			this.touch = true;
			this.setupTouchControls();

			const touchControls = document.querySelector('#game #touchControls');
			touchControls.classList.add('on');
		}


		//this.activate();
	}

	touchPress(evt){
		console.log('touchPress');

		switch(evt.target.id){
			case "up":
				this.up = true;
			break;
			case "down":
				this.down = true;
			break;
			case "left":
				this.left = true;
			break;
			case "right":
				this.right = true;
			break;
		}
	}

	touchRelease(evt){
		console.log('touchRelease');

		switch(evt.target.id){
			case "up":
				this.up = false;
			break;
			case "down":
				this.down = false;
			break;
			case "left":
				this.left = false;
			break;
			case "right":
				this.right = false;
			break;
		}
	}

	activate(){
		this.activeState = true;

		this.controlsInt = setInterval( () => {

			// this.w = false;
			// this.a = false;
			// this.s = false;
			// this.d = false;

			// this.up = false;
			// this.down = false;
			// this.left = false;
			// this.right = false;

			//this.directionCode

			let dir = '';

			if(this.w === true || this.up === true){
				dir += 'u';
			}

			if(this.a === true || this.left === true){
				dir += 'l';
			}

			if(this.d === true || this.right === true){
				dir += 'r';
			}

			if(this.s === true || this.down === true){
				dir += 'd';
			}

			this.directionCode = dir;
		}, 10);

	}

	deactivate(){
		this.activeState = false;
	}

	getDirections(){
		return this.directionCode;
	}

	setupTouchControls(){

		const gamePage = document.getElementById('game');

		const touchControls = document.createElement('div');
		touchControls.id = 'touchControls';
		touchControls.classList.add('controls');

		gamePage.append(touchControls);


		// ARROWS

		const touchUp = document.createElement('div');
		touchUp.id = 'up';
		touchUp.classList.add('control-arrow');

		touchControls.append(touchUp);

		const touchDown = document.createElement('div');
		touchDown.id = 'down';
		touchDown.classList.add('control-arrow');

		touchControls.append(touchDown);

		const touchLeft = document.createElement('div');
		touchLeft.id = 'left';
		touchLeft.classList.add('control-arrow');

		touchControls.append(touchLeft);

		const touchRight = document.createElement('div');
		touchRight.id = 'right';
		touchRight.classList.add('control-arrow');

		touchControls.append(touchRight);


		const allArrows = document.querySelectorAll('#game #touchControls .control-arrow');

		for(let i = 0; i < allArrows.length; i++){
			const arrow = allArrows[i];

			arrow.addEventListener('touchstart', (evt) => {
				this.touchPress(evt);
			});

			arrow.addEventListener('touchend', (evt) => {
				this.touchRelease(evt);
			});
		}

	}

}
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
class ComponentItem{
	constructor(data, assets, xPos, top, bottom, id){
		this.itemWidth = data.widthPx;
		this.debug = true;

		const type = data.type;

		this.item = {type: type};


		let item_img_id = '';
		let item_effect = '';
		let rectangle = '';

		switch(type){
			case 'burger':
				item_img_id = 'item-burger';
				item_effect = 'good';
				rectangle = new createjs.Rectangle(280, 590, 395, 255);
			break;
			case 'fries':
				item_img_id = 'item-fries';
				item_effect = 'good';
				rectangle = new createjs.Rectangle(303, 482, 434, 341);
			break;
			case 'shake':
				item_img_id = 'item-shake';
				item_effect = 'good';
				rectangle = new createjs.Rectangle(364, 397, 253, 431);
			break;
			case 'shell':
				item_img_id = 'item-shell';
				item_effect = 'good';
				rectangle = new createjs.Rectangle(282, 367, 422, 468);
			break;
			case 'shark':
				item_img_id = 'item-shark';
				item_effect = 'bad';
				rectangle = new createjs.Rectangle(200, 344, 500, 386);
			break;
			case 'post':
				item_img_id = 'item-post';
				item_effect = 'bad';
				rectangle = new createjs.Rectangle(414, 445, 294, 464);
			break;
			case 'tentacle':
				item_img_id = 'item-tentacle';
				item_effect = 'bad';
				rectangle = new createjs.Rectangle(220, 731, 460, 214);
			break;
		}

		this.artImg = new createjs.Bitmap(assets.getResult(item_img_id));

		const artScale = this.itemWidth / this.artImg.getBounds().width;

		rectangle.x = rectangle.x * artScale;
		rectangle.y = rectangle.y * artScale;
		rectangle.width = rectangle.width * artScale;
		rectangle.height = rectangle.height * artScale;


		// From JSON:
		//this.item.type
		
		this.item.idNumber = id;
		this.item.item_effect = item_effect;
		this.item.art = new createjs.Container();
		this.item.art.addChild(this.artImg);
		this.item.art.scaleX = this.item.art.scaleY = artScale;
		this.item.art.x = xPos;
		this.item.art.y = ( Math.random() * (bottom - top) ) + top;
		this.item.hitArea = rectangle;
		this.item.activated = true;

	}

	getArt(){
		return this.item.art;
	}

	getItem(){
		return this.item;
	}

	updateX(pos){
		this.item.art.x = pos;
	}

	isActivated(){
		return this.item.activated;
	}

	deactivate(){
		this.item.activated = false;
	}

	kill(){
		this.item.idNumber = 0;
		this.item.item_effect = '';
		this.item.art.removeChild(this.artImg);
		this.item.art = null;
		this.artImg = null;
		this.item.hitArea = null;
		this.item.activated = false;

	}
}
class Page{
	constructor(id, mainScope){
		this.id = id;
		this.htmlElement = document.getElementById(id);
		this.main = mainScope;
		
	}

	on(){
		this.htmlElement.classList.add('on');
	}

	off(){
		this.htmlElement.classList.remove('on');
	}

	gotoNext(){
		this.main.gotoNextPage();
	}

	resize(w,h){
	}

}
class PageCharacterSelect extends Page{
	constructor(id, mainScope){
		super(id, mainScope);


		const button = document.querySelector(`.page#` + id + ` .btn#go`);

		button.addEventListener('pointerup', () => {

			this.gotoNext();
		});

		const charBtns = document.querySelectorAll(`.page#` + id + ` .character`);

		charBtns.forEach( (item) => {
			item.addEventListener('pointerup', (evt) => {
				const currentlySelected = document.querySelector(`.page#` + id + ` .character.selected`);
				if(currentlySelected){
					currentlySelected.classList.remove('selected');
				}

				const charSelected = Number(evt.currentTarget.dataset.index);

				evt.currentTarget.classList.add('selected');

				mainScope.setCharacter(charSelected);
			});
		});

		const selectedCharacter = document.querySelectorAll(`.page#` + id + ` .character`)[mainScope.character];
		selectedCharacter.classList.add('selected');
	}


}
class PageGame extends Page{
	constructor(id, mainScope, assets, data){
		super(id, mainScope);

		this.data = data;

		this.controls = new ComponentControls();

		this.initialSpd = 10;
		this.spd = this.initialSpd; // # of pixels to shift every frame
		this.fps = 60;

		this.refreshRate = 1000 / this.fps;

		this.characterData = new ComponentCharacter(data);

		this.charPos = {x:0, y:250};
		this.verticalMin = 0;
		this.verticalMax = window.innerHeight;

		this.gameLoop = '';
		this.assets = assets;

		this.mainScope = mainScope;

		// Tallies
		this.strikes = 0;
		this.strikesDisplayed = 0;
		this.burgers = 0;
		this.burgersDisplayed = 0;
		this.fries = 0;
		this.friesDisplayed = 0;
		this.shakes = 0;
		this.shakesDisplayed = 0;
		this.bonusTally = 1;

		this.points = 0;
		this.displayedPoints = 0; // Rounded to next;

		this.pointValBurgersBase = data.items[0].basePoints;
		this.pointValFriesBase = data.items[1].basePoints;
		this.pointValDrinksBase = data.items[2].basePoints;


		this.pointValBurgers = this.pointValBurgersBase;
		this.pointValFries = this.pointValFriesBase;
		this.pointValDrinks = this.pointValDrinksBase;



		this.buildMap();
	}

	loseGame(){
		const finishCommentParent = document.querySelector('#game .finish');
		finishCommentParent.classList.remove('on');

		this.mainScope.setGameResult(false);

		this.map.reset();

		this.gotoNext();
	}


	winGame(){
		const finishCommentParent = document.querySelector('#game .finish');
		finishCommentParent.classList.remove('on');

		this.mainScope.setGameResult(true);

		this.map.reset();

		this.gotoNext();
	}

	endGame(scope, win){
		clearInterval(scope.gameLoop);

		if(win === true){
			setTimeout( () => {
				scope.winGame();
			}, 2000);
		}else{

			setTimeout( () => {
				scope.loseGame();
			}, 1000);

		}
	}

	eventGame(scope, eventData){

		console.log('event registered', eventData, scope.map.getFactor());

		/* 

		Tally items on display:

		-this.strikes = 0;
		-this.burgers = 0;
		-this.fries = 0;
		-this.drinks = 0;

		-this.pointValBurgersBase = 0;
		-this.pointValFriesBase = 0;
		-this.pointValDrinksBase = 0;

		-this.pointValBurgers = 0;
		-this.pointValFries = 0;
		-this.pointValDrinks = 0;


		*/



		const strikes = document.querySelectorAll('#game .ui .tallies .strikes .strike-item');

		switch(eventData.getItem().type){
			case "burger":
				scope.burgers++;

				scope.points += (scope.pointValBurgers * scope.map.getFactor());
				scope.displayedPoints = Math.ceil(scope.points);

			break;
			case "fries":
				scope.fries++;

				scope.points += (scope.pointValFries * scope.map.getFactor());

				scope.displayedPoints = Math.ceil(scope.points);
			break;
			case "shake":
				scope.shakes++;

				scope.points += (scope.pointValDrinks * scope.map.getFactor());
				scope.displayedPoints = Math.ceil(scope.points);
			break;
			case "shell":
				//scope.shakes++;
			break;
			case "shark":
				scope.strikes++;
			break;
			case "post":
				scope.strikes++;
			break;
			case "tentacle":
				scope.strikes++;
			break;
		}

		if(scope.strikes == 3){
			scope.finishGame(scope, false);
		}


		scope.showEvent(eventData.getItem().type, eventData.getItem().idNumber);
	}

	checkForBonus(){

		if(this.burgers >= this.bonusTally && this.fries >= this.bonusTally && this.shakes >= this.bonusTally ){
			this.bonusTally ++;

			return true;
		}

		return false;
	}

	showEvent(type, idNum){


		let displayType = type;

		let bonus = false;
		switch(type){
			case "burger":
				displayType = "burger";
				if(this.checkForBonus() === true){
					console.log("DISPLAY BONUS!");
					bonus = true;
				}
			break;
			case "fries":
				displayType = "fries";
				if(this.checkForBonus() === true){
					console.log("DISPLAY BONUS!");
					bonus = true;
				}
			break;
			case "shake":
				displayType = "shake";
				if(this.checkForBonus() === true){
					console.log("DISPLAY BONUS!");
					bonus = true;
				}
			break;
			case "shell":
				displayType = "shell";
			break;
			case "shark":
				displayType = "strike";
			break;
			case "post":
				displayType = "strike";
			break;
			case "tentacle":
				displayType = "strike";
			break;
		}

		const effectContainer = document.querySelector('.collected-effects');

		// Generate element
		const evtDiv = document.createElement('div');
		evtDiv.id = type + '-' + idNum;
		evtDiv.classList.add('effect-item');


		// Show Combo Indicator
		if( bonus === true){
			console.log(' generate Bonus asset');

			if(this.comboContainer){
				console.log('remove combo forcefully', (this.bonusTally - 1) );
				this.comboContainer.remove();

			}

			this.comboContainer = null;

			const comboContainer = document.createElement('div');
			comboContainer.id = 'combo-' + idNum;
			comboContainer.classList.add('combo');

			this.comboContainer = comboContainer;

			const comboObj = document.createElement('h1');
			comboObj.classList.add('combo-text');

			if(this.bonusTally == 2){
				comboObj.textContent = "COMBO!";
			}else{
				comboObj.textContent = "COMBO x " + (this.bonusTally - 1) + "!";
			}
			

			comboContainer.appendChild(comboObj);

			effectContainer.appendChild(comboContainer);

			// Animate in
			setTimeout( () => {
				comboContainer.classList.add('show');
			}, 100 );


			setTimeout( () => {
				comboContainer.classList.remove('show');
			}, 3500 );

			// Remove
			setTimeout( () => {
				comboObj.remove();
				comboContainer.remove();
				this.comboContainer = null;

				console.log('remove combo naturally');
			}, 4000);
		}
		

		effectContainer.appendChild(evtDiv);

		const eventImg = document.createElement('img');
		eventImg.src = 'img/item-' + displayType + '.png';
		evtDiv.appendChild(eventImg);

		// Get target tally's global coords
		let tallyCoords = {x:0, y:0 };
		if(displayType == "strike"){
			const strikeTally = document.querySelector('#game .ui .tallies .strikes');
			tallyCoords.x = strikeTally.getBoundingClientRect().left + ( strikeTally.getBoundingClientRect().width / 2);
			tallyCoords.y = strikeTally.getBoundingClientRect().top + 20;

		}else if(displayType == "burger"){
			const burgerTally = document.querySelector('#game .ui .tallies .pluses #item-0');
			tallyCoords.x = burgerTally.getBoundingClientRect().left + ( burgerTally.getBoundingClientRect().width / 2);
			tallyCoords.y = burgerTally.getBoundingClientRect().top + 20;
		}else if(displayType == "fries"){
			const friesTally = document.querySelector('#game .ui .tallies .pluses #item-1');
			tallyCoords.x = friesTally.getBoundingClientRect().left + ( friesTally.getBoundingClientRect().width / 2);
			tallyCoords.y = friesTally.getBoundingClientRect().top + 20;
		}else if(displayType == "shake"){
			const shakesTally = document.querySelector('#game .ui .tallies .pluses #item-2');
			tallyCoords.x = shakesTally.getBoundingClientRect().left + ( shakesTally.getBoundingClientRect().width / 2);
			tallyCoords.y = shakesTally.getBoundingClientRect().top + 20;
		}

		// Animate effect to tally's position
		setTimeout( () => {
			evtDiv.classList.add('animate');
			evtDiv.style.left = tallyCoords.x + "px";
			evtDiv.style.top = tallyCoords.y + "px";
			evtDiv.style.opacity = "0";
			evtDiv.style.transform = "scale(0.2) translate3d(-50%, -50%, 0)";
		}, 500 );

		// Show outcome

		setTimeout( () => {
			// Remove effect from DOM
			evtDiv.remove();

			// Set points or strikes
			const strikes = document.querySelectorAll('#game .ui .tallies .strikes .strike-item');

			switch(type){
				case "burger":
					this.burgersDisplayed ++;

					const burgerScore = document.querySelector('#game .ui .tallies .pluses #item-0 .value h2');
					
					burgerScore.textContent = this.burgers;

					this.displayScore();
				break;
				case "fries":
					this.friesDisplayed ++;

					const friesScore = document.querySelector('#game .ui .tallies .pluses #item-1 .value h2');
					friesScore.textContent = this.fries;

					this.displayScore();
				break;
				case "shake":
					this.shakesDisplayed ++;

					const shakesScore = document.querySelector('#game .ui .tallies .pluses #item-2 .value h2');
					shakesScore.textContent = this.shakes;

					this.displayScore();
				break;
				case "shark":
					strikes[this.strikesDisplayed].classList.add('out');
					this.strikesDisplayed ++;
				break;
				case "post":
					strikes[this.strikesDisplayed].classList.add('out');
					this.strikesDisplayed ++;
				break;
				case "tentacle":
					strikes[this.strikesDisplayed].classList.add('out');
					this.strikesDisplayed ++;
				break;
			}
		}, 700 );


	}

	displayScore(){

		const pointsScore = document.querySelector('#game .ui .tallies .points #points-item .value h2');
		pointsScore.textContent = this.displayedPoints;
	}

	finishGame(scope, finished){
		clearInterval(scope.gameLoop);
		this.map.stopGame();

		if(finished === true){
			// Win
			const finishCommentParent = document.querySelector('#game .finish');
			finishCommentParent.classList.add('on');

			const finishComment = document.querySelector('#game #finish');
			finishComment.classList.add('on');

			setTimeout( () => {
				finishComment.classList.remove('on');
			}, 10 );

			setTimeout( () => {
				scope.winGame();
			}, 2000);
			
		}else{
			// Lose

			setTimeout( () => {
				scope.loseGame();
			}, 2000);
		}

	}

	on(){
		this.htmlElement.classList.add('on');

		this.setupGame();
	}

	startGame(){
		console.log('startGame');

		// Clear gameloop, just in case it is still active
		clearInterval(this.gameLoop);

		this.gameLoop = setInterval( () => {

			const prevCharPos = this.characterData.getPosition();
			const prevCharY = prevCharPos.y;


			const directions = this.controls.getDirections().split('');

			let newCharPos = prevCharPos;

			for(let i = 0; i < directions.length; i++){
				const dir = directions[i];


				switch(dir){
					case 'u':
						// Move UP only if new position is within bounds
						if( prevCharPos.y - this.spd > this.map.getMinMax().top ){
							console.log('this.map.getMinMax().top', this.map.getMinMax().top);
							newCharPos.y = prevCharPos.y - this.spd;
						}
						this.characterData.showDirection('up');
					break;
					case 'd':
						// Move DOWN only if new position is within bounds
						if( prevCharPos.y + this.spd < this.map.getMinMax().bottom ){
							newCharPos.y = prevCharPos.y + this.spd;
						}
						this.characterData.showDirection('down');
					break;
				}
			}

			if(directions.length == 0){
				this.characterData.showDirection('side');
			}

			if( newCharPos.y != prevCharY){

				// Update character position data
				this.characterData.updatePosition(newCharPos);
			}
			

			this.map.start();

			this.map.update();

		}, this.refreshRate);



	}

	buildMap(){
		this.map = new ComponentGameMap(
			this.data, 
			this.assets, 
			this.characterData, 
			this.finishGame, 
			this.endGame, 
			this.eventGame,
			this);

		this.map.setSpeed(this.initialSpd);

	}

	setupGame(){
		console.log('setupGame');
		this.spd = this.initialSpd;
		this.map.setSpeed(this.initialSpd);

		this.bonusTally = 1;

		this.pointValBurgers = this.pointValBurgersBase;
		this.pointValFries = this.pointValFriesBase;
		this.pointValDrinks = this.pointValDrinksBase;

		// Countdown 3, 2, 1
		const countdownParent = document.querySelector('#game .countdown');
		const countdownItems = document.querySelectorAll('#game .countdown .count');

		let countdown = 4;

		countdownParent.classList.add('on');

		this.countdownTimer = setInterval( () => {

			if(countdown < 4){
				const countItemPrev = countdownItems[countdown];
				countItemPrev.classList.add('off');
			}

			countdown --;

			const countItem = countdownItems[countdown];
			countItem.classList.remove('pre');
			countItem.classList.add('on');

			setTimeout( () => {
				countItem.classList.remove('on');
			}, 10);


			if(countdown == 0){

				// Clean up countdown process, and start the gameplay
				clearInterval(this.countdownTimer);

				this.startGame();
				this.controls.activate();

				countdownParent.classList.add('out');

				setTimeout( () => {
					countdownParent.classList.remove('on');
					countdownParent.classList.remove('out');
				}, 1500);
			}


		}, 1000);


		this.map.setupGame();
	}

	clearGame(){
		// Reset Countdown
		const countdownParent = document.querySelector('#game .countdown');
		const countdownItems = document.querySelectorAll('#game .countdown .count');

		for(let cd = 0; cd < countdownItems.length; cd++){
			const item = countdownItems[cd];

			item.classList.remove('off');
			item.classList.add('pre');

		}

		// Reset tallies
		this.strikes = 0;
		this.strikesDisplayed = 0;
		this.burgers = 0;
		this.burgersDisplayed = 0;
		this.fries = 0;
		this.friesDisplayed = 0;
		this.shakes = 0;
		this.shakesDisplayed = 0;

		this.points = 0;
		this.pointValBurgers = 0;
		this.pointValFries = 0;
		this.pointValDrinks = 0;


		// Rewrite scores in DOM
		const burgerScore = document.querySelector('#game .ui .tallies .pluses #item-0 .value h2');
		burgerScore.textContent = 0;

		const friesScore = document.querySelector('#game .ui .tallies .pluses #item-1 .value h2');
		friesScore.textContent = 0;

		const shakesScore = document.querySelector('#game .ui .tallies .pluses #item-2 .value h2');
		shakesScore.textContent = 0;


		const pointsScore = document.querySelector('#game .ui .tallies .points #points-item .value h2');
		pointsScore.textContent = 0;

		const strikes = document.querySelectorAll('#game .ui .tallies .strikes .strike-item');
		for( let strI = 0; strI < strikes.length; strI++){
			strikes[strI].classList.remove('out');
		}
		
		this.spd = this.initialSpd;

	}

	setCharacter(index){

		this.map.setCharacter(index);

		this.characterData.setCharacter(this.data.player.characters[index]);

		this.characterData.resetPosition( {x: this.data.player.x, y: this.data.player.y} );

		this.characterData.resetDirection();
	}

	off(){
		this.htmlElement.classList.remove('on');

		clearInterval(this.countdownTimer);

		clearInterval(this.gameLoop);

		this.clearGame();
	}

	resize(w,h){
		if(this.map){

			this.map.resize();

			this.verticalMin = this.map.getMinMax().top;
			this.verticalMax = this.map.getMinMax().bottom;
		}
	}

}
class PageInstructions extends Page{
	constructor(id, mainScope){
		super(id, mainScope);

		console.log('Instructions');

		const startButton = document.querySelector(`.page#` + id + ` .btn#play`);

		startButton.addEventListener('pointerup', () => {

			this.gotoNext();
		});
	}


}
class PagePreloader extends Page{
	constructor(id, mainScope){
		super(id, mainScope);


	}


}
class PageResults extends Page{
	constructor(id, mainScope){
		super(id, mainScope);

		this.resultWin = false;

		console.log('Results');

		console.log(`.page#` + id + ` #win.btn`);
		const restartButtonWin = document.querySelector(`.page#` + id + ` #win .btn`);

		restartButtonWin.addEventListener('pointerup', () => {
			this.reset();
		});


		const restartButtonLose = document.querySelector(`.page#` + id + ` #lose .btn`);

		restartButtonLose.addEventListener('pointerup', () => {
			this.reset();
		});
	}

	setResult(bool){
		this.resultWin = bool;

		this.resultScreen = document.querySelector('.page#results .result#win');
		if(bool !== true){
			this.resultScreen = document.querySelector('.page#results .result#lose');
		}

		this.resultScreen.classList.add('visible');
	}

	reset(){
		console.log('reset to title');

		this.resultScreen.classList.remove('visible');

		this.main.resetToTitle();
	}


}
class PageTitleScreen extends Page{
	constructor(id, mainScope){
		super(id, mainScope);

		const startButton = document.querySelector(`.page#` + id + ` .btn#start`);

		startButton.addEventListener('pointerup', () => {

			this.gotoNext();
		});

		// startButton.addEventListener('touchend', () => {

		// 	this.gotoNext();
		// });

	}


}
const manifest = [];

//let stage;
let canvas;
let main;
let preloader;
let data;
let spriteData = [];

function init(){

	canvas = document.getElementById('cvs');

	main = new App( canvas);

	main.resize();

	loadData();
}

function loadData(){
	const dataLoader = new createjs.LoadQueue();

	dataLoader.addEventListener('complete', (evt) => {

		for(let i = 0; i < dataLoader.getResult('data').objects.length; i++){
			const dataItem = dataLoader.getResult('data').objects[i];

			manifest.push(dataItem);


			// If audio file (only audio files will have a "data" property in load manifest), register sound
			if(dataItem.data){
				console.log('preload dataItem', dataItem);

				Audio.registerSound(dataItem.id, dataItem.src);
			}
			
		}

		data = dataLoader.getResult('data');

		preload();
	} );

	dataLoader.loadFile({ id: 'data', src: 'data/data.json' });
}

function preload(){
	preloader = new createjs.LoadQueue();
		const preloadProgressElement = document.querySelector('#preload .header #progress');

	preloader.on('progress', (evt) => {
		preloadProgressElement.textContent = Math.ceil(evt.progress * 100) + '%';
	});

	preloader.on('complete', () => {
		preloadProgressElement.textContent = '100%';

		setTimeout(() => {
			main.init(preloader, data);
		}, 1000);
		
	});

	preloader.loadManifest(manifest);
}

window.onload = init;