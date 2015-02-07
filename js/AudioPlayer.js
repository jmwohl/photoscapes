window.AudioPlayer = (function($, _) {
	var self = {},
		_curAudio,
		_prevAudio,
		$player = $('#AudioPlayer'),
		$progressWrap = $('.progress-wrap'),
		$playerProgress = $('.player-progress'),
		_radius = 15,
		_playerHeight = 200,
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
		_numSlides;

	function _draw(slides) {
		_slides = slides;
		_numSlides = slides.length;
		$playerProgress.val(0).knob(_knobOpts);
		$player.show();
	}

	function _start(slideIndex) {
		var slide = _slides[slideIndex];
		if (slide) {
			_setPlayerPosition(slideIndex);
			if (slide.aud) {
				// if there is audio currently playing, fade it out and stop updating the progress indicator
				if (_curAudio && _curAudio !== slide.aud) {
					_prevAudio = _curAudio;
					_removeTimeUpdates(_prevAudio);
					_fadeOutAudio(_prevAudio);
				}

				_curAudio = slide.aud;
				_listenToTimeUpdates(_curAudio);
				_fadeInAudio(_curAudio, !_isPaused);
			} else {
				_fadeOutAudio(_curAudio);
				_removeTimeUpdates(_curAudio);
			}
		}
	}

	function _pause() {
		_curAudio.pause();
		_isPaused = true;
	}

	function _play() {
		_curAudio.play();
		_isPaused = false;
	}

	function _setPlayerPosition(slideIndex) {
		var percent = slideIndex / (_numSlides - 1),
			position = _playerHeight * percent - _radius;
		$progressWrap.animate({'top': position}, _transitionDuration);
	}

	function _fadeInAudio(aud, play) {
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

	self.draw = _draw;
	self.start = _start;
	self.pause = _pause;
	self.play = _play;
	self.isPaused = function() {
		return _isPaused;
	};
	return self;
})($, _);