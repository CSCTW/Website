/*
	Massively by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var	$window = $(window),
		$body = $('body'),
		$wrapper = $('#wrapper'),
		$header = $('#header'),
		$nav = $('#nav'),
		$main = $('#main'),
		$chatbot,
		$navPanelToggle, $navPanel, $navPanelInner;

	var chatbotConfig = window.csctwChatbotConfig || {};
	var chatbotDefaults = {
		tokenUrl: '',
		embedUrl: 'https://csctws-beta-chat.azurewebsites.net',
		webChatScriptUrl: 'https://cdn.botframework.com/botframework-webchat/latest/webchat.js',
		launcherLabel: 'Chat with us',
		panelTitle: '#CSCTW Chat',
		panelDescription: 'Ask about the archive, pages, or site navigation.'
	};

	function getChatbotConfig() {

		return $.extend({}, chatbotDefaults, chatbotConfig);
	}

	function installChatbotStyles() {

		if (document.getElementById('csctwChatbotStyles'))
			return;

		var style = document.createElement('style');

		style.id = 'csctwChatbotStyles';
		style.type = 'text/css';
		style.textContent = '' +
			'#csctwChatbot { position: fixed; right: 1rem; bottom: 1rem; z-index: 10000; font: inherit; }' +
			'#csctwChatbot, #csctwChatbot * { box-sizing: border-box; }' +
			'#csctwChatbotLauncher { display: inline-flex; align-items: center; justify-content: center; width: 3.5rem; height: 3.5rem; padding: 0; border: 0; border-radius: 999px; background: linear-gradient(135deg, #f45d48 0%, #d94335 100%); color: #ffffff; box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28); cursor: pointer; font-size: 1.2rem; font-weight: 700; line-height: 1; transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease; }' +
			'#csctwChatbotLauncher::before { content: "?"; }' +
			'#csctwChatbotLauncher:hover { transform: translateY(-2px); box-shadow: 0 22px 48px rgba(0, 0, 0, 0.32); }' +
			'#csctwChatbotLauncher:disabled { opacity: 0.7; cursor: progress; transform: none; }' +
			'#csctwChatbotPanel { position: absolute; right: 0; bottom: 4.4rem; width: min(22rem, calc(100vw - 1.5rem)); height: min(30rem, calc(100vh - 6rem)); background: #ffffff; color: #1f1f1f; border-radius: 1.1rem; overflow: hidden; box-shadow: 0 22px 60px rgba(0, 0, 0, 0.25); opacity: 0; pointer-events: none; transform: translateY(12px); transition: opacity 0.2s ease, transform 0.2s ease; display: flex; flex-direction: column; }' +
			'#csctwChatbot.is-open #csctwChatbotPanel { opacity: 1; pointer-events: auto; transform: translateY(0); }' +
			'#csctwChatbotHeader { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; padding: 0.9rem 0.9rem 0.8rem; background: linear-gradient(135deg, #10263f 0%, #1d4b7a 100%); color: #ffffff; }' +
			'#csctwChatbotHeader h3 { margin: 0; font-size: 0.98rem; line-height: 1.2; }' +
			'#csctwChatbotHeader p { margin: 0.3rem 0 0; font-size: 0.78rem; line-height: 1.4; opacity: 0.9; }' +
			'#csctwChatbotClose { flex: 0 0 auto; width: 1.9rem; height: 1.9rem; border: 0; border-radius: 999px; background: rgba(255, 255, 255, 0.16); color: #ffffff; cursor: pointer; font-size: 1.1rem; line-height: 1; }' +
			'#csctwChatbotBody { flex: 1 1 auto; min-height: 0; background: #f7f9fc; }' +
			'#csctwChatbotBody > div { height: 100%; }' +
			'@media screen and (max-width: 736px) { #csctwChatbot { left: 0.75rem; right: 0.75rem; bottom: 0.75rem; } #csctwChatbotLauncher { width: 3.25rem; height: 3.25rem; } #csctwChatbotPanel { left: 0; right: 0; width: auto; height: min(28rem, calc(100vh - 5.5rem)); } }';

		document.head.appendChild(style);
	}

	function loadScript(src) {

		return $.getScript(src);
	}

	function openChatbot() {

		if (!$chatbot)
			return;

		$chatbot.addClass('is-open');
		$('#csctwChatbotLauncher').attr('aria-expanded', 'true');
	}

	function closeChatbot() {

		if (!$chatbot)
			return;

		$chatbot.removeClass('is-open');
		$('#csctwChatbotLauncher').attr('aria-expanded', 'false');
	}

	function initChatbot() {

		var config = getChatbotConfig();

		if (!config.embedUrl && !config.tokenUrl)
			return;

		if (document.getElementById('csctwChatbot'))
			return;

		installChatbotStyles();

		$chatbot = $(
			'<div id="csctwChatbot" aria-live="polite">' +
				'<div id="csctwChatbotPanel">' +
					'<div id="csctwChatbotHeader">' +
						'<div>' +
							'<h3>' + config.panelTitle + '</h3>' +
							'<p>' + config.panelDescription + '</p>' +
						'</div>' +
						'<button type="button" id="csctwChatbotClose" aria-label="Close chat">&times;</button>' +
					'</div>' +
					'<div id="csctwChatbotBody"></div>' +
				'</div>' +
				'<button type="button" id="csctwChatbotLauncher" aria-expanded="false">' + config.launcherLabel + '</button>' +
			'</div>'
		).appendTo($body);

		$('#csctwChatbotLauncher').on('click', function() {
			$chatbot.hasClass('is-open') ? closeChatbot() : openChatbot();
		});

		$('#csctwChatbotClose').on('click', function() {
			closeChatbot();
		});

		if (config.embedUrl) {
			$('#csctwChatbotBody').html(
				'<iframe id="csctwChatbotFrame" title="CSCTW Chatbot" src="' + config.embedUrl + '" style="width:100%;height:100%;border:0;display:block;background:#ffffff;"></iframe>' +
				'<div style="padding:0.75rem 1rem;border-top:1px solid rgba(0,0,0,0.08);background:#fff;"><a href="' + config.embedUrl + '" target="_blank" rel="noopener">Open chat in a new tab</a></div>'
			);
			return;
		}

		loadScript(config.webChatScriptUrl)
			.then(function() {
				return $.ajax({
					url: config.tokenUrl,
					method: 'GET',
					dataType: 'json'
				});
			})
			.done(function(data) {
				var token = data && (data.token || data.directLineToken || data.direct_line_token);

				if (!token || !window.WebChat || !window.WebChat.renderWebChat) {
					$('#csctwChatbotBody').html('<div style="padding: 1rem;">Chat is not configured yet.</div>');
					return;
				}

				window.WebChat.renderWebChat({
					directLine: window.WebChat.createDirectLine({ token: token }),
					styleOptions: {
						backgroundColor: '#f7f9fc',
						bubbleBackground: '#ffffff',
						bubbleBorderRadius: 18,
						bubbleFromUserBackground: '#1d4b7a',
						bubbleFromUserTextColor: '#ffffff',
						height: '100%',
						hideUploadButton: true,
						primaryFont: 'inherit',
						sendBoxBackground: '#ffffff'
					}
				}, document.getElementById('csctwChatbotBody'));
			})
			.fail(function() {
				$('#csctwChatbotBody').html('<div style="padding: 1rem;">Chat could not be loaded.</div>');
			});
	}

	// Breakpoints.
		breakpoints({
			default:   ['1681px',   null       ],
			xlarge:    ['1281px',   '1680px'   ],
			large:     ['981px',    '1280px'   ],
			medium:    ['737px',    '980px'    ],
			small:     ['481px',    '736px'    ],
			xsmall:    ['361px',    '480px'    ],
			xxsmall:   [null,       '360px'    ]
		});

	/**
	 * Applies parallax scrolling to an element's background image.
	 * @return {jQuery} jQuery object.
	 */
	$.fn._parallax = function(intensity) {

		var	$window = $(window),
			$this = $(this);

		if (this.length == 0 || intensity === 0)
			return $this;

		if (this.length > 1) {

			for (var i=0; i < this.length; i++)
				$(this[i])._parallax(intensity);

			return $this;

		}

		if (!intensity)
			intensity = 0.25;

		$this.each(function() {

			var $t = $(this),
				$bg = $('<div class="bg"></div>').appendTo($t),
				on, off;

			on = function() {

				$bg
					.removeClass('fixed')
					.css('transform', 'matrix(1,0,0,1,0,0)');

				$window
					.on('scroll._parallax', function() {

						var pos = parseInt($window.scrollTop()) - parseInt($t.position().top);

						$bg.css('transform', 'matrix(1,0,0,1,0,' + (pos * intensity) + ')');

					});

			};

			off = function() {

				$bg
					.addClass('fixed')
					.css('transform', 'none');

				$window
					.off('scroll._parallax');

			};

			// Disable parallax on ..
				if (browser.name == 'ie'			// IE
				||	browser.name == 'edge'			// Edge
				||	window.devicePixelRatio > 1		// Retina/HiDPI (= poor performance)
				||	browser.mobile)					// Mobile devices
					off();

			// Enable everywhere else.
				else {

					breakpoints.on('>large', on);
					breakpoints.on('<=large', off);

				}

		});

		$window
			.off('load._parallax resize._parallax')
			.on('load._parallax resize._parallax', function() {
				$window.trigger('scroll');
			});

		return $(this);

	};

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Scrolly.
		$('.scrolly').scrolly();

	// Background.
		$wrapper._parallax(0.925);

	// Nav Panel.

		// Toggle.
			$navPanelToggle = $(
				'<a href="#navPanel" id="navPanelToggle">Menu</a>'
			)
				.appendTo($wrapper);

			// Change toggle styling once we've scrolled past the header.
				$header.scrollex({
					bottom: '5vh',
					enter: function() {
						$navPanelToggle.removeClass('alt');
					},
					leave: function() {
						$navPanelToggle.addClass('alt');
					}
				});

		// Panel.
			$navPanel = $(
				'<div id="navPanel">' +
					'<nav>' +
					'</nav>' +
					'<a href="#navPanel" class="close"></a>' +
				'</div>'
			)
				.appendTo($body)
				.panel({
					delay: 500,
					hideOnClick: true,
					hideOnSwipe: true,
					resetScroll: true,
					resetForms: true,
					side: 'right',
					target: $body,
					visibleClass: 'is-navPanel-visible'
				});

			// Get inner.
				$navPanelInner = $navPanel.children('nav');

			// Move nav content on breakpoint change.
				var $navContent = $nav.children();

				breakpoints.on('>medium', function() {

					// NavPanel -> Nav.
						$navContent.appendTo($nav);

					// Flip icon classes.
						$nav.find('.icons, .icon')
							.removeClass('alt');

				});

				breakpoints.on('<=medium', function() {

					// Nav -> NavPanel.
						$navContent.appendTo($navPanelInner);

					// Flip icon classes.
						$navPanelInner.find('.icons, .icon')
							.addClass('alt');

				});

			// Hack: Disable transitions on WP.
				if (browser.os == 'wp'
				&&	browser.osVersion < 10)
					$navPanel
						.css('transition', 'none');

	// Intro.
		var $intro = $('#intro');

		if ($intro.length > 0) {

			// Hack: Fix flex min-height on IE.
				if (browser.name == 'ie') {
					$window.on('resize.ie-intro-fix', function() {

						var h = $intro.height();

						if (h > $window.height())
							$intro.css('height', 'auto');
						else
							$intro.css('height', h);

					}).trigger('resize.ie-intro-fix');
				}

			// Hide intro on scroll (> small).
				breakpoints.on('>small', function() {

					$main.unscrollex();

					$main.scrollex({
						mode: 'bottom',
						top: '25vh',
						bottom: '-50vh',
						enter: function() {
							$intro.addClass('hidden');
						},
						leave: function() {
							$intro.removeClass('hidden');
						}
					});

				});

			// Hide intro on scroll (<= small).
				breakpoints.on('<=small', function() {

					$main.unscrollex();

					$main.scrollex({
						mode: 'middle',
						top: '15vh',
						bottom: '-15vh',
						enter: function() {
							$intro.addClass('hidden');
						},
						leave: function() {
							$intro.removeClass('hidden');
						}
					});

			});

		}

})(jQuery);