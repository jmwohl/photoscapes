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
        $header = $("#Header"),
        $headerContent = $("#HeaderContent"),
        $preloader = $("#Preloader"),
        $photos = $("ul#Photos"),
        _winH = $win.height(),
        _winW = $win.width(),
        _scrollEvents = [];

    function _init(data_url) {
        _setupScreen();

        _setupEventHandlers();

        _loadData(data_url).done(_onDataLoaded);
    }

    function _loadData(data_url) {
        return $.get(data_url);
    }

    /**
     * Set the initial dimensions of the various components based on window size.
     */
    function _setupScreen() {
        console.log(_winH, _winW);
        $header.css("height", _winH + "px");
        $preloader.css("top", _winH / 2 - Preloader.radius);
        $preloader.css("left", _winW / 2 - Preloader.radius);

        // this minus offset is a guess... should be calculated.
        $headerContent.css("top", _winH / 2 - 100);

        // var padding = (_winH - $("#HeaderContent").height())/2;
        // $header.css("padding", padding + "px 0px");
    }

    function _setupEventHandlers() {
        // $('body').on({
        //     'mousewheel': function(e) {
        //         console.log(e);
        //         // e.preventDefault();
        //         // e.stopPropagation();

        //         _scrollEvents.push(e);
        //         _scrollEvents.slice(0, 2);


        //     }
        // });

        $(document).on('scrollstop', function(e) {
        	
        });

        $(document).on('keydown', function(e) {
            console.log(e.keyCode);
            if (e.which == 40 || e.which == 39) {
                _nextSlide();
                e.preventDefault();
            } else if (e.which == 37 || e.which == 38) {
                _prevSlide();
                e.preventDefault();
            }
        });
    }

    // uses Preloader module, returns the deferred from the load method
    function _preloadSlides(slides) {
        return Preloader.load(slides);
    }

    function _playPhoto(index) {

    }

    function _setCurrentSlide() {
    	// var curScroll = 
    }

    function _nextSlide() {
        console.log("_nextSlide");
        var $el;
        if (_curSlide < _slides.length + 1) {
        	_curSlide += 1;
        }
        if (_curSlide == _slides.length + 1) {
        	$el = $footer;
        } else {
        	$el = $photos.find('li').eq(_curSlide - 1);
        }
        _scrollToElement($el);
        
    }

    function _prevSlide() {
        console.log("_prevSlide");
        var $el;
        if (_curSlide > 0) {
        	_curSlide -= 1;
        }
        if (_curSlide == 0) {
        	$el = $header;
        } else {
	        $el = $photos.find('li').eq(_curSlide - 1);
        	
        }
        _scrollToElement($el);
    }

    function _scrollToElement($el) {
    	$('html, body').stop().animate({
            scrollTop: $el.offset().top
        }, 1200);
    }


    function _drawContent() {
        _showHeaderContent();
        console.log('_slides', _slides);
        for (var i = 0; i < _slides.length; i++) {

            var $li = $('<li>').css({
                'height': _winH,
                'position': 'relative'
            });

            var imgH = _winH * .75;
            _slides[i].$img.height(imgH);
            _slides[i].$img.css({
                'position': 'relative',
                'top': '50%',
                'margin-top': -imgH / 2
            });
            $li.append(_slides[i].$img);
            $photos.append($li);
        }
    }

    function _onDataLoaded(data) {
        console.log("loaded:", data);
        _data = data;
        _slides = data.slides;
        _preloadSlides(_slides).then(_drawContent);
    }

    // display the header content, set HTML background color to white
    function _showHeaderContent() {
        $('.title').text(_data.title);
        $('.date').text(_data.date);
        $('body').css('background-color', '#fff');
        $headerContent.css("left", _winW / 2 - $headerContent.width() / 2);
        $headerContent.show();
    }

    self.init = _init;

    return self;
})($, Preloader);
