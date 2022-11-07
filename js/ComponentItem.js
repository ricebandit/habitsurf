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