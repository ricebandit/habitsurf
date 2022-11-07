class Audio{
	constructor(){
		const audio = {};

		createjs.Sound.alternateExtensions = ["mp3"];

		this.muted = false;
		this.interrupted = false;
		this.audioPath = "audio";

		// Used only if standalone CreateJS component. 
		// Usually, if used within a larger CreateJS app, 
		// audio files will already be loaded via manifest.
		this.numberLoaded = 0;
	}

	static registerSound(id, file){
		/* For future reference, this snippet is used during preload process, before manifest is called
			// If audio file (only audio files will have a "data" property in load manifest), register sound
			if(dataItem.data){
				console.log('preload dataItem', dataItem);

				Audio.registerSound(dataItem.id, dataItem.src);
			}
		*/
		createjs.Sound.registerSound({id: id, src: file});
	}

	static startNextSong(id, volume){
		if(this.currentSongId === id){return;}

        const songID = id;
        
        let musicVol = volume;
        if(volume == false || volume == "undefined" || volume == undefined){
            musicVol = 1;
        }
        
        
        // Check if there is already music playing
        if(this.music){
            // Tween volume down before starting next song

			createjs.Tween.get(this.music).to({volume:0}, 1000).call(() => {
				this.music.stop();
				this.playSong(songID, musicVol);
			});
        }else{
            // Play initial song
            this.playSong(id, musicVol);
        }
	}

	static playSong(id, musicVol){

		
        this.music = createjs.Sound.play(id, {loop:-1, volume:musicVol});
		this.currentSongId = id;
	}

	static quietMusic(delay){
        createjs.Tween.get(this.music).to({volume:0}, 100);

		setTimeout(() => {
			this.fadeIn();
		}, delay);
	}

	static fadeIn(){
        createjs.Tween.get(this.music).to({volume:1}, 1000);
    }

    static playIncidental(id, volume){
        // Play indicated sound effect, no looping
        if(this.muted){ return; }
        
        let sfxVol = volume;
        if(volume == false || volume == "undefined" || volume == undefined){
            sfxVol = 1;
        }
        
        createjs.Sound.play(id, {volume: sfxVol});
    }

    static mute(bool){
        if(bool){
            createjs.Sound.muted = true;
            this.muted = true;
        }else{
            createjs.Sound.muted = false;
            this.muted = false;
        }
    }

    static getMuted(){
        return this.muted;
    }

    static interrupt(){
        createjs.Sound.setMute(true);
        
        this.interrupted = true;
    }

    static uninterrupt(){
        if(this.muted == false){
            createjs.Sound.setMute(false);
        }
        
        this.interrupted = false;
    }

	// Used only if standalone CreateJS component. 
	// Usually, if used within a larger CreateJS app, 
	// audio files will already be loaded via manifest.
    static getProgress(){
        var loaded = this.numberLoaded / _audioManifest.length;
        return loaded;
    }



}