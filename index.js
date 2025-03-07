/*!
 *
 * The MIT License (MIT)
 *
 * Copyright © 2025 Taufik Nurrohman <https://github.com/taufik-nurrohman>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the “Software”), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */
(function (g, f) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = f() : typeof define === 'function' && define.amd ? define(f) : (g = typeof globalThis !== 'undefined' ? globalThis : g || self, g.OptionPicker = f());
})(this, (function () {
    'use strict';
    var hasValue = function hasValue(x, data) {
        return -1 !== data.indexOf(x);
    };
    var isArray = function isArray(x) {
        return Array.isArray(x);
    };
    var isDefined = function isDefined(x) {
        return 'undefined' !== typeof x;
    };
    var isFloat = function isFloat(x) {
        return isNumber(x) && 0 !== x % 1;
    };
    var isFunction = function isFunction(x) {
        return 'function' === typeof x;
    };
    var isInstance = function isInstance(x, of, exact) {
        if (!x || 'object' !== typeof x) {
            return false;
        }
        if (exact) {
            return isSet(of) && isSet(x.constructor) && of === x.constructor;
        }
        return isSet(of) && x instanceof of ;
    };
    var isInteger = function isInteger(x) {
        return isNumber(x) && 0 === x % 1;
    };
    var isNull = function isNull(x) {
        return null === x;
    };
    var isNumber = function isNumber(x) {
        return 'number' === typeof x;
    };
    var isNumeric = function isNumeric(x) {
        return /^-?(?:\d*.)?\d+$/.test(x + "");
    };
    var isObject = function isObject(x, isPlain) {
        if (isPlain === void 0) {
            isPlain = true;
        }
        if (!x || 'object' !== typeof x) {
            return false;
        }
        return isPlain ? isInstance(x, Object, 1) : true;
    };
    var isSet = function isSet(x) {
        return isDefined(x) && !isNull(x);
    };
    var isString = function isString(x) {
        return 'string' === typeof x;
    };
    var toCaseCamel = function toCaseCamel(x) {
        return x.replace(/[-_.](\w)/g, function (m0, m1) {
            return toCaseUpper(m1);
        });
    };
    var toCaseLower = function toCaseLower(x) {
        return x.toLowerCase();
    };
    var toCaseUpper = function toCaseUpper(x) {
        return x.toUpperCase();
    };
    var toCount = function toCount(x) {
        return x.length;
    };
    var toJSON = function toJSON(x) {
        return JSON.stringify(x);
    };
    var toNumber = function toNumber(x, base) {
        if (base === void 0) {
            base = 10;
        }
        return base ? parseInt(x, base) : parseFloat(x);
    };
    var _toValue = function toValue(x) {
        if (isArray(x)) {
            return x.map(function (v) {
                return _toValue(v);
            });
        }
        if (isNumeric(x)) {
            return toNumber(x);
        }
        if (isObject(x)) {
            for (var k in x) {
                x[k] = _toValue(x[k]);
            }
            return x;
        }
        if ('false' === x) {
            return false;
        }
        if ('null' === x) {
            return null;
        }
        if ('true' === x) {
            return true;
        }
        return x;
    };
    var fromJSON = function fromJSON(x) {
        var value = null;
        try {
            value = JSON.parse(x);
        } catch (e) {}
        return value;
    };
    var _fromStates = function fromStates() {
        for (var _len = arguments.length, lot = new Array(_len), _key = 0; _key < _len; _key++) {
            lot[_key] = arguments[_key];
        }
        var out = lot.shift();
        for (var i = 0, j = toCount(lot); i < j; ++i) {
            for (var k in lot[i]) {
                // Assign value
                if (!isSet(out[k])) {
                    out[k] = lot[i][k];
                    continue;
                }
                // Merge array
                if (isArray(out[k]) && isArray(lot[i][k])) {
                    out[k] = [ /* Clone! */ ].concat(out[k]);
                    for (var ii = 0, jj = toCount(lot[i][k]); ii < jj; ++ii) {
                        if (!hasValue(lot[i][k][ii], out[k])) {
                            out[k].push(lot[i][k][ii]);
                        }
                    }
                    // Merge object recursive
                } else if (isObject(out[k]) && isObject(lot[i][k])) {
                    out[k] = _fromStates({
                        /* Clone! */ }, out[k], lot[i][k]);
                    // Replace value
                } else {
                    out[k] = lot[i][k];
                }
            }
        }
        return out;
    };
    var _fromValue = function fromValue(x) {
        if (isArray(x)) {
            return x.map(function (v) {
                return _fromValue(x);
            });
        }
        if (isObject(x)) {
            for (var k in x) {
                x[k] = _fromValue(x[k]);
            }
            return x;
        }
        if (false === x) {
            return 'false';
        }
        if (null === x) {
            return 'null';
        }
        if (true === x) {
            return 'true';
        }
        return "" + x;
    };
    var D = document;
    var W = window;
    var B = D.body;
    var R = D.documentElement;
    var getAttribute = function getAttribute(node, attribute, parseValue) {
        if (parseValue === void 0) {
            parseValue = true;
        }
        if (!hasAttribute(node, attribute)) {
            return null;
        }
        var value = node.getAttribute(attribute);
        return parseValue ? _toValue(value) : value;
    };
    var getAttributes = function getAttributes(node, parseValue) {
        if (parseValue === void 0) {
            parseValue = true;
        }
        var attributes = node.attributes,
            value,
            values = {};
        for (var i = 0, j = attributes.length; i < j; ++i) {
            value = attributes[i].value;
            values[attributes[i].name] = parseValue ? _toValue(value) : value;
        }
        return values;
    };
    var getChildFirst = function getChildFirst(parent) {
        return parent.firstElementChild || null;
    };
    var getChildLast = function getChildLast(parent) {
        return parent.lastElementChild || null;
    };
    var getChildren = function getChildren(parent, index) {
        var children = [].slice.call(parent.children);
        return isNumber(index) ? children[index] || null : children;
    };
    var getDatum = function getDatum(node, datum, parseValue) {
        if (parseValue === void 0) {
            parseValue = true;
        }
        var value = getAttribute(node, 'data-' + datum, parseValue),
            v = (value + "").trim();
        if (parseValue && v && ('[' === v[0] && ']' === v.slice(-1) || '{' === v[0] && '}' === v.slice(-1)) && null !== (v = fromJSON(value))) {
            return v;
        }
        return value;
    };
    var getElement = function getElement(query, scope) {
        return (scope || D).querySelector(query);
    };
    var getHTML = function getHTML(node, trim) {
        if (trim === void 0) {
            trim = true;
        }
        var state = 'innerHTML';
        if (!hasState(node, state)) {
            return false;
        }
        var content = node[state];
        content = trim ? content.trim() : content;
        return "" !== content ? content : null;
    };
    var getName = function getName(node) {
        return toCaseLower(node && node.nodeName || "") || null;
    };
    var getNext = function getNext(node, anyNode) {
        return node['next' + (anyNode ? "" : 'Element') + 'Sibling'] || null;
    };
    var getParent = function getParent(node, query) {
        if (query) {
            return node.closest(query) || null;
        }
        return node.parentNode || null;
    };
    var getParentForm = function getParentForm(node) {
        var state = 'form';
        if (hasState(node, state) && state === getName(node[state])) {
            return node[state];
        }
        return getParent(node, state);
    };
    var getPrev = function getPrev(node, anyNode) {
        return node['previous' + (anyNode ? "" : 'Element') + 'Sibling'] || null;
    };
    var getStyle = function getStyle(node, style, parseValue) {
        var value = W.getComputedStyle(node).getPropertyValue(style);
        return value || "" === value || 0 === value ? value : null;
    };
    var getText = function getText(node, trim) {
        if (trim === void 0) {
            trim = true;
        }
        var state = 'textContent';
        if (!hasState(node, state)) {
            return false;
        }
        var content = node[state];
        content = trim ? content.trim() : content;
        return "" !== content ? content : null;
    };
    var hasAttribute = function hasAttribute(node, attribute) {
        return node.hasAttribute(attribute);
    };
    var hasClass = function hasClass(node, value) {
        return node.classList.contains(value);
    };
    var hasState = function hasState(node, state) {
        return state in node;
    };
    var isWindow = function isWindow(node) {
        return node === W;
    };
    var letAttribute = function letAttribute(node, attribute) {
        return node.removeAttribute(attribute), node;
    };
    var letClass = function letClass(node, value) {
        return node.classList.remove(value), node;
    };
    var letDatum = function letDatum(node, datum) {
        return letAttribute(node, 'data-' + datum);
    };
    var letElement = function letElement(node) {
        var parent = getParent(node);
        return node.remove(), parent;
    };
    var letStyle = function letStyle(node, style) {
        return node.style[toCaseCamel(style)] = null, node;
    };
    var setAttribute = function setAttribute(node, attribute, value) {
        if (true === value) {
            value = attribute;
        }
        return node.setAttribute(attribute, _fromValue(value)), node;
    };
    var setAttributes = function setAttributes(node, attributes) {
        var value;
        for (var attribute in attributes) {
            value = attributes[attribute];
            if (value || "" === value || 0 === value) {
                setAttribute(node, attribute, value);
            } else {
                letAttribute(node, attribute);
            }
        }
        return node;
    };
    var setChildLast = function setChildLast(parent, node) {
        return parent.append(node), node;
    };
    var setClass = function setClass(node, value) {
        return node.classList.add(value), node;
    };
    var setDatum = function setDatum(node, datum, value) {
        if (isArray(value) || isObject(value)) {
            value = toJSON(value);
        }
        return setAttribute(node, 'data-' + datum, value);
    };
    var setElement = function setElement(node, content, attributes) {
        node = isString(node) ? D.createElement(node) : node;
        if (isObject(content)) {
            attributes = content;
            content = false;
        }
        if (isString(content)) {
            setHTML(node, content);
        }
        if (isObject(attributes)) {
            setAttributes(node, attributes);
        }
        return node;
    };
    var setHTML = function setHTML(node, content, trim) {
        if (trim === void 0) {
            trim = true;
        }
        if (null === content) {
            return node;
        }
        var state = 'innerHTML';
        return hasState(node, state) && (node[state] = trim ? content.trim() : content), node;
    };
    var setNext = function setNext(current, node) {
        return getParent(current).insertBefore(node, getNext(current, true)), node;
    };
    var setStyle = function setStyle(node, style, value) {
        if (isNumber(value)) {
            value += 'px';
        }
        return node.style[toCaseCamel(style)] = _fromValue(value), node;
    };
    var setStyles = function setStyles(node, styles) {
        var value;
        for (var style in styles) {
            value = styles[style];
            if (value || "" === value || 0 === value) {
                setStyle(node, style, value);
            } else {
                letStyle(node, style);
            }
        }
        return node;
    };
    var setText = function setText(node, content, trim) {
        if (trim === void 0) {
            trim = true;
        }
        if (null === content) {
            return node;
        }
        var state = 'textContent';
        return hasState(node, state) && (node[state] = trim ? content.trim() : content), node;
    };
    var debounce = function debounce(then, time) {
        var timer;
        return function () {
            var _arguments = arguments,
                _this = this;
            timer && clearTimeout(timer);
            timer = setTimeout(function () {
                return then.apply(_this, _arguments);
            }, time);
        };
    };
    var delay = function delay(then, time) {
        return function () {
            var _arguments2 = arguments,
                _this2 = this;
            setTimeout(function () {
                return then.apply(_this2, _arguments2);
            }, time);
        };
    };
    var getRect = function getRect(node) {
        var h, rect, w, x, y, X, Y;
        if (isWindow(node)) {
            x = node.pageXOffset || R.scrollLeft || B.scrollLeft;
            y = node.pageYOffset || R.scrollTop || B.scrollTop;
            w = node.innerWidth;
            h = node.innerHeight;
        } else {
            rect = node.getBoundingClientRect();
            x = rect.left;
            y = rect.top;
            w = rect.width;
            h = rect.height;
            X = rect.right;
            Y = rect.bottom;
        }
        return [x, y, w, h, X, Y];
    };
    var getScroll = function getScroll(node) {
        return [node.scrollLeft, node.scrollTop];
    };
    var setScroll = function setScroll(node, data) {
        node.scrollLeft = data[0];
        node.scrollTop = data[1];
        return node;
    };

    function hook($, $$) {
        $$ = $$ || $;
        $$.fire = function (event, data, that) {
            var $ = this,
                hooks = $.hooks;
            if (!isSet(hooks[event])) {
                return $;
            }
            hooks[event].forEach(function (then) {
                return then.apply(that || $, data);
            });
            return $;
        };
        $$.off = function (event, then) {
            var $ = this,
                hooks = $.hooks;
            if (!isSet(event)) {
                return hooks = {}, $;
            }
            if (isSet(hooks[event])) {
                if (isSet(then)) {
                    var j = hooks[event].length;
                    // Clean-up empty hook(s)
                    if (0 === j) {
                        delete hooks[event];
                    } else {
                        for (var i = 0; i < j; ++i) {
                            if (then === hooks[event][i]) {
                                hooks[event].splice(i, 1);
                                break;
                            }
                        }
                    }
                } else {
                    delete hooks[event];
                }
            }
            return $;
        };
        $$.on = function (event, then) {
            var $ = this,
                hooks = $.hooks;
            if (!isSet(hooks[event])) {
                hooks[event] = [];
            }
            if (isSet(then)) {
                hooks[event].push(then);
            }
            return $;
        };
        return $.hooks = {}, $;
    }
    var offEvent = function offEvent(name, node, then) {
        node.removeEventListener(name, then);
    };
    var offEventDefault = function offEventDefault(e) {
        return e && e.preventDefault();
    };
    var offEventPropagation = function offEventPropagation(e) {
        return e && e.stopPropagation();
    };
    var onEvent = function onEvent(name, node, then, options) {
        if (options === void 0) {
            options = false;
        }
        node.addEventListener(name, then, options);
    };
    var FILTER_COMMIT_TIME = 50;
    var SEARCH_CLEAR_TIME = 500;
    var KEY_ARROW_DOWN = 'ArrowDown';
    var KEY_ARROW_UP = 'ArrowUp';
    var KEY_BEGIN = 'Home';
    var KEY_DELETE_LEFT = 'Backspace';
    var KEY_DELETE_RIGHT = 'Delete';
    var KEY_END = 'End';
    var KEY_ENTER = 'Enter';
    var KEY_ESCAPE = 'Escape';
    var KEY_PAGE_DOWN = 'PageDown';
    var KEY_PAGE_UP = 'PageUp';
    var KEY_TAB = 'Tab';
    var OPTION_SELF = 0;
    var bounce = debounce(function ($) {
        return $.fit();
    }, 10);
    var name = 'OptionPicker';
    var references = new WeakMap();

    function createOptions($, options, values) {
        var items,
            itemsParent,
            self = $.self,
            state = $.state;
        state.n;
        if ('input' === getName(self)) {
            items = (itemsParent = self.list) ? getChildren(itemsParent) : [];
        } else {
            items = getChildren(itemsParent = self);
        }
        // Remove option(s)
        for (var i = 0, j = toCount(items); i < j; ++i) {
            if ('optgroup' === getName(items[i])) {
                var itemsItems = getChildren(items[i]);
                for (var ii = 0, jj = toCount(itemsItems); ii < jj; ++ii) {
                    itemsItems[ii] && letElement(itemsItems[ii]);
                }
            }
            items[i] && letElement(items[i]);
        }
        // Reset option(s) data
        $._options.let();
        forEachMap(values, function (v, k) {
            return setValueInMap(k, v, $._options);
        });
        $.state.options = values;
    }

    function createOptionsFrom($, options, maskOptions) {
        var map = isInstance(options, Map) ? options : new Map();
        if (isArray(options)) {
            forEachArray(options, function (option) {
                if (isArray(option)) {
                    var _option$, _option$2, _option$1$value;
                    option[0] = (_option$ = option[0]) != null ? _option$ : "";
                    option[1] = (_option$2 = option[1]) != null ? _option$2 : {};
                    setValueInMap(_toValue((_option$1$value = option[1].value) != null ? _option$1$value : option[0]), option, map);
                } else {
                    setValueInMap(_toValue(option), [option, {}], map);
                }
            });
        } else if (isObject(options, 0)) {
            for (var k in options) {
                if (isArray(options[k])) {
                    var _options$k$, _options$k$2, _options$k$1$value;
                    options[k][0] = (_options$k$ = options[k][0]) != null ? _options$k$ : "";
                    options[k][1] = (_options$k$2 = options[k][1]) != null ? _options$k$2 : {};
                    setValueInMap(_toValue((_options$k$1$value = options[k][1].value) != null ? _options$k$1$value : k), options[k], map);
                } else {
                    setValueInMap(_toValue(k), [options[k], {}], map);
                }
            }
        }
        createOptions($, maskOptions, map);
    }

    function defineProperty(of, key, state) {
        Object.defineProperty(of, key, state);
    }

    function focusTo(node) {
        node.focus();
    }

    function focusToOption(option, picker, focusOnly) {
        var mask = picker.mask,
            state = picker.state,
            n = state.n;
        if (option) {
            focusToOptionsNone(picker);
            focusOnly ? focusTo(option) : setClass(option, n + '__option--focus');
            setClass(mask, n += '--focus');
            letClass(mask, n + '-self');
            setClass(mask, n += '-option');
            return option;
        }
    }

    function focusToOptionFirst(picker, focusOnly, k) {
        var _options = picker._options,
            state = picker.state,
            n = state.n,
            option;
        n += '__option--disabled';
        if (option = toValuesFromMap(_options)['find' + (k || "")](function (v) {
                return !v[2].hidden && !hasClass(v[2], n);
            })) {
            return focusToOption(option[2], picker, focusOnly);
        }
    }

    function focusToOptionLast(picker, focusOnly) {
        return focusToOptionFirst(picker, focusOnly, 'Last');
    }

    function focusToOptionsNone(picker) {
        var _options = picker._options,
            mask = picker.mask,
            state = picker.state,
            n = state.n;
        letClass(mask, n + '--focus-option');
        setClass(mask, n + '--focus');
        setClass(mask, n + '--focus-self');
        n += '__option--focus';
        forEachMap(_options, function (v) {
            return letClass(v[2], n);
        });
    }

    function forEachArray(array, then) {
        array.forEach(then);
    }

    function forEachMap(map, then) {
        if (map instanceof OptionPickerOptions) {
            map = map.map;
        }
        forEachArray(map, then);
    }

    function getOptionValue(option) {
        return getDatum(option, 'value', false);
    }

    function getOptions(self) {
        var map = new Map();
        var item,
            items,
            itemsParent,
            selected = [],
            value = getValue(self);
        if ('input' === getName(self)) {
            items = (itemsParent = self.list) ? getChildren(itemsParent) : [];
        } else {
            items = getChildren(itemsParent = self);
        }
        var _loop = function _loop(i) {
            var v = items[i],
                attributes = getAttributes(v);
            forEachArray(['disabled', 'selected'], function (k) {
                if (k in attributes) {
                    attributes[k] = "" === attributes[k] ? true : attributes[k];
                    if ('selected' === k) {
                        selected.push(i);
                    }
                } else {
                    attributes[k] = null;
                }
            });
            if ('optgroup' === getName(v)) {
                forEachMap(getOptions(v), function (vv, kk) {
                    vv[1]['&'] = v.label;
                    setValueInMap(_toValue(kk), vv, map);
                });
                return 1; // continue
            }
            setValueInMap(_toValue(v.value), [getText(v) || v.value, attributes, null, v], map);
        };
        for (var i = 0, j = toCount(items); i < j; ++i) {
            if (_loop(i)) continue;
        }
        // If there is no selected option(s), get it from the current value
        if (0 === toCount(selected) && (item = getValueInMap(value = _toValue(value), map))) {
            item[1].selected = true;
            setValueInMap(value, item, map);
        }
        return map;
    }

    function getReference(key) {
        return getValueInMap(key, references) || null;
    }

    function getValue(self) {
        return (self.value || "").replace(/\r/g, "");
    }

    function getValueInMap(k, map) {
        return map.get(k);
    }

    function hasKeyInMap(k, map) {
        return map.has(k);
    }

    function isDisabled(self) {
        return self.disabled;
    }

    function isReadOnly(self) {
        return self.readOnly;
    }

    function letReference(k) {
        return letValueInMap(k, references);
    }

    function letValueInMap(k, map) {
        if (map instanceof OptionPickerOptions) {
            return map.let(k);
        }
        return map.delete(k);
    }

    function scrollTo(node, view) {
        node.scrollIntoView({
            block: 'nearest'
        });
    }

    function setReference(key, value) {
        return setValueInMap(key, value, references);
    }

    function setValueInMap(k, v, map) {
        return map.set(k, v);
    }

    function toValueFirstFromMap(map) {
        return toValuesFromMap(map).shift();
    }

    function toValuesFromMap(map) {
        var out = [];
        forEachMap(map, function (v) {
            return out.push(v);
        });
        return out;
    }

    function OptionPicker(self, state) {
        var $ = this;
        if (!self) {
            return $;
        }
        // Return new instance if `OptionPicker` was called without the `new` operator
        if (!isInstance($, OptionPicker)) {
            return new OptionPicker(self, state);
        }
        setReference(self, hook($, OptionPicker._));
        return $.attach(self, _fromStates({}, OptionPicker.state, state || {}));
    }
    OptionPicker.from = function (self, state) {
        return new OptionPicker(self, state);
    };
    OptionPicker.of = getReference;
    OptionPicker.state = {
        'n': 'option-picker',
        'options': null,
        'size': null,
        'strict': false,
        'with': []
    };
    OptionPicker.version = '2.0.0';
    defineProperty(OptionPicker, 'name', {
        value: name
    });
    var $$ = OptionPicker._ = OptionPicker.prototype;
    defineProperty($$, 'options', {
        get: function get() {
            return this._options;
        },
        set: function set(options) {
            var $ = this,
                _mask = $._mask,
                state = $.state,
                n = state.n,
                option;
            n += '__option';
            if (isFloat(options) || isInteger(options) || isString(options)) {
                options = [options];
            }
            createOptionsFrom($, options, _mask.options);
            if (option = toValuesFromMap($._options).find(function (v) {
                    return !v[2].hidden && !hasClass(v[2], n + '--disabled');
                })) {
                $.value = getOptionValue(option[2]);
            }
        }
    });
    defineProperty($$, 'size', {
        get: function get() {
            var size = this.state.size || 1;
            if (!isInteger(size)) {
                return 1;
            }
            return size < 1 ? 1 : size; // <https://html.spec.whatwg.org#attr-select-size>
        },
        set: function set(value) {
            var $ = this,
                _mask = $._mask,
                _options = $._options,
                mask = $.mask,
                state = $.state,
                options = _mask.options;
            state.n;
            var size = !isInteger(value) ? 1 : value < 1 ? 1 : value;
            $.state.size = size;
            if (1 === size) {
                letDatum(mask, 'size');
                letStyle(options, 'max-height');
                letReference(R);
            } else {
                var option = toValuesFromMap(_options).find(function (_option) {
                    return !_option[2].hidden;
                });
                if (option) {
                    var _ref, _getStyle;
                    var optionsGap = getStyle(options, 'gap'),
                        optionsPaddingBottom = getStyle(options, 'padding-bottom'),
                        optionHeight = (_ref = (_getStyle = getStyle(option, 'height')) != null ? _getStyle : getStyle(option, 'min-height')) != null ? _ref : getStyle(option, 'line-height');
                    setDatum(mask, 'size', size);
                    setStyle(options, 'max-height', 'calc((' + optionHeight + ' + max(' + optionsGap + ',' + optionsPaddingBottom + '))*' + size + ')');
                    setReference(R, $);
                }
            }
        }
    });
    defineProperty($$, 'text', {
        get: function get() {
            var $ = this,
                _mask = $._mask,
                input = _mask.input,
                text = _mask.text;
            return text ? getText(input) : null;
        },
        set: function set(value) {
            var $ = this,
                _mask = $._mask,
                self = $.self,
                hint = _mask.hint,
                input = _mask.input,
                text = _mask.text;
            if (text) {
                setText(input, _fromValue(value));
                if (getText(input, false)) {
                    setText(hint, "");
                } else {
                    setText(hint, self.placeholder + "");
                }
            }
        }
    });
    defineProperty($$, 'value', {
        get: function get() {
            var value = getValue(this.self);
            return "" === value ? null : value;
        },
        set: function set(value) {
            var $ = this,
                _options = $._options,
                mask = $.mask,
                state = $.state,
                n = state.n,
                v;
            if (v = getValueInMap(_toValue(value), _options)) {
                selectToOption(v[2], $);
                letClass(mask, n += '--focus');
                letClass(mask, n + '-option');
                letClass(mask, n + '-self');
                letClass(mask, n + '-text');
            }
        }
    });
    // TODO: `<select multiple>`
    defineProperty($$, 'values', {
        get: function get() {},
        set: function set(values) {}
    });
    var filter = debounce(function ($, input, _options, selectOnly) {
        var query = isString(input) ? input : getText(input) || "",
            q = toCaseLower(query),
            _event = $._event,
            _mask = $._mask,
            mask = $.mask,
            self = $.self,
            state = $.state,
            options = _mask.options;
        _mask.value;
        var n = state.n,
            strict = state.strict,
            hasSize = getDatum(mask, 'size');
        n += '__option--disabled';
        if (selectOnly) {
            try {
                forEachMap(_options, function (v) {
                    var text = toCaseLower(getText(v[2]) + '\t' + getOptionValue(v[2]));
                    if ("" !== q && q === text.slice(0, toCount(q)) && !hasClass(v[2], n)) {
                        selectToOption(v[2], $);
                        if (hasSize) {
                            scrollTo(v[2], options);
                        }
                        throw "";
                    }
                });
            } catch (e) {}
        } else {
            var count = _options.count;
            focusToOptionsNone($);
            forEachMap(_options, function (v) {
                var text = toCaseLower(getText(v[2]) + '\t' + getOptionValue(v[2]));
                if ("" === q || hasValue(q, text)) {
                    v[2].hidden = false;
                } else {
                    v[2].hidden = true;
                    --count;
                }
            });
            options.hidden = !count;
            // Focus visually to the first option!
            if (strict) {
                focusToOptionFirst($);
            }
            self.value = strict ? "" : query;
        }
        $.fire('search', [_event, query]);
        var call = state.options;
        if (isFunction(call)) {
            call = call.call($, query);
            if (isInstance(call, Promise)) {
                call.then(function (v) {
                    createOptionsFrom($, v, options);
                    $.fire('load', [_event, v, query]);
                });
            } else {
                createOptionsFrom($, call, options);
            }
        }
    }, FILTER_COMMIT_TIME);

    function onBlurMask(e) {
        var $ = this,
            picker = getReference($),
            state = picker.state,
            n = state.n;
        picker._event = e;
        letClass($, n += '--focus');
        letClass($, n += '-self');
    }

    function onBlurOption(e) {
        var $ = this,
            picker = getReference($),
            mask = picker.mask,
            state = picker.state,
            n = state.n;
        picker._event = e;
        letClass(mask, n + '--focus-option');
        letClass($, n += '--focus');
        letClass($, n += '-option');
    }

    function onBlurTextInput(e) {
        var $ = this,
            picker = getReference($),
            state = picker.state,
            n = state.n,
            strict = state.strict;
        picker._event = e;
        letClass(mask, n + '--focus-text');
        letClass(text, n + '__text--focus');
        if (strict) {
            // Automatically select the first option, or select none!
            if (!selectToOptionFirst(picker)) {
                selectToOptionsNone(picker);
            }
        }
    }

    function onCutTextInput(e) {
        var $ = this,
            picker = getReference($),
            _mask = picker._mask,
            self = picker.self,
            hint = _mask.hint;
        picker._event = e;
        delay(function () {
            return setText(hint, getText($, false) ? "" : self.placeholder);
        }, 1)();
    }

    function onFocusMask(e) {
        var $ = this,
            picker = getReference($),
            state = picker.state,
            n = state.n;
        picker._event = e;
        setClass($, n += '--focus');
        setClass($, n += '-self');
    }

    function onFocusOption(e) {
        var $ = this,
            picker = getReference($),
            mask = picker.mask,
            state = picker.state,
            n = state.n;
        selectNone();
        picker._event = e;
        setClass(mask, n += '--focus');
        setClass(mask, n += '-option');
    }

    function onFocusSelf(e) {
        var $ = this,
            picker = getReference($);
        picker._event = e;
        picker.focus();
    }

    function onFocusTextInput(e) {
        var $ = this,
            picker = getReference($),
            _mask = picker._mask,
            mask = picker.mask;
        picker.self;
        var state = picker.state,
            input = _mask.input,
            text = _mask.text,
            n = state.n;
        picker._event = e;
        setClass(text, n + '__text--focus');
        setClass(mask, n += '--focus');
        setClass(mask, n += '-text');
        getText(input, false) ? selectTo($) : picker.enter().fit();
    }

    function onKeyDownTextInput(e) {
        var $ = this,
            exit,
            key = e.key,
            picker = getReference($),
            _mask = picker._mask,
            _options = picker._options,
            mask = picker.mask,
            self = picker.self,
            state = picker.state,
            hint = _mask.hint,
            input = _mask.input,
            n = state.n,
            strict = state.strict;
        picker._event = e;
        delay(function () {
            return setText(hint, getText($, false) ? "" : self.placeholder);
        }, 1)();
        if (KEY_DELETE_LEFT === key || KEY_DELETE_RIGHT === key || 1 === toCount(key)) {
            delay(function () {
                return picker.enter().fit();
            }, FILTER_COMMIT_TIME + 1)();
        }
        if (KEY_ARROW_DOWN === key || KEY_ARROW_UP === key || KEY_ENTER === key) {
            var currentOption = getValueInMap(_toValue(getValue(self)), _options);
            currentOption = currentOption ? currentOption[2] : 0;
            if (!currentOption || currentOption.hidden) {
                currentOption = toValueFirstFromMap(_options);
                currentOption = currentOption ? currentOption[2] : 0;
                while (currentOption && (hasClass(currentOption, n + '__option--disabled') || currentOption.hidden)) {
                    currentOption = getNext(currentOption);
                }
            }
            if (KEY_ENTER === key) {
                if (!hasClass(mask, n + '--open')) {
                    selectToOptionsNone(picker);
                    picker.enter();
                } else {
                    if (strict) {
                        if (selectToOptionFirst(picker)) {
                            picker.exit(), focusTo(input), selectTo(input);
                        }
                    }
                }
            }
            currentOption && focusTo(currentOption);
            exit = true;
        } else if (KEY_TAB === key) {
            picker.exit();
        } else {
            filter(picker, $, _options);
        }
        if (exit) {
            offEventDefault(e);
            offEventPropagation(e);
        }
    }
    var searchTerm = "",
        searchTermClear = debounce(function () {
            return searchTerm = "";
        }, SEARCH_CLEAR_TIME);

    function onKeyDownMask(e) {
        var $ = this,
            exit,
            key = e.key,
            keyIsAlt = e.altKey,
            keyIsCtrl = e.ctrlKey,
            picker = getReference($),
            _options = picker._options,
            self = picker.self;
        searchTermClear();
        if (isDisabled(self) || isReadOnly(self)) {
            return offEventDefault(e);
        }
        picker._event = e;
        if (KEY_DELETE_LEFT === key || KEY_DELETE_RIGHT === key) {
            searchTerm = "";
        } else if (KEY_ESCAPE === key) {
            searchTerm = "";
            picker.exit(exit = true);
        } else if (KEY_TAB === key) {
            searchTerm = "";
            picker.exit(!(exit = false));
        } else if (KEY_ARROW_DOWN === key || KEY_ARROW_UP === key || KEY_ENTER === key || KEY_PAGE_DOWN === key || KEY_PAGE_UP === key || "" === searchTerm && ' ' === key) {
            picker.enter(exit = true).fit();
        } else if (1 === toCount(key) && !keyIsAlt && !keyIsCtrl) {
            searchTerm += key;
        }
        if ("" !== searchTerm) {
            filter(picker, searchTerm, _options, exit = true);
        }
        exit && offEventDefault(e);
    }

    function onKeyDownOption(e) {
        var $ = this,
            exit,
            key = e.key,
            keyIsAlt = e.altKey,
            keyIsCtrl = e.ctrlKey,
            picker = getReference($),
            _mask = picker._mask;
        picker._options;
        picker.mask;
        var self = picker.self,
            state = picker.state,
            hint = _mask.hint;
        _mask.input;
        _mask.value;
        var n = state.n;
        n += '__option';
        var isInput = 'input' === getName(self),
            nextOption,
            parentOption,
            prevOption;
        picker._event = e;
        if (KEY_DELETE_LEFT === key) {
            picker.exit(exit = true);
        } else if (KEY_ENTER === key || KEY_ESCAPE === key || KEY_TAB === key || ' ' === key) {
            if (KEY_ESCAPE !== key) {
                selectToOption($, picker);
            }
            picker.exit(exit = KEY_TAB !== key);
        } else if (KEY_ARROW_DOWN === key || KEY_PAGE_DOWN === key) {
            exit = true;
            if (KEY_PAGE_DOWN === key && hasClass(parentOption = getParent($), n + '-group')) {
                nextOption = getNext(parentOption);
            } else {
                nextOption = getNext($);
            }
            // Skip disabled and hidden option(s)…
            while (nextOption && (hasClass(nextOption, n + '--disabled') || nextOption.hidden)) {
                nextOption = getNext(nextOption);
            }
            if (nextOption) {
                // Next option is a group?
                if (hasClass(nextOption, n + '-group')) {
                    nextOption = getChildFirst(nextOption);
                }
                // Is the last option?
            } else {
                // Is in a group?
                if ((parentOption = getParent($)) && hasClass(parentOption, n + '-group')) {
                    nextOption = getNext(parentOption);
                }
                // Next option is a group?
                if (nextOption && hasClass(nextOption, n + '-group')) {
                    nextOption = getChildFirst(nextOption);
                }
            }
            // Skip disabled and hidden option(s)…
            while (nextOption && (hasClass(nextOption, n + '--disabled') || nextOption.hidden)) {
                nextOption = getNext(nextOption);
            }
            nextOption ? focusToOption(nextOption, picker, 1) : focusToOptionFirst(picker, 1);
        } else if (KEY_ARROW_UP === key || KEY_PAGE_UP === key) {
            exit = true;
            if (KEY_PAGE_UP === key && hasClass(parentOption = getParent($), n + '-group')) {
                prevOption = getPrev(parentOption);
            } else {
                prevOption = getPrev($);
            }
            // Skip disabled and hidden option(s)…
            while (prevOption && (hasClass(prevOption, n + '--disabled') || prevOption.hidden)) {
                prevOption = getPrev(prevOption);
            }
            if (prevOption) {
                // Previous option is a group?
                if (hasClass(prevOption, n + '-group')) {
                    prevOption = getChildLast(prevOption);
                }
                // Is the first option?
            } else {
                // Is in a group?
                if ((parentOption = getParent($)) && hasClass(parentOption, n + '-group')) {
                    prevOption = getPrev(parentOption);
                }
                // Previous option is a group?
                if (prevOption && hasClass(prevOption, n + '-group')) {
                    prevOption = getChildLast(prevOption);
                }
            }
            // Skip disabled and hidden option(s)…
            while (prevOption && (hasClass(prevOption, n + '--disabled') || prevOption.hidden)) {
                prevOption = getPrev(prevOption);
            }
            prevOption ? focusToOption(prevOption, picker, 1) : focusToOptionLast(picker, 1);
        } else if (KEY_BEGIN === key) {
            exit = true;
            focusToOptionFirst(picker, 1);
        } else if (KEY_END === key) {
            exit = true;
            focusToOptionLast(picker, 1);
        } else {
            isInput && 1 === toCount(key) && !keyIsAlt && !keyIsCtrl && setText(hint, "");
            picker.exit(!(exit = false));
        }
        exit && (offEventDefault(e), offEventPropagation(e));
    }

    function onPasteTextInput(e) {
        var $ = this,
            picker = getReference($),
            _mask = picker._mask,
            self = picker.self,
            hint = _mask.hint;
        picker._event = e;
        delay(function () {
            return setText($, getText($));
        })(); // Convert to plain text
        delay(function () {
            return setText(hint, getText($, false) ? "" : self.placeholder);
        }, 1)();
    }

    function onPointerDownMask(e) {
        var $ = this,
            picker = getReference($),
            self = picker.self,
            state = picker.state,
            n = state.n,
            target = e.target;
        offEventDefault(e);
        if (isDisabled(self) || isReadOnly(self) || getDatum($, 'size')) {
            return;
        }
        picker._event = e;
        if (hasClass(target, n + '__options') || getParent(target, '.' + n + '__options')) {
            // The user is likely browsing the available option(s) by dragging the scroll bar
            return;
        }
        picker[hasClass($, n + '--open') ? 'exit' : 'enter'](true).fit();
    }
    var optionsScrollTop = 0;

    function onPointerDownOption(e) {
        var $ = this,
            picker = getReference($),
            _mask = picker._mask,
            mask = picker.mask,
            options = _mask.options;
        picker._event = e;
        // Select it immediately, then close the option(s) list when the event occurs with a mouse
        if ('mousedown' === e.type) {
            selectToOption($, picker);
            if (!getDatum(mask, 'size')) {
                picker.exit(true);
            }
            // Must be a `touchstart` event, just focus on the option. To touch an option does not always mean to select it, the
            // user may be about to scroll the option(s) list
        } else {
            focusTo($), optionsScrollTop = getScroll(options)[1];
        }
        offEventDefault(e);
    }
    var touchTop = false;

    function onPointerDownRoot(e) {
        if ('touchstart' === e.type) {
            touchTop = e.touches[0].clientY;
        }
        var $ = this,
            picker = getReference($);
        if (!picker) {
            return;
        }
        var mask = picker.mask,
            state = picker.state,
            n = state.n,
            target = e.target;
        picker._event = e;
        if (mask !== target && mask !== getParent(target, '.' + n)) {
            if (getDatum(mask, 'size')) {
                picker.blur();
            } else {
                letReference($);
                picker.exit();
                console.log('TODO: Remove all focus states!');
            }
        }
    }

    function onPointerMoveRoot(e) {
        if (false === touchTop) {
            return;
        }
        var $ = this,
            picker = getReference($);
        picker._event = e;
        if ('touchmove' === e.type && picker) {
            var _mask = picker._mask,
                options = _mask.options,
                touchTopCurrent = e.touches[0].clientY;
            // Programmatically re-enable the swipe feature in the option(s) list because the default `touchstart` event was
            // disabled. It does not have the innertia effect as in the native after-swipe reaction, but it is better than
            // doing nothing :\
            if (options) {
                var scroll = getScroll(options);
                scroll[1] -= touchTopCurrent - touchTop;
                setScroll(options, scroll);
                touchTop = touchTopCurrent;
            }
        }
    }

    function onPointerUpOption(e) {
        var $ = this,
            picker = getReference($),
            _mask = picker._mask,
            options = _mask.options;
        picker._event = e;
        // Select it, then close the option(s) list if the `touchstart` (that was done before this `touchend` event) event
        // is not intended to perform a scroll action. This is done by comparing the scroll offset of the option(s) list at
        // the first time `touchstart` event is fired with the scroll offset of the option(s) list when `touchend` event
        // (this event) is fired. If it has a difference, then it scrolls ;)
        if (getScroll(options)[1] === optionsScrollTop) {
            selectToOption($, picker), picker.exit(true);
        }
    }

    function onPointerUpRoot() {
        touchTop = false;
    }

    function onResetForm(e) {
        var $ = this,
            picker = getReference($);
        picker._event = e;
        picker.let().fire('reset', [e]);
    }

    function onResizeWindow(e) {
        var $ = this,
            picker = getReference($);
        if (!picker) {
            return;
        }
        bounce(picker), picker._event = e;
    }

    function onScrollWindow(e) {
        onResizeWindow.call(this, e);
    }

    function onSubmitForm(e) {
        var $ = this,
            picker = getReference($);
        picker._event = e;
        return picker.fire('submit', [e]);
    }

    function selectNone(node) {
        var selection = D.getSelection();
        {
            // selection.removeAllRanges();
            if (selection.rangeCount) {
                selection.removeRange(selection.getRangeAt(0));
            }
        }
    }

    function selectTo(node, mode) {
        var selection = D.getSelection();
        selectNone();
        var range = D.createRange();
        range.selectNodeContents(node);
        selection.addRange(range);
        if (1 === mode) {
            selection.collapseToEnd();
        } else if (-1 === mode) {
            selection.collapseToStart();
        }
    }

    function selectToOption(option, picker) {
        var _event = picker._event,
            _mask = picker._mask;
        picker._options;
        var mask = picker.mask,
            self = picker.self,
            state = picker.state,
            hint = _mask.hint,
            input = _mask.input,
            value = _mask.value,
            n = state.n;
        letClass(mask, n + '--focus-self');
        setClass(mask, n + '--focus');
        setClass(mask, n + '--focus-option');
        n += '__option--selected';
        if (option) {
            var a = getValue(self),
                b;
            selectToOptionsNone(picker);
            setAttribute(option._[OPTION_SELF], 'selected', "");
            setClass(option, n);
            self.value = b = getOptionValue(option);
            if ('input' === getName(self)) {
                setText(hint, "");
                setText(input, getText(option));
            } else {
                setDatum(value, 'value', b);
                setHTML(value, getHTML(option));
            }
            if (b !== a) {
                picker.fire('change', [_event, b]);
            }
            return option;
        }
    }

    function selectToOptionFirst(picker, k) {
        var _options = picker._options,
            state = picker.state,
            n = state.n,
            option;
        n += '__option--disabled';
        if (option = toValuesFromMap(_options)['find' + ("")](function (v) {
                return !v[2].hidden && !hasClass(v[2], n);
            })) {
            return selectToOption(option[2], picker);
        }
    }

    function selectToOptionsNone(picker, hook) {
        picker._event;
        var _mask = picker._mask,
            _options = picker._options,
            mask = picker.mask,
            self = picker.self,
            state = picker.state,
            hint = _mask.hint,
            input = _mask.input,
            options = _mask.options,
            value = _mask.value,
            n = state.n;
        options.hidden = false;
        letClass(mask, n + '--focus-option');
        setClass(mask, n + '--focus');
        setClass(mask, n + '--focus-self');
        n += '__option--selected';
        getValue(self);
        forEachMap(_options, function (v) {
            letAttribute(v[3], 'selected');
            letClass(v[2], n);
            v[2].hidden = false;
        });
        self.value = "";
        if ('input' === getName(self)) {
            setText(hint, self.placeholder);
            setText(input, "");
        } else {
            letDatum(value, 'value');
            setHTML(value, "");
        }
    }
    $$.attach = function (self, state) {
        var _state$size;
        var $ = this;
        self = self || $.self;
        state = state || $.state;
        $._active = !isDisabled(self) && !isReadOnly(self);
        $._event = null;
        $._options = new OptionPickerOptions($);
        $._value = getValue(self) || null;
        $.self = self;
        $.state = state;
        var isInput = 'input' === getName(self),
            _state = state,
            n = _state.n;
        var arrow = setElement('span', {
            'class': n + '__arrow'
        });
        var form = getParentForm(self);
        var mask = setElement('div', {
            'class': n,
            'tabindex': isDisabled(self) || isInput ? false : 0
        });
        $.mask = mask;
        var maskOptions = setElement('div', {
            'class': n + '__options'
        });
        var maskValues = setElement('div', {
            'class': n + '__values'
        });
        var text = setElement('span', {
            'class': n + '__' + (isInput ? 'text' : 'value')
        });
        var textInput = setElement('span', {
            'autocapitalize': 'off',
            'contenteditable': isDisabled(self) || isReadOnly(self) || !isInput ? false : "",
            'spellcheck': !isInput ? false : 'false'
        });
        var textInputHint = setElement('span', isInput ? self.placeholder + "" : "");
        setChildLast(mask, maskValues);
        setChildLast(mask, maskOptions);
        setChildLast(maskValues, text);
        setChildLast(maskValues, arrow);
        if (isInput) {
            onEvent('blur', textInput, onBlurTextInput);
            onEvent('cut', textInput, onCutTextInput);
            onEvent('focus', textInput, onFocusTextInput);
            onEvent('keydown', textInput, onKeyDownTextInput);
            onEvent('paste', textInput, onPasteTextInput);
            setChildLast(text, textInput);
            setChildLast(text, textInputHint);
            setReference(textInput, $);
        } else {
            onEvent('blur', mask, onBlurMask);
            onEvent('focus', mask, onFocusMask);
            onEvent('keydown', mask, onKeyDownMask);
        }
        setClass(self, n + '__self');
        setNext(self, mask);
        if (form) {
            onEvent('reset', form, onResetForm);
            onEvent('submit', form, onSubmitForm);
            setReference(form, $);
        }
        onEvent('focus', self, onFocusSelf);
        onEvent('mousedown', R, onPointerDownRoot);
        onEvent('mousedown', mask, onPointerDownMask);
        onEvent('mousemove', R, onPointerMoveRoot);
        onEvent('mouseup', R, onPointerUpRoot);
        onEvent('resize', W, onResizeWindow);
        onEvent('scroll', W, onScrollWindow);
        onEvent('touchend', R, onPointerUpRoot);
        onEvent('touchmove', R, onPointerMoveRoot, {
            passive: false
        });
        onEvent('touchstart', R, onPointerDownRoot);
        onEvent('touchstart', mask, onPointerDownMask);
        self.tabIndex = -1;
        setReference(mask, $);
        var _mask = {},
            option;
        _mask.arrow = arrow;
        _mask.hint = isInput ? textInputHint : null;
        _mask.input = isInput ? textInput : null;
        _mask.of = self;
        _mask.options = maskOptions;
        _mask.self = mask;
        _mask[isInput ? 'text' : 'value'] = text;
        $._mask = _mask;
        $.size = (_state$size = state.size) != null ? _state$size : isInput ? 1 : self.size;
        var _state2 = state,
            options = _state2.options;
        if (isFunction(options)) {
            options = options.call($, null);
            if (isInstance(options, Promise)) {
                options.then(function (options) {
                    createOptionsFrom($, options, maskOptions);
                    $.fire('load', [$._event, options, null]);
                });
            } else {
                createOptionsFrom($, options, maskOptions);
            }
        } else {
            createOptionsFrom($, options || getOptions(self), maskOptions);
        }
        // Attach the current value(s)
        if (option = getValueInMap(_toValue($._value), $._options) || (isInput ? 0 : toValuesFromMap($._options).find(function (_option) {
                return !isDisabled(_option[3]);
            }))) {
            $.value = getOptionValue(option[2]);
        }
        // Attach extension(s)
        if (isSet(state) && isArray(state.with)) {
            for (var i = 0, j = toCount(state.with); i < j; ++i) {
                var value = state.with[i];
                if (isString(value)) {
                    value = OptionPicker[value];
                }
                // `const Extension = function (self, state = {}) {}`
                if (isFunction(value)) {
                    value.call($, self, state);
                    continue;
                }
                // `const Extension = {attach: function (self, state = {}) {}, detach: function (self, state = {}) {}}`
                if (isObject(value) && isFunction(value.attach)) {
                    value.attach.call($, self, state);
                    continue;
                }
            }
        }
        return $;
    };
    $$.blur = function () {
        selectNone();
        var $ = this,
            _mask = $._mask,
            mask = $.mask,
            input = _mask.input;
        return (input || mask).blur(), $.exit();
    };
    $$.detach = function () {
        var $ = this,
            _mask = $._mask,
            mask = $.mask,
            self = $.self,
            state = $.state,
            input = _mask.input;
        var form = getParentForm(self);
        $._active = false;
        $._options = new OptionPickerOptions($);
        $._value = getValue(self) || null; // Update initial value to be the current value
        if (form) {
            offEvent('reset', form, onResetForm);
            offEvent('submit', form, onSubmitForm);
        }
        if (input) {
            offEvent('blur', input, onBlurTextInput);
            offEvent('blur', mask, onBlurMask);
            offEvent('cut', input, onCutTextInput);
            offEvent('focus', input, onFocusTextInput);
            offEvent('focus', mask, onFocusMask);
            offEvent('keydown', input, onKeyDownTextInput);
            offEvent('keydown', mask, onKeyDownMask);
            offEvent('paste', input, onPasteTextInput);
        }
        offEvent('focus', self, onFocusSelf);
        offEvent('mousedown', R, onPointerDownRoot);
        offEvent('mousedown', mask, onPointerDownMask);
        offEvent('mousemove', R, onPointerMoveRoot);
        offEvent('mouseup', R, onPointerUpRoot);
        offEvent('resize', W, onResizeWindow);
        offEvent('scroll', W, onScrollWindow);
        offEvent('touchend', R, onPointerUpRoot);
        offEvent('touchmove', R, onPointerMoveRoot);
        offEvent('touchstart', R, onPointerDownRoot);
        offEvent('touchstart', mask, onPointerDownMask);
        // Detach extension(s)
        if (isArray(state.with)) {
            for (var i = 0, j = toCount(state.with); i < j; ++i) {
                var value = state.with[i];
                if (isString(value)) {
                    value = OptionPicker[value];
                }
                if (isObject(value) && isFunction(value.detach)) {
                    value.detach.call($, self, state);
                    continue;
                }
            }
        }
        self.tabIndex = null;
        letClass(self, state.n + '__self');
        letElement(mask);
        $._mask = {
            of: self
        };
        $.mask = null;
        return $;
    };
    $$.enter = function (focus) {
        var $ = this,
            option,
            _event = $._event,
            _mask = $._mask,
            _options = $._options,
            mask = $.mask,
            self = $.self,
            state = $.state,
            input = _mask.input,
            n = state.n;
        setClass(mask, n + '--open');
        setClass(mask, n += '--focus');
        letClass(mask, n + '-self');
        setClass(mask, n + '-option');
        var theRootReference = getReference(R);
        if (theRootReference && $ !== theRootReference) {
            theRootReference.exit(); // Exit other(s)
        }
        setReference(R, $); // Link current picker to the root target
        setReference(W, $);
        $.fire('enter', [_event]);
        if (focus) {
            if ('input' === getName(self)) {
                focusTo(input), selectTo(input);
            } else if (option = getValueInMap(_toValue(getValue(self)), _options)) {
                focusTo(option[2]);
            }
            $.fire('focus', [_event]).fire('focus.option', [_event]);
        }
        return $;
    };
    $$.exit = function (focus) {
        var $ = this,
            _event = $._event,
            _mask = $._mask,
            mask = $.mask,
            self = $.self,
            state = $.state,
            input = _mask.input,
            n = state.n;
        if (hasClass(mask, n + '--open')) {
            letClass(mask, n + '--open');
            setClass(mask, n += '--focus');
            letClass(mask, n + '-option');
            setClass(mask, n + '-self');
        } else {
            letClass(mask, n += '--focus');
            letClass(mask, n + '-self');
        }
        $.fire('exit', [_event]);
        if (focus) {
            if ('input' === getName(self)) {
                focusTo(input), selectTo(input);
            } else {
                focusTo(mask);
            }
            $.fire('focus', [_event]).fire('focus.self', [_event]);
        }
        return $;
    };
    $$.fit = function () {
        var $ = this,
            _mask = $._mask,
            mask = $.mask,
            options = _mask.options;
        if (getDatum(mask, 'size')) {
            return $;
        }
        var borderMaskBottom = getStyle(mask, 'border-bottom-width'),
            borderMaskTop = getStyle(mask, 'border-top-width'),
            rectMask = getRect(mask),
            rectWindow = getRect(W);
        if (rectMask[1] + rectMask[3] / 2 > rectWindow[3] / 2) {
            setStyles(options, {
                'bottom': '100%',
                'max-height': 'calc(' + rectMask[1] + 'px + ' + borderMaskBottom + ')',
                'top': 'auto'
            });
        } else {
            setStyles(options, {
                'bottom': 'auto',
                'max-height': 'calc(' + (rectWindow[3] - rectMask[1] - rectMask[3]) + 'px + ' + borderMaskTop + ')',
                'top': '100%'
            });
        }
        return $;
    };
    $$.focus = function (mode) {
        var $ = this,
            _mask = $._mask,
            mask = $.mask,
            input = _mask.input;
        if (input) {
            return focusTo(input), selectTo(input, mode), $;
        }
        return focusTo(mask), $;
    };

    function OptionPickerOptions(of, options) {
        var $ = this;
        if (!isInstance($, OptionPickerOptions)) {
            return new OptionPickerOptions(of, options);
        }
        $.count = 0;
        $.map = new Map();
        $.of = of;
        if (options && toCount(options)) {
            createOptionsFrom(of, options, of._mask.options);
        }
        return $;
    }
    defineProperty(OptionPickerOptions, 'name', {
        value: 'Options'
    });
    var $$$ = OptionPickerOptions.prototype;
    $$$.get = function (key) {
        return getValueInMap(_toValue(key), this.map);
    };
    $$$.has = function (key) {
        return hasKeyInMap(_toValue(key), this.map);
    };
    $$$.let = function (key) {
        var $ = this,
            map = $.map,
            r;
        if (!isSet(key)) {
            forEachMap(map, function (v, k) {
                return $.let(k);
            });
            return 0 === $.count;
        }
        if (!(r = $.get(_toValue(key)))) {
            return false;
        }
        offEvent('blur', r[2], onBlurOption);
        offEvent('focus', r[2], onFocusOption);
        offEvent('keydown', r[2], onKeyDownOption);
        offEvent('mousedown', r[2], onPointerDownOption);
        offEvent('touchend', r[2], onPointerUpOption);
        offEvent('touchstart', r[2], onPointerDownOption);
        letElement(r[2]), letElement(r[3]);
        if (r = letValueInMap(_toValue(key), map)) {
            --$.count;
        }
        return r;
    };
    $$$.set = function (key, value) {
        var $ = this;
        if ($.has(key)) {
            return $;
        }
        var itemsParent,
            option,
            optionReal,
            optionGroup,
            optionGroupReal,
            map = $.map,
            of = $.of,
            _mask = of._mask,
            self = of.self,
            state = of.state,
            options = _mask.options,
            n = state.n;
        n += '__option';
        if ('input' === getName(self)) {
            (itemsParent = self.list) ? getChildren(itemsParent): [];
        } else {
            getChildren(itemsParent = self);
        }
        if (!isSet(value)) {
            value = [key, {}];
        } else if (isFloat(value) || isInteger(value) || isString(value)) {
            value = [value, {}];
        }
        if ('&' in value[1]) {
            optionGroup = getElement('.' + n + '-group[data-value="' + value[1]['&'].replace(/"/g, '\\"') + '"]', options);
            if (!optionGroup || getOptionValue(optionGroup) !== value[1]['&']) {
                setChildLast(options, optionGroup = setElement('span', {
                    'class': n + '-group',
                    'data-value': value[1]['&']
                }));
                setChildLast(itemsParent, optionGroupReal = setElement('optgroup', {
                    'label': value[1]['&']
                }));
            }
        } else {
            optionGroup = optionGroupReal = false;
        }
        var _value$ = value[1],
            disabled = _value$.disabled,
            selected = _value$.selected,
            v = _value$.value;
        if (isDisabled(self)) {
            disabled = true;
        }
        v = _fromValue(v || key);
        option = value[2] || setElement('span', _fromValue(value[0]), {
            'class': n + (disabled ? ' ' + n + '--disabled' : "") + (selected ? ' ' + n + '--selected' : ""),
            'data-group': '&' in value[1] ? value[1]['&'] : false,
            'data-value': v,
            'tabindex': disabled ? false : -1
        });
        optionReal = value[3] || setElement('option', _fromValue(value[0]), {
            'disabled': disabled ? "" : false,
            'selected': selected ? "" : false,
            'value': v
        });
        option._ = {};
        option._[OPTION_SELF] = optionReal;
        if (!disabled && !value[2]) {
            onEvent('blur', option, onBlurOption);
            onEvent('focus', option, onFocusOption);
            onEvent('keydown', option, onKeyDownOption);
            onEvent('mousedown', option, onPointerDownOption);
            onEvent('touchend', option, onPointerUpOption);
            onEvent('touchstart', option, onPointerDownOption);
        }
        setChildLast(optionGroup || options, option);
        setChildLast(optionGroupReal || itemsParent, optionReal);
        setReference(option, of);
        value[2] = option;
        value[3] = optionReal;
        ++$.count;
        return setValueInMap(key, value, map), $;
    };
    OptionPicker.Options = OptionPickerOptions;
    return OptionPicker;
}));