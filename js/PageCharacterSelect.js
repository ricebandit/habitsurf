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