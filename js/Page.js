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