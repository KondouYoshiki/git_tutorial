/**
 * jquery.scrollFollow.js
 * Copyright (c) 2008 Net Perspective (http://kitchen.net-perspective.com/)
 * Licensed under the MIT License (http://www.opensource.org/licenses/mit-license.php)
 * 
 * @author R.A. Ray
 *
 * @projectDescription	jQuery plugin for allowing an element to animate down as the user scrolls the page.
 * 
 * @version 0.4.0
 * 
 * @requires jquery.js (tested with 1.2.6)
 * @requires ui.core.js (tested with 1.5.2)
 * 
 * @optional jquery.cookie.js (http://www.stilbuero.de/2006/09/17/cookie-plugin-for-jquery/)
 * @optional jquery.easing.js (http://gsgd.co.uk/sandbox/jquery/easing/ - tested with 1.3)
 * 
 * @param speed		int - Duration of animation (in milliseconds)
 * 								default: 500
 * @param offset			int - Number of pixels box should remain from top of viewport
 * 								default: 0
 * @param easing		string - Any one of the easing options from the easing plugin - Requires jQuery Easing Plugin < http://gsgd.co.uk/sandbox/jquery/easing/ >
 * 								default: 'linear'
 * @param container	string - ID of the containing div
 * 								default: box's immediate parent
 * @param killSwitch	string - ID of the On/Off toggle element
 * 								default: 'killSwitch'
 * @param onText		string - killSwitch text to be displayed if sliding is enabled
 * 								default: 'Turn Slide Off'
 * @param offText		string - killSwitch text to be displayed if sliding is disabled
 * 								default: 'Turn Slide On'
 * @param relativeTo	string - Scroll animation can be relative to either the 'top' or 'bottom' of the viewport
 * 								default: 'top'
 * @param delay			int - Time between the end of the scroll and the beginning of the animation in milliseconds
 * 								default: 0
 * 
 * 
 * 上記は本家jquery scroll followの説明です。
 * 以下はそれを元に作ったjquery scroll follow plusについてです。
 * 
 * Copyright (c) 2011 銑鉄網-roheisen net(http://roheisen.net/), 響 2nd Season(http://h2s.roheisen.net/)
 * Licensed under the MIT License (http://www.opensource.org/licenses/mit-license.php)
 * 
 * @改変作者					銑鉄計画(roheisen projekt) - MMZK, 松下 響
 * 
 * @必須、オプションライブラリ	変更ありません
 * 
 * @param ralativeTo			string	- フォローボックスが画面の上下どちらにフィットするかのオプションです。 'both'、'top'、'bottom'の三つがあります。
 * 											default: 'both'
 * @param topAdjust				int		- 画面上端フィット時にフォローボックスとその中身の可視オブジェクトの間に空いている隙間を何ピクセル詰めるかというオプションです。
 * 											default: 0
 * @param topOverrun			int		- フォローボックスがその親ボックスの上端より何ピクセルはみ出したところまで移動できるかというオプションです。
 * 											default: 0
 * @param bottomAdjust			int		- 画面下端フィット時にフォローボックスとその中身の可視オブジェクトの間に空いている隙間を何ピクセル詰めるかというオプションです。
 * 											default: 0
 * @param bottomOverrun			int		- フォローボックスがその親ボックスの下端より何ピクセルはみ出したところまで移動できるかというオプションです。
 * 											default: 0
 * @param offset				上記4つに細分化したため、無くなりました。
 */

( function( $ ) {
	
	$.scrollFollow = function ( box, options )
	{ 
		// Convert box into a jQuery object
		box = $( box );
		
		// 'box' is the object to be animated
		var position = box.css( 'position' );
		
		function ani()
		{		
			// The script runs on every scroll which really means many times during a scroll.
			// We don't want multiple slides to queue up.
			box.queue( [ ] );
		
			// A bunch of values we need to determine where to animate to
			var viewportHeight = parseInt( $( window ).height() );	
			var pageScroll =  parseInt( $( document ).scrollTop() );
			var parentTop =  parseInt( box.cont.offset().top );
			var parentHeight = parseInt( box.cont.attr( 'offsetHeight' ) );
			var boxHeight = parseInt( box.attr( 'offsetHeight' ) );
			var innerHeight = boxHeight - options.topAdjust - options.bottomAdjust;
			var aniTop;
			var animateflag = 0;
			var topoverflag = 0;
			var bottomoverflag = 0;
			var fitTo;
			var currentTop = parseInt( box.css( 'top' ) );
			if (!currentTop) { currentTop = 0; }
			
			// Make sure the user wants the animation to happen
			if ( isActive )
			{
				//フィット処理分岐
				switch (options.relativeTo)
				{
					case 'top':
						fitTo = 'top';
						animateflag = 1;
						break;
					case 'bottom':
						fitTo = 'bottom';
						animateflag = 1;
						break;
					default:
						//both
						if (innerHeight < viewportHeight)
						{
							//フォローボックスの中身の全高がウィンドウ高さより小さい場合topとして処理
							fitTo = 'top';
							animateflag = 1;
						}
						else
						{
							//上端画面外フラグ判定
							if ((box.initialOffsetTop + currentTop + options.topAdjust) < pageScroll)
							{	topoverflag = 1;	}
							//下端画面外フラグ判定
							if ((box.initialOffsetTop + currentTop + boxHeight - options.bottomAdjust) > (pageScroll + viewportHeight))
							{	bottomoverflag = 1;	}
							
							// ボックスの上端・下端がどちらも画面内に入っていない場合は動かない
							if ((topoverflag) && (bottomoverflag))
							{
								fitTo = 'free';
								animateflag = 0;	
							}
							//ボックスの下端だけが画面外の場合、topとして処理
							else if (bottomoverflag) {
								fitTo = 'top';
								animateflag = 1;
							}
							//ボックスの上端だけが画面外の場合、bottomとして処理
							else if (topoverflag)
							{
								fitTo = 'bottom';
								animateflag = 1;
							}
							//先にサイズを測っているため上下両方画面内はあり得ないが、念のため動かないフラグを立てる
							else
							{
								fitTo = 'free';
								animateflag = 0;
							}
						}
						break;
				}
				// 上端フィット
				if (fitTo == 'top')
				{
					aniTop = Math.max( ( -options.topOverrun ) ,  Math.min( ( pageScroll - box.initialOffsetTop - options.topAdjust ), ( parentHeight - boxHeight + options.bottomOverrun ) ) );
				}
				// 下端フィット
				if (fitTo == 'bottom')
				{
					aniTop = Math.max( ( -options.topOverrun ) ,  Math.min( ( pageScroll + viewportHeight - box.initialOffsetTop - boxHeight + options.bottomAdjust), ( parentHeight - boxHeight + options.bottomOverrun ) ) );
				}
				
				// Checks to see if the relevant scroll was the last one
				// "-20" is to account for inaccuracy in the timeout
				if (animateflag)
				{
					if ( ( new Date().getTime() - box.lastScroll ) >= ( options.delay - 20 ) )
					{
						box.animate(
							{
								top: aniTop
							}, options.speed, options.easing
						);
					}
				}
			}
		};
		
		// For user-initiated stopping of the slide
		var isActive = true;
		
		if ( $.cookie != undefined )
		{
			if( $.cookie( 'scrollFollowSetting' + box.attr( 'id' ) ) == 'false' )
			{
				var isActive = false;
				
				$( '#' + options.killSwitch ).text( options.offText )
					.toggle( 
						function ()
						{
							isActive = true;
							
							$( this ).text( options.onText );
							
							$.cookie( 'scrollFollowSetting' + box.attr( 'id' ), true, { expires: 365, path: '/'} );
							
							ani();
						},
						function ()
						{
							isActive = false;
							
							$( this ).text( options.offText );
							
							box.animate(
								{
									top: box.initialTop
								}, options.speed, options.easing
							);	
							
							$.cookie( 'scrollFollowSetting' + box.attr( 'id' ), false, { expires: 365, path: '/'} );
						}
					);
			}
			else
			{
				$( '#' + options.killSwitch ).text( options.onText )
					.toggle( 
						function ()
						{
							isActive = false;
							
							$( this ).text( options.offText );
							
							box.animate(
								{
									top: box.initialTop
								}, 0
							);	
							
							$.cookie( 'scrollFollowSetting' + box.attr( 'id' ), false, { expires: 365, path: '/'} );
						},
						function ()
						{
							isActive = true;
							
							$( this ).text( options.onText );
							
							$.cookie( 'scrollFollowSetting' + box.attr( 'id' ), true, { expires: 365, path: '/'} );
							
							ani();
						}
					);
			}
		}
		
		// If no parent ID was specified, and the immediate parent does not have an ID
		// options.container will be undefined. So we need to figure out the parent element.
		if ( options.container == '')
		{
			box.cont = box.parent();
		}
		else
		{
			box.cont = $( '#' + options.container );
		}
		
		// Finds the default positioning of the box.
		box.initialOffsetTop =  parseInt( box.offset().top );
		box.initialTop = parseInt( box.css( 'top' ) ) || 0;
		
		// Hack to fix different treatment of boxes positioned 'absolute' and 'relative'
		if ( box.css( 'position' ) == 'relative' )
		{
			box.paddingAdjustment = parseInt( box.cont.css( 'paddingTop' ) ) + parseInt( box.cont.css( 'paddingBottom' ) );
		}
		else
		{
			box.paddingAdjustment = 0;
		}
		
		// Animate the box when the page is scrolled
		$( window ).scroll( function ()
			{
				// Sets up the delay of the animation
				$.fn.scrollFollow.interval = setTimeout( function(){ ani();} , options.delay );
				
				// To check against right before setting the animation
				box.lastScroll = new Date().getTime();
			}
		);
		
		// Animate the box when the page is resized
		$( window ).resize( function ()
			{
				// Sets up the delay of the animation
				$.fn.scrollFollow.interval = setTimeout( function(){ ani();} , options.delay );
				
				// To check against right before setting the animation
				box.lastScroll = new Date().getTime();
			}
		);

		// Run an initial animation on page load
		box.lastScroll = 0;
		
		ani();
	};
	
	$.fn.scrollFollow = function ( options )
	{
		options = options || {};
		options.relativeTo = options.relativeTo || 'both';
		options.speed = options.speed || 500;
		options.topAdjust = options.topAdjust || 0;
		options.topOverrun = options.topOverrun || 0;
		options.bottomAdjust = options.bottomAdjust || 0;
		options.bottomOverrun = options.bottomOverrun || 0;
		options.easing = options.easing || 'swing';
		options.container = options.container || this.parent().attr( 'id' );
		options.killSwitch = options.killSwitch || 'killSwitch';
		options.onText = options.onText || 'Turn Slide Off';
		options.offText = options.offText || 'Turn Slide On';
		options.delay = options.delay || 0;
		
		this.each( function() 
			{
				new $.scrollFollow( this, options );
			}
		);
		
		return this;
	};
})( jQuery );
