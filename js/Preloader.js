window.Preloader = (function() {
	var self = {},
		_slides,
		_totalSlides,
		_numLoaded = 0,
		_curLoading = 0,
		_radius = 20,
		_knobOpts = {
		    width: _radius*2,
		    max: 0,
		    readOnly: true,
		    inputColor: '#cbcac7',
		    fgColor: '#3f3e3c',
		    thickness: 0.2
		},
		$preloader = $('#Preloader'),
		_doneDfd;


	function _load(slides) {
		_slides = slides;
		_totalSlides = _knobOpts.max = _slides.length;
		_curLoading = 0;
		_doneDfd = $.Deferred();

		_showPreloader();
		
		var loadCompleteDfd = $.Deferred();

		_loadSlide(_slides[_curLoading]);

		return _doneDfd;
	}

	function _loadSlide(slide) {
		console.log('_loadSlide', slide);

		if (slide.type != 'photo') {
			$(".dial").val(_numLoaded).trigger('change');
			_numLoaded += 1;
			if (_numLoaded < _totalSlides) {
				_curLoading += 1;
				_loadSlide(_slides[_curLoading]);
			} else {
				_hidePreloader();
				_doneDfd.resolve();
			}
			return;
		}

		// load the img
		var imgDfd = _loadImage(slide.img_url);
		
		// load the audio
		var audDfd = _loadAudio(slide.aud_url);
		
		// when both are loaded, see about loading the next one...
		$.when(imgDfd, audDfd).done(function($img, aud) {
			slide.$img = $img;
			if (aud) {
				aud.loop = true;
				aud.volume = 0;
				slide.aud = aud;
				// for overlapping loop
				slide.audB = aud.cloneNode();
			}

			_numLoaded += 1;
			$(".dial").val(_numLoaded).trigger('change');			

			if (_numLoaded < _totalSlides) {
				_curLoading += 1;
				_loadSlide(_slides[_curLoading]);
			} else {
				_hidePreloader();
				_doneDfd.resolve();
			}

		});
	}

	// preload an image
	function _loadImage(url) {
		var dfd = $.Deferred(),
			$img = $('<img>');

		// set up preloading
		$img.load(function() {
			console.log('image loaded');
			dfd.resolve($img);
		});
		$img.attr('src', url);
		
		return dfd.promise();
	}

	// preload an Audio file
	// TODO: in this case we're going to wait for all of the audio files to reach "canplaythrough", which probably isn't necessary
	// ... might be better to just preload the first couple?
	// 
	//  - Looks like 'canplaythrough' maybe doesn't work/exist on mobile safari, so need another solution for preloading.
	//  - Also, mobile can only play one sound at a time, so no cross fades...
	function _loadAudio(url) {

		var dfd = $.Deferred(),
			audio = new Audio();
	    if (!url) {
	    	dfd.resolve();
	    	return;
	    }
	    audio.addEventListener('canplaythrough', function() {
	    	console.log('audio loaded');
	    	dfd.resolve(audio);
	    }, false);
	    audio.src = url;

	    // dfd.resolve(audio);
	    
		return dfd.promise();
	}

	function _showPreloader() {
		$preloader.find('.dial').val(_numLoaded).knob(_knobOpts);

		$("#Preloader").show();
	}

	function _hidePreloader() {
		$("#Preloader").hide();
	}


	self.load = _load;
	self.radius = _radius;
	return self;
})();