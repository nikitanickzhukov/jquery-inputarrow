(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/* global jQuery */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function ($) {
    var defaults = {
        min: 0,
        max: Infinity,
        step: 1,
        emptyOnMin: false,
        renderPrev: function renderPrev(input) {
            return $(document.createElement('span')).addClass('inputarrow-prev').html('<').insertBefore(input);
        },
        renderNext: function renderNext(input) {
            return $(document.createElement('span')).addClass('inputarrow-next').html('>').insertAfter(input);
        },

        encodeValue: null,
        decodeValue: null,
        onChange: null,
        onIterate: null,
        disabledClassName: 'inputarrow-disabled',
        comma: false,
        gradientFactor: 1.1,
        gradientDefault: 1,
        gradientMax: 20,
        delay: 300,
        interval: 120
    };

    var prop = window.Symbol !== undefined ? window.Symbol('inputarrow') : '__inputarrow';

    /** Class representing an inputarrow handler. */

    var InputArrow = function () {
        /**
         * Create an instance, setup plugin.
         * @param {HTMLInputElement} input - html element.
         * @param {object} options - settings.
         */
        function InputArrow(input, options) {
            var _this = this;

            _classCallCheck(this, InputArrow);

            this.input = input;
            this.opt = $.extend({}, defaults, options);

            this.$input = $(this.input);
            this.$prev = this.opt.renderPrev.call(this, this.input);
            this.$next = this.opt.renderNext.call(this, this.input);

            this.$prev.on('mousedown touchstart', function () {
                _this.startCounting(-1);
            }).on('mouseup mouseout touchend', function () {
                if (_this.__isStarted) {
                    if (_this.__isCounting) {
                        _this.stopCounting();
                    } else {
                        _this.__clearCounting();
                        _this.count(-1);
                    }
                }
            });

            this.$next.on('mousedown touchstart', function () {
                _this.startCounting(1);
            }).on('mouseup mouseout touchend', function () {
                if (_this.__isStarted) {
                    if (_this.__isCounting) {
                        _this.stopCounting();
                    } else {
                        _this.__clearCounting();
                        _this.count(1);
                    }
                }
            });

            this.__checkChange = function () {
                _this.check();
            };
            this.$input.on('change', this.__checkChange);

            this.__currentGrad = this.opt.gradientDefault;

            this.fit();
            this.check();
        }
        /**
         * Single increment or decrement value.
         * @public
         * @param {number} k - coefficient (-1 for decrementing, +1 for incrementing).
         */


        _createClass(InputArrow, [{
            key: 'count',
            value: function count(k) {
                console.log('count', k);

                var value = this.getValue();
                var newValue = this.__round(value + k * this.opt.step);

                if (newValue < this.opt.min) {
                    newValue = this.opt.min;
                } else if (newValue > this.opt.max) {
                    newValue = this.opt.max;
                }

                console.log('old value:', value, 'new value:', newValue);

                if (newValue !== value) {
                    this.setValue(newValue);
                    this.$input.trigger('change');
                    if (this.opt.onChange) {
                        this.opt.onChange.call(this, newValue, value);
                    }
                }
            }
            /**
             * Start fluent incrementing or decrementing value.
             * @public
             * @param {number} k - coefficient (-1 for decrementing, +1 for incrementing).
             */

        }, {
            key: 'startCounting',
            value: function startCounting(k) {
                var _this2 = this;

                this.__isStarted = true;
                this.__delayTimer = setTimeout(function () {
                    console.log('startCounting', k);

                    _this2.__isCounting = true;
                    _this2.__oldValue = _this2.__currentValue = _this2.getValue();
                    _this2.__currentGrad = _this2.opt.gradientDefault;

                    _this2.__incTimer = setInterval(function () {
                        _this2.__iterateCounting(k);
                    }, _this2.opt.interval);
                }, this.opt.delay);
            }
            /**
             * Stop fluent incrementing or decrementing value.
             * @public
             */

        }, {
            key: 'stopCounting',
            value: function stopCounting() {
                this.__clearCounting();

                if (this.__isCounting) {
                    console.log('stopCounting');

                    this.__isCounting = false;
                    clearInterval(this.__incTimer);

                    var value = this.getValue();

                    if (value !== this.__oldValue) {
                        this.$input.trigger('change');
                        if (this.opt.onChange) {
                            this.opt.onChange.call(this, value, this.__oldValue);
                        }
                    }
                }
            }
            /**
             * Process incrementing or decrementing value for each iteration.
             * @private
             * @param {number} k - coefficient (-1 for decrementing, +1 for incrementing).
             */

        }, {
            key: '__iterateCounting',
            value: function __iterateCounting(k) {
                this.__currentValue += k * this.opt.step * this.__currentGrad;

                var newValue = this.__round(this.__currentValue);

                var stop = false;
                if (newValue < this.opt.min) {
                    newValue = this.opt.min;
                    stop = true;
                } else if (newValue > this.opt.max) {
                    newValue = this.opt.max;
                    stop = true;
                }

                var value = this.getValue();

                console.log('old value:', value, 'new value', newValue);

                if (newValue !== value) {
                    this.setValue(newValue);
                    this.check();
                    if (this.opt.onIterate) {
                        this.opt.onIterate.call(this, newValue, value);
                    }
                }

                if (stop) {
                    this.stopCounting();
                } else {
                    this.__incGrad();
                }
            }
            /**
             * Clear timer for delayed start.
             * @private
             */

        }, {
            key: '__clearCounting',
            value: function __clearCounting() {
                if (this.__isStarted) {
                    this.__isStarted = false;
                    clearTimeout(this.__delayTimer);
                }
            }
            /**
             * Set next coefficient for fluent incrementing or decrementing.
             * @private
             */

        }, {
            key: '__incGrad',
            value: function __incGrad() {
                if (this.__currentGrad < this.opt.gradientMax) {
                    this.__currentGrad *= this.opt.gradientFactor;
                }
                if (this.__currentGrad > this.opt.gradientMax) {
                    this.__currentGrad = this.opt.gradientMax;
                }
            }
            /**
             * Get value from input.
             * @public
             * @return {number} The value.
             */

        }, {
            key: 'getValue',
            value: function getValue() {
                var value = this.input.value;

                if (this.opt.encodeValue) {
                    value = this.opt.encodeValue.call(this, value);
                }

                if (value === '') {
                    if (!this.opt.emptyOnMin) {
                        throw new TypeError('Can\'t convert empty string to value');
                    }
                    return this.opt.min;
                } else {
                    return parseFloat(this.opt.comma ? value.toString().replace(/,/, '.') : value);
                }
            }
            /**
             * Set value for input.
             * @public
             * @param {number} value.
             */

        }, {
            key: 'setValue',
            value: function setValue(value) {
                if (this.opt.decodeValue) {
                    value = this.opt.decodeValue.call(this, value);
                }

                if (value === this.opt.min && this.opt.emptyOnMin) {
                    this.input.value = '';
                } else {
                    this.input.value = this.opt.comma ? value.toString().replace(/\./, ',') : value;
                }
            }
            /**
             * Fit input value for current constraints (min, max).
             * @public
             */

        }, {
            key: 'fit',
            value: function fit() {
                var value = this.getValue();
                if (value < this.opt.min) {
                    value = this.opt.min;
                }
                if (value > this.opt.max) {
                    value = this.opt.max;
                }
                this.setValue(value);
            }
            /**
             * Check arrows for availability using min and max options.
             * @public
             */

        }, {
            key: 'check',
            value: function check() {
                var value = this.getValue();

                console.log('check:', value);

                if (value <= this.opt.min) {
                    this.$prev.addClass(this.opt.disabledClassName);
                } else {
                    this.$prev.removeClass(this.opt.disabledClassName);
                }

                if (value >= this.opt.max) {
                    this.$next.addClass(this.opt.disabledClassName);
                } else {
                    this.$next.removeClass(this.opt.disabledClassName);
                }
            }
            /**
             * Round value using step option.
             * @private
             * @return {number} The rounded value.
             */

        }, {
            key: '__round',
            value: function __round(value) {
                return Math.round(value / this.opt.step) * this.opt.step;
            }
            /**
             * Destroy all created elements and unbind connected events.
             * @public
             */

        }, {
            key: 'destroy',
            value: function destroy() {
                console.log('destroy');

                this.$input.off('change', this.__checkChange);
                this.$prev.remove();
                this.$next.remove();
            }
        }]);

        return InputArrow;
    }();

    $.fn.extend({
        inputarrow: function inputarrow(arg) {
            if (typeof arg === 'string') {
                var value = [];

                for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    args[_key - 1] = arguments[_key];
                }

                for (var i = 0; i < this.length; i++) {
                    var inputarrow = this.get(i)[prop];
                    if (inputarrow) {
                        if (typeof inputarrow[arg] !== 'undefined') {
                            if (/^_/.test(arg)) {
                                throw new Error('Can\'t call ' + arg + ': it isn\'t public');
                            } else if (typeof inputarrow[arg] === 'function') {
                                var res = inputarrow[arg].apply(inputarrow, args);
                                value.push(res);

                                if (arg === 'destroy') {
                                    delete this.get(i)[prop];
                                }
                            } else {
                                var _res = inputarrow[arg];
                                value.push(_res);
                            }
                        } else {
                            throw new Error('Can\'t call ' + arg + ': no such method or property');
                        }
                    } else {
                        throw new Error('Can\'t call ' + arg + ': InputArrow is not initialized');
                    }
                }

                if (value.length === 1) {
                    return value[0];
                } else {
                    return value;
                }
            } else {
                for (var _i = 0; _i < this.length; _i++) {
                    var attrs = {},
                        min = this.eq(_i).attr('min'),
                        max = this.eq(_i).attr('max'),
                        step = this.eq(_i).attr('step');

                    if (typeof min !== 'undefined' && min !== '') {
                        attrs.min = parseFloat(min);
                    }
                    if (typeof max !== 'undefined' && max !== '') {
                        attrs.max = parseFloat(max);
                    }
                    if (typeof step !== 'undefined' && step !== '' && step !== 'any') {
                        attrs.step = parseFloat(step);
                    }

                    if (this.get(_i)[prop]) {
                        throw new Error('InputArrow is already initialized');
                    }

                    this.get(_i)[prop] = new InputArrow(this.get(_i), $.extend({}, attrs, arg));
                }

                return this;
            }
        }
    });
})(jQuery);

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQUVBOzs7Ozs7QUFFQSxDQUFDLFVBQVMsQ0FBVCxFQUFZO0FBQ1QsUUFBSSxXQUFXO0FBQ1gsYUFBSyxDQURNO0FBRVgsYUFBSyxRQUZNO0FBR1gsY0FBTSxDQUhLO0FBSVgsb0JBQVksS0FKRDtBQUtYLGtCQUxXLHNCQUtBLEtBTEEsRUFLTztBQUNkLG1CQUFPLEVBQUUsU0FBUyxhQUFULENBQXVCLE1BQXZCLENBQUYsRUFBa0MsUUFBbEMsQ0FBMkMsaUJBQTNDLEVBQThELElBQTlELENBQW1FLEdBQW5FLEVBQXdFLFlBQXhFLENBQXFGLEtBQXJGLENBQVA7QUFDSCxTQVBVO0FBUVgsa0JBUlcsc0JBUUEsS0FSQSxFQVFPO0FBQ2QsbUJBQU8sRUFBRSxTQUFTLGFBQVQsQ0FBdUIsTUFBdkIsQ0FBRixFQUFrQyxRQUFsQyxDQUEyQyxpQkFBM0MsRUFBOEQsSUFBOUQsQ0FBbUUsR0FBbkUsRUFBd0UsV0FBeEUsQ0FBb0YsS0FBcEYsQ0FBUDtBQUNILFNBVlU7O0FBV1gscUJBQWEsSUFYRjtBQVlYLHFCQUFhLElBWkY7QUFhWCxrQkFBVSxJQWJDO0FBY1gsbUJBQVcsSUFkQTtBQWVYLDJCQUFtQixxQkFmUjtBQWdCWCxlQUFPLEtBaEJJO0FBaUJYLHdCQUFnQixHQWpCTDtBQWtCWCx5QkFBaUIsQ0FsQk47QUFtQlgscUJBQWEsRUFuQkY7QUFvQlgsZUFBTyxHQXBCSTtBQXFCWCxrQkFBVTtBQXJCQyxLQUFmOztBQXdCQSxRQUFJLE9BQVEsT0FBTyxNQUFQLEtBQWtCLFNBQW5CLEdBQWdDLE9BQU8sTUFBUCxDQUFjLFlBQWQsQ0FBaEMsR0FBOEQsY0FBekU7O0FBR0E7O0FBNUJTLFFBNkJILFVBN0JHO0FBOEJMOzs7OztBQUtBLDRCQUFZLEtBQVosRUFBbUIsT0FBbkIs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LElBQUksS0FBSixDQUFVLG1DQUFWLENBQU47QUFDSDs7QUFFRCx5QkFBSyxHQUFMLENBQVMsRUFBVCxFQUFZLElBQVosSUFBb0IsSUFBSSxVQUFKLENBQWUsS0FBSyxHQUFMLENBQVMsRUFBVCxDQUFmLEVBQTRCLEVBQUUsTUFBRixDQUFTLEVBQVQsRUFBYSxLQUFiLEVBQW9CLEdBQXBCLENBQTVCLENBQXBCO0FBQ0g7O0FBRUQsdUJBQU8sSUFBUDtBQUNIO0FBQ0o7QUE3RE8sS0FBWjtBQStESCxDQTNXRCxFQTJXRyxNQTNXSCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbi8qIGdsb2JhbCBqUXVlcnkgKi9cblxuKGZ1bmN0aW9uKCQpIHtcbiAgICBsZXQgZGVmYXVsdHMgPSB7XG4gICAgICAgIG1pbjogMCxcbiAgICAgICAgbWF4OiBJbmZpbml0eSxcbiAgICAgICAgc3RlcDogMSxcbiAgICAgICAgZW1wdHlPbk1pbjogZmFsc2UsXG4gICAgICAgIHJlbmRlclByZXYoaW5wdXQpIHtcbiAgICAgICAgICAgIHJldHVybiAkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKSkuYWRkQ2xhc3MoJ2lucHV0YXJyb3ctcHJldicpLmh0bWwoJzwnKS5pbnNlcnRCZWZvcmUoaW5wdXQpO1xuICAgICAgICB9LFxuICAgICAgICByZW5kZXJOZXh0KGlucHV0KSB7XG4gICAgICAgICAgICByZXR1cm4gJChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJykpLmFkZENsYXNzKCdpbnB1dGFycm93LW5leHQnKS5odG1sKCc+JykuaW5zZXJ0QWZ0ZXIoaW5wdXQpO1xuICAgICAgICB9LFxuICAgICAgICBlbmNvZGVWYWx1ZTogbnVsbCxcbiAgICAgICAgZGVjb2RlVmFsdWU6IG51bGwsXG4gICAgICAgIG9uQ2hhbmdlOiBudWxsLFxuICAgICAgICBvbkl0ZXJhdGU6IG51bGwsXG4gICAgICAgIGRpc2FibGVkQ2xhc3NOYW1lOiAnaW5wdXRhcnJvdy1kaXNhYmxlZCcsXG4gICAgICAgIGNvbW1hOiBmYWxzZSxcbiAgICAgICAgZ3JhZGllbnRGYWN0b3I6IDEuMSxcbiAgICAgICAgZ3JhZGllbnREZWZhdWx0OiAxLFxuICAgICAgICBncmFkaWVudE1heDogMjAsXG4gICAgICAgIGRlbGF5OiAzMDAsXG4gICAgICAgIGludGVydmFsOiAxMjBcbiAgICB9O1xuXG4gICAgbGV0IHByb3AgPSAod2luZG93LlN5bWJvbCAhPT0gdW5kZWZpbmVkKSA/IHdpbmRvdy5TeW1ib2woJ2lucHV0YXJyb3cnKSA6ICdfX2lucHV0YXJyb3cnO1xuXG5cbiAgICAvKiogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIGlucHV0YXJyb3cgaGFuZGxlci4gKi9cbiAgICBjbGFzcyBJbnB1dEFycm93IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSBhbiBpbnN0YW5jZSwgc2V0dXAgcGx1Z2luLlxuICAgICAgICAgKiBAcGFyYW0ge0hUTUxJbnB1dEVsZW1lbnR9IGlucHV0IC0gaHRtbCBlbGVtZW50LlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyAtIHNldHRpbmdzLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3RydWN0b3IoaW5wdXQsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQgPSBpbnB1dDtcbiAgICAgICAgICAgIHRoaXMub3B0ID0gJC5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHRpb25zKTtcblxuICAgICAgICAgICAgdGhpcy4kaW5wdXQgPSAkKHRoaXMuaW5wdXQpO1xuICAgICAgICAgICAgdGhpcy4kcHJldiA9IHRoaXMub3B0LnJlbmRlclByZXYuY2FsbCh0aGlzLCB0aGlzLmlucHV0KTtcbiAgICAgICAgICAgIHRoaXMuJG5leHQgPSB0aGlzLm9wdC5yZW5kZXJOZXh0LmNhbGwodGhpcywgdGhpcy5pbnB1dCk7XG5cbiAgICAgICAgICAgIHRoaXMuJHByZXYub24oJ21vdXNlZG93biB0b3VjaHN0YXJ0JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnRDb3VudGluZygtMSk7XG4gICAgICAgICAgICB9KS5vbignbW91c2V1cCBtb3VzZW91dCB0b3VjaGVuZCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fX2lzU3RhcnRlZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fX2lzQ291bnRpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcENvdW50aW5nKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9fY2xlYXJDb3VudGluZygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3VudCgtMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy4kbmV4dC5vbignbW91c2Vkb3duIHRvdWNoc3RhcnQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydENvdW50aW5nKDEpO1xuICAgICAgICAgICAgfSkub24oJ21vdXNldXAgbW91c2VvdXQgdG91Y2hlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX19pc1N0YXJ0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX19pc0NvdW50aW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0b3BDb3VudGluZygpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fX2NsZWFyQ291bnRpbmcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY291bnQoMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fX2NoZWNrQ2hhbmdlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hlY2soKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLiRpbnB1dC5vbignY2hhbmdlJywgdGhpcy5fX2NoZWNrQ2hhbmdlKTtcblxuICAgICAgICAgICAgdGhpcy5fX2N1cnJlbnRHcmFkID0gdGhpcy5vcHQuZ3JhZGllbnREZWZhdWx0O1xuXG4gICAgICAgICAgICB0aGlzLmZpdCgpO1xuICAgICAgICAgICAgdGhpcy5jaGVjaygpO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTaW5nbGUgaW5jcmVtZW50IG9yIGRlY3JlbWVudCB2YWx1ZS5cbiAgICAgICAgICogQHB1YmxpY1xuICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gayAtIGNvZWZmaWNpZW50ICgtMSBmb3IgZGVjcmVtZW50aW5nLCArMSBmb3IgaW5jcmVtZW50aW5nKS5cbiAgICAgICAgICovXG4gICAgICAgIGNvdW50KGspIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjb3VudCcsIGspO1xuXG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XG4gICAgICAgICAgICBsZXQgbmV3VmFsdWUgPSB0aGlzLl9fcm91bmQodmFsdWUgKyBrICogdGhpcy5vcHQuc3RlcCk7XG5cbiAgICAgICAgICAgIGlmIChuZXdWYWx1ZSA8IHRoaXMub3B0Lm1pbikge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlID0gdGhpcy5vcHQubWluO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdWYWx1ZSA+IHRoaXMub3B0Lm1heCkge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlID0gdGhpcy5vcHQubWF4O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnb2xkIHZhbHVlOicsIHZhbHVlLCAnbmV3IHZhbHVlOicsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgaWYgKG5ld1ZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0VmFsdWUobmV3VmFsdWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuJGlucHV0LnRyaWdnZXIoJ2NoYW5nZScpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdC5vbkNoYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdC5vbkNoYW5nZS5jYWxsKHRoaXMsIG5ld1ZhbHVlLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdGFydCBmbHVlbnQgaW5jcmVtZW50aW5nIG9yIGRlY3JlbWVudGluZyB2YWx1ZS5cbiAgICAgICAgICogQHB1YmxpY1xuICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gayAtIGNvZWZmaWNpZW50ICgtMSBmb3IgZGVjcmVtZW50aW5nLCArMSBmb3IgaW5jcmVtZW50aW5nKS5cbiAgICAgICAgICovXG4gICAgICAgIHN0YXJ0Q291bnRpbmcoaykge1xuICAgICAgICAgICAgdGhpcy5fX2lzU3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9fZGVsYXlUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdGFydENvdW50aW5nJywgayk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9faXNDb3VudGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5fX29sZFZhbHVlID0gdGhpcy5fX2N1cnJlbnRWYWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9fY3VycmVudEdyYWQgPSB0aGlzLm9wdC5ncmFkaWVudERlZmF1bHQ7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9faW5jVGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX19pdGVyYXRlQ291bnRpbmcoayk7XG4gICAgICAgICAgICAgICAgfSwgdGhpcy5vcHQuaW50ZXJ2YWwpO1xuICAgICAgICAgICAgfSwgdGhpcy5vcHQuZGVsYXkpO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdG9wIGZsdWVudCBpbmNyZW1lbnRpbmcgb3IgZGVjcmVtZW50aW5nIHZhbHVlLlxuICAgICAgICAgKiBAcHVibGljXG4gICAgICAgICAqL1xuICAgICAgICBzdG9wQ291bnRpbmcoKSB7XG4gICAgICAgICAgICB0aGlzLl9fY2xlYXJDb3VudGluZygpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5fX2lzQ291bnRpbmcpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc3RvcENvdW50aW5nJyk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9faXNDb3VudGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5fX2luY1RpbWVyKTtcblxuICAgICAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdGhpcy5fX29sZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJGlucHV0LnRyaWdnZXIoJ2NoYW5nZScpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHQub25DaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3B0Lm9uQ2hhbmdlLmNhbGwodGhpcywgdmFsdWUsIHRoaXMuX19vbGRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFByb2Nlc3MgaW5jcmVtZW50aW5nIG9yIGRlY3JlbWVudGluZyB2YWx1ZSBmb3IgZWFjaCBpdGVyYXRpb24uXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBrIC0gY29lZmZpY2llbnQgKC0xIGZvciBkZWNyZW1lbnRpbmcsICsxIGZvciBpbmNyZW1lbnRpbmcpLlxuICAgICAgICAgKi9cbiAgICAgICAgX19pdGVyYXRlQ291bnRpbmcoaykge1xuICAgICAgICAgICAgdGhpcy5fX2N1cnJlbnRWYWx1ZSArPSBrICogdGhpcy5vcHQuc3RlcCAqIHRoaXMuX19jdXJyZW50R3JhZDtcblxuICAgICAgICAgICAgbGV0IG5ld1ZhbHVlID0gdGhpcy5fX3JvdW5kKHRoaXMuX19jdXJyZW50VmFsdWUpO1xuXG4gICAgICAgICAgICBsZXQgc3RvcCA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKG5ld1ZhbHVlIDwgdGhpcy5vcHQubWluKSB7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWUgPSB0aGlzLm9wdC5taW47XG4gICAgICAgICAgICAgICAgc3RvcCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5ld1ZhbHVlID4gdGhpcy5vcHQubWF4KSB7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWUgPSB0aGlzLm9wdC5tYXg7XG4gICAgICAgICAgICAgICAgc3RvcCA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ29sZCB2YWx1ZTonLCB2YWx1ZSwgJ25ldyB2YWx1ZScsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgaWYgKG5ld1ZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0VmFsdWUobmV3VmFsdWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2hlY2soKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHQub25JdGVyYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0Lm9uSXRlcmF0ZS5jYWxsKHRoaXMsIG5ld1ZhbHVlLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc3RvcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcENvdW50aW5nKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX19pbmNHcmFkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENsZWFyIHRpbWVyIGZvciBkZWxheWVkIHN0YXJ0LlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX19jbGVhckNvdW50aW5nKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX19pc1N0YXJ0ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9faXNTdGFydGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX19kZWxheVRpbWVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogU2V0IG5leHQgY29lZmZpY2llbnQgZm9yIGZsdWVudCBpbmNyZW1lbnRpbmcgb3IgZGVjcmVtZW50aW5nLlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX19pbmNHcmFkKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX19jdXJyZW50R3JhZCA8IHRoaXMub3B0LmdyYWRpZW50TWF4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fX2N1cnJlbnRHcmFkICo9IHRoaXMub3B0LmdyYWRpZW50RmFjdG9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuX19jdXJyZW50R3JhZCA+IHRoaXMub3B0LmdyYWRpZW50TWF4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fX2N1cnJlbnRHcmFkID0gdGhpcy5vcHQuZ3JhZGllbnRNYXg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCB2YWx1ZSBmcm9tIGlucHV0LlxuICAgICAgICAgKiBAcHVibGljXG4gICAgICAgICAqIEByZXR1cm4ge251bWJlcn0gVGhlIHZhbHVlLlxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0VmFsdWUoKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmlucHV0LnZhbHVlO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5vcHQuZW5jb2RlVmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXMub3B0LmVuY29kZVZhbHVlLmNhbGwodGhpcywgdmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm9wdC5lbXB0eU9uTWluKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0NhblxcJ3QgY29udmVydCBlbXB0eSBzdHJpbmcgdG8gdmFsdWUnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0Lm1pbjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodGhpcy5vcHQuY29tbWEgPyB2YWx1ZS50b1N0cmluZygpLnJlcGxhY2UoLywvLCAnLicpIDogdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZXQgdmFsdWUgZm9yIGlucHV0LlxuICAgICAgICAgKiBAcHVibGljXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZS5cbiAgICAgICAgICovXG4gICAgICAgIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHQuZGVjb2RlVmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXMub3B0LmRlY29kZVZhbHVlLmNhbGwodGhpcywgdmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHRoaXMub3B0Lm1pbiAmJiB0aGlzLm9wdC5lbXB0eU9uTWluKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnB1dC52YWx1ZSA9ICcnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlucHV0LnZhbHVlID0gdGhpcy5vcHQuY29tbWEgPyB2YWx1ZS50b1N0cmluZygpLnJlcGxhY2UoL1xcLi8sICcsJykgOiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogRml0IGlucHV0IHZhbHVlIGZvciBjdXJyZW50IGNvbnN0cmFpbnRzIChtaW4sIG1heCkuXG4gICAgICAgICAqIEBwdWJsaWNcbiAgICAgICAgICovXG4gICAgICAgIGZpdCgpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA8IHRoaXMub3B0Lm1pbikge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhpcy5vcHQubWluO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHZhbHVlID4gdGhpcy5vcHQubWF4KSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGlzLm9wdC5tYXg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFZhbHVlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2sgYXJyb3dzIGZvciBhdmFpbGFiaWxpdHkgdXNpbmcgbWluIGFuZCBtYXggb3B0aW9ucy5cbiAgICAgICAgICogQHB1YmxpY1xuICAgICAgICAgKi9cbiAgICAgICAgY2hlY2soKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjaGVjazonLCB2YWx1ZSk7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA8PSB0aGlzLm9wdC5taW4pIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRwcmV2LmFkZENsYXNzKHRoaXMub3B0LmRpc2FibGVkQ2xhc3NOYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kcHJldi5yZW1vdmVDbGFzcyh0aGlzLm9wdC5kaXNhYmxlZENsYXNzTmFtZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA+PSB0aGlzLm9wdC5tYXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRuZXh0LmFkZENsYXNzKHRoaXMub3B0LmRpc2FibGVkQ2xhc3NOYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kbmV4dC5yZW1vdmVDbGFzcyh0aGlzLm9wdC5kaXNhYmxlZENsYXNzTmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJvdW5kIHZhbHVlIHVzaW5nIHN0ZXAgb3B0aW9uLlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSByb3VuZGVkIHZhbHVlLlxuICAgICAgICAgKi9cbiAgICAgICAgX19yb3VuZCh2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodmFsdWUgLyB0aGlzLm9wdC5zdGVwKSAqIHRoaXMub3B0LnN0ZXA7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlc3Ryb3kgYWxsIGNyZWF0ZWQgZWxlbWVudHMgYW5kIHVuYmluZCBjb25uZWN0ZWQgZXZlbnRzLlxuICAgICAgICAgKiBAcHVibGljXG4gICAgICAgICAqL1xuICAgICAgICBkZXN0cm95KCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2Rlc3Ryb3knKTtcblxuICAgICAgICAgICAgdGhpcy4kaW5wdXQub2ZmKCdjaGFuZ2UnLCB0aGlzLl9fY2hlY2tDaGFuZ2UpO1xuICAgICAgICAgICAgdGhpcy4kcHJldi5yZW1vdmUoKTtcbiAgICAgICAgICAgIHRoaXMuJG5leHQucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAkLmZuLmV4dGVuZCh7XG4gICAgICAgIGlucHV0YXJyb3c6IGZ1bmN0aW9uKGFyZywgLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gW107XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpICsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbnB1dGFycm93ID0gdGhpcy5nZXQoaSlbcHJvcF07XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnB1dGFycm93KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGlucHV0YXJyb3dbYXJnXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoL15fLy50ZXN0KGFyZykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4ndCBjYWxsICR7YXJnfTogaXQgaXNuJ3QgcHVibGljYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaW5wdXRhcnJvd1thcmddID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZXMgPSBpbnB1dGFycm93W2FyZ10uYXBwbHkoaW5wdXRhcnJvdywgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLnB1c2gocmVzKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJnID09PSAnZGVzdHJveScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmdldChpKVtwcm9wXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZXMgPSBpbnB1dGFycm93W2FyZ107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLnB1c2gocmVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3QgY2FsbCAke2FyZ306IG5vIHN1Y2ggbWV0aG9kIG9yIHByb3BlcnR5YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbid0IGNhbGwgJHthcmd9OiBJbnB1dEFycm93IGlzIG5vdCBpbml0aWFsaXplZGApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWVbMF07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSArKykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgYXR0cnMgPSB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbiA9IHRoaXMuZXEoaSkuYXR0cignbWluJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXggPSB0aGlzLmVxKGkpLmF0dHIoJ21heCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RlcCA9IHRoaXMuZXEoaSkuYXR0cignc3RlcCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbWluICE9PSAndW5kZWZpbmVkJyAmJiBtaW4gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRycy5taW4gPSBwYXJzZUZsb2F0KG1pbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBtYXggIT09ICd1bmRlZmluZWQnICYmIG1heCAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzLm1heCA9IHBhcnNlRmxvYXQobWF4KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHN0ZXAgIT09ICd1bmRlZmluZWQnICYmIHN0ZXAgIT09ICcnICYmIHN0ZXAgIT09ICdhbnknKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRycy5zdGVwID0gcGFyc2VGbG9hdChzdGVwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmdldChpKVtwcm9wXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnB1dEFycm93IGlzIGFscmVhZHkgaW5pdGlhbGl6ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0KGkpW3Byb3BdID0gbmV3IElucHV0QXJyb3codGhpcy5nZXQoaSksICQuZXh0ZW5kKHt9LCBhdHRycywgYXJnKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn0pKGpRdWVyeSk7XG4iXX0=
