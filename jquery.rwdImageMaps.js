/*
* rwdImageMaps jQuery plugin v1.5
*
* Allows image maps to be used in a responsive design by recalculating the area coordinates to match the actual image size on load and window.resize
*
* Copyright (c) 2013 Matt Stow
* https://github.com/stowball/jQuery-rwdImageMaps
* http://mattstow.com
* Licensed under the MIT license
* Usage: 
*	Without debounce
*	$('img[usemap]').rwdImageMaps();
*   
*	Disable.
*   $('img[usemap]').rwdImageMaps('off');
*
*	With debounce on at 500ms
*	$('img[usemap]').rwdImageMaps({
*		debounce: true,
*		timeout: 500
*	});
*/
;(function($) {
	$.fn.rwdImageMaps = function(options) {
		var $img = this,
			defaults = {
				debounce: false,
				timeout: 300 
			},
			// If options is an object, overwrite defaults with options.
			opts = $.extend(defaults, typeof options === 'object' ? options : {}),
			action;

		// If options is a string, use it as the action.
		if (typeof options === 'string') {
			action = options;
		}

		var rwdImageMap = function() {
			$img.each(function() {
				if (typeof($(this).attr('usemap')) == 'undefined')
					return;
				
				var that = this,
					$that = $(that);
				
				// Since WebKit doesn't know the height until after the image has loaded, perform everything in an onload copy
				$('<img />').load(function() {
					var attrW = 'naturalWidth',
						attrH = 'naturalHeight',
						c = 'coords',
						w = $that.attr(attrW),
						h = $that.attr(attrH),
						map;
					
					if (!w || !h) {
						var temp = new Image();
						temp.src = $that.attr('src');
						if (!w)
							w = temp.width;
						if (!h)
							h = temp.height;
					}
					
					w = $that.width()/w;
					h = $that.height()/h;
					
					if (w <= 0 || h <= 0) {
						// Prevent output of 0,0,0,0 coords if the image is hidden 
						return;
					}
					
					map = $that.attr('usemap').replace('#', '');
					
					$('map[name="' + map + '"]').find('area').each(function() {
						var $this = $(this);
						if (!$this.data(c))
							$this.data(c, $this.attr(c));
						
						var coords = $this.data(c).split(','),
							coordsPercent = new Array(coords.length);
						
						for (var i = 0; i < coordsPercent.length; ++i) {
							if (i % 2 === 0)
								coordsPercent[i] = parseInt(coords[i]*w);
							else
								coordsPercent[i] = parseInt(coords[i]*h);
						}
						$this.attr(c, coordsPercent.toString());
					});
				}).attr('src', $that.attr('src'));
			});
		};
		var debounce = function (fun, mil) {
			var timer;
			return function () {
				clearTimeout(timer);
					timer = setTimeout(function () {
					fun();
				}, mil);
			};
		};

		if (action === 'off') {
			$img.off('resize.rwdImageMaps');
		} else if (opts.debounce) {
			$(window).on('resize.rwdImageMaps', debounce(rwdImageMap, opts.timeout));
		} else {
			$(window).on('resize.rwdImageMaps', rwdImageMap);
		}
		
		return this;
	};
})(jQuery);