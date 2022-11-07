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