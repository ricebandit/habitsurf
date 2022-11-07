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