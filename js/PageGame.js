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