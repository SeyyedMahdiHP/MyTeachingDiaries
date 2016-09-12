//$(function(){
//    jQuery('img.svg, img.intro-pic').each(function(){
//        var $img = jQuery(this);
//        var imgID = $img.attr('id');
//        var imgClass = $img.attr('class');
//        var imgURL = $img.attr('src');
//    
//        jQuery.get(imgURL, function(data) {
//            // Get the SVG tag, ignore the rest
//            var $svg = jQuery(data).find('svg');
//    
//            // Add replaced image's ID to the new SVG
//            if(typeof imgID !== 'undefined') {
//                $svg = $svg.attr('id', imgID);
//            }
//            // Add replaced image's classes to the new SVG
//            if(typeof imgClass !== 'undefined') {
//                $svg = $svg.attr('class', imgClass+'replaced-svg');
//            }
//    
//            // Remove any invalid XML tags as per http://validator.w3.org
//            $svg = $svg.removeAttr('xmlns:a');
//            
//            // Check if the viewport is set, else we gonna set it if we can.
//            if(!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
//                $svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'))
//            }
//    
//            // Replace image with new SVG
//            $img.replaceWith($svg);
//    
//        }, 'xml');
//    
//    });
//});



jQuery(document).ready(function ($) {
    //if you change this breakpoint in the style.css file (or _layout.scss if you use SASS), don't forget to update this value as well
    var MQL = 1170;

    //primary navigation slide-in effect
    if ($(window).width() > MQL) {
        var headerHeight = $('.cd-header').height();
        $(window).on('scroll', {
                previousTop: 0
            },
            function () {
                var currentTop = $(window).scrollTop();
                //check if user is scrolling up
                if (currentTop < this.previousTop) {
                    //if scrolling up...
                    if (currentTop > 0 && $('.cd-header').hasClass('is-fixed')) {
                        $('.cd-header').addClass('is-visible');
                    } else {
                        $('.cd-header').removeClass('is-visible is-fixed');
                    }
                } else {
                    //if scrolling down...
                    $('.cd-header').removeClass('is-visible');
                    if (currentTop > headerHeight && !$('.cd-header').hasClass('is-fixed')) $('.cd-header').addClass('is-fixed');
                }
                this.previousTop = currentTop;
            });
    }
    // BG SCROLL 
    bindBgScroll('.blog-banner');     
   

    //open/close primary navigation
    $('.cd-primary-nav-trigger').on('click', function () {
        $('.cd-menu-icon').toggleClass('is-clicked');
        $('.cd-header').toggleClass('menu-is-open');

        //in firefox transitions break when parent overflow is changed, so we need to wait for the end of the trasition to give the body an overflow hidden
        if ($('.cd-primary-nav').hasClass('is-visible')) {
            $('.cd-primary-nav').removeClass('is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function () {
                $('body').removeClass('overflow-hidden');
            });
        } else {
            $('.cd-primary-nav').addClass('is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function () {
                $('body').addClass('overflow-hidden');
            });
        }
    });
});


fullscreen();
$(window).resize(fullscreen);
$(window).scroll(headerParallax);

function fullscreen() {
	var masthead = $('.homepage-hero-module');
	var windowH = $(window).height();
	var windowW = $(window).width();

	masthead.width(windowW);
	masthead.height(windowH);
}

function headerParallax() {
	var st = $(window).scrollTop();
	var headerScroll = $('.homepage-hero-module .title-container');

	if (st < 500) {
		headerScroll.css('opacity', 1-st/1000);
		$('.down-arrow').css('opacity', 1-st/500);
		headerScroll.css({
			'-webkit-transform' : 'translateY(' + st/5 + '%)',
			'-ms-transform' : 'translateY(' + st/5 + '%)',
			transform : 'translateY(' + st/5 + '%)'
		});
	}
}





// SVG ANIMATION

var setupPaths = function () {
    $('.ani-icon path').each(function () {
        var $path = $(this);
        var totalLength = $path[0].getTotalLength();

        $path.css({
            'stroke-dasharray': totalLength + ' ' + totalLength
        });
        $path.css({
            'stroke-dashoffset': -totalLength
        });
    });
}

var drawPath = function () {
    $("section").each(function () {
        var bottom_of_object, bottom_of_window;
        bottom_of_object = $(this).position().top + $(this).outerHeight() + ($(window).height() / 2);
        bottom_of_window = $(window).scrollTop();

        if (bottom_of_window >= bottom_of_object) {
            $(this).find("path").animate({
                'stroke-dashoffset': 0
            }, 2000)
        }
    });
};

$(document).ready(function () {
    setupPaths();
    drawPath();

    $(window).scroll(function () {
        drawPath();
    });
});

// BACK TO TOP

jQuery(document).ready(function ($) {
    // browser window scroll (in pixels) after which the "back to top" link is shown
    var offset = 300,
        //browser window scroll (in pixels) after which the "back to top" link opacity is reduced
        offset_opacity = 1200,
        //duration of the top scrolling animation (in ms)
        scroll_top_duration = 700,
        //grab the "back to top" link
        $back_to_top = $('.cd-top');

    //hide or show the "back to top" link
    $(window).scroll(function () {
        ($(this).scrollTop() > offset) ? $back_to_top.addClass('cd-is-visible'): $back_to_top.removeClass('cd-is-visible cd-fade-out');
        if ($(this).scrollTop() > offset_opacity) {
            $back_to_top.addClass('cd-fade-out');
        }
    });

    //smooth scroll to top
    $back_to_top.on('click', function (event) {
        event.preventDefault();
        $('body,html').animate({
            scrollTop: 0,
        }, scroll_top_duration);
    });

});


// slide-in-panel

jQuery(document).ready(function($){
	//open the lateral panel
	$('.cd-btn').on('click', function(event){
		event.preventDefault();
		$('.cd-panel').addClass('is-visible');
        $('body').addClass('hidescroll');
	});
	//clode the lateral panel
	$('.cd-panel').on('click', function(event){
		if( $(event.target).is('.cd-panel') || $(event.target).is('.cd-panel-close') ) { 
			$('.cd-panel').removeClass('is-visible');
            $('body').removeClass('hidescroll');
			event.preventDefault();
		}
	});
});



$(document).ready(function() {



	/* When user clicks the Icon */
	$('.nav-toggle').click(function() {
		$(this).toggleClass('active');
		$('.header-nav').toggleClass('open');
		event.preventDefault();
	});
	/* When user clicks a link */
	$('.header-nav li a').click(function() {
		$('.nav-toggle').toggleClass('active');
		$('.header-nav').toggleClass('open');

	});

	/***************** Header BG Scroll ******************/

	$(function() {
		$(window).scroll(function() {
			var scroll = $(window).scrollTop();

			if (scroll >= 20) {
				$('section.navigation').addClass('fixed');
				$('header').css({
					"border-bottom": "none",
					"padding": "10px 0"
				});
				$('header .member-actions').css({
					"top": "26px",
				});
				$('header .navicon').css({
					"top": "34px",
				});
			} else {
				$('section.navigation').removeClass('fixed');
				$('header').css({
					"border-bottom": "solid 1px rgba(255, 255, 255, 0.2)",
					"padding": "30px 0"
				});
				$('header .member-actions').css({
					"top": "41px",
				});
				$('header .navicon').css({
					"top": "44px",
				});
            
			}
		});
	});
	/***************** Smooth Scrolling ******************/

    
    
    
 $('a[href^="#"]').on('click', function (event) {
            var target = $($(this).attr('href'));
            if (target.length) {
                event.preventDefault();
                $('html, body').animate({
                     scrollTop: target.offset().top-80
                }, 1000);
            }
        });
        
        $('textarea.expand').focus(function () { 
            $(this).animate({ height: "150px" }, 500);  
        });
        
        $(" textarea.expand").focus(function(){
            $('.commentsdiv').slideDown(600);
        })

});
    // mobClickt();
    // jQuery(window).resize(function() {
    //     mobClickt();
    // });
    
    // function mobClickt() {      
    //     if(jQuery(window).innerWidth()< 992){
    //         jQuery('.dem').removeClass('hassub');  
    //         jQuery('.dropdown-menu').hide();  
    //     }else{
    //         jQuery('.dem').addClass('hassub');
    //         jQuery('.dropdown-menu').show();        
    //     }
    // }

    //     jQuery('.mob-drop').click(function(){
    //     jQuery('.hassub').removeClass('active')
    //   if(jQuery(this).parent().hasClass('active')){
    //       jQuery(this).parent().removeClass('active')
    //   }
    //    else{
    //        jQuery(this).parent().addClass('active')
    //    }
    // });





function bindBgScroll(ele){
 // this.element = ele;
    $(window).on('scroll', function() {
      const scrolled = $(window).scrollTop();
      //Move & fade the H1 on scroll.
      $(`${ele} .fadebox`).css({
        'top':`${scrolled * 0.3}px`,
        'opacity':`${1-(scrolled/$(ele).outerHeight())*1.8}` 
      });
      //Move & zoom the hero background image
      $(ele).css({
        'background-position':`50% calc(50% + ${scrolled * 0.2}px)`,
        'background-size': `${120 + (scrolled*50/$(ele).outerHeight())}%`
      });
      //Fade the extra rainbow div just in case it's visible
      $(`${ele} .overlay`).css('opacity', `${0.4 + (scrolled/$(ele).outerHeight())}`);
    });  
}  






