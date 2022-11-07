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