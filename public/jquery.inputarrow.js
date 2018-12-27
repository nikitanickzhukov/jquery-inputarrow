(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f;
            }
            var l = n[o] = {
                exports: {}
            };
            t[o][0].call(l.exports, function(e) {
                var n = t[o][1][e];
                return s(n ? n : e);
            }, l, l.exports, e, t, n, r);
        }
        return n[o].exports;
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s;
})({
    1: [ function(require, module, exports) {
        "use strict";
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || false;
                    descriptor.configurable = true;
                    if ("value" in descriptor) descriptor.writable = true;
                    Object.defineProperty(target, descriptor.key, descriptor);
                }
            }
            return function(Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
            };
        }();
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
            }
        }
        (function($) {
            var defaults = {
                min: 0,
                max: Infinity,
                step: 1,
                emptyOnMin: false,
                renderPrev: function renderPrev(input) {
                    return $(document.createElement("span")).addClass("inputarrow-prev").html("<").insertBefore(input);
                },
                renderNext: function renderNext(input) {
                    return $(document.createElement("span")).addClass("inputarrow-next").html(">").insertAfter(input);
                },
                encodeValue: null,
                decodeValue: null,
                onChange: null,
                onIterate: null,
                disabledClassName: "inputarrow-disabled",
                comma: false,
                gradientFactor: 1.1,
                gradientDefault: 1,
                gradientMax: 20,
                delay: 300,
                interval: 120
            };
            var prop = window.Symbol !== undefined ? window.Symbol("inputarrow") : "__inputarrow";
            var InputArrow = function() {
                function InputArrow(input, options) {
                    var _this = this;
                    _classCallCheck(this, InputArrow);
                    this.input = input;
                    this.opt = $.extend({}, defaults, options);
                    this.$input = $(this.input);
                    this.$prev = this.opt.renderPrev.call(this, this.input);
                    this.$next = this.opt.renderNext.call(this, this.input);
                    this.$prev.on("mousedown touchstart", function() {
                        _this.startCounting(-1);
                    }).on("mouseup mouseout touchend", function() {
                        if (_this.__isStarted) {
                            if (_this.__isCounting) {
                                _this.stopCounting();
                            } else {
                                _this.__clearCounting();
                                _this.count(-1);
                            }
                        }
                    });
                    this.$next.on("mousedown touchstart", function() {
                        _this.startCounting(1);
                    }).on("mouseup mouseout touchend", function() {
                        if (_this.__isStarted) {
                            if (_this.__isCounting) {
                                _this.stopCounting();
                            } else {
                                _this.__clearCounting();
                                _this.count(1);
                            }
                        }
                    });
                    this.__checkChange = function() {
                        _this.check();
                    };
                    this.$input.on("change", this.__checkChange);
                    this.__currentGrad = this.opt.gradientDefault;
                    this.fit();
                    this.check();
                }
                _createClass(InputArrow, [ {
                    key: "count",
                    value: function count(k) {
                        console.log("count", k);
                        var value = this.getValue();
                        var newValue = this.__round(value + k * this.opt.step);
                        if (newValue < this.opt.min) {
                            newValue = this.opt.min;
                        } else if (newValue > this.opt.max) {
                            newValue = this.opt.max;
                        }
                        console.log("old value:", value, "new value:", newValue);
                        if (newValue !== value) {
                            this.setValue(newValue);
                            this.$input.trigger("change");
                            if (this.opt.onChange) {
                                this.opt.onChange.call(this, newValue, value);
                            }
                        }
                    }
                }, {
                    key: "startCounting",
                    value: function startCounting(k) {
                        var _this2 = this;
                        this.__isStarted = true;
                        this.__delayTimer = setTimeout(function() {
                            console.log("startCounting", k);
                            _this2.__isCounting = true;
                            _this2.__oldValue = _this2.__currentValue = _this2.getValue();
                            _this2.__currentGrad = _this2.opt.gradientDefault;
                            _this2.__incTimer = setInterval(function() {
                                _this2.__iterateCounting(k);
                            }, _this2.opt.interval);
                        }, this.opt.delay);
                    }
                }, {
                    key: "stopCounting",
                    value: function stopCounting() {
                        this.__clearCounting();
                        if (this.__isCounting) {
                            console.log("stopCounting");
                            this.__isCounting = false;
                            clearInterval(this.__incTimer);
                            var value = this.getValue();
                            if (value !== this.__oldValue) {
                                this.$input.trigger("change");
                                if (this.opt.onChange) {
                                    this.opt.onChange.call(this, value, this.__oldValue);
                                }
                            }
                        }
                    }
                }, {
                    key: "__iterateCounting",
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
                        console.log("old value:", value, "new value", newValue);
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
                }, {
                    key: "__clearCounting",
                    value: function __clearCounting() {
                        if (this.__isStarted) {
                            this.__isStarted = false;
                            clearTimeout(this.__delayTimer);
                        }
                    }
                }, {
                    key: "__incGrad",
                    value: function __incGrad() {
                        if (this.__currentGrad < this.opt.gradientMax) {
                            this.__currentGrad *= this.opt.gradientFactor;
                        }
                        if (this.__currentGrad > this.opt.gradientMax) {
                            this.__currentGrad = this.opt.gradientMax;
                        }
                    }
                }, {
                    key: "getValue",
                    value: function getValue() {
                        var value = this.input.value;
                        if (this.opt.encodeValue) {
                            value = this.opt.encodeValue.call(this, value);
                        }
                        if (value === "") {
                            if (!this.opt.emptyOnMin) {
                                throw new TypeError("Can't convert empty string to value");
                            }
                            return this.opt.min;
                        } else {
                            return parseFloat(this.opt.comma ? value.toString().replace(/,/, ".") : value);
                        }
                    }
                }, {
                    key: "setValue",
                    value: function setValue(value) {
                        if (this.opt.decodeValue) {
                            value = this.opt.decodeValue.call(this, value);
                        }
                        if (value === this.opt.min && this.opt.emptyOnMin) {
                            this.input.value = "";
                        } else {
                            this.input.value = this.opt.comma ? value.toString().replace(/\./, ",") : value;
                        }
                    }
                }, {
                    key: "fit",
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
                }, {
                    key: "check",
                    value: function check() {
                        var value = this.getValue();
                        console.log("check:", value);
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
                }, {
                    key: "__round",
                    value: function __round(value) {
                        return Math.round(value / this.opt.step) * this.opt.step;
                    }
                }, {
                    key: "destroy",
                    value: function destroy() {
                        console.log("destroy");
                        this.$input.off("change", this.__checkChange);
                        this.$prev.remove();
                        this.$next.remove();
                    }
                } ]);
                return InputArrow;
            }();
            $.fn.extend({
                inputarrow: function inputarrow(arg) {
                    if (typeof arg === "string") {
                        var value = [];
                        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                            args[_key - 1] = arguments[_key];
                        }
                        for (var i = 0; i < this.length; i++) {
                            var inputarrow = this.get(i)[prop];
                            if (inputarrow) {
                                if (typeof inputarrow[arg] !== "undefined") {
                                    if (/^_/.test(arg)) {
                                        throw new Error("Can't call " + arg + ": it isn't public");
                                    } else if (typeof inputarrow[arg] === "function") {
                                        var res = inputarrow[arg].apply(inputarrow, args);
                                        value.push(res);
                                        if (arg === "destroy") {
                                            delete this.get(i)[prop];
                                        }
                                    } else {
                                        var _res = inputarrow[arg];
                                        value.push(_res);
                                    }
                                } else {
                                    throw new Error("Can't call " + arg + ": no such method or property");
                                }
                            } else {
                                throw new Error("Can't call " + arg + ": InputArrow is not initialized");
                            }
                        }
                        if (value.length === 1) {
                            return value[0];
                        } else {
                            return value;
                        }
                    } else {
                        for (var _i = 0; _i < this.length; _i++) {
                            var attrs = {}, min = this.eq(_i).attr("min"), max = this.eq(_i).attr("max"), step = this.eq(_i).attr("step");
                            if (typeof min !== "undefined" && min !== "") {
                                attrs.min = parseFloat(min);
                            }
                            if (typeof max !== "undefined" && max !== "") {
                                attrs.max = parseFloat(max);
                            }
                            if (typeof step !== "undefined" && step !== "" && step !== "any") {
                                attrs.step = parseFloat(step);
                            }
                            if (this.get(_i)[prop]) {
                                throw new Error("InputArrow is already initialized");
                            }
                            this.get(_i)[prop] = new InputArrow(this.get(_i), $.extend({}, attrs, arg));
                        }
                        return this;
                    }
                }
            });
        })(jQuery);
    }, {} ]
}, {}, [ 1 ]);
//# sourceMappingURL=maps/jquery.inputarrow.js.map
