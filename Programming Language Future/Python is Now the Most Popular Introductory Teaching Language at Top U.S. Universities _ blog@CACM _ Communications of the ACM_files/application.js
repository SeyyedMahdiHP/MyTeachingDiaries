(function($) {
    "use strict";
    var $el;

    function init() {

      $('a[href^=http]').click(open);
      if(!Modernizr.input.placeholder) placeholder();
      //if(mobileActive()) { remove_empty_spans(); }

      var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
      po.src = 'https://apis.google.com/js/plusone.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);

      // init listeners
      initClickListeners();
      initHoverListeners();

      // init individual features
      initArchiveNav();
      initColorbox();
      initJplayer();
      initRemoveBest();
      initSignInBox();
      initVideoHighlightsPage();
      initFeaturedJobs();
      initOtherJobs();
      $('#bigSearch').data('placeholder', $('#bigSearch').val());
      $('form label.inField').inFieldLabels();
      $('#page-links a:last-child').css('borderRight', 0);

      if($('.fav_bar a').length > 0) {
        $('.fav_bar a').tipsy({
          gravity: 's',
          opacity: 1.0
        });
      }

      var $inst = $('#instName');
      if(!!!$inst.text().length) {
        $inst.find('.logo-mini').hide();
      }

      // BEGIN HEADER FUNCTIONALITY
      var $tt = $('.section-list a[data-tooltip]');
      $tt.live('mouseenter', openToolTip);
      $tt.live('mouseleave', closeToolTip);
      // END HEADER FUNCTIONALITY
    }

    function initFeaturedJobs() {
      var $jobs = $('#jobs.widget');
      if(!$jobs.find('#jobs-featured').children().length) {
        $jobs.find('#jobs-featured').remove();
      }
    }

    function initOtherJobs() {
      var $jobs = $('#jobs.widget');

      if(!$jobs.find('#jobs-other').children().length) {
        $jobs.find('#jobs-other').remove();
      }else {
        if(!$jobs.find('#jobs-featured').children().length){
          $jobs.find('#jobs-other h2').text('Jobs');
          $jobs.find('#jobs-other').css('border', 'none');    
        }
      }
    }

    function initClickListeners() {
      $('.create-account').click(redirectToCreateAccount);
      $('.closeBox, #cboxClose').click(onClickCloseBox);
      $('.miniWidgetName').click(onClickMiniWidgetName);
      $('.openSignIn a').click(onClickOpenSignIn);
      $('.openCreateAccount a').click(onClickCreateAccount);
      $('.createFromLightbox').click(onClickCreateFormLightbox);
      $('.smallBlueI').click(onClickSmallBlueI);
      $('.WidgetHelpHoverEye').click(onClickWidgetHelpHoverEye);
      $('.expand, .collapse').click(onClickExpandCollapse); 
      $('a.close').click(onClickClose);
      $('.smallWhiteI').click(onClickSmallWhiteI);
      $('.faqTitle').click(onClickFaqTitle); 
      $('#searchSubmit').click(onClickSearchSubmit);
      $('#goBigSearch').click(onClickGoBigSearch);
      //archive nav
      $('.archYear').click(onClickArchiveYear);
      //send article
      $('#sendByEmail').click(onClickSendByEmail);
      //comment form
      $('#comment-submit-anon').click(onClickSubmitAnonComment);
      // expand/collapse search results
      $('.fname').click(onClickToggleSearchResults);
      $('.more').click(onClickMore)
      $('.instructional.signUpInPage').click(onClickHopWallForgotPassword);
    }

    function initSignInBox() {
      $('.portaInputSignIn input').focus(signInFocus);
      $('.portaInputSignIn input').blur(function() {
        $(this).parent().removeClass('portaInputSignInActive');
      });
    }

    function initHoverListeners() {
      $('#bigSearch').blur(bigSearchBlur);
      $('.sectionLink').hover(hoverSectionLink);

      $('.bestWidget, .jobsWidget, .popWidget').hover(function() {
          $el = $(this);
          if ($el.find('.hiddenTextWidget').css('display') === 'none') {
            $el.find('.WidgetHelpHoverEye').show();
          } else {
            $el.find('.WidgetHelpHoverEye').hide();
          }
        }, function() {
          $(this).find('.WidgetHelpHoverEye').hide();
        }
      );

      $('.smallBlueI').hover(function() {
          if($('.'+$(this).attr('id')).css('display') !== 'block'){
            $(this).css('background','url("/images/img.widget-help-hover.gif")');
          } else {
            $(this).css('background','url("/images/img.widget-help-hover.gif")');
          }
        }, function() {
          if($('.'+$(this).attr('id')).css('display') !== 'block'){
            $(this).css('background','url("images/buttons/small_buttons.png") 0px 0px');
          } else {
            $(this).css('background','url("images/buttons/small_buttons.png") 0px -28px');
          }
        }
      );

      $('.smallWhiteI').hover(function() {
          if($('.'+$(this).attr('id')).css('display') !== 'block'){
            $(this).css('background','url("images/buttons/small_buttons.png") -14px -14px');
          } else {
            $(this).css('background','url("images/buttons/small_buttons.png") -14px -42px');
          }
        }, function() {
          if($('.'+$(this).attr('id')).css('display') !== 'block'){
            $(this).css('background','url("images/buttons/small_buttons.png") 0px -14px');
          } else {
            $(this).css('background','url("images/buttons/small_buttons.png") 0px -42px');
          }
        }
      );

      $('.videoCont a').hover(function() {
          $(this).css('background','url("images/backgrounds/video_overlay.png") top no-repeat');
          $(this).parent().next().find('a').css('color','#077FBA');
        }, function() {
          $(this).css('background','url("images/backgrounds/video_overlay.png") bottom no-repeat');
          $(this).parent().next().find('a').css('color','#003356');
        }
      );

      $('.singleVideo h5 a').hover(function() {
          $(this).parent().prev().find('a').css('background','url("images/backgrounds/video_overlay.png") top no-repeat');
        }, function() {
          $(this).parent().prev().find('a').css('background','url("images/backgrounds/video_overlay.png") bottom no-repeat');
          $(this).css('color','#003356');
        }
      );

      $('.selectYearDropdown').hover(function() {
          $(this).find('ul').show();
        }, function() {
          $(this).find('ul').hide();
        }
      );

      $('input.jt-search-bar').focus(function(){
        $(this).fadeTo('fast', 0.5);
      });

      $('input.jt-search-bar').blur(function(){
        $(this).fadeTo('fast', 1);
      });

      $('#searchInput, #searchSubmit').focus(function(){
        $(this).parents('#topForm').css({'background-position': '0px -25px'});
      });

      $('#searchInput, #searchSubmit').blur(function(){
       $(this).parents('#topForm').css({'background-position': '0px 0px'});
      });

      $('#bigSearch, #goBigSearch').focus(function(){
       $(this).closest('.bigSearchContainer').css('background','url("images/backgrounds/big_search_bg.png") no-repeat 180px -35px');
      });

      $('#bigSearch, #goBigSearch').blur(function(){
        $(this).closest('.bigSearchContainer').css('background','url("images/backgrounds/big_search_bg.png") no-repeat 180px 0px');
      });

      $('#bigSearch').focus(function() {
        if($(this).val() === $(this).data('placeholder')) {
          $(this).val('');
        }
      });

      $('header nav ul li').hover(
        function() {
          $(this).find('.menuLinks').stop(true,true).slideDown('fast');
        },
        function() {
          $(this).find('.menuLinks').stop(true,true).slideUp('fast');
        }
      );

      $('button.normalButton').hover(function() {
        $(this).css('background','#003356');
      }, function() {
        $(this).css('background','#000000');
      });

      $('header nav ul li').hover( function() {
        $(this).find('.menuText').css({
          'padding':'10px 0px 0px 0px',
          'position':'relative',
          'border-top':'4px solid #a8b2b5',
          'z-index':'101',
          'color':'#077fba'
        });
      }, function() {
        $(this).find('.menuText').css({
          'padding':'14px 0px 0px 0px',
          'position':'relative',
          'border-top':'0',
          'z-index':'101',
          'color':'#000'
        });
      });

      $('header nav ul li').hover(function() {
        $(this).find('.withMenu').css('padding','10px 0px 13px 0px');
      }, function() {
        $(this).find('.withMenu').css('padding','14px 0px 0px 0px');
      });
    }

    function initColorbox() {
      $(".showModal").colorbox({
        width:"auto",
        inline:true,
        href:"#signup",
        scrolling: false,
        'opacity': 0.6,
        onComplete:function(){
          $.colorbox.resize();
        }
      });
    }

    function initVideoHighlightsPage() {
      $('.videoSingle iframe').siblings('p').children('a').parent('p').remove();
      $('#video-highlights .videoSingle').each( function () { $(this).fadeIn('slow').show(); });
      $('#articleFullText .videoThumb iframe, #articleFullText .videoThumb object').each( function() {
        $el = $(this);
        if($el.attr('height') !== 255 ) { $el.attr('height', 255); }
        if($el.attr('width') !== 360 ) { $el.attr('width', 360); }
      });
    }

    function onClickClose() {
      $(this)
        .parent()
        .hide()
        .find('.WidgetHelpHoverEye')
          .show();
    }
    function onClickExpandCollapse() {
      $('#more-dates').toggle();
      $('.expand, .collapse').toggle();
    }

    function onClickWidgetHelpHoverEye() {
      $el = $(this);
      $el.closest('.widget').find('.hiddenTextWidget').toggle();

      if($el.closest('.widget').find('.hiddenTextWidget').css('display') === 'block') {
        $el.hide();
        $el.closest('.widget').find('.hiddenTextWidget').css('border', '1px solid #0095C9');
      } else {
        $(this).closest('.widget').find('.hiddenTextWidget').css('border', 'none' );
      }
    }
    function onClickSmallWhiteI(e) {
      if($('.'+$(this).attr('id')).css('display') === 'block'){
        $('.'+$(this).attr('id')).css('display','none');
        $(this).css('background','url("images/buttons/small_buttons.png") -14px -14px');
      } else {
        $('.'+$(this).attr('id')).css('display','block');
        $(this).css('background','url("images/buttons/small_buttons.png") -14px -42px');
      }
      e.preventDefault();
    }

    function onClickSearchSubmit(){
      $(this).parents('#topForm').css({'background-position': '0px -50px'});
    }

    function onClickGoBigSearch(){
     $(this).closest('.bigSearchContainer').css('background','url("images/backgrounds/big_search_bg.png") no-repeat 180px -70px');
    }

    function onClickFaqTitle() {
      $(this).closest('.faqItem').toggleClass('faqItemOn');
    }

    function onClickSmallBlueI() {
      if($('.'+$(this).attr('id')).css('display') === 'block'){
        $('.'+$(this).attr('id')).css('display','none');
        $(this).css('background','url("images/buttons/small_buttons.png") -14px 0px');
      }
      else{
        $('.'+$(this).attr('id')).css('display','block');
        $(this).css('background','url("images/buttons/small_buttons.png") -14px -28px');
      }
      return false;
    }

    function onClickCreateFormLightbox() {
      $('.thirdContent').show();
      $('.secondContent').hide();
      $.colorbox.resize();
    }

    function onClickCreateAccount(){
      $('.openCreateAccount').hide();
      $('.firstContent').hide();
      $('.thirdContent').hide();
      $('.secondContent').show();
      $('.openSignIn').show();
      $.colorbox.resize();
    }
    function onClickOpenSignIn() {
      $('.openSignIn').hide();
      $('.secondContent').hide();
      $('.thirdContent').hide();
      $('.firstContent').show();
      $('.openCreateAccount').show();
      $.colorbox.resize();
    }
    function signInFocus() {
      $(this).parent().addClass('portaInputSignInActive');
    }

    function onClickMiniWidgetName() {
      $el = $(this);
      $el.siblings('.filterItems').toggle();
      $el.toggleClass('expanded');
    }

    function onClickCloseBox() {
      $.colorbox.close();
      $('#popOverForm')[0].reset();
    }

    function onClickFooter(e) {
    }

    function bigSearchBlur() {
      if($(this).val() === '') {
        $(this).val($(this).data('placeholder'));
      }
    }

    function hoverSectionLink() {
      var $el = $(this),
          pos = $el.index(),
          $box = $('#topBox');

          $box.find('.section-list').hide();
          $box.find('.section-list:eq('+ pos +')').show();

          $box.mouseleave(function() {
            $box.find('.section-list').hide();
          });
     }
    function openToolTip() {
      var $el = $(this),
          //tipText = $el.attr('data-tooltip'), // jsHINT says this isn't used
          toolTip = $('<div />').addClass('toolTip').append(
            $('<p />').addClass('toolTipText').html( $el.attr('data-tooltip') )
          );

       $('.toolTip').remove();
       toolTip.css({ 'top': ($el.position().top + 5) + 'px' });
       $el.append(toolTip);
       $el.css({ 'z-index': '98' });
       toolTip.show();
    }
    function closeToolTip() {
      $('.toolTip').remove();
      $(this).css({ 'z-index': 1 });
    }

    function onClickArchiveYear(e) {
      var year = $(this).attr('rel');
      $('.archMonth-' + year).toggle();
      e.preventDefault();
    }

    function onClickSendByEmail() {
      $.ajax({
        type:'get',
        url:'/otls',
        data: {
          'url': document.URL
        },
        success: function(response) {
          window.addthis_share = {
            url_transforms : {
              add: {
                otl: response
              }
            }
          };
          return addthis_sendto('email');
        },
        error: function(response) {
          return addthis_sendto('email');
        }
      });
    }

    function onClickSubmitAnonComment(e) {
      var comment = $('#comment-textarea').val(),
          $container = $('#comment_text_container');

      if($container.val().length) {
        $container.val() == "";
      }

      if(comment.length) {
        $container.val(comment);
      }

      if(comment !== ''){
        $.colorbox({
          width:"auto",
          inline:true,
          href:"#signup",
          scrolling: false,
          'opacity': 0.6,
          onComplete:function(){
            $.colorbox.resize();
          }
        });
      } else {
        alert('Comment cannot be blank');
      }
      e.preventDefault();
    }
    function initRemoveBest() {
      var $widget = $('#acmWidget');

      $widget
          .children('.singleBest')
          .removeClass('firstBest');
      $widget
          .children('.singleBest')
          .first()
          .addClass('firstBest');
    }
    function onClickMore() {
      $el = $(this);
      $el.parent().next('.more-filters').toggle();
      $el.hide();
    }
    function onClickToggleSearchResults() {
      var $el = $(this);
      $el.toggleClass('collapsed expanded');
      $el.next('.filters').find('.more').show();
      $el.parent().find('.filters').toggle();
      $el.parent().find('.more-filters').hide();
    }

    function open(e) {
        // exception for the mobile toggle link
        if($(e.target).hasClass('toggle-mobile')) {  return; }
        e.preventDefault();
        var href = this.getAttribute("href");
        if (window.location.host !== href.split('/')[2]) {
            window.open(href);
        } else {
            window.location = href;
        }
    }
    function redirectToCreateAccount(e) {
      stop(e);
      location.href = "/accounts/new"
    }

    function stop(e) {
      e.preventDefault();
    }

    function onClickHopWallForgotPassword() {
      var comment = $('#comment-textarea').val(),
          aid = $('#a-id').val();

      location.pathname = "/accounts/forgot-password?comment=" + comment +"&aid=" + aid;
    }

    function initArchiveNav() {
      var currentYear = $('#archive-current-year').val();
      $('.archMonth').hide();
      $('.archMonth-' + currentYear).show();
    }

    function remove_empty_spans() {
      $('.posts > li p > span').each(function() {
        var $el = $(this);
        $el.parent().text( $el.text() );
      });
    }

    function initJplayer() {
      var src = {},
      format = document.URL.split('/').pop();
      src.m4v = String($('.video-link').attr('href'));
      $("#jquery_jplayer_1").jPlayer({
        ready: function () {
          $(this).jPlayer("setMedia", src );
        },
        swfPath: "/javascripts/lib",
        supplied: "m4v",
        cssSelectorAncestor: "#jp_container_1",
        solution: "flash, html",
        size: {
          width: (format === 'fulltext' ? '360px' : '220px'),
          height: (format === 'fulltext' ? '255px' : '155px'),
          cssClass: (format === 'fulltext' ? 'jp-video-255p' : 'jp-video-220p')
        },
        repeat: function(event) { // Override the default jPlayer repeat event handler
          if(event.jPlayer.options.loop) {
            $(this).unbind(".jPlayerRepeat").unbind(".jPlayerNext");
            $(this).bind($.jPlayer.event.ended + ".jPlayer.jPlayerRepeat", function() {
              $(this).jPlayer("play");
            });
          } else {
            $(this).unbind(".jPlayerRepeat").unbind(".jPlayerNext");
            $(this).bind($.jPlayer.event.ended + ".jPlayer.jPlayerNext", function() {
              $("#jquery_jplayer_1").jPlayer("play", 0);
            });
          }
        }
      });
    }

    function placeholder() {
      var attr = 'placeholder';
      $('input[' + attr + '!=""]').each(function(idx, el){
        $el = $(el);
        var d = $el.attr(attr);
        if (d === undefined) { return; }
        $el.focus(function onFocus() {
            $el.removeClass(attr);
            if (this.value === d) { this.value = ''; }
        }).blur(function onBlur() {
            $el.addClass(attr);
            if ($.trim(this.value) === '') { this.value = d; }
        });
        $el.blur();
      });
    }

   $(init);
} (jQuery));
