(function($) {

	'use strict';

	if (typeof _wpcf7 == 'undefined' || _wpcf7 === null) {
		_wpcf7 = {};
	}

	_wpcf7 = $.extend({
		cached: 0
	}, _wpcf7);

	$.fn.wpcf7InitForm = function() {
		this.ajaxForm({
			beforeSubmit: function(arr, $form, options) {
				$form.wpcf7ClearResponseOutput();
				$form.find('[aria-invalid]').attr('aria-invalid', 'false');
				$form.find('img.ajax-loader').css({ visibility: 'visible' });
				return true;
			},
			beforeSerialize: function($form, options) {
				$form.find('[placeholder].placeheld').each(function(i, n) {
					$(n).val('');
				});
				return true;
			},
			data: { '_wpcf7_is_ajax_call': 1 },
			dataType: 'json',
			success: $.wpcf7AjaxSuccess,
			error: function(xhr, status, error, $form) {
				var e = $('<div class="ajax-error"></div>').text(error.message);
				$form.after(e);
			}
		});

		if (_wpcf7.cached) {
			this.wpcf7OnloadRefill();
		}

		this.wpcf7ToggleSubmit();

		this.find('.wpcf7-submit').wpcf7AjaxLoader();

		this.find('.wpcf7-acceptance').click(function() {
			$(this).closest('form').wpcf7ToggleSubmit();
		});

		this.find('.wpcf7-exclusive-checkbox').wpcf7ExclusiveCheckbox();

		this.find('.wpcf7-list-item.has-free-text').wpcf7ToggleCheckboxFreetext();

		this.find('[placeholder]').wpcf7Placeholder();

		if (_wpcf7.jqueryUi && ! _wpcf7.supportHtml5.date) {
			this.find('input.wpcf7-date[type="date"]').each(function() {
				$(this).datepicker({
					dateFormat: 'yy-mm-dd',
					minDate: new Date($(this).attr('min')),
					maxDate: new Date($(this).attr('max'))
				});
			});
		}

		if (_wpcf7.jqueryUi && ! _wpcf7.supportHtml5.number) {
			this.find('input.wpcf7-number[type="number"]').each(function() {
				$(this).spinner({
					min: $(this).attr('min'),
					max: $(this).attr('max'),
					step: $(this).attr('step')
				});
			});
		}

		this.find('.wpcf7-character-count').wpcf7CharacterCount();

		this.find('.wpcf7-validates-as-url').change(function() {
			$(this).wpcf7NormalizeUrl();
		});

		this.find('.wpcf7-recaptcha').wpcf7Recaptcha();
	};

	$.wpcf7AjaxSuccess = function(data, status, xhr, $form) {
		if (! $.isPlainObject(data) || $.isEmptyObject(data)) {
			return;
		}

		var $responseOutput = $form.find('div.wpcf7-response-output');

		$form.wpcf7ClearResponseOutput();

		$form.find('.wpcf7-form-control').removeClass('wpcf7-not-valid');
		$form.removeClass('invalid spam sent failed');

		if (data.captcha) {
			$form.wpcf7RefillCaptcha(data.captcha);
		}

		if (data.quiz) {
			$form.wpcf7RefillQuiz(data.quiz);
		}

		if (data.invalids) {
			$.each(data.invalids, function(i, n) {
				$form.find(n.into).wpcf7NotValidTip(n.message);
				$form.find(n.into).find('.wpcf7-form-control').addClass('wpcf7-not-valid');
				$form.find(n.into).find('[aria-invalid]').attr('aria-invalid', 'true');
			});

			$responseOutput.addClass('wpcf7-validation-errors');
			$form.addClass('invalid');

			$(data.into).trigger('wpcf7:invalid');
			$(data.into).trigger('invalid.wpcf7'); // deprecated

		} else if (1 == data.spam) {
			$form.find('[name="g-recaptcha-response"]').each(function() {
				if ('' == $(this).val()) {
					var $recaptcha = $(this).closest('.wpcf7-form-control-wrap');
					$recaptcha.wpcf7NotValidTip(_wpcf7.recaptcha.messages.empty);
				}
			});

			$responseOutput.addClass('wpcf7-spam-blocked');
			$form.addClass('spam');

			$(data.into).trigger('wpcf7:spam');
			$(data.into).trigger('spam.wpcf7'); // deprecated

		} else if (1 == data.mailSent) {
			$responseOutput.addClass('wpcf7-mail-sent-ok');
			$form.addClass('sent');

			if (data.onSentOk) {
				$.each(data.onSentOk, function(i, n) { eval(n) });
			}

			$(data.into).trigger('wpcf7:mailsent');
			$(data.into).trigger('mailsent.wpcf7'); // deprecated

		} else {
			$responseOutput.addClass('wpcf7-mail-sent-ng');
			$form.addClass('failed');

			$(data.into).trigger('wpcf7:mailfailed');
			$(data.into).trigger('mailfailed.wpcf7'); // deprecated
		}

		if (data.onSubmit) {
			$.each(data.onSubmit, function(i, n) { eval(n) });
		}

		$(data.into).trigger('wpcf7:submit');
		$(data.into).trigger('submit.wpcf7'); // deprecated

		if (1 == data.mailSent) {
			$form.resetForm();
		}

		$form.find('[placeholder].placeheld').each(function(i, n) {
			$(n).val($(n).attr('placeholder'));
		});

		$responseOutput.append(data.message).slideDown('fast');
		$responseOutput.attr('role', 'alert');

		$.wpcf7UpdateScreenReaderResponse($form, data);
	};

	$.fn.wpcf7ExclusiveCheckbox = function() {
		return this.find('input:checkbox').click(function() {
			var name = $(this).attr('name');
			$(this).closest('form').find('input:checkbox[name="' + name + '"]').not(this).prop('checked', false);
		});
	};

	$.fn.wpcf7Placeholder = function() {
		if (_wpcf7.supportHtml5.placeholder) {
			return this;
		}

		return this.each(function() {
			$(this).val($(this).attr('placeholder'));
			$(this).addClass('placeheld');

			$(this).focus(function() {
				if ($(this).hasClass('placeheld'))
					$(this).val('').removeClass('placeheld');
			});

			$(this).blur(function() {
				if ('' == $(this).val()) {
					$(this).val($(this).attr('placeholder'));
					$(this).addClass('placeheld');
				}
			});
		});
	};

	$.fn.wpcf7AjaxLoader = function() {
		return this.each(function() {
			var loader = $('<img class="ajax-loader" />')
				.attr({ src: _wpcf7.loaderUrl, alt: _wpcf7.sending })
				.css('visibility', 'hidden');

			$(this).after(loader);
		});
	};

	$.fn.wpcf7ToggleSubmit = function() {
		return this.each(function() {
			var form = $(this);

			if (this.tagName.toLowerCase() != 'form') {
				form = $(this).find('form').first();
			}

			if (form.hasClass('wpcf7-acceptance-as-validation')) {
				return;
			}

			var submit = form.find('input:submit');
			if (! submit.length) return;

			var acceptances = form.find('input:checkbox.wpcf7-acceptance');
			if (! acceptances.length) return;

			submit.removeAttr('disabled');
			acceptances.each(function(i, n) {
				n = $(n);
				if (n.hasClass('wpcf7-invert') && n.is(':checked')
				|| ! n.hasClass('wpcf7-invert') && ! n.is(':checked')) {
					submit.attr('disabled', 'disabled');
				}
			});
		});
	};

	$.fn.wpcf7ToggleCheckboxFreetext = function() {
		return this.each(function() {
			var $wrap = $(this).closest('.wpcf7-form-control');

			if ($(this).find(':checkbox, :radio').is(':checked')) {
				$(this).find(':input.wpcf7-free-text').prop('disabled', false);
			} else {
				$(this).find(':input.wpcf7-free-text').prop('disabled', true);
			}

			$wrap.find(':checkbox, :radio').change(function() {
				var $cb = $('.has-free-text', $wrap).find(':checkbox, :radio');
				var $freetext = $(':input.wpcf7-free-text', $wrap);

				if ($cb.is(':checked')) {
					$freetext.prop('disabled', false).focus();
				} else {
					$freetext.prop('disabled', true);
				}
			});
		});
	};

	$.fn.wpcf7CharacterCount = function() {
		return this.each(function() {
			var $count = $(this);
			var name = $count.attr('data-target-name');
			var down = $count.hasClass('down');
			var starting = parseInt($count.attr('data-starting-value'), 10);
			var maximum = parseInt($count.attr('data-maximum-value'), 10);
			var minimum = parseInt($count.attr('data-minimum-value'), 10);

			var updateCount = function($target) {
				var length = $target.val().length;
				var count = down ? starting - length : length;
				$count.attr('data-current-value', count);
				$count.text(count);

				if (maximum && maximum < length) {
					$count.addClass('too-long');
				} else {
					$count.removeClass('too-long');
				}

				if (minimum && length < minimum) {
					$count.addClass('too-short');
				} else {
					$count.removeClass('too-short');
				}
			};

			$count.closest('form').find(':input[name="' + name + '"]').each(function() {
				updateCount($(this));

				$(this).keyup(function() {
					updateCount($(this));
				});
			});
		});
	};

	$.fn.wpcf7NormalizeUrl = function() {
		return this.each(function() {
			var val = $.trim($(this).val());

			if (val && ! val.match(/^[a-z][a-z0-9.+-]*:/i)) { // check the scheme part
				val = val.replace(/^\/+/, '');
				val = 'http://' + val;
			}

			$(this).val(val);
		});
	};

	$.fn.wpcf7NotValidTip = function(message) {
		return this.each(function() {
			var $into = $(this);

			$into.find('span.wpcf7-not-valid-tip').remove();
			$into.append('<span role="alert" class="wpcf7-not-valid-tip">' + message + '</span>');

			if ($into.is('.use-floating-validation-tip *')) {
				$('.wpcf7-not-valid-tip', $into).mouseover(function() {
					$(this).wpcf7FadeOut();
				});

				$(':input', $into).focus(function() {
					$('.wpcf7-not-valid-tip', $into).not(':hidden').wpcf7FadeOut();
				});
			}
		});
	};

	$.fn.wpcf7FadeOut = function() {
		return this.each(function() {
			$(this).animate({
				opacity: 0
			}, 'fast', function() {
				$(this).css({'z-index': -100});
			});
		});
	};

	$.fn.wpcf7OnloadRefill = function() {
		return this.each(function() {
			var url = $(this).attr('action');

			if (0 < url.indexOf('#')) {
				url = url.substr(0, url.indexOf('#'));
			}

			var id = $(this).find('input[name="_wpcf7"]').val();
			var unitTag = $(this).find('input[name="_wpcf7_unit_tag"]').val();

			$.getJSON(url,
				{ _wpcf7_is_ajax_call: 1, _wpcf7: id, _wpcf7_request_ver: $.now() },
				function(data) {
					if (data && data.captcha) {
						$('#' + unitTag).wpcf7RefillCaptcha(data.captcha);
					}

					if (data && data.quiz) {
						$('#' + unitTag).wpcf7RefillQuiz(data.quiz);
					}
				}
			);
		});
	};

	$.fn.wpcf7RefillCaptcha = function(captcha) {
		return this.each(function() {
			var form = $(this);

			$.each(captcha, function(i, n) {
				form.find(':input[name="' + i + '"]').clearFields();
				form.find('img.wpcf7-captcha-' + i).attr('src', n);
				var match = /([0-9]+)\.(png|gif|jpeg)$/.exec(n);
				form.find('input:hidden[name="_wpcf7_captcha_challenge_' + i + '"]').attr('value', match[1]);
			});
		});
	};

	$.fn.wpcf7RefillQuiz = function(quiz) {
		return this.each(function() {
			var form = $(this);

			$.each(quiz, function(i, n) {
				form.find(':input[name="' + i + '"]').clearFields();
				form.find(':input[name="' + i + '"]').siblings('span.wpcf7-quiz-label').text(n[0]);
				form.find('input:hidden[name="_wpcf7_quiz_answer_' + i + '"]').attr('value', n[1]);
			});
		});
	};

	$.fn.wpcf7ClearResponseOutput = function() {
		return this.each(function() {
			$(this).find('div.wpcf7-response-output').hide().empty().removeClass('wpcf7-mail-sent-ok wpcf7-mail-sent-ng wpcf7-validation-errors wpcf7-spam-blocked').removeAttr('role');
			$(this).find('span.wpcf7-not-valid-tip').remove();
			$(this).find('img.ajax-loader').css({ visibility: 'hidden' });
		});
	};

	$.fn.wpcf7Recaptcha = function() {
		return this.each(function() {
			var events = 'wpcf7:spam wpcf7:mailsent wpcf7:mailfailed';
			$(this).closest('div.wpcf7').on(events, function(e) {
				if (recaptchaWidgets && grecaptcha) {
					$.each(recaptchaWidgets, function(index, value) {
						grecaptcha.reset(value);
					});
				}
			});
		});
	};

	$.wpcf7UpdateScreenReaderResponse = function($form, data) {
		$('.wpcf7 .screen-reader-response').html('').attr('role', '');

		if (data.message) {
			var $response = $form.siblings('.screen-reader-response').first();
			$response.append(data.message);

			if (data.invalids) {
				var $invalids = $('<ul></ul>');

				$.each(data.invalids, function(i, n) {
					if (n.idref) {
						var $li = $('<li></li>').append($('<a></a>').attr('href', '#' + n.idref).append(n.message));
					} else {
						var $li = $('<li></li>').append(n.message);
					}

					$invalids.append($li);
				});

				$response.append($invalids);
			}

			$response.attr('role', 'alert').focus();
		}
	};

	$.wpcf7SupportHtml5 = function() {
		var features = {};
		var input = document.createElement('input');

		features.placeholder = 'placeholder' in input;

		var inputTypes = ['email', 'url', 'tel', 'number', 'range', 'date'];

		$.each(inputTypes, function(index, value) {
			input.setAttribute('type', value);
			features[value] = input.type !== 'text';
		});

		return features;
	};

	$(function() {
		_wpcf7.supportHtml5 = $.wpcf7SupportHtml5();
		$('div.wpcf7 > form').wpcf7InitForm();
	});

})(jQuery);

;/*!
Waypoints - 4.0.0
Copyright © 2011-2015 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blob/master/licenses.txt
*/
!function(){"use strict";function t(o){if(!o)throw new Error("No options passed to Waypoint constructor");if(!o.element)throw new Error("No element option passed to Waypoint constructor");if(!o.handler)throw new Error("No handler option passed to Waypoint constructor");this.key="waypoint-"+e,this.options=t.Adapter.extend({},t.defaults,o),this.element=this.options.element,this.adapter=new t.Adapter(this.element),this.callback=o.handler,this.axis=this.options.horizontal?"horizontal":"vertical",this.enabled=this.options.enabled,this.triggerPoint=null,this.group=t.Group.findOrCreate({name:this.options.group,axis:this.axis}),this.context=t.Context.findOrCreateByElement(this.options.context),t.offsetAliases[this.options.offset]&&(this.options.offset=t.offsetAliases[this.options.offset]),this.group.add(this),this.context.add(this),i[this.key]=this,e+=1}var e=0,i={};t.prototype.queueTrigger=function(t){this.group.queueTrigger(this,t)},t.prototype.trigger=function(t){this.enabled&&this.callback&&this.callback.apply(this,t)},t.prototype.destroy=function(){this.context.remove(this),this.group.remove(this),delete i[this.key]},t.prototype.disable=function(){return this.enabled=!1,this},t.prototype.enable=function(){return this.context.refresh(),this.enabled=!0,this},t.prototype.next=function(){return this.group.next(this)},t.prototype.previous=function(){return this.group.previous(this)},t.invokeAll=function(t){var e=[];for(var o in i)e.push(i[o]);for(var n=0,r=e.length;r>n;n++)e[n][t]()},t.destroyAll=function(){t.invokeAll("destroy")},t.disableAll=function(){t.invokeAll("disable")},t.enableAll=function(){t.invokeAll("enable")},t.refreshAll=function(){t.Context.refreshAll()},t.viewportHeight=function(){return window.innerHeight||document.documentElement.clientHeight},t.viewportWidth=function(){return document.documentElement.clientWidth},t.adapters=[],t.defaults={context:window,continuous:!0,enabled:!0,group:"default",horizontal:!1,offset:0},t.offsetAliases={"bottom-in-view":function(){return this.context.innerHeight()-this.adapter.outerHeight()},"right-in-view":function(){return this.context.innerWidth()-this.adapter.outerWidth()}},window.Waypoint=t}(),function(){"use strict";function t(t){window.setTimeout(t,1e3/60)}function e(t){this.element=t,this.Adapter=n.Adapter,this.adapter=new this.Adapter(t),this.key="waypoint-context-"+i,this.didScroll=!1,this.didResize=!1,this.oldScroll={x:this.adapter.scrollLeft(),y:this.adapter.scrollTop()},this.waypoints={vertical:{},horizontal:{}},t.waypointContextKey=this.key,o[t.waypointContextKey]=this,i+=1,this.createThrottledScrollHandler(),this.createThrottledResizeHandler()}var i=0,o={},n=window.Waypoint,r=window.onload;e.prototype.add=function(t){var e=t.options.horizontal?"horizontal":"vertical";this.waypoints[e][t.key]=t,this.refresh()},e.prototype.checkEmpty=function(){var t=this.Adapter.isEmptyObject(this.waypoints.horizontal),e=this.Adapter.isEmptyObject(this.waypoints.vertical);t&&e&&(this.adapter.off(".waypoints"),delete o[this.key])},e.prototype.createThrottledResizeHandler=function(){function t(){e.handleResize(),e.didResize=!1}var e=this;this.adapter.on("resize.waypoints",function(){e.didResize||(e.didResize=!0,n.requestAnimationFrame(t))})},e.prototype.createThrottledScrollHandler=function(){function t(){e.handleScroll(),e.didScroll=!1}var e=this;this.adapter.on("scroll.waypoints",function(){(!e.didScroll||n.isTouch)&&(e.didScroll=!0,n.requestAnimationFrame(t))})},e.prototype.handleResize=function(){n.Context.refreshAll()},e.prototype.handleScroll=function(){var t={},e={horizontal:{newScroll:this.adapter.scrollLeft(),oldScroll:this.oldScroll.x,forward:"right",backward:"left"},vertical:{newScroll:this.adapter.scrollTop(),oldScroll:this.oldScroll.y,forward:"down",backward:"up"}};for(var i in e){var o=e[i],n=o.newScroll>o.oldScroll,r=n?o.forward:o.backward;for(var s in this.waypoints[i]){var a=this.waypoints[i][s],l=o.oldScroll<a.triggerPoint,h=o.newScroll>=a.triggerPoint,p=l&&h,u=!l&&!h;(p||u)&&(a.queueTrigger(r),t[a.group.id]=a.group)}}for(var c in t)t[c].flushTriggers();this.oldScroll={x:e.horizontal.newScroll,y:e.vertical.newScroll}},e.prototype.innerHeight=function(){return this.element==this.element.window?n.viewportHeight():this.adapter.innerHeight()},e.prototype.remove=function(t){delete this.waypoints[t.axis][t.key],this.checkEmpty()},e.prototype.innerWidth=function(){return this.element==this.element.window?n.viewportWidth():this.adapter.innerWidth()},e.prototype.destroy=function(){var t=[];for(var e in this.waypoints)for(var i in this.waypoints[e])t.push(this.waypoints[e][i]);for(var o=0,n=t.length;n>o;o++)t[o].destroy()},e.prototype.refresh=function(){var t,e=this.element==this.element.window,i=e?void 0:this.adapter.offset(),o={};this.handleScroll(),t={horizontal:{contextOffset:e?0:i.left,contextScroll:e?0:this.oldScroll.x,contextDimension:this.innerWidth(),oldScroll:this.oldScroll.x,forward:"right",backward:"left",offsetProp:"left"},vertical:{contextOffset:e?0:i.top,contextScroll:e?0:this.oldScroll.y,contextDimension:this.innerHeight(),oldScroll:this.oldScroll.y,forward:"down",backward:"up",offsetProp:"top"}};for(var r in t){var s=t[r];for(var a in this.waypoints[r]){var l,h,p,u,c,d=this.waypoints[r][a],f=d.options.offset,w=d.triggerPoint,y=0,g=null==w;d.element!==d.element.window&&(y=d.adapter.offset()[s.offsetProp]),"function"==typeof f?f=f.apply(d):"string"==typeof f&&(f=parseFloat(f),d.options.offset.indexOf("%")>-1&&(f=Math.ceil(s.contextDimension*f/100))),l=s.contextScroll-s.contextOffset,d.triggerPoint=y+l-f,h=w<s.oldScroll,p=d.triggerPoint>=s.oldScroll,u=h&&p,c=!h&&!p,!g&&u?(d.queueTrigger(s.backward),o[d.group.id]=d.group):!g&&c?(d.queueTrigger(s.forward),o[d.group.id]=d.group):g&&s.oldScroll>=d.triggerPoint&&(d.queueTrigger(s.forward),o[d.group.id]=d.group)}}return n.requestAnimationFrame(function(){for(var t in o)o[t].flushTriggers()}),this},e.findOrCreateByElement=function(t){return e.findByElement(t)||new e(t)},e.refreshAll=function(){for(var t in o)o[t].refresh()},e.findByElement=function(t){return o[t.waypointContextKey]},window.onload=function(){r&&r(),e.refreshAll()},n.requestAnimationFrame=function(e){var i=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||t;i.call(window,e)},n.Context=e}(),function(){"use strict";function t(t,e){return t.triggerPoint-e.triggerPoint}function e(t,e){return e.triggerPoint-t.triggerPoint}function i(t){this.name=t.name,this.axis=t.axis,this.id=this.name+"-"+this.axis,this.waypoints=[],this.clearTriggerQueues(),o[this.axis][this.name]=this}var o={vertical:{},horizontal:{}},n=window.Waypoint;i.prototype.add=function(t){this.waypoints.push(t)},i.prototype.clearTriggerQueues=function(){this.triggerQueues={up:[],down:[],left:[],right:[]}},i.prototype.flushTriggers=function(){for(var i in this.triggerQueues){var o=this.triggerQueues[i],n="up"===i||"left"===i;o.sort(n?e:t);for(var r=0,s=o.length;s>r;r+=1){var a=o[r];(a.options.continuous||r===o.length-1)&&a.trigger([i])}}this.clearTriggerQueues()},i.prototype.next=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints),o=i===this.waypoints.length-1;return o?null:this.waypoints[i+1]},i.prototype.previous=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints);return i?this.waypoints[i-1]:null},i.prototype.queueTrigger=function(t,e){this.triggerQueues[e].push(t)},i.prototype.remove=function(t){var e=n.Adapter.inArray(t,this.waypoints);e>-1&&this.waypoints.splice(e,1)},i.prototype.first=function(){return this.waypoints[0]},i.prototype.last=function(){return this.waypoints[this.waypoints.length-1]},i.findOrCreate=function(t){return o[t.axis][t.name]||new i(t)},n.Group=i}(),function(){"use strict";function t(t){this.$element=e(t)}var e=window.jQuery,i=window.Waypoint;e.each(["innerHeight","innerWidth","off","offset","on","outerHeight","outerWidth","scrollLeft","scrollTop"],function(e,i){t.prototype[i]=function(){var t=Array.prototype.slice.call(arguments);return this.$element[i].apply(this.$element,t)}}),e.each(["extend","inArray","isEmptyObject"],function(i,o){t[o]=e[o]}),i.adapters.push({name:"jquery",Adapter:t}),i.Adapter=t}(),function(){"use strict";function t(t){return function(){var i=[],o=arguments[0];return t.isFunction(arguments[0])&&(o=t.extend({},arguments[1]),o.handler=arguments[0]),this.each(function(){var n=t.extend({},o,{element:this});"string"==typeof n.context&&(n.context=t(this).closest(n.context)[0]),i.push(new e(n))}),i}}var e=window.Waypoint;window.jQuery&&(window.jQuery.fn.waypoint=t(window.jQuery)),window.Zepto&&(window.Zepto.fn.waypoint=t(window.Zepto))}();
;/*!
	jQuery Colorbox v1.4.18 - 2013-05-30
	(c) 2013 Jack Moore - jacklmoore.com/colorbox
	license: http://www.opensource.org/licenses/mit-license.php
*/
(function(t,e,i){function o(i,o,n){var r=e.createElement(i);return o&&(r.id=te+o),n&&(r.style.cssText=n),t(r)}function n(){return i.innerHeight?i.innerHeight:t(i).height()}function r(t){var e=E.length,i=(j+t)%e;return 0>i?e+i:i}function h(t,e){return Math.round((/%/.test(t)?("x"===e?H.width():n())/100:1)*parseInt(t,10))}function l(t,e){return t.photo||t.photoRegex.test(e)}function s(t,e){return t.retinaUrl&&i.devicePixelRatio>1?e.replace(t.photoRegex,t.retinaSuffix):e}function a(t){"contains"in x[0]&&!x[0].contains(t.target)&&(t.stopPropagation(),x.focus())}function d(){var e,i=t.data(A,Z);null==i?(_=t.extend({},Y),console&&console.log&&console.log("Error: cboxElement missing settings object")):_=t.extend({},i);for(e in _)t.isFunction(_[e])&&"on"!==e.slice(0,2)&&(_[e]=_[e].call(A));_.rel=_.rel||A.rel||t(A).data("rel")||"nofollow",_.href=_.href||t(A).attr("href"),_.title=_.title||A.title,"string"==typeof _.href&&(_.href=t.trim(_.href))}function c(i,o){t(e).trigger(i),se.trigger(i),t.isFunction(o)&&o.call(A)}function u(){var t,e,i,o,n,r=te+"Slideshow_",h="click."+te;_.slideshow&&E[1]?(e=function(){clearTimeout(t)},i=function(){(_.loop||E[j+1])&&(t=setTimeout(J.next,_.slideshowSpeed))},o=function(){M.html(_.slideshowStop).unbind(h).one(h,n),se.bind(ne,i).bind(oe,e).bind(re,n),x.removeClass(r+"off").addClass(r+"on")},n=function(){e(),se.unbind(ne,i).unbind(oe,e).unbind(re,n),M.html(_.slideshowStart).unbind(h).one(h,function(){J.next(),o()}),x.removeClass(r+"on").addClass(r+"off")},_.slideshowAuto?o():n()):x.removeClass(r+"off "+r+"on")}function f(i){G||(A=i,d(),E=t(A),j=0,"nofollow"!==_.rel&&(E=t("."+ee).filter(function(){var e,i=t.data(this,Z);return i&&(e=t(this).data("rel")||i.rel||this.rel),e===_.rel}),j=E.index(A),-1===j&&(E=E.add(A),j=E.length-1)),g.css({opacity:parseFloat(_.opacity),cursor:_.overlayClose?"pointer":"auto",visibility:"visible"}).show(),V&&x.add(g).removeClass(V),_.className&&x.add(g).addClass(_.className),V=_.className,K.html(_.close).show(),$||($=q=!0,x.css({visibility:"hidden",display:"block"}),W=o(ae,"LoadedContent","width:0; height:0; overflow:hidden").appendTo(v),D=b.height()+k.height()+v.outerHeight(!0)-v.height(),B=T.width()+C.width()+v.outerWidth(!0)-v.width(),N=W.outerHeight(!0),z=W.outerWidth(!0),_.w=h(_.initialWidth,"x"),_.h=h(_.initialHeight,"y"),J.position(),u(),c(ie,_.onOpen),O.add(S).hide(),x.focus(),_.trapFocus&&e.addEventListener&&(e.addEventListener("focus",a,!0),se.one(he,function(){e.removeEventListener("focus",a,!0)})),_.returnFocus&&se.one(he,function(){t(A).focus()})),w())}function p(){!x&&e.body&&(X=!1,H=t(i),x=o(ae).attr({id:Z,"class":t.support.opacity===!1?te+"IE":"",role:"dialog",tabindex:"-1"}).hide(),g=o(ae,"Overlay").hide(),L=o(ae,"LoadingOverlay").add(o(ae,"LoadingGraphic")),y=o(ae,"Wrapper"),v=o(ae,"Content").append(S=o(ae,"Title"),I=o(ae,"Current"),P=t('<button type="button"/>').attr({id:te+"Previous"}),R=t('<button type="button"/>').attr({id:te+"Next"}),M=o("button","Slideshow"),L,K=t('<button type="button"/>').attr({id:te+"Close"})),y.append(o(ae).append(o(ae,"TopLeft"),b=o(ae,"TopCenter"),o(ae,"TopRight")),o(ae,!1,"clear:left").append(T=o(ae,"MiddleLeft"),v,C=o(ae,"MiddleRight")),o(ae,!1,"clear:left").append(o(ae,"BottomLeft"),k=o(ae,"BottomCenter"),o(ae,"BottomRight"))).find("div div").css({"float":"left"}),F=o(ae,!1,"position:absolute; width:9999px; visibility:hidden; display:none"),O=R.add(P).add(I).add(M),t(e.body).append(g,x.append(y,F)))}function m(){function i(t){t.which>1||t.shiftKey||t.altKey||t.metaKey||t.control||(t.preventDefault(),f(this))}return x?(X||(X=!0,R.click(function(){J.next()}),P.click(function(){J.prev()}),K.click(function(){J.close()}),g.click(function(){_.overlayClose&&J.close()}),t(e).bind("keydown."+te,function(t){var e=t.keyCode;$&&_.escKey&&27===e&&(t.preventDefault(),J.close()),$&&_.arrowKey&&E[1]&&!t.altKey&&(37===e?(t.preventDefault(),P.click()):39===e&&(t.preventDefault(),R.click()))}),t.isFunction(t.fn.on)?t(e).on("click."+te,"."+ee,i):t("."+ee).live("click."+te,i)),!0):!1}function w(){var n,r,a,u=J.prep,f=++de;q=!0,U=!1,A=E[j],d(),c(le),c(oe,_.onLoad),_.h=_.height?h(_.height,"y")-N-D:_.innerHeight&&h(_.innerHeight,"y"),_.w=_.width?h(_.width,"x")-z-B:_.innerWidth&&h(_.innerWidth,"x"),_.mw=_.w,_.mh=_.h,_.maxWidth&&(_.mw=h(_.maxWidth,"x")-z-B,_.mw=_.w&&_.w<_.mw?_.w:_.mw),_.maxHeight&&(_.mh=h(_.maxHeight,"y")-N-D,_.mh=_.h&&_.h<_.mh?_.h:_.mh),n=_.href,Q=setTimeout(function(){L.show()},100),_.inline?(a=o(ae).hide().insertBefore(t(n)[0]),se.one(le,function(){a.replaceWith(W.children())}),u(t(n))):_.iframe?u(" "):_.html?u(_.html):l(_,n)?(n=s(_,n),U=e.createElement("img"),t(U).addClass(te+"Photo").bind("error",function(){_.title=!1,u(o(ae,"Error").html(_.imgError))}).one("load",function(){var e;f===de&&(U.alt=t(A).attr("alt")||t(A).attr("data-alt")||"",_.retinaImage&&i.devicePixelRatio>1&&(U.height=U.height/i.devicePixelRatio,U.width=U.width/i.devicePixelRatio),_.scalePhotos&&(r=function(){U.height-=U.height*e,U.width-=U.width*e},_.mw&&U.width>_.mw&&(e=(U.width-_.mw)/U.width,r()),_.mh&&U.height>_.mh&&(e=(U.height-_.mh)/U.height,r())),_.h&&(U.style.marginTop=Math.max(_.mh-U.height,0)/2+"px"),E[1]&&(_.loop||E[j+1])&&(U.style.cursor="pointer",U.onclick=function(){J.next()}),U.style.width=U.width+"px",U.style.height=U.height+"px",setTimeout(function(){u(U)},1))}),setTimeout(function(){U.src=n},1)):n&&F.load(n,_.data,function(e,i){f===de&&u("error"===i?o(ae,"Error").html(_.xhrError):t(this).contents())})}var g,x,y,v,b,T,C,k,E,H,W,F,L,S,I,M,R,P,K,O,_,D,B,N,z,A,j,U,$,q,G,Q,J,V,X,Y={transition:"elastic",speed:300,fadeOut:300,width:!1,initialWidth:"600",innerWidth:!1,maxWidth:!1,height:!1,initialHeight:"450",innerHeight:!1,maxHeight:!1,scalePhotos:!0,scrolling:!0,inline:!1,html:!1,iframe:!1,fastIframe:!0,photo:!1,href:!1,title:!1,rel:!1,opacity:.9,preloading:!0,className:!1,retinaImage:!1,retinaUrl:!1,retinaSuffix:"@2x.$1",current:"image {current} of {total}",previous:"previous",next:"next",close:"close",xhrError:"This content failed to load.",imgError:"This image failed to load.",open:!1,returnFocus:!0,trapFocus:!0,reposition:!0,loop:!0,slideshow:!1,slideshowAuto:!0,slideshowSpeed:2500,slideshowStart:"start slideshow",slideshowStop:"stop slideshow",photoRegex:/\.(gif|png|jp(e|g|eg)|bmp|ico|webp)((#|\?).*)?$/i,onOpen:!1,onLoad:!1,onComplete:!1,onCleanup:!1,onClosed:!1,overlayClose:!0,escKey:!0,arrowKey:!0,top:!1,bottom:!1,left:!1,right:!1,fixed:!1,data:void 0},Z="colorbox",te="cbox",ee=te+"Element",ie=te+"_open",oe=te+"_load",ne=te+"_complete",re=te+"_cleanup",he=te+"_closed",le=te+"_purge",se=t("<a/>"),ae="div",de=0;t.colorbox||(t(p),J=t.fn[Z]=t[Z]=function(e,i){var o=this;if(e=e||{},p(),m()){if(t.isFunction(o))o=t("<a/>"),e.open=!0;else if(!o[0])return o;i&&(e.onComplete=i),o.each(function(){t.data(this,Z,t.extend({},t.data(this,Z)||Y,e))}).addClass(ee),(t.isFunction(e.open)&&e.open.call(o)||e.open)&&f(o[0])}return o},J.position=function(t,e){function i(t){b[0].style.width=k[0].style.width=v[0].style.width=parseInt(t.style.width,10)-B+"px",v[0].style.height=T[0].style.height=C[0].style.height=parseInt(t.style.height,10)-D+"px"}var o,r,l,s=0,a=0,d=x.offset();H.unbind("resize."+te),x.css({top:-9e4,left:-9e4}),r=H.scrollTop(),l=H.scrollLeft(),_.fixed?(d.top-=r,d.left-=l,x.css({position:"fixed"})):(s=r,a=l,x.css({position:"absolute"})),a+=_.right!==!1?Math.max(H.width()-_.w-z-B-h(_.right,"x"),0):_.left!==!1?h(_.left,"x"):Math.round(Math.max(H.width()-_.w-z-B,0)/2),s+=_.bottom!==!1?Math.max(n()-_.h-N-D-h(_.bottom,"y"),0):_.top!==!1?h(_.top,"y"):Math.round(Math.max(n()-_.h-N-D,0)/2),x.css({top:d.top,left:d.left,visibility:"visible"}),t=x.width()===_.w+z&&x.height()===_.h+N?0:t||0,y[0].style.width=y[0].style.height="9999px",o={width:_.w+z+B,height:_.h+N+D,top:s,left:a},0===t&&x.css(o),x.dequeue().animate(o,{duration:t,complete:function(){i(this),q=!1,y[0].style.width=_.w+z+B+"px",y[0].style.height=_.h+N+D+"px",_.reposition&&setTimeout(function(){H.bind("resize."+te,J.position)},1),e&&e()},step:function(){i(this)}})},J.resize=function(t){var e;$&&(t=t||{},t.width&&(_.w=h(t.width,"x")-z-B),t.innerWidth&&(_.w=h(t.innerWidth,"x")),W.css({width:_.w}),t.height&&(_.h=h(t.height,"y")-N-D),t.innerHeight&&(_.h=h(t.innerHeight,"y")),t.innerHeight||t.height||(e=W.scrollTop(),W.css({height:"auto"}),_.h=W.height()),W.css({height:_.h}),e&&W.scrollTop(e),J.position("none"===_.transition?0:_.speed))},J.prep=function(e){function i(){return _.w=_.w||W.width(),_.w=_.mw&&_.mw<_.w?_.mw:_.w,_.w}function n(){return _.h=_.h||W.height(),_.h=_.mh&&_.mh<_.h?_.mh:_.h,_.h}if($){var h,a="none"===_.transition?0:_.speed;W.empty().remove(),W=o(ae,"LoadedContent").append(e),W.hide().appendTo(F.show()).css({width:i(),overflow:_.scrolling?"auto":"hidden"}).css({height:n()}).prependTo(v),F.hide(),t(U).css({"float":"none"}),h=function(){function e(){t.support.opacity===!1&&x[0].style.removeAttribute("filter")}var i,n,h=E.length,d="frameBorder",u="allowTransparency";$&&(n=function(){clearTimeout(Q),L.hide(),c(ne,_.onComplete)},S.html(_.title).add(W).show(),h>1?("string"==typeof _.current&&I.html(_.current.replace("{current}",j+1).replace("{total}",h)).show(),R[_.loop||h-1>j?"show":"hide"]().html(_.next),P[_.loop||j?"show":"hide"]().html(_.previous),_.slideshow&&M.show(),_.preloading&&t.each([r(-1),r(1)],function(){var e,i,o=E[this],n=t.data(o,Z);n&&n.href?(e=n.href,t.isFunction(e)&&(e=e.call(o))):e=t(o).attr("href"),e&&l(n,e)&&(e=s(n,e),i=new Image,i.src=e)})):O.hide(),_.iframe?(i=o("iframe")[0],d in i&&(i[d]=0),u in i&&(i[u]="true"),_.scrolling||(i.scrolling="no"),t(i).attr({src:_.href,name:(new Date).getTime(),"class":te+"Iframe",allowFullScreen:!0,webkitAllowFullScreen:!0,mozallowfullscreen:!0}).one("load",n).appendTo(W),se.one(le,function(){i.src="//about:blank"}),_.fastIframe&&t(i).trigger("load")):n(),"fade"===_.transition?x.fadeTo(a,1,e):e())},"fade"===_.transition?x.fadeTo(a,0,function(){J.position(0,h)}):J.position(a,h)}},J.next=function(){!q&&E[1]&&(_.loop||E[j+1])&&(j=r(1),f(E[j]))},J.prev=function(){!q&&E[1]&&(_.loop||j)&&(j=r(-1),f(E[j]))},J.close=function(){$&&!G&&(G=!0,$=!1,c(re,_.onCleanup),H.unbind("."+te),g.fadeTo(_.fadeOut||0,0),x.stop().fadeTo(_.fadeOut||0,0,function(){x.add(g).css({opacity:1,cursor:"auto"}).hide(),c(le),W.empty().remove(),setTimeout(function(){G=!1,c(he,_.onClosed)},1)}))},J.remove=function(){x&&(x.stop(),t.colorbox.close(),x.stop().remove(),g.remove(),G=!1,x=null,t("."+ee).removeData(Z).removeClass(ee),t(e).unbind("click."+te))},J.element=function(){return t(A)},J.settings=Y)})(jQuery,document,window);
;/*!
 * hoverIntent v1.8.0 // 2014.06.29 // jQuery v1.9.1+
 * http://cherne.net/brian/resources/jquery.hoverIntent.html
 *
 * You may use hoverIntent under the terms of the MIT license. Basically that
 * means you are free to use hoverIntent as long as this header is left intact.
 * Copyright 2007, 2014 Brian Cherne
 */
(function($){$.fn.hoverIntent=function(handlerIn,handlerOut,selector){var cfg={interval:100,sensitivity:6,timeout:0};if(typeof handlerIn==="object"){cfg=$.extend(cfg,handlerIn)}else{if($.isFunction(handlerOut)){cfg=$.extend(cfg,{over:handlerIn,out:handlerOut,selector:selector})}else{cfg=$.extend(cfg,{over:handlerIn,out:handlerIn,selector:handlerOut})}}var cX,cY,pX,pY;var track=function(ev){cX=ev.pageX;cY=ev.pageY};var compare=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);if(Math.sqrt((pX-cX)*(pX-cX)+(pY-cY)*(pY-cY))<cfg.sensitivity){$(ob).off("mousemove.hoverIntent",track);ob.hoverIntent_s=true;return cfg.over.apply(ob,[ev])}else{pX=cX;pY=cY;ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}};var delay=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);ob.hoverIntent_s=false;return cfg.out.apply(ob,[ev])};var handleHover=function(e){var ev=$.extend({},e);var ob=this;if(ob.hoverIntent_t){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t)}if(e.type==="mouseenter"){pX=ev.pageX;pY=ev.pageY;$(ob).on("mousemove.hoverIntent",track);if(!ob.hoverIntent_s){ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}}else{$(ob).off("mousemove.hoverIntent",track);if(ob.hoverIntent_s){ob.hoverIntent_t=setTimeout(function(){delay(ev,ob)},cfg.timeout)}}};return this.on({"mouseenter.hoverIntent":handleHover,"mouseleave.hoverIntent":handleHover},cfg.selector)}})(jQuery);
;/*
 Sticky-kit v1.1.2 | WTFPL | Leaf Corcoran 2015 | http://leafo.net
*/
(function(){var b,f;b=this.jQuery||window.jQuery;f=b(window);b.fn.stick_in_parent=function(d){var A,w,J,n,B,K,p,q,k,E,t;null==d&&(d={});t=d.sticky_class;B=d.inner_scrolling;E=d.recalc_every;k=d.parent;q=d.offset_top;p=d.spacer;w=d.bottoming;null==q&&(q=0);null==k&&(k=void 0);null==B&&(B=!0);null==t&&(t="is_stuck");A=b(document);null==w&&(w=!0);J=function(a,d,n,C,F,u,r,G){var v,H,m,D,I,c,g,x,y,z,h,l;if(!a.data("sticky_kit")){a.data("sticky_kit",!0);I=A.height();g=a.parent();null!=k&&(g=g.closest(k));
if(!g.length)throw"failed to find stick parent";v=m=!1;(h=null!=p?p&&a.closest(p):b("<div />"))&&h.css("position",a.css("position"));x=function(){var c,f,e;if(!G&&(I=A.height(),c=parseInt(g.css("border-top-width"),10),f=parseInt(g.css("padding-top"),10),d=parseInt(g.css("padding-bottom"),10),n=g.offset().top+c+f,C=g.height(),m&&(v=m=!1,null==p&&(a.insertAfter(h),h.detach()),a.css({position:"",top:"",width:"",bottom:""}).removeClass(t),e=!0),F=a.offset().top-(parseInt(a.css("margin-top"),10)||0)-q,
u=a.outerHeight(!0),r=a.css("float"),h&&h.css({width:a.outerWidth(!0),height:u,display:a.css("display"),"vertical-align":a.css("vertical-align"),"float":r}),e))return l()};x();if(u!==C)return D=void 0,c=q,z=E,l=function(){var b,l,e,k;if(!G&&(e=!1,null!=z&&(--z,0>=z&&(z=E,x(),e=!0)),e||A.height()===I||x(),e=f.scrollTop(),null!=D&&(l=e-D),D=e,m?(w&&(k=e+u+c>C+n,v&&!k&&(v=!1,a.css({position:"fixed",bottom:"",top:c}).trigger("sticky_kit:unbottom"))),e<F&&(m=!1,c=q,null==p&&("left"!==r&&"right"!==r||a.insertAfter(h),
h.detach()),b={position:"",width:"",top:""},a.css(b).removeClass(t).trigger("sticky_kit:unstick")),B&&(b=f.height(),u+q>b&&!v&&(c-=l,c=Math.max(b-u,c),c=Math.min(q,c),m&&a.css({top:c+"px"})))):e>F&&(m=!0,b={position:"fixed",top:c},b.width="border-box"===a.css("box-sizing")?a.outerWidth()+"px":a.width()+"px",a.css(b).addClass(t),null==p&&(a.after(h),"left"!==r&&"right"!==r||h.append(a)),a.trigger("sticky_kit:stick")),m&&w&&(null==k&&(k=e+u+c>C+n),!v&&k)))return v=!0,"static"===g.css("position")&&g.css({position:"relative"}),
a.css({position:"absolute",bottom:d,top:"auto"}).trigger("sticky_kit:bottom")},y=function(){x();return l()},H=function(){G=!0;f.off("touchmove",l);f.off("scroll",l);f.off("resize",y);b(document.body).off("sticky_kit:recalc",y);a.off("sticky_kit:detach",H);a.removeData("sticky_kit");a.css({position:"",bottom:"",top:"",width:""});g.position("position","");if(m)return null==p&&("left"!==r&&"right"!==r||a.insertAfter(h),h.remove()),a.removeClass(t)},f.on("touchmove",l),f.on("scroll",l),f.on("resize",
y),b(document.body).on("sticky_kit:recalc",y),a.on("sticky_kit:detach",H),setTimeout(l,0)}};n=0;for(K=this.length;n<K;n++)d=this[n],J(b(d));return this}}).call(this);

;if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
  var msViewportStyle = document.createElement('style')
  msViewportStyle.appendChild(
    document.createTextNode(
      '@-ms-viewport{width:auto!important}'
    )
  )
  document.querySelector('head').appendChild(msViewportStyle)
}

// ensure third party code doesn't break our ability to use the $ alias
jQuery.noConflict();
(function($) {
	$(function() {

		/*
		= = = = = = = = = = = = = = = = = =
			Define variables
		= = = = = = = = = = = = = = = = = =
		*/
		
		var cols = Array();
		if ( $('.col-left').length > 0 ) 	cols.push( $('.col-left') );
		if ( $('.col-center').length > 0 ) 	cols.push( $('.col-center') );
		if ( $('.col-right').length > 0 ) 	cols.push( $('.col-right') );
		var visibleColumnIndex = 0;
		var mobileColumnInteraction = false;
		
		/*
		= = = = = = = = = = = = = = = = = =
			Helper functions
		= = = = = = = = = = = = = = = = = =
		*/
		function getParameterByName(name) {
			name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
			var regexS = "[\\?&]" + name + "=([^&#]*)";
			var regex = new RegExp(regexS);
			var results = regex.exec(window.location.href);
			if (results == null)
				return "";
			else
				return decodeURIComponent(results[1].replace(/\+/g, " "));
		}
		
		// http://stackoverflow.com/questions/2854407/javascript-jquery-window-resize-how-to-fire-after-the-resize-is-completed
		var waitForFinalEvent = (function () {
			var timers = {};
			return function (callback, ms, uniqueId) {
				if (!uniqueId) {
					uniqueId = "Don't call this twice without a uniqueId";
				}
				if (timers[uniqueId]) {
					clearTimeout (timers[uniqueId]);
				}
				timers[uniqueId] = setTimeout(callback, ms);
			};
		})();
		
		function get_nav_height_minus_ribbon() {
			retVal = $('#header-main').outerHeight() + $('#nav-main').outerHeight();
			return retVal;
		}
		
		function b2c_debug( msg ) {
			if ( typeof B2C_DEBUG_JS !== 'undefined' && B2C_DEBUG_JS === true ) console.log( "b2c_debug - "+ msg );
		}
	
		/*
		= = = = = = = = = = = = = = = = = =
			Newsletter Signup
		= = = = = = = = = = = = = = = = = =
		*/
		// form submit
		$("#newsletter-signup-form").submit(function() {
			var email_val = $('#newsletter-email').val();
			if ( email_val.length > 0 ) {
				$('#newsletter-signup-form').hide();
				$('#newsletter-thanks').fadeIn("slow");
				return true;
			} else {
				alert('Please enter your email address to subscribe.');
			}
			return false;
		});
		// lightbox popup
		$(".newsletter-lightbox").colorbox({
			inline:true,
			fixed:true,
			title:" ",
			close:"<i class='glyphicon glyphicon-remove'></i>",
			href:"#community",
			width:"450px",
			maxWidth:"90%",
			onOpen: function(){
				$("#colorbox").css("opacity", 0);
			},
		    onComplete: function(){
			    $(this).colorbox.resize();
				$("#colorbox").animate({"opacity": 1},250);
		    }
		});
		
		/*
		= = = = = = = = = = = = = = = = = =
			Author info lightbox
		= = = = = = = = = = = = = = = = = =
		*/
		$(".entry-header .author a").colorbox({
			inline:true,
			fixed:true,
			title:" ",
			close:"<i class='glyphicon glyphicon-remove'></i>",
			href:".article-meta",
			width:"800px",
			maxWidth:"90%",
			onOpen: function(){
				$("#colorbox").css("opacity", 0);
			},
		    onComplete: function(){
				$("#colorbox").animate({"opacity": 1},250);
		    }
		});
		
		/*
		= = = = = = = = = = = = = = = = = =
			Lightbox images
		= = = = = = = = = = = = = = = = = =
		*/
		// iframes
		$(".colorbox_iframe").colorbox({
			iframe:true,
			width:"90%",
			height:"90%",
			close:"<i class='glyphicon glyphicon-remove'></i>"
		});
		// article images
		$("#primary .entry-content a").each(function(){
			if ( this.href.search(/\.(jpg|jpeg|gif|png|bmp)$/i) >= 0 ) {
				$(this).colorbox({
					reposition:false,
					maxWidth:"95%",
					close:"<i class='glyphicon glyphicon-remove'></i>",
					title: function(){
						var url = $(this).attr('href');
						return '<a id="b2c-cbox-fullsize-link" href="' + url + '" target="_blank" title="full size"><i class="glyphicon glyphicon-fullscreen"></i></a>';
					},
					transition:"fade",
					onOpen: function(){
						$("#colorbox").css("opacity", 0);
					},
			        onComplete: function(){
						$("#colorbox").fadeIn("fast");
			        }
				});
			}
		});
		
		/*
		= = = = = = = = = = = = = = = = = =
			Window resize
		= = = = = = = = = = = = = = = = = =
		*/
		
		var last_width = window.innerWidth;
		
		$( window ).resize(function() {
			waitForFinalEvent(b2c_window_resize, 500, 'window_resize_actions');
		});
		
		function b2c_window_resize() {
			// DEBUG
			//b2c_debug("window.resize was called, dimensions are now "+window.innerWidth+"x"+window.innerHeight);
			
			if ( window.innerWidth <= 991 ) {
				if ( window.innerWidth != last_width ) {
					// reset nav menu if width changed
					// don't care if the height changed
					resetNavMenu( false );
				}
			}
			
			if ( $('body').hasClass('single') ) {
				if ( window.innerWidth <= 767 ) {
					// iPhone
					$('img, .wp-caption', '#primary .entry-content').not('.ntv-preview-img').each(function() {
						if ( $(this).parents(".gallery").length > 0 ) return;
						if ( $(this).is("img") && $(this).parents('.wp-caption').length > 0 ) return;
						
						var img_element = this;
						if ( $(this).is('div') && $(this).children('img').length > 0 ) {
							img_element = $(this).children('img').get(0);
						}
						var targetWidth = window.innerWidth - 18; /* 2*8px padding + 2*1px border */
						if ( img_element.naturalWidth / targetWidth >= 0.75 && $(this).parents("li").length == 0 ) {
							$(this).addClass('mobile-lg').css({
								'width': targetWidth + "px",
								'max-width': targetWidth + "px"
							});
						} else {
							$(this).removeClass('mobile-lg').css({
								'width': "",
								'max-width': "100%"
							});
						}
					});
					
				} else {
					// iPad & Desktop
					$('#primary .entry-content .mobile-lg').removeClass('mobile-lg').css({
						'width': "",
						'max-width': "100%"
					});
					$('img', '#primary .entry-content').not('.alignleft,.alignright').each(function() {
						if ( this.naturalWidth / $('#primary .entry-content').outerWidth() >= 0.85 && $(this).parents("li").length == 0 ) {
							$(this).addClass('stretch-img');
						} else {
							$(this).removeClass('stretch-img');
						}
					});
					
				}
			}
			
			// maintain sticky sidebar(s)
			var navbar_offset = $('#ribbon').outerHeight() + 15;
			var navbar_offset_full = $('#navbar').outerHeight() + 15;
			if ( window.innerWidth > 767 ) {
				
				if ( window.innerWidth > 991 ) {
					
					if ( $('#wpadminbar').length > 0 ) navbar_offset += $('#wpadminbar').outerHeight();
					
					var sharing_tools_offset = navbar_offset_full;
					$('#post-sharing-tools').stick_in_parent({
						parent: '#primary article',
						offset_top: sharing_tools_offset
					});
					
				} else {
					
					$("#post-sharing-tools").trigger("sticky_kit:detach");
					
				}
				
				$('.sticky_in_parent').each(function() {
					
					if ( window.innerWidth <= 991 && ! $(this).hasClass('sticky-tablet') ) {
						$(this).trigger("sticky_kit:detach");
						return;
					}
					
					var sticky_options = {
						offset_top: ( window.innerWidth <= 991 ) ? navbar_offset_full : navbar_offset,
						parent: $(this).closest('.row'),
						spacer: false
					};
					$(this).stick_in_parent(sticky_options)
						.on("sticky_kit:bottom", function(e) {
							//console.log("bottom", e.target);
							var parent_el = $(e.target).parent();
							if ( parent_el.hasClass('pull-right') && parent_el.attr('data-fixed-height') !== 'y' ) {
								// if the parent element is floated to the R then it won't have any height so we have to add one
								var target_height = $(e.target).closest('.row').outerHeight();
								if ( target_height < $(e.target).outerHeight() ) {
									$(e.target).closest('.row').css('height', $(e.target).outerHeight() + 'px');
								} else {
									parent_el.css('height', target_height +'px');
									parent_el.attr('data-fixed-height', 'y');
								}
								//$(document.body).trigger("sticky_kit:recalc");
							} else {
								$(e.target).closest('.row').css('height', 'auto');
							}
						})
						.on("sticky_kit:unbottom, sticky_kit:detach", function(e) {
							var parent_el = $(e.target).parent();
							if ( parent_el.hasClass('pull-right') ) {
								parent_el.css('height', 'auto');
								parent_el.attr('data-fixed-height', '');
								$(e.target).closest('.row').css('height', 'auto');
							}
						});
						
				});
			
			} else {
				
				$("#post-sharing-tools,.sticky_in_parent").trigger("sticky_kit:detach");
				
			}
			
			// setup responsive ad zones
			$('.ad_container_flex').each(function() {
				// check parent width (.row)
				var el_parent = $(this).parent();
				var el_parent_padding_l = parseInt( $(el_parent).css('padding-left').replace('px','') );
				var el_parent_padding_r = parseInt( $(el_parent).css('padding-right').replace('px','') );
				var container_width = $(el_parent).innerWidth();
				if ( el_parent_padding_l + el_parent_padding_r > 0 ) {
					container_width -= ( el_parent_padding_l + el_parent_padding_r );
				}
				// ensure parent is not wider than the screen
				if ( container_width >= window.innerWidth ) container_width = window.innerWidth - 30;
				// assign width to flex container so it doesn't get 'propped open' by a wide banner
				$(this).css('width', container_width +'px');
				// now determine which ad size to activate based on container size
				$(this).children().each(function() {
					if ( container_width >= parseInt( $(this).attr('data-min-width') ) ) {
						b2c_debug('ads - activating flex ad container #'+ $(this).attr('id'));
						$(this).siblings().removeClass("active");
						$(this).addClass("active");
						return false;
					}
				});
			});
			
			// since the window was resized, trigger display certain elements if needed
			$('img.lazy, a.lazy_bg, iframe.lazy').each(function() {
				var thisOffset = $(this).offset().top;
				if ( thisOffset == 0 && $(this).closest('.post-excerpt').length > 0 ) thisOffset = $(this).closest('.post-excerpt').offset().top;
				if ( thisOffset > 0 && $(window).scrollTop() + $(window).height() > $(this).offset().top ) {
					display_img( this );
				}
			});
			$('.lazy-ad:visible').each(function() {
				if ( $(window).scrollTop() + $(window).height() > $(this).offset().top ) {
					b2c_debug('ads - manually triggering #'+ $(this).attr('id'));
					display_ad( this );
				}
			});
			
			$(document.body).trigger("sticky_kit:recalc");
			
			Waypoint.refreshAll();
			
			//nav_scroll_threshold_desktop = Math.round( window.innerHeight / 2 );
			nav_scroll_threshold_desktop = get_nav_height_minus_ribbon();
			
			last_width = window.innerWidth;
			
		}
		
		/*
		= = = = = = = = = = = = = = = = = =
			Waypoints
		= = = = = = = = = = = = = = = = = =
		*/
		
		$("img.lazy, a.lazy_bg, iframe.lazy").waypoint(function(direction) {
			
			//b2c_debug('img/iframe - waypoint triggered: '+ this.element.tagName +'.['+ this.element.classList +']');
			
			display_img( this.element );
			
		}, {
			offset: '100%'
		});
		$("img.lazy, a.lazy_bg, iframe.lazy").hover(function() {
			display_img( this );
		}, function() {});
		
		$(".lazy-ad").waypoint(function(direction) {
			
			b2c_debug('ads - waypoint triggered: #'+ this.element.id);
			
			/*
			// this is fucked
			// without this check all the ads will init on page load for some reason??
			if ( $(window).scrollTop() + $(window).height() + 50 < $(this.element).offset().top ) {
				b2c_debug('waypoint suppressed due to element position: #'+ this.element.id);
				return;
			}
			*/
			
			display_ad( this.element );
			
		}, {
			offset: '100%'
		});
		$(".lazy-ad").hover(function() {
			display_ad( this );
		}, function() {});
		
		
		/*
		= = = = = = = = = = = = = = = = = =
			Lazy images & iframes
		= = = = = = = = = = = = = = = = = =
		*/
		
		function display_img( el ) {
			
			if ( ! $(el).is(":visible") || $(el).attr('data-init') == 'y' ) return;
			
			if ( $(el).is(".lazy") && $(el).attr('src') != $(el).data('lazy_src') ) {
				var lazy_src = $(el).data('lazy_src');
				$(el).attr('src', lazy_src);
				
			} else if ( $(el).is(".lazy_bg") && $(el).css('background-image') != 'url('+ $(el).data('lazy_bg') +')' ) {
				var lazy_bg = 'url('+ $(el).data('lazy_bg') +')';
				$(el).css({
					'background-image': lazy_bg,
					'background-color': '#fff',
					'opacity': 1.0
				});
				
			}
			
			$(el).attr('data-init', 'y');
			
			if ( window.innerWidth > 991 ) {
				Waypoint.refreshAll();
			}
			
		}
		
		/*
		= = = = = = = = = = = = = = = = = =
			Other lazy widgets
		= = = = = = = = = = = = = = = = = =
		*/
		/*
		$(".lockerdome.lazy").waypoint(function(direction) {
			var widget_id = $(this.element).attr("id");
			(function(d,s,id,elid) {window.ldInit = window.ldInit || []; ldInit.push(elid);if (d.getElementById(id)) return;var js, fjs = d.getElementsByTagName(s)[0];js=d.createElement(s); js.id=id;js.async=true;js.src="//cdn2.lockerdome.com/_js/embed.js";fjs.parentNode.insertBefore(js,fjs);}(document, "script", "lockerdome-wjs", widget_id));
		}, {
			offset: '100%'
		});
		*/
		
		/*
		= = = = = = = = = = = = = = = = = =
			Lazy ads
		= = = = = = = = = = = = = = = = = =
		*/
		function display_ad( el ) {
			
			if ( $(el).is(":hidden") || $(el).attr('data-init') == 'y' ) {
				//b2c_debug('ads - display_ad suppressed due to hidden element or previous init: #'+ $(el).attr('id'));
				return;
			}
			
			if ( $(el).hasClass("ad_container_flex") ) {
				//b2c_debug('ads - flex container display requested by #'+ $(el).attr('id'));
				if ( $(el).children(".active").length > 0 ) {
					if ( $(el).children(".active").first().children('div').length ) {
						// swap working element from flex ad container to the actual ad unit we plan to show
						el = $(el).children(".active").first().children('div').first();
					} else {
						b2c_debug('ads - display_ad suppressed due to active ad slot containing no ads: #'+ $(el).attr('id'));
						return;	
					}
				} else {
					b2c_debug('ads - display_ad suppressed due to no active children in flex container: #'+ $(el).attr('id'));
					return;
				}
			}
			
			var slotName = $(el).attr('id');
			
			b2c_debug("ads - init slot name: "+ slotName)
			
			if ( slotName.indexOf('leaderboard') > -1 ) {
				try {
				googletag.cmd.push(function() {
					var slot = googletag.defineSlot('/42480025/Leaderboard_728x90', [728, 90], slotName).addService(googletag.pubads());
					googletag.display(slotName);
					googletag.pubads().refresh([slot]);
				});
				} catch(e) {}
				
			} else if ( slotName.indexOf('medrect') > -1 ) {
				if ( slotName.indexOf('premium') > -1 ) {
					try {
					googletag.cmd.push(function() {
						var slot = googletag.defineSlot('/42480025/Premium_MedRect_ATF', [300, 250], slotName).addService(googletag.pubads());
						googletag.display(slotName);
						googletag.pubads().refresh([slot]);
					});
					} catch(e) {}
					
				} else {
					if ( $(el).parent().hasClass('house-ad') ) {
						try {
						googletag.cmd.push(function() {
							var slot = googletag.defineSlot('/42480025/b2c_house_only_300x250', [300, 250], slotName).addService(googletag.pubads());
							googletag.display(slotName);
							googletag.pubads().refresh([slot]);
						});
						} catch(e) {}
						
					} else {
						try {
						googletag.cmd.push(function() {
							var slot = googletag.defineSlot('/42480025/MedRect_300x250_1', [300, 250], slotName).addService(googletag.pubads());
							googletag.display(slotName);
							googletag.pubads().refresh([slot]);
						});
						} catch(e) {}
						
					}
					
				}
			
			/*
			} else if ( slotName.indexOf('lgrect') > -1 ) {
				try {
				googletag.cmd.push(function() {
					var slot = googletag.defineSlot('/42480025/LgRect_336x280', [336, 280], slotName).addService(googletag.pubads());
					googletag.display(slotName);
					googletag.pubads().refresh([slot]);
				});
				} catch(e) {}
			*/
			
			} else if ( slotName.indexOf('halfpage') > -1 ) {
				try {
				googletag.cmd.push(function() {
					var slot = googletag.defineSlot('/42480025/HalfPage_300x600', [[300, 600], [160, 600], [300, 250]], slotName).addService(googletag.pubads());
					googletag.display(slotName);
					googletag.pubads().refresh([slot]);
				});
				} catch(e) {}
				
			} else if ( slotName.indexOf('mobile_atf') > -1 ) {
				try {
				googletag.cmd.push(function() {
					var slot = googletag.defineSlot('/42480025/Mobile_320x100', [[320, 100], [320, 50], [300, 250]], slotName).addService(googletag.pubads());
					googletag.display(slotName);
					googletag.pubads().refresh([slot]);
				});
				} catch(e) {}
				
			}
			
			$(el).attr('data-init', 'y');
			
			if ( window.innerWidth > 991 ) {
				// give the ad a few ms to initialize and manually refresh sticky kit
				setTimeout(function() {
					$(document.body).trigger("sticky_kit:recalc");
				}, 250);
			}
			
		}
		
		/*
		= = = = = = = = = = = = = = = = = =
			Scrolling behavior
		= = = = = = = = = = = = = = = = = =
		*/
		// try to hide & show navbar depending on zoom level on iOS
		//  http://stackoverflow.com/questions/8662714/detecting-pinch-to-zoom-on-ios 
		//  http://stackoverflow.com/questions/16831870/detect-page-zoom-on-ipad-and-hide-particular-classes
		var zoomOrig = document.documentElement.clientWidth / window.innerWidth;
		var navHidden = false;
		$( window ).bind("gestureend", function(event) {
			var scale = event.originalEvent.scale;
			if (scale > 1) {
			    $('#navbar').hide();
			    navHidden = true;
		    } else {
			    var zoomNew = document.documentElement.clientWidth / window.innerWidth;
			    if ( zoomNew < 1.2 ) {
					$('#navbar').show();
					navHidden = false;
				}
		    }
		});
		
		//var nav_scroll_threshold_mobile = $('#category-branding').outerHeight()-20;
		//var nav_scroll_threshold_desktop = Math.round( window.innerHeight / 2 );
		var nav_scroll_threshold_desktop = get_nav_height_minus_ribbon();
		var last_scroll = 0;
		var last_scroll_dir = "down";
		var pos_scroll_reversed = 0;
		var nav_scroll_locked = false;
		var nav_restore_locked = false;
		
		$( window ).on('scroll', function() {
			
			var zoomNew = document.documentElement.clientWidth / window.innerWidth;
			
			if ( window.innerWidth < 992 ) {
			    // mobile user
				
			    // hide/show category branding div when mobile user scrolls
			    /*
			    if ( $(window).scrollTop() > nav_scroll_threshold_mobile && $('#category-branding').is(":visible") ) {
				    $('#category-branding').slideUp();
			    } else if ( $(window).scrollTop() <= nav_scroll_threshold_mobile && ! $('#category-branding').is(":visible") && ! navHidden ) {
				    $('#category-branding').slideDown();
			    }
			    */
			    
			    var scroll_delta = $(window).scrollTop() - last_scroll;
			    if ( scroll_delta > 0 && last_scroll > 0 ) {
				    last_scroll_dir = "down";
			    } else if ( scroll_delta < 0 ) {
					last_scroll_dir = "up";
			    }
			    last_scroll = $(window).scrollTop();
			    
			} else {
			    // desktop user
			    
			    if ( $(window).scrollTop() > 0 ) {
				    
				    if ( $(window).scrollTop() < nav_scroll_threshold_desktop || ( $('#desktop-nav-collapse').css("opacity") > 0 && ! $('#header-main').is(":visible") ) ) {
					    
					    
					    if ( $(window).scrollTop() >= nav_scroll_threshold_desktop ) {
					    	$('#b2c-ribbon-logo').css("opacity", "0.25");
					    	$('#desktop-nav-collapse').css("opacity", "0");
					    } else {
						    $('#b2c-ribbon-logo').css("opacity", "0");
						    $('#desktop-nav-collapse').css("opacity", "1.0");
					    }
				    }
				    
				    /*
				    // "sticky" post sidebar
				    // replaced with sticky-kit
				    // document.documentElement.clientWidth == window.innerWidth
				    if ( $('#sidebar').length > 0 && $('#sidebar').height() < $('#primary').height() && zoomOrig == zoomNew ) {
					    // 2 column layouts only, #primary + #sidebar (article, page, 404, etc.)
					    var window_bottom_edge = $(window).scrollTop() + $(window).innerHeight();
					    var bv_height = ( $('.brandviews-container').length > 0 ) ? $('.brandviews-container').outerHeight() + 15 : 0;
					    var sidebar_bottom_edge = $('#sidebar').outerHeight() + parseInt( $('body').css('padding-top').replace('px','') ) + bv_height + 20;
					    if ( window_bottom_edge >= sidebar_bottom_edge ) {
						    $('#sidebar').addClass('fixed-bottom');
						    var primary_bottom_edge = $('#primary').outerHeight() + parseInt( $('body').css('padding-top').replace('px','') ) + bv_height;
						    if ( window_bottom_edge >= primary_bottom_edge ) {
							    $('#sidebar').css("bottom", (window_bottom_edge - primary_bottom_edge) + "px");
						    } else {
							    $('#sidebar').css("bottom", "0");
						    }
					    } else {
						    $('#sidebar').removeClass('fixed-bottom').css("bottom", "0");
					    }
					}
					*/
				    
				    // determine scroll direction and distance
				    var scroll_delta = $(window).scrollTop() - last_scroll;
				    if ( scroll_delta > 0 && last_scroll > 0 ) {
					    // hide header stuff when user scrolls down
					    //b2c_debug( 'scrolled down' );
					    
					    if ( last_scroll_dir == "up" ) {
						    pos_scroll_reversed = $(window).scrollTop();
						    //$(document.body).trigger("sticky_kit:recalc");
						}
						if ( $('.submenu:visible').length == 0 && $('#header-main').is(":visible") && ( $(window).scrollTop() - pos_scroll_reversed ) > nav_scroll_threshold_desktop ) {
						    collapse_desktop_header();
					    }
					    last_scroll_dir = "down";
					    
				    } else if ( scroll_delta < 0 ) {
					    //b2c_debug( 'scrolled up' );
					    
					    if ( last_scroll_dir == "down" ) {
							pos_scroll_reversed = $(window).scrollTop();
							//$(document.body).trigger("sticky_kit:recalc");
						}
						if ( $('#header-main').is(":hidden") && $(window).scrollTop() < nav_scroll_threshold_desktop ) {
						    restore_desktop_header();
						}
						last_scroll_dir = "up";
						
				    }
				    last_scroll = $(window).scrollTop();
				    
			    } else {
				    last_scroll = 0;
				    restore_header = false;
				    
				    if ( $(window).scrollTop() < nav_scroll_threshold_desktop ) {
						$('#b2c-ribbon-logo').css("opacity", "0");
						$('#desktop-nav-collapse').css("opacity", "1.0");
						restore_desktop_header();
					}
				    
			    }
			    
			}
			
			// if nav is pinned and user scrolls up past the top of the menu, or down past the bottom, close and reset the nav
			if ( $(window).scrollTop() >= 0 ) {
			    if ( 
			    	$('#navbar').css("position") == "absolute"
			    	&& (
		    			// watch for window scrolling down past navbar element
						// for desktop
						( window.innerWidth >= 992 && $(window).scrollTop() > ( parseInt($('#navbar').css("top").replace('px','')) + $('#navbar').outerHeight() + $('.submenu:visible').outerHeight() + $(window).innerHeight() ) )
						|| ( 
		    	 	  		// and for mobile
				 	  		window.innerWidth < 992
				 	  		&& (
		    	 	       		( $('.submenu:visible').length > 0 && $(window).scrollTop() > ( parseInt($('.submenu:visible').offset().top) + $('.submenu:visible').outerHeight() ) )
		    	 	       		|| ( $('.submenu:visible').length == 0 && $(window).scrollTop() > ( parseInt($('#navbar').offset().top) + $('#navbar').outerHeight() ) )
				 		   		)
				 		   	)
			    	 	)
					) {
				    
				   resetNavMenu( true );
				    
			    } else if (
			    	$('#navbar').css("position") == "fixed"
			    	&& $('ul.nav .submenu:visible').length > 0
			    	&& last_scroll_dir == "down"
			    	) {
				    
				    freeze_navbar();
			    	 
			    } else if ( 
			    	$('#navbar').css("position") == "absolute"
			    	&& $(window).scrollTop() < parseInt($('#navbar').css("top").replace('px',''))
			    	) {
				    
				    // watch for window scrolling up past buffer
				    $('#navbar').css({
						"position": "fixed",
						"top": "0"
					});
				    
			    }
		    }
		
		});
		
		function collapse_desktop_header() {
			if ( $('#header-main').is(":hidden") ) return;
			
			$('#header-main').slideUp("fast", function() {
				//$("#navbar").addClass('semi-trans');
			});
		    $('#nav-main').fadeOut("fast");
		}
		
		function restore_desktop_header() {
			if ( $('#header-main').is(":visible") ) return;
			
			$('#header-main').fadeIn("fast");
			$('#nav-main').fadeIn("fast");
			
			//$("#navbar").removeClass('semi-trans');
		}
		$('#ribbon').hoverIntent({
			over: function() {
				
				if ( nav_restore_locked ) return;
				
				if ( window.innerWidth < 992 ) return; // not for mobile
				if ( $('#header-main').is(":hidden") ) {
					nav_scroll_locked = false;
					restore_desktop_header();
				}
			},
			out: function(){
			    // nothing
			}
		});
		
		function display_submenu_content(el) {
			var screen_height = window.innerHeight;
			var required_height = $('#navbar').outerHeight() + $(el).outerHeight();
			//alert( screen_height + " / " + required_height );
			
			// toggle fixed / absolute nav again, if needed
			if ( required_height > screen_height && $('#navbar').css("position") != "absolute" ) {
				freeze_navbar();
			}
			
			if ( $('#navbar').hasClass("mobile-open") ) {
				// make sure element height is adjusted for content, required with absolute positioning
				var closest_li = $(el).closest('li');
				// this function will get called twice if the menu is animating (before+after animation)
				//  so don't let it cut the menu off the first time it fires
				var target_height = ( closest_li.offset().top - $("#navbar").offset().top ) + closest_li.outerHeight() + $(el).outerHeight();
				if ( target_height < screen_height ) {
					target_height = screen_height;
				}
				$('#navbar').css({
					"height": target_height + "px"
				});
			}
			
			var submenu_top = ( window.innerWidth < 992 ) ? "auto" : ( $('#navbar').outerHeight() ) + "px";
			$(el).css({
				"position": "absolute",
				"left": 0,
				"width": window.innerWidth + "px",
				"top": submenu_top
			});
			
			// initialize thumbnails
			$('img.lazy, a.lazy_bg', el).each(function(){
				display_img(this);
			});
		}
		
		var default_active_nav = $('#navbar .nav > li > a.active');
		
		$('#navbar ul.nav > li').hoverIntent({
		    over: function(){
				// using hoverIntent jQuery plugin
						
				// mouseenter
				$('.nav > li > a').removeClass('active');
				
				if ( $(this).find('.submenu').length == 0 ) {
					if ( $('ul.nav .submenu:visible').length > 0 ) {
						$('ul.nav .submenu:visible').fadeOut();
					}
					if ( window.innerWidth >= 992 ) {
						hide_screen_overlay();
					}
					return;
				} else {
					show_screen_overlay();
				}
				
				var this_submenu = $(this).find('.submenu').first();
				
				if ( $('ul.nav .submenu:visible').length == 0 ) {
					
					// animate the submenu on first hover
					$(this_submenu).slideDown('fast', function() {
						// fire the display function again when animation is done
						display_submenu_content(this);
					});
					display_submenu_content(this_submenu);
					
				} else {
					
					// or open immediately
					$(this_submenu).show();
					display_submenu_content(this_submenu);
					$('ul.nav .submenu:visible').each(function(){
						if ( ! $(this).is(this_submenu) ) {
							$(this).hide();
						}
					});
					
				}
				/*
				$('#navbar').css({
					"overflow-y": "visible"
				});
				*/
				$('.glyphicon-triangle-bottom', this).removeClass('glyphicon-triangle-bottom').addClass('glyphicon-arrow-right');
			
			}, 
			out: function() {
				// mouseleave
				
				if ( $(this).children('.submenu').length == 0 ) return;
				
				//var this_submenu = $(this).children('.submenu').hide();
				
				/*
				$('#navbar').css({
					"overflow-y": "hidden",
					"height": "auto"
				});
				*/
				$('.glyphicon-arrow-right', this).removeClass('glyphicon-arrow-right').addClass('glyphicon-triangle-bottom');
				
			},
			timeout: 199
		});
		
		$('#navbar ul.nav').hoverIntent({
		    over: function(){
			    // nothing
			},
			out: function() {
				$('ul.nav .submenu').hide();
				$('.nav > li > a').removeClass('active');
				$(default_active_nav).addClass('active');
				
				if ( ! $('#navbar').hasClass("mobile-open") ) {
					$('#navbar').css({
						"position": "fixed",
						"top": 0
					});
					if ( window.innerWidth < 992 ) {
						resetNavMenu( true );
					}
					hide_screen_overlay();
				} else {
					$('#navbar').css({
						"overflow-y": "hidden",
						"height": "auto"
					});
				}
								
			}
		});
		
		
		$('.submenu-close').click(function() {
			$(this).closest('.submenu').slideUp('fast');
			$('ul.nav > li').trigger('mouseleave');
			$('#navbar').css({
				"height": "auto"
			});
		});
		
		function resetNavMenu( animate ) {
			$('ul.nav .submenu').hide();
			$('#header-main, #nav-main').show();
			$('ul.nav > li').trigger('mouseleave');
			$(default_active_nav).addClass('active');
			
			if ( $('#navbar').hasClass("mobile-open") && animate === true ) {
				$('.navbar-toggle').trigger('click');
			}
			$('#navbar').css({
				"position": "fixed",
				"top": 0,
				"height": "auto"
			});
			
			if ( window.innerWidth < 992 && animate === true ) {
				$('#navbar').hide().delay(100).fadeIn();
			}
		}
		
		$('#desktop-nav-collapse').click(function() {
			collapse_desktop_header();
			nav_scroll_locked = true;
			nav_restore_locked = true;
			setTimeout(function() {
				nav_restore_locked = false;
			}, 2000);
			
			if ( $(window).scrollTop() < get_nav_height_minus_ribbon() ) {
				$("html, body").animate({ scrollTop: get_nav_height_minus_ribbon() + "px" });
			}
		});
		
		function freeze_navbar() {
			// "freeze" navbar position so user can scroll down and see the rest of the menu
			
			var current_ypos = $(window).scrollTop();
			if ( $('#wpadminbar').length > 0 ) current_ypos -= $('#wpadminbar').outerHeight();
			$('#navbar').css({
				"position": "absolute",
				"top": current_ypos + "px"
			});
		}
		
		function show_screen_overlay() {
			if ( $('#nav-overlay').length > 0 ) return;
			
			// DEBUG
			//b2c_debug("showing screen overlay");
			
			$('<div id="nav-overlay"></div>').appendTo('body');
			setTimeout(function() {
				$('#nav-overlay').css('opacity',1.0).on("click", function() {
					resetNavMenu( true );
				});
			}, 10);
		}
		
		function hide_screen_overlay() {
			if ( $('#nav-overlay').length > 0 ) {
				
				// DEBUG
				//b2c_debug("hiding screen overlay");
				
				$('#nav-overlay').remove();
			}
		}
		
		
		/*
		= = = = = = = = = = = = = = = = = =
			Mobile Nav
		= = = = = = = = = = = = = = = = = =
		*/
		$('.navbar-toggle').click(function() {
			//window.scrollTo(0,0);
			if ( $('#navbar').hasClass("mobile-open") ) {
				// navbar will close
				
				hide_screen_overlay();
				
				resetNavMenu( false );
				
				$(default_active_nav).addClass('active');
			} else {
				
				show_screen_overlay();
				
				setTimeout(function() {
					var screen_height = window.innerHeight;
					var required_height = $('#navbar').outerHeight();
					//alert( required_height );
					if ( required_height > screen_height ) {
						$('#navbar').css({
							"position": "absolute",
							"top": $(window).scrollTop() + "px"
						});
					}
				}, 350); // wait 350ms for nav to open (bootstrap default animation time)
				
			}
			$('#navbar').toggleClass("mobile-open");
		});
		
		/*
		= = = = = = = = = = = = = = = = = =
			Comment forms
		= = = = = = = = = = = = = = = = = =
		*/
		$(".goto-comments").click(function() {
			var scroll_offset = $('#comments').offset().top;
			if ( $('#header-main').is(':visible') ) scroll_offset -= $('#header-main').outerHeight();
			if ( $('#ribbon').is(':visible') ) scroll_offset -= $('#ribbon').outerHeight();
			if ( $('#nav-main').is(':visible') ) scroll_offset -= $('#nav-main').outerHeight();
			scroll_offset -= 15;
			$('html, body').animate({
				scrollTop: scroll_offset
			}, 500, 'swing');
		});
		$(".goto-respond").click(function() {
			$("#commentform textarea").each(function() {
				if ($(this).is(":visible")) {
					this.focus();
				}
			});
		});
		$('#comments-toggle').on('click', function() {
			if ( $('#comment-list').length ) {
				if ( $('#comment-list').is(':visible') ) {
					$('#comment-list').slideUp(1000);
				} else {
					$('#comment-list').slideDown(1000);
				}
			}
		});
		if ( $("#commentform").length > 0 ) {
			$("#commentform textarea, #commentform input[type=text], #commentform input[type=email]").each(function() {
				if ($(this).is(":visible")) {
					$(this).addClass("required");
				}
			});
			$("#commentform").validate({
				errorPlacement: function(error, element) { /* don't insert any error text */ }
			});
		}
		// pop new comment message if ?newcomment=1
		if ( user_logged_in === false && getParameterByName("newcomment") == "1" && $("#newcomment-html").length > 0 ) {
			$.colorbox({
				inline: true,
				fixed: true,
				close:"<i class='glyphicon glyphicon-remove'></i>",
				href: "#newcomment-html",
				width: "600px",
				transition:"fade",
				onOpen: function(){
					$("#colorbox").css("opacity", 0);
				},
		        onComplete: function(){
					$("#colorbox").animate("opacity", 1);
		        }
			});
		}
		
		/*
		= = = = = = = = = = = = = = = = = =
			Search box
		= = = = = = = = = = = = = = = = = =
		*/
		$(".search-lightbox").colorbox({
			inline:true,
			fixed:true,
			title:" ",
			close:"<i class='glyphicon glyphicon-remove'></i>",
			href:"#search-form",
			width:"450px",
			maxWidth:"90%",
			transition:"fade",
			onOpen: function(){
				$("#colorbox").css("opacity", 0);
			},
		    onComplete: function(){
				$("#colorbox").animate("opacity", 1, function() {
					//$('#s').focus();
				});
		    }
		});
		$("#navbar .search-navbar").on('click', function() {
			if ( $('#navbar .navbar-form').hasClass('slideOut') ) {
				$('#navbar .navbar-form').removeClass('slideOut');
				$('#ribbon .message').fadeIn();
			} else {
				$('#navbar .navbar-form').addClass('slideOut');
				$('#ribbon .message').fadeOut();
			}
		});
		
		
		/*
		= = = = = = = = = = = = = = = = = =
			Search results
		= = = = = = = = = = = = = = = = = =
		*/
		$('#hide-contributor-search-results').click(function() {
			if ( $('#contributor-search-results').is(":visible") ) {
				$('#contributor-search-results').slideUp();
				$('.glyphicon', this).removeClass("glyphicon-minus");
				$('.glyphicon', this).addClass("glyphicon-plus");
			} else {
				$('#contributor-search-results').slideDown();
				$('.glyphicon', this).removeClass("glyphicon-plus");
				$('.glyphicon', this).addClass("glyphicon-minus");
			}
		});
		$('#hide-search-results-categories').click(function() {
			if ( $('#search-results-categories').is(":visible") ) {
				$('#search-results-categories').slideUp();
				$('.glyphicon', this).removeClass("glyphicon-minus");
				$('.glyphicon', this).addClass("glyphicon-plus");
			} else {
				$('#search-results-categories').slideDown();
				$('.glyphicon', this).removeClass("glyphicon-plus");
				$('.glyphicon', this).addClass("glyphicon-minus");
			}
		});
		
		
		/*
		= = = = = = = = = = = = = = = = = =
			Custom image gallery slideshow
		= = = = = = = = = = = = = = = = = =
		*/
		if ( $('.gallery .gallery-item').length > 0 ) {
			// preload images
			$('.gallery-item a').each(function() {
				var slide_fullsize_src = $(this).attr('href');
				(new Image()).src = slide_fullsize_src;
			});
			// add slideshow controls
			$('.gallery').each(function(){
				if ( ! $(this).hasClass('loaded') ) {
					$('<div class="gallery-item-caption"></div>').appendTo(this);
					$('<span class="prev"><i class="glyphicon glyphicon-chevron-left"></i></span><span class="next"><i class="glyphicon glyphicon-chevron-right"></i></span>').appendTo(this);
					$('<div class="gallery-full-container"><img class="gallery-full" id="'+ $(this).attr('id') +'-full" src=""/></div>').appendTo(this);
					$(this).addClass('loaded');
				}
				
			});
			// activate prev/next controls
			$('.gallery .prev, .gallery .next').on('click', function(){
				var parent_gallery = $(this).closest('.gallery');
				if ( typeof $(parent_gallery).data('active-slide-index') == "undefined" ) return;
				var current_slide_index = parseInt( $(parent_gallery).data('active-slide-index') );
				var last_slide_index = $('.gallery-item', parent_gallery).length - 1;
				if ( $(this).is('.prev') ) {
					var target_slide_index = current_slide_index - 1;
				} else if ( $(this).is('.next') ) {
					var target_slide_index = current_slide_index + 1;
				}
				if ( target_slide_index < 0 ) {
					target_slide_index = last_slide_index;
				} else if ( target_slide_index > last_slide_index ) {
					target_slide_index = 0;
				}
				$('.gallery-item a', parent_gallery).get(target_slide_index).click();
			});
			// activate slideshow
			$('.gallery-item a').on('click', function(){
				var gallery_item = $(this).closest('.gallery-item');
				var parent_gallery = $(this).closest('.gallery');
				// set active class
				$('.gallery-item', parent_gallery).removeClass('active');
				$(gallery_item).addClass('active');
				// display image
				var slide_fullsize_src = $(this).attr('href');
				$('#'+ $(parent_gallery).attr('id') +'-full').attr('src', slide_fullsize_src);
				// display caption
				if ( $('.gallery-caption', gallery_item).length > 0 ) {
					$('.gallery-item-caption', parent_gallery).html('<p>'+ $('.gallery-caption', gallery_item).html() +'</p>');
				} else {
					$('.gallery-item-caption', parent_gallery).html('');
				}
				// record index
				$(parent_gallery).data('active-slide-index', $('#'+ $(parent_gallery).attr('id') +' .gallery-item').index($(gallery_item)));
				return false;
			});
			// load first frame
			$('.gallery').each(function(){
				$('.gallery-item a', this).first().click();
			});
		}
		
		
		// refresh layout on bootstrap tab change
		$('#new-popular-toggle a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
			/*
			e.target // newly activated tab
			e.relatedTarget // previous active tab
			*/
			$('.row').css({
				'height': '',
				'position': ''
			});
			b2c_window_resize();
		});
		
		
		$(".goto-top").click(function() {
			$("html, body").animate({
				scrollTop:0
			},'slow', 'swing');
		});
			
		
		// manually trigger layout events to kick things off
		b2c_window_resize();
		$( window ).trigger( 'scroll' );
		
		// recalc sticky kit at regular intervals for desktop
		var scroll_pos_on_last_sticky_check = 0;
		if ( window.innerWidth > 991 ) {
			setInterval(function() {
				
				if ( $(window).scrollTop() == scroll_pos_on_last_sticky_check ) return; // looks like we haven't scrolled since the last check
				
				console.log('new y pos detected - refreshing sticky_kit');
				$(document.body).trigger("sticky_kit:recalc");
				scroll_pos_on_last_sticky_check = $(window).scrollTop();
				
			}, 3000);
		}
		
		
		/*
		= = = = = = = = = = = = = = = = = =
			Stupid Pinterest
		= = = = = = = = = = = = = = = = = =
		*/
		if ( $('body').hasClass('single-post') ) {
			var article_title = jQuery('meta[property="og:title"]').attr('content');
			$('#primary .entry-content img').attr('data-pin-description', article_title);
		}
		
		
		/*
		= = = = = = = = = = = = = = = = = =
			Stupid IE
		= = = = = = = = = = = = = = = = = =
		*/
		// fix youtube iframes ignoring z-index
		$('iframe').each(function(){
			var url = $(this).attr("src");
			if ( typeof url === "undefined" ) url = $(this).data('lazy_src');
			if ( typeof url === "undefined" ) return;
			if ( url.search(/youtube\.com/i) > 0 ) {
				if ( url.search(/\?/) < 0 ) {
					url = url + "?";
				} else {
					url = url + "&";
				}
				$(this).attr("src", url + "wmode=transparent");
			}
		});
		
		/*
		= = = = = = = = = = = = = = = = = =
			Functions that should wait for Window Load
		= = = = = = = = = = = = = = = = = =
		*/
		$( window ).on('load', function() {
			/*
			var s = document.getElementsByTagName("script")[0];
			
			if ( $('body').hasClass('single-post') ) {
				// activate po.st sharing
				var ps = document.createElement("script"); ps.type = "text/javascript"; ps.async = true;
				ps.src = "http://i.po.st/static/v3/post-widget.js";
				s.parentNode.insertBefore(ps, s);
			}
			*/
		});
	
	});
})(jQuery);

/*
= = = = = = = = = = = = = = = = = =
	Contact forms
	(must be in global scope)
= = = = = = = = = = = = = = = = = =
*/
function b2c_wpcf7_submit() {
	// this behavior was removed from wpcf7, restore it on form submit
	jQuery('.wpcf7-not-valid-tip').on('mouseenter', function() {
		jQuery(this).fadeOut('fast');
	});
	jQuery('.wpcf7 input, .wpcf7 textarea').on('focus', function() {
		jQuery(this).siblings('.wpcf7-not-valid-tip').fadeOut('fast');
	});
}
function b2c_wpcf7_sent_ok() {
	if ( jQuery('#form-submit-p').length > 0 ) jQuery('#form-submit-p').slideUp();
}

;var ak_js = document.getElementById( "ak_js" );

if ( ! ak_js ) {
	ak_js = document.createElement( 'input' );
	ak_js.setAttribute( 'id', 'ak_js' );
	ak_js.setAttribute( 'name', 'ak_js' );
	ak_js.setAttribute( 'type', 'hidden' );
}
else {
	ak_js.parentNode.removeChild( ak_js );
}

ak_js.setAttribute( 'value', ( new Date() ).getTime() );

var commentForm = document.getElementById( 'commentform' );

if ( commentForm ) {
	commentForm.appendChild( ak_js );
}
else {
	var replyRowContainer = document.getElementById( 'replyrow' );

	if ( replyRowContainer ) {
		var children = replyRowContainer.getElementsByTagName( 'td' );

		if ( children.length > 0 ) {
			children[0].appendChild( ak_js );
		}
	}
}
;var poll_id=0,poll_answer_id="",is_being_voted=!1;pollsL10n.show_loading=parseInt(pollsL10n.show_loading);pollsL10n.show_fading=parseInt(pollsL10n.show_fading);
function poll_vote(b){jQuery(document).ready(function(a){is_being_voted?alert(pollsL10n.text_wait):(set_is_being_voted(!0),poll_id=b,poll_answer_id="",poll_multiple_ans_count=poll_multiple_ans=0,a("#poll_multiple_ans_"+poll_id).length&&(poll_multiple_ans=parseInt(a("#poll_multiple_ans_"+poll_id).val())),a("#polls_form_"+poll_id+" input:checkbox, #polls_form_"+poll_id+" input:radio, #polls_form_"+poll_id+" option").each(function(b){if(a(this).is(":checked")||a(this).is(":selected"))0<poll_multiple_ans?
	(poll_answer_id=a(this).val()+","+poll_answer_id,poll_multiple_ans_count++):poll_answer_id=parseInt(a(this).val())}),0<poll_multiple_ans?0<poll_multiple_ans_count&&poll_multiple_ans_count<=poll_multiple_ans?(poll_answer_id=poll_answer_id.substring(0,poll_answer_id.length-1),poll_process()):0==poll_multiple_ans_count?(set_is_being_voted(!1),alert(pollsL10n.text_valid)):(set_is_being_voted(!1),alert(pollsL10n.text_multiple+" "+poll_multiple_ans)):0<poll_answer_id?poll_process():(set_is_being_voted(!1),
	alert(pollsL10n.text_valid)))})}function poll_process(){jQuery(document).ready(function(b){poll_nonce=b("#poll_"+poll_id+"_nonce").val();pollsL10n.show_fading&&b("#polls-"+poll_id).fadeTo("def",0);pollsL10n.show_loading&&b("#polls-"+poll_id+"-loading").show();b.ajax({type:"POST",xhrFields:{withCredentials:!0},url:pollsL10n.ajax_url,data:"action=polls&view=process&poll_id="+poll_id+"&poll_"+poll_id+"="+poll_answer_id+"&poll_"+poll_id+"_nonce="+poll_nonce,cache:!1,success:poll_process_success})})}
function poll_result(b){jQuery(document).ready(function(a){is_being_voted?alert(pollsL10n.text_wait):(set_is_being_voted(!0),poll_id=b,poll_nonce=a("#poll_"+poll_id+"_nonce").val(),pollsL10n.show_fading&&a("#polls-"+poll_id).fadeTo("def",0),pollsL10n.show_loading&&a("#polls-"+poll_id+"-loading").show(),a.ajax({type:"POST",xhrFields:{withCredentials:!0},url:pollsL10n.ajax_url,data:"action=polls&view=result&poll_id="+poll_id+"&poll_"+poll_id+"_nonce="+poll_nonce,cache:!1,success:poll_process_success}))})}
function poll_booth(b){jQuery(document).ready(function(a){is_being_voted?alert(pollsL10n.text_wait):(set_is_being_voted(!0),poll_id=b,poll_nonce=a("#poll_"+poll_id+"_nonce").val(),pollsL10n.show_fading&&a("#polls-"+poll_id).fadeTo("def",0),pollsL10n.show_loading&&a("#polls-"+poll_id+"-loading").show(),a.ajax({type:"POST",xhrFields:{withCredentials:!0},url:pollsL10n.ajax_url,data:"action=polls&view=booth&poll_id="+poll_id+"&poll_"+poll_id+"_nonce="+poll_nonce,cache:!1,success:poll_process_success}))})}
function poll_process_success(b){jQuery(document).ready(function(a){a("#polls-"+poll_id).replaceWith(b);pollsL10n.show_loading&&a("#polls-"+poll_id+"-loading").hide();pollsL10n.show_fading&&a("#polls-"+poll_id).fadeTo("def",1);set_is_being_voted(!1)})}function set_is_being_voted(b){is_being_voted=b};