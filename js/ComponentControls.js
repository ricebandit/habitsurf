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