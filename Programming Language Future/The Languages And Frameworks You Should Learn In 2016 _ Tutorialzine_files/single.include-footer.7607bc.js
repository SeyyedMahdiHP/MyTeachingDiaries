$(function(){

	// Syntax highlighting

	if(window.hljs){

		$('#post pre:not(.inline-editor pre):not(.challenge pre)').each(function(i, e) {

			var elem = $(this);
			var type = elem.attr('class') || elem.data('type');
			
			if(!type) return;
			
			type = type.replace('brush:','').replace('js','javascript').replace('plain','nohighlight');

			elem.wrapInner('<code class="'+type+'" />');

			// Show the line numbers

			var lines = elem.text().match(/\n/g);
			lines = (lines ? lines.length : 0) + 1;

			if(lines > 1){

				var l = '';
				for(var i=0;i<lines;i++){
					l+=(i+1)+'\n';
				}

				elem.attr('data-lines',l);
			}

			// Enable dark theme

			var theme = elem.data('theme');

			if(theme){
				elem.addClass(theme);
			} 
		});

		hljs.tabReplace = '    ';
		hljs.initHighlightingOnLoad();
	}

	// Sidebar post tabs

	$('#sidebar .sidebar-group.posts h5').click(function(){
		var elem = $(this);

		elem.addClass('active').siblings().removeClass('active');
		elem.parent().find('#'+elem.data('tab')).addClass('active');
	});


	// Follow Button Sidebar

	setTimeout(function(){
		var iframe = '<iframe scrolling="no" frameborder="0" style="width:300px; height:20px"' +
						'src="http://platform.twitter.com/widgets/follow_button.html?screen_name=tutorialzine'+
						'&amp;link_color=008de6&amp;text_color=aaaaaa" allowtransparency="true"></iframe>';

		$('#followTwitterButton').html(iframe);
	},3000);

	// Book page download form
	
	(function(){
		
		var downloadBook = $('#downloadBookForm'),
			form = downloadBook.find('form'),
			working = false;

		form.submit(function(e){
			e.preventDefault();

			if(working) return;
			working = true;

			newsletterHelper({
				email:form.find('input[type=text]').val()
			}, function(status, hash){

				working = false;

				switch(status){
					case 'success':

						form.find('input[type=text]').val('');
						showFlashMessage('Thank you! Check your email for instructions.', 'green');

						trackEvent('Signup', 'Newsletter', 'Book Download Page');
						break;

					case 'registered':
						showFlashMessage('Click here to download your book.', 'green', function(){ window.location = '/webdev-newsletter/' + hash; });
						break;

					case 'invalid':
						showFlashMessage('Invalid email.', 'red');
						break;
				}
			});
		});
		
	})();
		
	
	function newsletterHelper(params, cb){
		
		params.submit = 1;
		params.special = 'asd22';
		
		$.post('/webdev-newsletter/', params, function(r,xhr){

			// Match the responses

			if(r.match('JS:SUCCESS')){
				cb('success')
			}
			else if(r.match('JS:REGISTERED')){
				cb('registered', r.match(/JS:REGISTERED:(\w+)/)[1]);
			}
			else {
				cb('invalid');
			}

		}, 'html');
	}

	// Member area
	
	var signin = $('.mContainer .hero1 .signin');
	
	if(signin.length){

		$('body').click(function(){
			signin.removeClass('expand');
		});
		
		signin.click(false);
		
		signin.find('.login').click(function(e){
			e.preventDefault();

			signin.addClass('expand');
			signin.find('input').focus();
		});
		
		signin.find('.go').click(function(e){
			e.preventDefault();
			
			$.post('/webdev-newsletter/', {check: signin.find('input').val()}, function(r){
				if(/\w+/.test(r)){
					window.location = '/webdev-newsletter/'+r+'/';
				}
				else{
					// show the error message that the person is not logged in
					showFlashMessage('This email is not registered. Please sign up first!', 'red');
				}
			}, 'html');
		});
		
		$('.mMessageSuccess').each(function(){
			var el = $(this).remove();
			showFlashMessage(el.text(), 'green');
			trackEvent('Signup', 'Newsletter', 'From Member Page');
		});
		
		$('.mMessageError').each(function(){
			var el = $(this).remove();
			showFlashMessage(el.text(), 'red');
		});
	}

	function showFlashMessage(message, cls, onClick){
		$('.flashMessage').remove();
		var msg = $('<div class="flashMessage '+cls+'">');
		
		onClick = onClick || function(){
			msg.queue('fx',[]);
			msg.fadeOut('fast');
	   };
		
		msg.text(message)
		   .hide()
		   .appendTo('body')
		   .fadeIn('fast')
		   .delay(5000)
		   .fadeOut('fast')
		   .click(onClick);
	}

	// Fixed sidebar

	setTimeout(function(){

		var fixedSidebar = $('#fixed-sidebar');

		if(!fixedSidebar.length) return;

		var articles = [
			{id: 5779, img: "/2015/05/15-awesome-free-javascript-books-100x100.jpg", url: "/2015/05/15-awesome-and-free-javascript-books/", title: "15 Awesome And Free JavaScript Books"}, 
			{id: 5598, img: "/2015/03/15-chrome-devtools-tips-and-tricks-100x100.jpg", url: "/2015/03/15-must-know-chrome-devtools-tips-tricks/", title: "15 Must-Know Chrome DevTools Tips and Tricks"}, 
			{id: 4889, img: "/2014/12/learn-regex-20-minutes-100x100.jpg", url: "/2014/12/learn-regular-expressions-in-20-minutes/", title: "Learn Regular Expressions in 20 Minutes"}, 
			{id: 4663, img: "/2014/12/50-useful-libraries-resources-responsive-design2-100x100.jpg", url: "/2014/12/50-useful-libraries-resources-responsive-design/", title: "50 Useful Libraries and Resources for Responsive Web Design"}, 
			{id: 4411, img: "/2014/09/cute-file-browser-100x100.jpg", url: "/2014/09/cute-file-browser-jquery-ajax-php/", title: "Cute File Browser with jQuery and PHP"},
			{id: 4294, img: "/2014/09/50-awesome-tools-and-resources-100x100.jpg", url: "/2014/09/50-awesome-tools-and-resources-for-web-developers/", title: "50 Awesome Tools and Resources for Web Developers"}, 
			{id: 4083, img: "/2014/07/20-impressive-css3-techniques-libraries-examples-100x100.jpg", url: "/2014/07/20-impressive-css3-techniques-libraries-and-examples/", title: "20 Impressive CSS3 Techniques, Libraries and Examples"}, 
			{id: 3939, img: "/2014/06/guess-the-programming-language-100x100.jpg", url: "/2014/06/guess-the-programming-language/", title: "Guess the Programming Language"}, 
			{id: 3771, img: "/2014/06/javascript-without-jquery-100x100.jpg", url: "/2014/06/10-tips-for-writing-javascript-without-jquery/", title: "10 Tips for Writing JavaScript without jQuery"}, 
			{id: 3638, img: "/2014/04/10-mistakes-javascript-beginners-make-100x100.jpg", url: "/2014/04/10-mistakes-javascript-beginners-make/", title: "10 Mistakes That JavaScript Beginners Often Make"}, 
			{id: 3595, img: "/2014/02/10-signs-awesome-web-developers-100x100.jpg", url: "/2014/02/10-signs-that-you-are-an-awesome-web-developer/", title: "10 Signs That You Are An Awesome Web Developer"}, 
			{id: 3521, img: "/2013/12/weirdest-programming-languages-100x100.jpg", url: "/2013/12/the-10-weirdest-programming-languages/", title: "The 10 Weirdest Programming Languages"}, 
			{id: 3465, img: "/2013/10/12-awesome-css-features-100x100.jpg", url: "/2013/10/12-awesome-css3-features-you-can-finally-use/", title: "12 Awesome CSS3 Features That You Can Finally Start Using"}, 
			{id: 2748, img: "/2013/04/2748-100x100.jpg", url: "/2013/04/50-amazing-jquery-plugins/", title: "50 Amazing jQuery Plugins That You Should Start Using Right Now"}, 
			{id: 2673, img: "/2013/02/2673-100x100.jpg", url: "/2013/02/24-cool-php-libraries-you-should-know-about/", title: "24 Cool PHP Libraries You Should Know About"}
		];

		articles = articles.filter( function(a){ return a.id != the_id } );
		
		var featured = [], randomIndex;
		
		for(var i = 0; i < 4; i++){
			 randomIndex = Math.floor(Math.random()*articles.length);
			 featured.push(articles[randomIndex]);
			 articles.splice(randomIndex, 1);
		}

		fixedSidebar.find('.posts').html( featured.map(function(article){
			return '<li><a href="http://tutorialzine.com' + article.url + '">' +
						'<img src="http://cdn.tutorialzine.com/wp-content/uploads' + article.img + '">'+
							'<span class="title">' + article.title + '</span>'+
						'</a></li>';
		}));

		fixedSidebar.find('.social-icons a').on('click', function(e){
			e.preventDefault();

			var left = (screen.width/2)-250,
			top = (screen.height/2)-200;
			
			window.open(this.href, 'Social Sharing', 'toolbar=no, location=no, directories=no, status=no,'+
					' menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=500, height=400, top='+top+', left='+left);
		});

		var win = $(window),
			visible = false,
			sidebar = $('#sidebar');

		win.on('scroll resize', function () {

			if (win.scrollTop() >= sidebar.height() + 300) {
				if(!visible){
					visible = true;
					fixedSidebar.css('opacity', '0').show();
					setTimeout(function(){
						fixedSidebar.css('opacity', '1');
					}, 10);
				}
			}
			else{
				if(visible){
					visible = false;
					fixedSidebar.hide();
				}


			}
		}).resize();

	}, 800);
	

	// The search text field

	var searchIcon = $('.searchIcon');

	searchIcon.click(function(e){
		e.preventDefault();

		if(searchIcon.is('.active') && $(e.target).is(searchIcon)){
			searchIcon.removeClass('active');
		}
		else{
			searchIcon.addClass('active');
			searchIcon.find('input').focus();
		}

	});

	$('body').click(function(e){

		if(	searchIcon.is('.active') &&
			!$(e.target).is('.searchIcon, .searchIcon form, .searchIcon input')){

			searchIcon.removeClass('active');
		}

	});


	var shareBar = $('#shareBar');

	if(shareBar.length && window.the_title && window.the_permalink){

		var html = '<iframe allowtransparency="true" frameborder="0" scrolling="no"' +
			'src="http://platform.twitter.com/widgets/tweet_button.html?url=' + encodeURIComponent(the_permalink) + '&amp;text=' + encodeURIComponent(the_title) + '&amp;via=tutorialzine&amp;count=horizontal"'+
			'style="width:105px; height:22px;">' +
		'</iframe>' +

		'<iframe src="//www.facebook.com/plugins/like.php?href=' + encodeURIComponent(the_permalink) + '&amp;width&amp;layout=button_count&amp;action=like&amp;show_faces=false&amp;share=true&amp;height=21&amp;appId=1480656385503635&amp;width=150" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:150px; height:21px;" allowTransparency="true"></iframe>' +

		'<script src="https://apis.google.com/js/plusone.js" async></script> <g:plusone href="' + encodeURIComponent(the_permalink) + '" size="medium"></g:plusone>';

		setTimeout(function(){
			shareBar.html(html).fadeIn();
		}, 2000);

	}
	
	// Turn the navigation menu into an ul
	
	var navItems = [{text:'Home', url:'/' }],
		navSelect, nav = $('nav'), win = $(window),
		index = nav.find('a').filter('.active').index();
	
	index = (index !== -1) ? index + 1 : 0;
	
	win.resize(function(){
		
		if(win.width() < 600){
			
			if(!navSelect){

				navSelect = $('<select>');

				Array.prototype.push.apply(navItems, nav.find('a').map(function(){
					return {text: this.textContent, url: this.href};
				}).get());

				$.each(navItems, function(){
					navSelect.append($('<option>',{text:this.text}));
				});

				navSelect.on('change', function(){
					window.location = navItems[this.selectedIndex].url;
				});
				
				navSelect.prop('selectedIndex', index);
				
				navSelect.appendTo('header');
			}
			
			nav.hide();
			navSelect.show();
			
		}
		else{
			nav.show();
			navSelect && navSelect.hide();
		}
		
		
	}).resize();

	// Bootstrap Studio Banner

	(function(){
		
		var win = $(window),
			elem = $('.webappstudio-animation'),
			elemOffset = 0,
			animation = elem.find('.animation');

		if(!elem.length){
			return;
		}

		win.on('scroll', function(){
			
			elemOffset = elem.offset().top;
			
			if( ( win.scrollTop() + win.height() ) > elemOffset ) {
				animation.addClass('active');
			}
			else {
				animation.removeClass('active');
			}

			if( win.scrollTop() > ( elemOffset + elem.outerHeight() ) ) {
				animation.removeClass('active');
			}

		}).scroll();

	})();

	var first_ad = '<div class="gad hide600 adsbygoogle">' + 
	'<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>'+
	'<!-- Tutorialzine Article Centered 1 -->'+
	'<ins class="adsbygoogle"'+
		 'style="display:inline-block;width:336px;height:280px"'+
		 'data-ad-client="ca-pub-4243460155472587"'+
		 'data-ad-slot="3935611756"></ins>'+
	'<script>'+
	'(adsbygoogle = window.adsbygoogle || []).push({});'+
	'</script>'+
	'</div>';

	var second_ad = '<div class="gad hide600 adsbygoogle">' + 
	'<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>'+
	'<!-- Tutorialzine Article Centered 2 -->'+
	'<ins class="adsbygoogle"'+
		 'style="display:inline-block;width:336px;height:280px"'+
		 'data-ad-client="ca-pub-4243460155472587"'+
		 'data-ad-slot="5272744153"></ins>'+
	'<script>'+
	'(adsbygoogle = window.adsbygoogle || []).push({});'+
	'</script>'+
	'</div>';

	var book_ad = '<div class="jquery-trickshots-ban hide840">'+
		'<a href="/books/jquery-trickshots/" target="_blank">' +
		'<h6>100 Must Know jQuery Tips and Tricks</h6>'+
		'<p>jQuery Trickshot is our free book, filled with kick-ass tips and tricks for jQuery that every developer should know.</p>' +
		'<span class="button blue">Download it</span>'+
		'</a>'+
	'</div>';

	var sections = $('#post h3, #post hr');
	var hrs = $('#post hr');
	
	if(sections.length > 1){
		sections.eq(0).before(first_ad);
		
		setTimeout(function(){

			if( $('ins.adsbygoogle').length && $('ins.adsbygoogle').children().length == 0 ){			
				$('#post .adsbygoogle').remove();
				
				trackEvent('Environment', 'User', 'Adblocker Active');
				
				var b_ad = $(book_ad)
				
				sections.eq(0).before(b_ad);
				
				b_ad.find('a').click(function(){
					trackEvent('Click', 'Ad', 'Fallback book ad');
				});
			}

		}, 2000);
		
	}
	
	// Show the second ad either before the middle hr or the middle h3
	
	if(hrs.length > 3){
		hrs.eq(Math.ceil(hrs.length/2)).before(second_ad);
	}
	else if(sections.length > 3){
		sections.eq(Math.ceil(sections.length/2)).before(second_ad);
	}

	// Downloading the book from the member area
			
	$('.mContainer form.jquery-trickshots-ban').submit(function(e){
		
		var ban = $('form.jquery-trickshots-ban');
		
		ban.first().css('opacity', 0);
		
		setTimeout(function(){
			ban.first().hide();
			ban.last().show().css('opacity', 1);
		}, 300);
	});

	// Event tracking
		
	function trackEvent(){
		var arr = ['_trackEvent'];
		arr.push.apply(arr,arguments);
		
		_gaq && _gaq.push(arr);
	}
	
});

addComment={moveForm:function(d,f,i,c){var m=this,a,h=m.I(d),b=m.I(i),l=m.I("cancel-comment-reply-link"),j=m.I("comment_parent"),k=m.I("comment_post_ID");if(!h||!b||!l||!j){return}m.respondId=i;c=c||false;if(!m.I("wp-temp-form-div")){a=document.createElement("div");a.id="wp-temp-form-div";a.style.display="none";b.parentNode.insertBefore(a,b)}h.parentNode.insertBefore(b,h.nextSibling);if(k&&c){k.value=c}j.value=f;l.style.display="";l.onclick=function(){var n=addComment,e=n.I("wp-temp-form-div"),o=n.I(n.respondId);if(!e||!o){return}n.I("comment_parent").value="0";e.parentNode.insertBefore(o,e);e.parentNode.removeChild(e);this.style.display="none";this.onclick=null;return false};try{m.I("comment").focus()}catch(g){}return false},I:function(a){return document.getElementById(a)}};
;!function(e){"undefined"!=typeof exports?e(exports):(window.hljs=e({}),"function"==typeof define&&define.amd&&define("hljs",[],function(){return window.hljs}))}(function(e){function n(e){return e.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;")}function t(e){return e.nodeName.toLowerCase()}function r(e,n){var t=e&&e.exec(n);return t&&0==t.index}function a(e){return/no-?highlight|plain|text/.test(e)}function i(e){var n,t,r,i=e.className+" ";if(i+=e.parentNode?e.parentNode.className:"",t=/\blang(?:uage)?-([\w-]+)\b/.exec(i))return E(t[1])?t[1]:"no-highlight";for(i=i.split(/\s+/),n=0,r=i.length;r>n;n++)if(E(i[n])||a(i[n]))return i[n]}function o(e,n){var t,r={};for(t in e)r[t]=e[t];if(n)for(t in n)r[t]=n[t];return r}function u(e){var n=[];return function r(e,a){for(var i=e.firstChild;i;i=i.nextSibling)3==i.nodeType?a+=i.nodeValue.length:1==i.nodeType&&(n.push({event:"start",offset:a,node:i}),a=r(i,a),t(i).match(/br|hr|img|input/)||n.push({event:"stop",offset:a,node:i}));return a}(e,0),n}function c(e,r,a){function i(){return e.length&&r.length?e[0].offset!=r[0].offset?e[0].offset<r[0].offset?e:r:"start"==r[0].event?e:r:e.length?e:r}function o(e){function r(e){return" "+e.nodeName+'="'+n(e.value)+'"'}f+="<"+t(e)+Array.prototype.map.call(e.attributes,r).join("")+">"}function u(e){f+="</"+t(e)+">"}function c(e){("start"==e.event?o:u)(e.node)}for(var s=0,f="",l=[];e.length||r.length;){var g=i();if(f+=n(a.substr(s,g[0].offset-s)),s=g[0].offset,g==e){l.reverse().forEach(u);do c(g.splice(0,1)[0]),g=i();while(g==e&&g.length&&g[0].offset==s);l.reverse().forEach(o)}else"start"==g[0].event?l.push(g[0].node):l.pop(),c(g.splice(0,1)[0])}return f+n(a.substr(s))}function s(e){function n(e){return e&&e.source||e}function t(t,r){return new RegExp(n(t),"m"+(e.cI?"i":"")+(r?"g":""))}function r(a,i){if(!a.compiled){if(a.compiled=!0,a.k=a.k||a.bK,a.k){var u={},c=function(n,t){e.cI&&(t=t.toLowerCase()),t.split(" ").forEach(function(e){var t=e.split("|");u[t[0]]=[n,t[1]?Number(t[1]):1]})};"string"==typeof a.k?c("keyword",a.k):Object.keys(a.k).forEach(function(e){c(e,a.k[e])}),a.k=u}a.lR=t(a.l||/\b\w+\b/,!0),i&&(a.bK&&(a.b="\\b("+a.bK.split(" ").join("|")+")\\b"),a.b||(a.b=/\B|\b/),a.bR=t(a.b),a.e||a.eW||(a.e=/\B|\b/),a.e&&(a.eR=t(a.e)),a.tE=n(a.e)||"",a.eW&&i.tE&&(a.tE+=(a.e?"|":"")+i.tE)),a.i&&(a.iR=t(a.i)),void 0===a.r&&(a.r=1),a.c||(a.c=[]);var s=[];a.c.forEach(function(e){e.v?e.v.forEach(function(n){s.push(o(e,n))}):s.push("self"==e?a:e)}),a.c=s,a.c.forEach(function(e){r(e,a)}),a.starts&&r(a.starts,i);var f=a.c.map(function(e){return e.bK?"\\.?("+e.b+")\\.?":e.b}).concat([a.tE,a.i]).map(n).filter(Boolean);a.t=f.length?t(f.join("|"),!0):{exec:function(){return null}}}}r(e)}function f(e,t,a,i){function o(e,n){for(var t=0;t<n.c.length;t++)if(r(n.c[t].bR,e))return n.c[t]}function u(e,n){if(r(e.eR,n)){for(;e.endsParent&&e.parent;)e=e.parent;return e}return e.eW?u(e.parent,n):void 0}function c(e,n){return!a&&r(n.iR,e)}function g(e,n){var t=N.cI?n[0].toLowerCase():n[0];return e.k.hasOwnProperty(t)&&e.k[t]}function h(e,n,t,r){var a=r?"":w.classPrefix,i='<span class="'+a,o=t?"":"</span>";return i+=e+'">',i+n+o}function p(){if(!L.k)return n(B);var e="",t=0;L.lR.lastIndex=0;for(var r=L.lR.exec(B);r;){e+=n(B.substr(t,r.index-t));var a=g(L,r);a?(y+=a[1],e+=h(a[0],n(r[0]))):e+=n(r[0]),t=L.lR.lastIndex,r=L.lR.exec(B)}return e+n(B.substr(t))}function d(){if(L.sL&&!x[L.sL])return n(B);var e=L.sL?f(L.sL,B,!0,M[L.sL]):l(B);return L.r>0&&(y+=e.r),"continuous"==L.subLanguageMode&&(M[L.sL]=e.top),h(e.language,e.value,!1,!0)}function b(){return void 0!==L.sL?d():p()}function v(e,t){var r=e.cN?h(e.cN,"",!0):"";e.rB?(k+=r,B=""):e.eB?(k+=n(t)+r,B=""):(k+=r,B=t),L=Object.create(e,{parent:{value:L}})}function m(e,t){if(B+=e,void 0===t)return k+=b(),0;var r=o(t,L);if(r)return k+=b(),v(r,t),r.rB?0:t.length;var a=u(L,t);if(a){var i=L;i.rE||i.eE||(B+=t),k+=b();do L.cN&&(k+="</span>"),y+=L.r,L=L.parent;while(L!=a.parent);return i.eE&&(k+=n(t)),B="",a.starts&&v(a.starts,""),i.rE?0:t.length}if(c(t,L))throw new Error('Illegal lexeme "'+t+'" for mode "'+(L.cN||"<unnamed>")+'"');return B+=t,t.length||1}var N=E(e);if(!N)throw new Error('Unknown language: "'+e+'"');s(N);var R,L=i||N,M={},k="";for(R=L;R!=N;R=R.parent)R.cN&&(k=h(R.cN,"",!0)+k);var B="",y=0;try{for(var C,j,I=0;;){if(L.t.lastIndex=I,C=L.t.exec(t),!C)break;j=m(t.substr(I,C.index-I),C[0]),I=C.index+j}for(m(t.substr(I)),R=L;R.parent;R=R.parent)R.cN&&(k+="</span>");return{r:y,value:k,language:e,top:L}}catch(O){if(-1!=O.message.indexOf("Illegal"))return{r:0,value:n(t)};throw O}}function l(e,t){t=t||w.languages||Object.keys(x);var r={r:0,value:n(e)},a=r;return t.forEach(function(n){if(E(n)){var t=f(n,e,!1);t.language=n,t.r>a.r&&(a=t),t.r>r.r&&(a=r,r=t)}}),a.language&&(r.second_best=a),r}function g(e){return w.tabReplace&&(e=e.replace(/^((<[^>]+>|\t)+)/gm,function(e,n){return n.replace(/\t/g,w.tabReplace)})),w.useBR&&(e=e.replace(/\n/g,"<br>")),e}function h(e,n,t){var r=n?R[n]:t,a=[e.trim()];return e.match(/\bhljs\b/)||a.push("hljs"),-1===e.indexOf(r)&&a.push(r),a.join(" ").trim()}function p(e){var n=i(e);if(!a(n)){var t;w.useBR?(t=document.createElementNS("http://www.w3.org/1999/xhtml","div"),t.innerHTML=e.innerHTML.replace(/\n/g,"").replace(/<br[ \/]*>/g,"\n")):t=e;var r=t.textContent,o=n?f(n,r,!0):l(r),s=u(t);if(s.length){var p=document.createElementNS("http://www.w3.org/1999/xhtml","div");p.innerHTML=o.value,o.value=c(s,u(p),r)}o.value=g(o.value),e.innerHTML=o.value,e.className=h(e.className,n,o.language),e.result={language:o.language,re:o.r},o.second_best&&(e.second_best={language:o.second_best.language,re:o.second_best.r})}}function d(e){w=o(w,e)}function b(){if(!b.called){b.called=!0;var e=document.querySelectorAll("pre code");Array.prototype.forEach.call(e,p)}}function v(){addEventListener("DOMContentLoaded",b,!1),addEventListener("load",b,!1)}function m(n,t){var r=x[n]=t(e);r.aliases&&r.aliases.forEach(function(e){R[e]=n})}function N(){return Object.keys(x)}function E(e){return x[e]||x[R[e]]}var w={classPrefix:"hljs-",tabReplace:null,useBR:!1,languages:void 0},x={},R={};return e.highlight=f,e.highlightAuto=l,e.fixMarkup=g,e.highlightBlock=p,e.configure=d,e.initHighlighting=b,e.initHighlightingOnLoad=v,e.registerLanguage=m,e.listLanguages=N,e.getLanguage=E,e.inherit=o,e.IR="[a-zA-Z]\\w*",e.UIR="[a-zA-Z_]\\w*",e.NR="\\b\\d+(\\.\\d+)?",e.CNR="\\b(0[xX][a-fA-F0-9]+|(\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)",e.BNR="\\b(0b[01]+)",e.RSR="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~",e.BE={b:"\\\\[\\s\\S]",r:0},e.ASM={cN:"string",b:"'",e:"'",i:"\\n",c:[e.BE]},e.QSM={cN:"string",b:'"',e:'"',i:"\\n",c:[e.BE]},e.PWM={b:/\b(a|an|the|are|I|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such)\b/},e.C=function(n,t,r){var a=e.inherit({cN:"comment",b:n,e:t,c:[]},r||{});return a.c.push(e.PWM),a.c.push({cN:"doctag",bK:"TODO FIXME NOTE BUG XXX",r:0}),a},e.CLCM=e.C("//","$"),e.CBCM=e.C("/\\*","\\*/"),e.HCM=e.C("#","$"),e.NM={cN:"number",b:e.NR,r:0},e.CNM={cN:"number",b:e.CNR,r:0},e.BNM={cN:"number",b:e.BNR,r:0},e.CSSNM={cN:"number",b:e.NR+"(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",r:0},e.RM={cN:"regexp",b:/\//,e:/\/[gimuy]*/,i:/\n/,c:[e.BE,{b:/\[/,e:/\]/,r:0,c:[e.BE]}]},e.TM={cN:"title",b:e.IR,r:0},e.UTM={cN:"title",b:e.UIR,r:0},e});hljs.registerLanguage("javascript",function(e){return{aliases:["js"],k:{keyword:"in of if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const export super debugger as async await",literal:"true false null undefined NaN Infinity",built_in:"eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document Symbol Set Map WeakSet WeakMap Proxy Reflect Promise"},c:[{cN:"pi",r:10,b:/^\s*['"]use (strict|asm)['"]/},e.ASM,e.QSM,{cN:"string",b:"`",e:"`",c:[e.BE,{cN:"subst",b:"\\$\\{",e:"\\}"}]},e.CLCM,e.CBCM,{cN:"number",v:[{b:"\\b(0[bB][01]+)"},{b:"\\b(0[oO][0-7]+)"},{b:e.CNR}],r:0},{b:"("+e.RSR+"|\\b(case|return|throw)\\b)\\s*",k:"return throw case",c:[e.CLCM,e.CBCM,e.RM,{b:/</,e:/>\s*[);\]]/,r:0,sL:"xml"}],r:0},{cN:"function",bK:"function",e:/\{/,eE:!0,c:[e.inherit(e.TM,{b:/[A-Za-z$_][0-9A-Za-z$_]*/}),{cN:"params",b:/\(/,e:/\)/,eB:!0,eE:!0,c:[e.CLCM,e.CBCM],i:/["'\(]/}],i:/\[|%/},{b:/\$[(.]/},{b:"\\."+e.IR,r:0},{bK:"import",e:"[;$]",k:"import from as",c:[e.ASM,e.QSM]},{cN:"class",bK:"class",e:/[{;=]/,eE:!0,i:/[:"\[\]]/,c:[{bK:"extends"},e.UTM]}]}});hljs.registerLanguage("less",function(e){var r="[\\w-]+",t="("+r+"|@{"+r+"})",a=[],c=[],n=function(e){return{cN:"string",b:"~?"+e+".*?"+e}},i=function(e,r,t){return{cN:e,b:r,r:t}},s=function(r,t,a){return e.inherit({cN:r,b:t+"\\(",e:"\\(",rB:!0,eE:!0,r:0},a)},b={b:"\\(",e:"\\)",c:c,r:0};c.push(e.CLCM,e.CBCM,n("'"),n('"'),e.CSSNM,i("hexcolor","#[0-9A-Fa-f]+\\b"),s("function","(url|data-uri)",{starts:{cN:"string",e:"[\\)\\n]",eE:!0}}),s("function",r),b,i("variable","@@?"+r,10),i("variable","@{"+r+"}"),i("built_in","~?`[^`]*?`"),{cN:"attribute",b:r+"\\s*:",e:":",rB:!0,eE:!0});var o=c.concat({b:"{",e:"}",c:a}),u={bK:"when",eW:!0,c:[{bK:"and not"}].concat(c)},C={cN:"attribute",b:t,e:":",eE:!0,c:[e.CLCM,e.CBCM],i:/\S/,starts:{e:"[;}]",rE:!0,c:c,i:"[<=$]"}},l={cN:"at_rule",b:"@(import|media|charset|font-face|(-[a-z]+-)?keyframes|supports|document|namespace|page|viewport|host)\\b",starts:{e:"[;{}]",rE:!0,c:c,r:0}},d={cN:"variable",v:[{b:"@"+r+"\\s*:",r:15},{b:"@"+r}],starts:{e:"[;}]",rE:!0,c:o}},p={v:[{b:"[\\.#:&\\[]",e:"[;{}]"},{b:t+"[^;]*{",e:"{"}],rB:!0,rE:!0,i:"[<='$\"]",c:[e.CLCM,e.CBCM,u,i("keyword","all\\b"),i("variable","@{"+r+"}"),i("tag",t+"%?",0),i("id","#"+t),i("class","\\."+t,0),i("keyword","&",0),s("pseudo",":not"),s("keyword",":extend"),i("pseudo","::?"+t),{cN:"attr_selector",b:"\\[",e:"\\]"},{b:"\\(",e:"\\)",c:o},{b:"!important"}]};return a.push(e.CLCM,e.CBCM,l,d,p,C),{cI:!0,i:"[=>'/<($\"]",c:a}});hljs.registerLanguage("css",function(e){var c="[a-zA-Z-][a-zA-Z0-9_-]*",a={cN:"function",b:c+"\\(",rB:!0,eE:!0,e:"\\("},r={cN:"rule",b:/[A-Z\_\.\-]+\s*:/,rB:!0,e:";",eW:!0,c:[{cN:"attribute",b:/\S/,e:":",eE:!0,starts:{cN:"value",eW:!0,eE:!0,c:[a,e.CSSNM,e.QSM,e.ASM,e.CBCM,{cN:"hexcolor",b:"#[0-9A-Fa-f]+"},{cN:"important",b:"!important"}]}}]};return{cI:!0,i:/[=\/|'\$]/,c:[e.CBCM,r,{cN:"id",b:/\#[A-Za-z0-9_-]+/},{cN:"class",b:/\.[A-Za-z0-9_-]+/},{cN:"attr_selector",b:/\[/,e:/\]/,i:"$"},{cN:"pseudo",b:/:(:)?[a-zA-Z0-9\_\-\+\(\)"']+/},{cN:"at_rule",b:"@(font-face|page)",l:"[a-z-]+",k:"font-face page"},{cN:"at_rule",b:"@",e:"[{;]",c:[{cN:"keyword",b:/\S+/},{b:/\s/,eW:!0,eE:!0,r:0,c:[a,e.ASM,e.QSM,e.CSSNM]}]},{cN:"tag",b:c,r:0},{cN:"rules",b:"{",e:"}",i:/\S/,c:[e.CBCM,r]}]}});hljs.registerLanguage("python",function(e){var r={cN:"prompt",b:/^(>>>|\.\.\.) /},b={cN:"string",c:[e.BE],v:[{b:/(u|b)?r?'''/,e:/'''/,c:[r],r:10},{b:/(u|b)?r?"""/,e:/"""/,c:[r],r:10},{b:/(u|r|ur)'/,e:/'/,r:10},{b:/(u|r|ur)"/,e:/"/,r:10},{b:/(b|br)'/,e:/'/},{b:/(b|br)"/,e:/"/},e.ASM,e.QSM]},l={cN:"number",r:0,v:[{b:e.BNR+"[lLjJ]?"},{b:"\\b(0o[0-7]+)[lLjJ]?"},{b:e.CNR+"[lLjJ]?"}]},c={cN:"params",b:/\(/,e:/\)/,c:["self",r,l,b]};return{aliases:["py","gyp"],k:{keyword:"and elif is global as in if from raise for except finally print import pass return exec else break not with class assert yield try while continue del or def lambda nonlocal|10 None True False",built_in:"Ellipsis NotImplemented"},i:/(<\/|->|\?)/,c:[r,l,b,e.HCM,{v:[{cN:"function",bK:"def",r:10},{cN:"class",bK:"class"}],e:/:/,i:/[${=;\n,]/,c:[e.UTM,c]},{cN:"decorator",b:/@/,e:/$/},{b:/\b(print|exec)\(/}]}});hljs.registerLanguage("sql",function(e){var t=e.C("--","$");return{cI:!0,i:/[<>]/,c:[{cN:"operator",bK:"begin end start commit rollback savepoint lock alter create drop rename call delete do handler insert load replace select truncate update set show pragma grant merge describe use explain help declare prepare execute deallocate savepoint release unlock purge reset change stop analyze cache flush optimize repair kill install uninstall checksum restore check backup revoke",e:/;/,eW:!0,k:{keyword:"abs absolute acos action add adddate addtime aes_decrypt aes_encrypt after aggregate all allocate alter analyze and any are as asc ascii asin assertion at atan atan2 atn2 authorization authors avg backup before begin benchmark between bin binlog bit_and bit_count bit_length bit_or bit_xor both by cache call cascade cascaded case cast catalog ceil ceiling chain change changed char_length character_length charindex charset check checksum checksum_agg choose close coalesce coercibility collate collation collationproperty column columns columns_updated commit compress concat concat_ws concurrent connect connection connection_id consistent constraint constraints continue contributors conv convert convert_tz corresponding cos cot count count_big crc32 create cross cume_dist curdate current current_date current_time current_timestamp current_user cursor curtime data database databases datalength date_add date_format date_sub dateadd datediff datefromparts datename datepart datetime2fromparts datetimeoffsetfromparts day dayname dayofmonth dayofweek dayofyear deallocate declare decode default deferrable deferred degrees delayed delete des_decrypt des_encrypt des_key_file desc describe descriptor diagnostics difference disconnect distinct distinctrow div do domain double drop dumpfile each else elt enclosed encode encrypt end end-exec engine engines eomonth errors escape escaped event eventdata events except exception exec execute exists exp explain export_set extended external extract fast fetch field fields find_in_set first first_value floor flush for force foreign format found found_rows from from_base64 from_days from_unixtime full function get get_format get_lock getdate getutcdate global go goto grant grants greatest group group_concat grouping grouping_id gtid_subset gtid_subtract handler having help hex high_priority hosts hour ident_current ident_incr ident_seed identified identity if ifnull ignore iif ilike immediate in index indicator inet6_aton inet6_ntoa inet_aton inet_ntoa infile initially inner innodb input insert install instr intersect into is is_free_lock is_ipv4 is_ipv4_compat is_ipv4_mapped is_not is_not_null is_used_lock isdate isnull isolation join key kill language last last_day last_insert_id last_value lcase lead leading least leaves left len lenght level like limit lines ln load load_file local localtime localtimestamp locate lock log log10 log2 logfile logs low_priority lower lpad ltrim make_set makedate maketime master master_pos_wait match matched max md5 medium merge microsecond mid min minute mod mode module month monthname mutex name_const names national natural nchar next no no_write_to_binlog not now nullif nvarchar oct octet_length of old_password on only open optimize option optionally or ord order outer outfile output pad parse partial partition password patindex percent_rank percentile_cont percentile_disc period_add period_diff pi plugin position pow power pragma precision prepare preserve primary prior privileges procedure procedure_analyze processlist profile profiles public publishingservername purge quarter query quick quote quotename radians rand read references regexp relative relaylog release release_lock rename repair repeat replace replicate reset restore restrict return returns reverse revoke right rlike rollback rollup round row row_count rows rpad rtrim savepoint schema scroll sec_to_time second section select serializable server session session_user set sha sha1 sha2 share show sign sin size slave sleep smalldatetimefromparts snapshot some soname soundex sounds_like space sql sql_big_result sql_buffer_result sql_cache sql_calc_found_rows sql_no_cache sql_small_result sql_variant_property sqlstate sqrt square start starting status std stddev stddev_pop stddev_samp stdev stdevp stop str str_to_date straight_join strcmp string stuff subdate substr substring subtime subtring_index sum switchoffset sysdate sysdatetime sysdatetimeoffset system_user sysutcdatetime table tables tablespace tan temporary terminated tertiary_weights then time time_format time_to_sec timediff timefromparts timestamp timestampadd timestampdiff timezone_hour timezone_minute to to_base64 to_days to_seconds todatetimeoffset trailing transaction translation trigger trigger_nestlevel triggers trim truncate try_cast try_convert try_parse ucase uncompress uncompressed_length unhex unicode uninstall union unique unix_timestamp unknown unlock update upgrade upped upper usage use user user_resources using utc_date utc_time utc_timestamp uuid uuid_short validate_password_strength value values var var_pop var_samp variables variance varp version view warnings week weekday weekofyear weight_string when whenever where with work write xml xor year yearweek zon",literal:"true false null",built_in:"array bigint binary bit blob boolean char character date dec decimal float int integer interval number numeric real serial smallint varchar varying int8 serial8 text"},c:[{cN:"string",b:"'",e:"'",c:[e.BE,{b:"''"}]},{cN:"string",b:'"',e:'"',c:[e.BE,{b:'""'}]},{cN:"string",b:"`",e:"`",c:[e.BE]},e.CNM,e.CBCM,t]},e.CBCM,t]}});hljs.registerLanguage("json",function(e){var t={literal:"true false null"},i=[e.QSM,e.CNM],l={cN:"value",e:",",eW:!0,eE:!0,c:i,k:t},c={b:"{",e:"}",c:[{cN:"attribute",b:'\\s*"',e:'"\\s*:\\s*',eB:!0,eE:!0,c:[e.BE],i:"\\n",starts:l}],i:"\\S"},n={b:"\\[",e:"\\]",c:[e.inherit(l,{cN:null})],i:"\\S"};return i.splice(i.length,0,c,n),{c:i,k:t,i:"\\S"}});hljs.registerLanguage("xml",function(t){var e="[A-Za-z0-9\\._:-]+",s={b:/<\?(php)?(?!\w)/,e:/\?>/,sL:"php",subLanguageMode:"continuous"},c={eW:!0,i:/</,r:0,c:[s,{cN:"attribute",b:e,r:0},{b:"=",r:0,c:[{cN:"value",c:[s],v:[{b:/"/,e:/"/},{b:/'/,e:/'/},{b:/[^\s\/>]+/}]}]}]};return{aliases:["html","xhtml","rss","atom","xsl","plist"],cI:!0,c:[{cN:"doctype",b:"<!DOCTYPE",e:">",r:10,c:[{b:"\\[",e:"\\]"}]},t.C("<!--","-->",{r:10}),{cN:"cdata",b:"<\\!\\[CDATA\\[",e:"\\]\\]>",r:10},{cN:"tag",b:"<style(?=\\s|>|$)",e:">",k:{title:"style"},c:[c],starts:{e:"</style>",rE:!0,sL:"css"}},{cN:"tag",b:"<script(?=\\s|>|$)",e:">",k:{title:"script"},c:[c],starts:{e:"</script>",rE:!0,sL:""}},s,{cN:"pi",b:/<\?\w+/,e:/\?>/,r:10},{cN:"tag",b:"</?",e:"/?>",c:[{cN:"title",b:/[^ \/><\n\t]+/,r:0},c]}]}});hljs.registerLanguage("bash",function(e){var t={cN:"variable",v:[{b:/\$[\w\d#@][\w\d_]*/},{b:/\$\{(.*?)}/}]},s={cN:"string",b:/"/,e:/"/,c:[e.BE,t,{cN:"variable",b:/\$\(/,e:/\)/,c:[e.BE]}]},a={cN:"string",b:/'/,e:/'/};return{aliases:["sh","zsh"],l:/-?[a-z\.]+/,k:{keyword:"if then else elif fi for while in do done case esac function",literal:"true false",built_in:"break cd continue eval exec exit export getopts hash pwd readonly return shift test times trap umask unset alias bind builtin caller command declare echo enable help let local logout mapfile printf read readarray source type typeset ulimit unalias set shopt autoload bg bindkey bye cap chdir clone comparguments compcall compctl compdescribe compfiles compgroups compquote comptags comptry compvalues dirs disable disown echotc echoti emulate fc fg float functions getcap getln history integer jobs kill limit log noglob popd print pushd pushln rehash sched setcap setopt stat suspend ttyctl unfunction unhash unlimit unsetopt vared wait whence where which zcompile zformat zftp zle zmodload zparseopts zprof zpty zregexparse zsocket zstyle ztcp",operator:"-ne -eq -lt -gt -f -d -e -s -l -a"},c:[{cN:"shebang",b:/^#![^\n]+sh\s*$/,r:10},{cN:"function",b:/\w[\w\d_]*\s*\(\s*\)\s*\{/,rB:!0,c:[e.inherit(e.TM,{b:/\w[\w\d_]*/})],r:0},e.HCM,e.NM,s,a,t]}});hljs.registerLanguage("php",function(e){var c={cN:"variable",b:"\\$+[a-zA-Z_-ÿ][a-zA-Z0-9_-ÿ]*"},a={cN:"preprocessor",b:/<\?(php)?|\?>/},i={cN:"string",c:[e.BE,a],v:[{b:'b"',e:'"'},{b:"b'",e:"'"},e.inherit(e.ASM,{i:null}),e.inherit(e.QSM,{i:null})]},n={v:[e.BNM,e.CNM]};return{aliases:["php3","php4","php5","php6"],cI:!0,k:"and include_once list abstract global private echo interface as static endswitch array null if endwhile or const for endforeach self var while isset public protected exit foreach throw elseif include __FILE__ empty require_once do xor return parent clone use __CLASS__ __LINE__ else break print eval new catch __METHOD__ case exception default die require __FUNCTION__ enddeclare final try switch continue endfor endif declare unset true false trait goto instanceof insteadof __DIR__ __NAMESPACE__ yield finally",c:[e.CLCM,e.HCM,e.C("/\\*","\\*/",{c:[{cN:"doctag",b:"@[A-Za-z]+"},a]}),e.C("__halt_compiler.+?;",!1,{eW:!0,k:"__halt_compiler",l:e.UIR}),{cN:"string",b:"<<<['\"]?\\w+['\"]?$",e:"^\\w+;",c:[e.BE]},a,c,{b:/(::|->)+[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/},{cN:"function",bK:"function",e:/[;{]/,eE:!0,i:"\\$|\\[|%",c:[e.UTM,{cN:"params",b:"\\(",e:"\\)",c:["self",c,e.CBCM,i,n]}]},{cN:"class",bK:"class interface",e:"{",eE:!0,i:/[:\(\$"]/,c:[{bK:"extends implements"},e.UTM]},{bK:"namespace",e:";",i:/[\.']/,c:[e.UTM]},{bK:"use",e:";",c:[e.UTM]},{b:"=>"},i,n]}});