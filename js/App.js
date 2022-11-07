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