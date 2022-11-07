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