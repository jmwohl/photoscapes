window.AudioPlayer = (function($, _) {
	var self = {},
		_inited = false,
		_curAudio,
		_prevAudio,
		$player = $('#AudioPlayer'),
		$progressWrap = $('.progress-wrap'),
		$playerProgress = $('.player-progress'),
		$btn = $('.play-pause-btn'),
		_radius = 15,
		_playerHeight = 200,
		_playerWidth = 30,
		_transitionDuration = 1000,
		_knobOpts = {
		    width: _radius*2,
		    max: 100,
		    readOnly: true,
		    inputColor: '#cbcac7',
		    fgColor: '#3f3e3c',
		    bgColor: '#f3f2f0',
		    fillColor: '#ffffff',
		    thickness: 0.2
		},
		_isPaused = false,
		_slides,
		_imageW,
		_winW,
		_numSlides;

	function _init(opts) {
		if (_inited) return;
		_winW = opts.winW;
		_imageW = opts.imageW;
		_setupMouseEvents();
		_inited = true;
	}
	
	function _draw(slides) {
		_slides = slides;
		_numSlides = slides.length;
		$player.css({
			'right': (_winW - _imageW)/4 - _playerWidth/2
		});
		$playerProgress.val(0).knob(_knobOpts);
		$player.show();
	}

	function _setupMouseEvents() {
		$(document).on('click', '.play-pause-btn', function() {
			if (_isPaused) {
            	_play();
        	} else {
            	_pause();
        	}
		});
	}

	function _start(slideIndex) {
		var slide = _slides[slideIndex];
		if (slide) {
			// _setPlayerPositionByIndex(slideIndex);
			if (slide.aud) {
				// if there is audio currently playing, fade it out and stop updating the progress indicator
				if (_curAudio && _curAudio !== slide.aud) {
					_prevAudio = _curAudio;
					_removeTimeUpdates(_prevAudio);
					_fadeOutAudio(_prevAudio);
				}
				_curAudio = slide.aud;
				_curAudio.currentTime = 0;
				_listenToTimeUpdates(_curAudio);
				_fadeInAudio(_curAudio, !_isPaused);
			} else {
				_fadeOutAudio(_curAudio);
				_removeTimeUpdates(_curAudio);
			}
		}
	}

	function _pause() {
		if (!_curAudio) return;
		_curAudio.pause();
		if (_prevAudio) {
			_prevAudio.pause();
		}
		$btn.removeClass('pause').addClass('play');
		_isPaused = true;
	}

	function _play() {
		if (!_curAudio) return;
		console.log(_curAudio);
		_curAudio.play();
		$btn.removeClass('play').addClass('pause');
		_isPaused = false;
	}

	function _setPlayerPositionByIndex(slideIndex) {
		var percent = slideIndex / (_numSlides - 1),
			position = _playerHeight * percent - _radius;
		$progressWrap.animate({'top': position}, _transitionDuration);
	}

	function _setPlayerPosition(percent) {
		var position = _playerHeight * percent - _radius;
		$progressWrap.css({'top': position});
	}

	function _fadeInAudio(aud, play) {
		// console.log("AUD", $(aud));
		// console.log(aud);
		// aud.play(0);
		aud.volume = 0;
		if (play) {
			_play();
		}
		_fadeAudio(aud, 1, _transitionDuration);
	}

	function _fadeOutAudio(aud) {
		_fadeAudio(aud, 0, _transitionDuration*4);
	}

	function _fadeAudio(aud, endValue, duration) {
		return $(aud).stop().animate({volume: endValue}, {
			duration: duration,
			complete: function() {
				if (endValue === 0) {
					aud.pause();
				}
			}
		});
	}

	function _updateProgress(e) {
		// console.log('_updateProgress', e);
		var percentDone = (e.target.currentTime / e.target.duration) * 100;
		$playerProgress.val(percentDone);
		$playerProgress.trigger('change');
	}

	function _listenToTimeUpdates(aud) {
		$(aud).on('timeupdate', _updateProgress);
	}

	function _removeTimeUpdates(aud) {
		_resetIndicator();
		$(aud).off('timeupdate');
	}

	function _resetIndicator() {
		$playerProgress.val(0);
		$playerProgress.trigger('change');
	}

	self.init = _init;
	self.draw = _draw;
	self.start = _start;
	self.pause = _pause;
	self.play = _play;
	self.setPlayerPosition = _setPlayerPosition;
	self.isPaused = function() {
		return _isPaused;
	};
	return self;
})($, _);