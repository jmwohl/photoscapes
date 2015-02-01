window.Preloader = (function() {
	var self = {},
		_slides,
		_totalSlides,
		_numLoaded = 0,
		_curLoading = 0,
		_radius = 20,
		_knobOpts = {
		    width: _radius*2,
		    max: _totalSlides,
		    readOnly: true,
		    inputColor: '#cbcac7',
		    fgColor: '#3f3e3c',
		    thickness: 0.2
		},
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
		// load the img
		var imgDfd = _loadImage(slide.img_url);
		
		// load the audio
		var audDfd = _loadAudio(slide.aud_url);
		
		// when both are loaded, see about loading the next one...
		$.when(imgDfd, audDfd).done(function($img, aud) {
			slide.$img = $img;
			slide.aud = aud;
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
			dfd.resolve($img);
		});
		$img.attr('src', url);
		
		return dfd.promise();
	}

	// TODO: preload an Audio file
	function _loadAudio(url) {
		var dfd = $.Deferred(),
			$img = $('<img>');

			dfd.resolve();
		// // set up preloading
		// $img.load(dfd.resolve);
		// $img.attr('src', url);
		
		return dfd.promise();
	}

	function _showPreloader() {
		$(".dial").val(_numLoaded).knob(_knobOpts);
		$("#Preloader").show();
	}

	function _hidePreloader() {
		$("#Preloader").hide();
	}


	self.load = _load;
	self.radius = _radius;
	return self;
})();