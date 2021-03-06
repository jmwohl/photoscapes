/**
 * TODO:
 * 		- make everything a slide, including header, footer, and section
 */

window.Controller = (function($, Preloader) {
    var self = {},
        _data,
        _slides,
        _audio1 = new Audio(),
        _audio2 = new Audio(),
        _transitionDuration = 500,
        _curSlide = 0,
        $win = $(window),
        $headerTemplate = $("#Header"),
        _headerTplCompiled = _.template($headerTemplate.html()),
        $headerContent = $("#HeaderContent"),
        $preloader = $("#Preloader"),
        $photos = $("ul#Slides"),
        _slidesWrapH = 0,
        _winH = $win.height(),
        _winW = $win.width(),
        _imageW = _winW * 0.7,
        _scrollEvents = [];

    function _init(data_url) {
        _setupScreen();

        _setupEventHandlers();

        _loadData(data_url).done(_onDataLoaded);

        AudioPlayer.init({
        	imageW: _imageW,
        	winW: _winW
        });
    }

    function _loadData(data_url) {
        return $.get(data_url);
    }

    function _addScrollSnap() {
    	$(document).scrollsnap({
	        snaps: '.slide',
	        proximity: _winW/2,
	        easing: "easeInOutCubic",
	        duration: 500,
	        onSnap: _handleSnapToSlide
	    });
    }

    function _removeScrollSnap() {
    	$(document).unbind('scrollstop');
    }

    /**
     * Set the initial dimensions of the various components based on window size.
     */
    function _setupScreen() {
        console.log(_winH, _winW);
    }

    function _setupEventHandlers() {
    	console.log('_setupEventHandlers');

        _addScrollSnap();

        $(document).on('keydown', function(e) {
            console.log(e.keyCode);
            if (e.which == 40 || e.which == 39) {
                _nextSlide();
                e.preventDefault();
            } else if (e.which == 37 || e.which == 38) {
                _prevSlide();
                e.preventDefault();
            } else if (e.which == 32) {
            	if (AudioPlayer.isPaused()) {
                	AudioPlayer.play();
            	} else {
                	AudioPlayer.pause();
            	}
            	e.preventDefault();
            }
        });

        // scroll audio controls with body
        $(document).on('scroll', function(e) {
            
            // get scroll position as percent
            var scrollTop = $('body').scrollTop(),
                percent = scrollTop / (_slidesWrapH - _winH);
            
            AudioPlayer.setPlayerPosition(percent);
        });
    }

    // uses Preloader module, returns the deferred from the load method
    function _preloadSlides(slides) {
        return Preloader.load(slides);
    }

    function _playPhoto(index) {

    }

    function _nextSlide() {
        console.log("_nextSlide", _curSlide);
        var $el;
        if (_curSlide < _slides.length - 1) {
        	_curSlide += 1;
	        $el = $photos.find('li').eq(_curSlide);
	        _scrollToElement($el);
	        AudioPlayer.start(_curSlide);
        }
        
    }

    function _prevSlide() {
        console.log("_prevSlide", _curSlide);
        var $el;
        if (_curSlide > 0) {
        	_curSlide -= 1;
		    $el = $photos.find('li').eq(_curSlide);
	        _scrollToElement($el);
	        AudioPlayer.start(_curSlide);
        }
    }

    function _scrollToElement($el) {
    	console.log("$el: ", $el);
    	_removeScrollSnap();
    	$('body').stop().animate({
	            scrollTop: $el.offset().top
	        }, 
	        1500,
	        "easeInOutCubic",
	        function() {
	        	console.log('scroll complete');
                setTimeout(_addScrollSnap, 100);
	        	// _addScrollSnap();
	        });
    }


    function _drawContent() {
        console.log('_slides', _slides);

        AudioPlayer.draw(_slides);

        for (var i = 0; i < _slides.length; i++) {
        	var slide = _slides[i];

            var $li = $('<li>').addClass('slide').css({
                'height': _winH,
                'position': 'relative'
            }).attr('rel', i);

        	switch (slide.type) {
        		case 'header':
        			var $header = $(_headerTplCompiled(slide));
        			$li.append($header).addClass('header');
        			break;
        		case 'photo':
		            var $img = _slides[i].$img,
		            	oW = $img[0].width,
		            	oH = $img[0].height,
		            	nW = _imageW,
		            	nH = (nW/oW) * oH;
		            _slides[i].$img.width(nW);
		            console.log("HEIGHT", nH);
		            _slides[i].$img.css({
		                'position': 'relative',
		                'top': '50%',
		                'margin-top': -nH / 2
		            });
		            $li.append(_slides[i].$img);
        			break;
        		case 'footer':
        			break;
        	}

            $photos.append($li);
        }

        _onDrawComplete();
    }

    function _onDataLoaded(data) {
        console.log("loaded:", data);
        _data = data;
        _slides = data.slides;
        _preloadSlides(_slides).then(_drawContent);
    }

    function _onDrawComplete() {
        _slidesWrapH = $('#SlidesWrap').height();
    }

    function _handleSnapToSlide(el) {
        console.log('snapped');
    	_curSlide = parseInt($(el).attr('rel'));
    	AudioPlayer.start(_curSlide);
    }

    // display the header content, set HTML background color to white
    function _showHeaderContent(slide) {
        $('.title').text(slide.title);
        $('.date').text(slide.date);
        $('body').css('background-color', '#fff');
        $headerContent.css("left", _winW / 2 - $headerContent.width() / 2);
        $headerContent.show();
    }

    self.init = _init;

    return self;
})($, Preloader);
