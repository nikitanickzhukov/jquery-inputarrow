'use strict';

/* global jQuery */

(function($) {
    let defaults = {
        min: 0,
        max: Infinity,
        step: 1,
        emptyOnMin: false,
        renderPrev(input) {
            return $(document.createElement('span')).addClass('inputarrow-prev').html('<').insertBefore(input);
        },
        renderNext(input) {
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

    let prop = window.Symbol ? window.Symbol('inputarrow') : '__inputarrow';


    /** Class representing an inputarrow handler. */
    class InputArrow {
        /**
         * Create an instance, setup plugin.
         * @param {HTMLInputElement} input - html element.
         * @param {object} options - settings.
         */
        constructor(input, options) {
            this.input = input;
            this.opt = $.extend({}, defaults, options);

            this.$input = $(this.input);
            this.$prev = this.opt.renderPrev.call(this, this.input);
            this.$next = this.opt.renderNext.call(this, this.input);

            this.$prev.on(this.__getTouchStartEvent(), () => {
                if (!this.__isStarted) {
                    this.startCounting(-1);
                }
            }).on(this.__getTouchEndEvent(), () => {
                if (this.__isStarted) {
                    if (this.__isCounting) {
                        this.stopCounting();
                    } else {
                        this.__clearCounting();
                        this.count(-1);
                    }
                }
            });

            this.$next.on(this.__getTouchStartEvent(), () => {
                if (!this.__isStarted) {
                    this.startCounting(1);
                }
            }).on(this.__getTouchEndEvent(), () => {
                if (this.__isStarted) {
                    if (this.__isCounting) {
                        this.stopCounting();
                    } else {
                        this.__clearCounting();
                        this.count(1);
                    }
                }
            });

            this.__checkChange = () => {
                this.check();
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
        count(k) {
            let value = this.getValue();
            let newValue = this.__round(value + k * this.opt.step);

            if (newValue < this.opt.min) {
                newValue = this.opt.min;
            } else if (newValue > this.opt.max) {
                newValue = this.opt.max;
            }

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
        startCounting(k) {
            this.__isStarted = true;
            this.__delayTimer = setTimeout(() => {
                this.__isCounting = true;
                this.__oldValue = this.__currentValue = this.getValue();
                this.__currentGrad = this.opt.gradientDefault;

                this.__incTimer = setInterval(() => {
                    this.__iterateCounting(k);
                }, this.opt.interval);
            }, this.opt.delay);
        }
        /**
         * Stop fluent incrementing or decrementing value.
         * @public
         */
        stopCounting() {
            this.__clearCounting();

            if (this.__isCounting) {
                this.__isCounting = false;
                clearInterval(this.__incTimer);

                let value = this.getValue();

                if (value !== this.__oldValue) {
                    this.$input.trigger('change');
                    if (this.opt.onChange) {
                        this.opt.onChange.call(this, value, this.__oldValue);
                    }
                }
            }
        }
        /**
         * Get event(s) which must be used as a touch start for controls.
         * @private
         * @return {string} The event name (or names separated by spaces).
         */
        __getTouchStartEvent() {
            return this.__isTouchDevice() ? 'touchstart' : 'mousedown';
        }
        /**
         * Get event(s) which must be used as a touch end for controls.
         * @private
         * @return {string} The event name (or names separated by spaces).
         */
        __getTouchEndEvent() {
            return this.__isTouchDevice() ? 'touchend' : 'mouseup mouseout';
        }
        /**
         * Returns true if we must operate touch events for mobile devices, false otherwise.
         * @private
         * @return {boolean} The value.
         */
        __isTouchDevice() {
            return ('ontouchstart' in window) || navigator.msMaxTouchPoints;
        }
        /**
         * Process incrementing or decrementing value for each iteration.
         * @private
         * @param {number} k - coefficient (-1 for decrementing, +1 for incrementing).
         */
        __iterateCounting(k) {
            this.__currentValue += k * this.opt.step * this.__currentGrad;

            let newValue = this.__round(this.__currentValue);

            let stop = false;
            if (newValue < this.opt.min) {
                newValue = this.opt.min;
                stop = true;
            } else if (newValue > this.opt.max) {
                newValue = this.opt.max;
                stop = true;
            }

            let value = this.getValue();

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
        __clearCounting() {
            if (this.__isStarted) {
                this.__isStarted = false;
                clearTimeout(this.__delayTimer);
            }
        }
        /**
         * Set next coefficient for fluent incrementing or decrementing.
         * @private
         */
        __incGrad() {
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
        getValue() {
            let value = this.input.value;

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
        setValue(value) {
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
        fit() {
            let value = this.getValue();
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
        check() {
            let value = this.getValue();

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
        __round(value) {
            return Math.round(value / this.opt.step) * this.opt.step;
        }
        /**
         * Destroy all created elements and unbind connected events.
         * @public
         */
        destroy() {
            this.$input.off('change', this.__checkChange);
            this.$prev.remove();
            this.$next.remove();
        }
    }

    $.fn.extend({
        inputarrow: function(arg, ...args) {
            if (typeof arg === 'string') {
                let value = [];

                for (let i = 0; i < this.length; i ++) {
                    let inputarrow = this.get(i)[prop];
                    if (inputarrow) {
                        if (typeof inputarrow[arg] !== 'undefined') {
                            if (/^_/.test(arg)) {
                                throw new Error(`Can't call ${arg}: it isn't public`);
                            } else if (typeof inputarrow[arg] === 'function') {
                                let res = inputarrow[arg].apply(inputarrow, args);
                                value.push(res);

                                if (arg === 'destroy') {
                                    delete this.get(i)[prop];
                                }
                            } else {
                                let res = inputarrow[arg];
                                value.push(res);
                            }
                        } else {
                            throw new Error(`Can't call ${arg}: no such method or property`);
                        }
                    } else {
                        throw new Error(`Can't call ${arg}: InputArrow is not initialized`);
                    }
                }

                if (this.length === 0) {
                    return undefined;
                } else if (this.length === 1) {
                    return value[0];
                } else {
                    return value;
                }
            } else {
                for (let i = 0; i < this.length; i ++) {
                    let attrs = {},
                        min = this.eq(i).attr('min'),
                        max = this.eq(i).attr('max'),
                        step = this.eq(i).attr('step');

                    if (typeof min !== 'undefined' && min !== '') {
                        attrs.min = parseFloat(min);
                    }
                    if (typeof max !== 'undefined' && max !== '') {
                        attrs.max = parseFloat(max);
                    }
                    if (typeof step !== 'undefined' && step !== '' && step !== 'any') {
                        attrs.step = parseFloat(step);
                    }

                    if (this.get(i)[prop]) {
                        throw new Error('InputArrow is already initialized');
                    }

                    this.get(i)[prop] = new InputArrow(this.get(i), $.extend({}, attrs, arg));
                }

                return this;
            }
        }
    });
})(jQuery);
