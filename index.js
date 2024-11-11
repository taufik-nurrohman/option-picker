/*!
 *
 * The MIT License (MIT)
 *
 * Copyright © 2024 Taufik Nurrohman <https://github.com/taufik-nurrohman>
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

    function createOptions(options, values) {
        var $ = this,
            optionGroup,
            self = $.self,
            state = $.state,
            n = state.n;
        n += '__option';
        values = isInstance(values, Map) && values.size > 0 ? values : getOptions(self);
        forEachMap(values, function (v, k) {
            if ('data-group' in v[1]) {
                if (!optionGroup || getDatum(optionGroup, 'value', false) !== v[1]['data-group']) {
                    setChildLast(options, optionGroup = setElement('span', {
                        'class': n + '-group',
                        'data-value': v[1]['data-group']
                    }));
                }
            } else {
                optionGroup = false;
            }
            var _v$ = v[1],
                disabled = _v$.disabled,
                selected = _v$.selected,
                value = _v$.value;
            if (isDisabled(self)) {
                disabled = true;
            }
            var option = setElement('span', v[0], {
                'class': n + (disabled ? ' ' + n + '--disabled' : "") + (selected ? ' ' + n + '--selected' : ""),
                'data-value': _fromValue(value || k),
                'tabindex': disabled ? false : -1
            });
            if (!disabled) {
                onEvent('blur', option, onBlurOption);
                onEvent('focus', option, onFocusOption);
                onEvent('keydown', option, onKeyDownOption);
                onEvent('mousedown', option, onPointerDownOption);
                onEvent('touchend', option, onPointerUpOption);
                onEvent('touchstart', option, onPointerDownOption);
            }
            option._ = {};
            option._[OPTION_SELF] = v[2];
            setChildLast(optionGroup || options, option);
            setReference(option, $);
            setValueInMap(k, option, $._options);
        });
        $.state.options = values;
    }

    function createOptionsCall($, options, maskOptions) {
        var map = new Map();
        if (isArray(options)) {
            forEachArray(options, function (option) {
                if (isArray(option)) {
                    var _option$, _option$2;
                    option[0] = (_option$ = option[0]) != null ? _option$ : "";
                    option[1] = (_option$2 = option[1]) != null ? _option$2 : {};
                    setValueInMap(option[0], option, map);
                } else {
                    setValueInMap(option, [option, {}], map);
                }
            });
        } else if (isObject(options)) {
            for (var k in options) {
                if (isArray(options[k])) {
                    var _options$k$, _options$k$2;
                    options[k][0] = (_options$k$ = options[k][0]) != null ? _options$k$ : "";
                    options[k][1] = (_options$k$2 = options[k][1]) != null ? _options$k$2 : {};
                    setValueInMap(k, options[k], map);
                } else {
                    setValueInMap(k, [options[k], {}], map);
                }
            }
        }
        createOptions.call($, maskOptions, map);
    }

    function defineProperty(of, key, state) {
        Object.defineProperty(of, key, state);
    }

    function focusTo(node) {
        node.focus();
    }

    function forEachArray(array, then) {
        array.forEach(then);
    }

    function forEachMap(map, then) {
        forEachArray(map, then);
    }

    function getOptions(self) {
        var map = new Map();
        var value = getValue(self);
        var item,
            items,
            selected = [];
        if ('input' === getName(self)) {
            items = self.list;
            items = items ? items.children : [];
        } else {
            items = self.children;
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
                    vv[1]['data-group'] = v.label;
                    setValueInMap(kk, vv, map);
                });
                return 1; // continue
            }
            setValueInMap(v.value, [getText(v) || v.value, attributes, v], map);
        };
        for (var i = 0, j = toCount(items); i < j; ++i) {
            if (_loop(i)) continue;
        }
        // If there is no selected option(s), get it from the current value
        if (0 === toCount(selected) && (item = getValueInMap(value, map))) {
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
        setReference(self, hook($, OptionPicker.prototype));
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
    var $$ = OptionPicker.prototype;
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
                    return !_option.hidden;
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
    defineProperty($$, 'value', {
        get: function get() {
            var value = getValue(this.self);
            return "" === value ? null : value;
        },
        set: function set(value) {
            var $ = this;
            $.fire('change', [_toValue(value)]);
        }
    });
    var filter = debounce(function ($, input, _options, selectOnly) {
        var query = isString(input) ? input : getText(input) || "",
            q = toCaseLower(query),
            _mask = $._mask,
            mask = $.mask,
            self = $.self,
            state = $.state,
            options = _mask.options,
            value = _mask.value,
            n = state.n,
            hasSize = getDatum(mask, 'size');
        n += '__option';
        if (selectOnly) {
            var a = getValue(self),
                b;
            forEachMap(_options, function (v, k) {
                letAttribute(v._[OPTION_SELF], 'selected');
                letClass(v, n + '--selected');
            });
            try {
                forEachMap(_options, function (v, k) {
                    var text = toCaseLower(getText(v) + '\t' + (b = getDatum(v, 'value', false)));
                    if ("" !== q && q === text.slice(0, toCount(q)) && !hasClass(v, n + '--disabled')) {
                        self.value = b;
                        setAttribute(v._[OPTION_SELF], 'selected', "");
                        setClass(v, n + '--selected');
                        setDatum(value, 'value', b);
                        setHTML(value, getHTML(v));
                        if (b !== a) {
                            $.fire('change', [_toValue(b)]);
                        }
                        if (hasSize) {
                            scrollTo(v, options);
                        }
                        throw "";
                    }
                });
            } catch (e) {}
        } else {
            var count = _options.size;
            forEachMap(_options, function (v, k) {
                var text = toCaseLower(getText(v) + '\t' + getDatum(v, 'value', false));
                if (("" === q || hasValue(q, text)) && !hasClass(v, n + '--disabled')) {
                    v.hidden = false;
                } else {
                    v.hidden = true;
                    --count;
                }
            });
            options.hidden = !count;
        }
        $.fire('search', [query]);
        var optionsCall = state.options;
        if (isFunction(optionsCall)) {
            optionsCall = optionsCall.call($, query);
            if (isInstance(optionsCall, Promise)) {
                optionsCall.then(function (v) {
                    createOptionsCall($, v, options);
                    $.fire('load', [v, query]);
                });
            }
        }
    }, FILTER_COMMIT_TIME);

    function onBlurMask() {
        var $ = this,
            picker = getReference($),
            state = picker.state,
            n = state.n;
        letClass($, n += '--focus');
        letClass($, n += '-self');
    }

    function onBlurOption() {
        var $ = this,
            picker = getReference($);
        picker.mask;
        var state = picker.state,
            n = state.n;
        letClass($, n += '--focus');
        letClass($, n += '-option');
    }

    function onBlurTextInput() {
        var $ = this,
            picker = getReference($),
            _mask = picker._mask,
            mask = picker.mask,
            state = picker.state,
            text = _mask.text,
            n = state.n;
        letClass(mask, n + '--focus-text');
        letClass(text, n + '__text--focus');
    }

    function onCutTextInput() {
        var $ = this,
            picker = getReference($),
            _mask = picker._mask,
            self = picker.self,
            hint = _mask.hint;
        delay(function () {
            return setText(hint, getText($, false) ? "" : self.placeholder);
        }, 1)();
    }

    function onFocusMask() {
        var $ = this,
            picker = getReference($),
            state = picker.state,
            n = state.n;
        setClass($, n += '--focus');
        setClass($, n += '-self');
    }

    function onFocusOption() {
        var $ = this,
            picker = getReference($),
            mask = picker.mask,
            state = picker.state,
            n = state.n;
        selectNone();
        setClass(mask, n += '--focus');
        setClass(mask, n += '-option');
    }

    function onFocusSelf() {
        var $ = this,
            picker = getReference($);
        picker.focus();
    }

    function onFocusTextInput() {
        var $ = this,
            picker = getReference($),
            _mask = picker._mask,
            mask = picker.mask;
        picker.self;
        var state = picker.state,
            input = _mask.input,
            text = _mask.text,
            n = state.n;
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
            self = picker.self,
            state = picker.state,
            hint = _mask.hint,
            n = state.n;
        n += '__option--disabled';
        delay(function () {
            return setText(hint, getText($, false) ? "" : self.placeholder);
        }, 1)();
        if (KEY_DELETE_LEFT === key || KEY_DELETE_RIGHT === key || 1 === toCount(key)) {
            delay(function () {
                return picker.enter().fit();
            }, FILTER_COMMIT_TIME + 1)();
        }
        if (KEY_ARROW_DOWN === key || KEY_ARROW_UP === key || KEY_ENTER === key) {
            var currentOption = getValueInMap(getValue(self), _options);
            if (!currentOption || currentOption.hidden) {
                currentOption = toValueFirstFromMap(_options);
                while (currentOption && (hasClass(currentOption, n) || currentOption.hidden)) {
                    currentOption = getNext(currentOption);
                }
            }
            currentOption && focusTo(currentOption);
            exit = true;
        } else if (KEY_TAB === key) {
            if (state.strict);
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
            _mask = picker._mask,
            _options = picker._options;
        picker.mask;
        var self = picker.self,
            state = picker.state,
            hint = _mask.hint,
            input = _mask.input,
            value = _mask.value,
            n = state.n;
        n += '__option';
        var isInput = 'input' === getName(self),
            firstOption,
            lastOption,
            nextOption,
            parentOption,
            prevOption;
        if (KEY_DELETE_LEFT === key) {
            picker.exit(exit = true);
        } else if (KEY_ENTER === key || KEY_ESCAPE === key || KEY_TAB === key || ' ' === key) {
            if (KEY_ESCAPE !== key) {
                var a = getValue(self),
                    b;
                if (prevOption = getValueInMap(a, _options)) {
                    letAttribute(prevOption._[OPTION_SELF], 'selected');
                    letClass(prevOption, n + '--selected');
                }
                setAttribute($._[OPTION_SELF], 'selected', "");
                setClass($, n + '--selected');
                self.value = b = getDatum($, 'value', false);
                if (isInput) {
                    setText(hint, "");
                    setText(input, getText($));
                } else {
                    setDatum(value, 'value', b);
                    setHTML(value, getHTML($));
                }
                if (b !== a) {
                    picker.fire('change', [_toValue(b)]);
                }
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
            if (nextOption) {
                focusTo(nextOption);
            } else {
                firstOption = toValuesFromMap(_options).find(function (v) {
                    return !v.hidden && !hasClass(v, n + '--disabled');
                });
                firstOption && focusTo(firstOption);
            }
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
            if (prevOption) {
                focusTo(prevOption);
            } else {
                lastOption = toValuesFromMap(_options).findLast(function (v) {
                    return !v.hidden && !hasClass(v, n + '--disabled');
                });
                lastOption && focusTo(lastOption);
            }
        } else if (KEY_BEGIN === key) {
            exit = true;
            firstOption = toValuesFromMap(_options).find(function (v) {
                return !v.hidden && !hasClass(v, n + '--disabled');
            });
            firstOption && focusTo(firstOption);
        } else if (KEY_END === key) {
            exit = true;
            lastOption = toValuesFromMap(_options).findLast(function (v) {
                return !v.hidden && !hasClass(v, n + '--disabled');
            });
            lastOption && focusTo(lastOption);
        } else {
            isInput && 1 === toCount(key) && !keyIsAlt && !keyIsCtrl && setText(hint, "");
            picker.exit(!(exit = false));
        }
        exit && (offEventDefault(e), offEventPropagation(e));
    }

    function onPasteTextInput() {
        var $ = this,
            picker = getReference($),
            _mask = picker._mask,
            self = picker.self,
            hint = _mask.hint;
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
        if (mask !== target && mask !== getParent(target, '.' + n)) {
            if (getDatum(mask, 'size')) {
                picker.blur();
            } else {
                letReference($);
                picker.exit();
            }
        }
    }

    function onPointerMoveRoot(e) {
        if (false === touchTop) {
            return;
        }
        var $ = this,
            picker = getReference($);
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
        // Select it, then close the option(s) list if the `touchstart` (that was done before this `touchend` event) event
        // is not intended to perform a scroll action. This is done by comparing the scroll offset of the option(s) list at
        // the first time `touchstart` event is fired with the scroll offset of the option(s) list when `touchend` event
        // (this event) is fired. If it has a difference, then it scrolls ;)
        if (getScroll(options)[1] === optionsScrollTop) {
            selectToOption($, picker), picker.exit(true);
        }
    }

    function onPointerUpRoot(e) {
        touchTop = false;
    }

    function onResetForm(e) {
        var $ = this,
            picker = getReference($);
        picker.let().fire('reset', [e]);
    }

    function onResizeWindow() {
        var $ = this,
            picker = getReference($);
        picker && bounce(picker);
    }

    function onScrollWindow() {
        onResizeWindow.call(this);
    }

    function onSubmitForm(e) {
        var $ = this,
            picker = getReference($);
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

    function selectToOption($, picker) {
        var _mask = picker._mask,
            _options = picker._options,
            self = picker.self,
            state = picker.state,
            hint = _mask.hint,
            input = _mask.input;
        _mask.options;
        var value = _mask.value,
            n = state.n;
        n += '__option--selected';
        var a = getValue(self),
            b;
        forEachMap(_options, function (v, k) {
            if ($ === v) {
                return;
            }
            letAttribute(v._[OPTION_SELF], 'selected');
            letClass(v, n);
        });
        setAttribute($._[OPTION_SELF], 'selected', "");
        setClass($, n);
        self.value = b = getDatum($, 'value', false);
        if ('input' === getName(self)) {
            setText(hint, "");
            setText(input, getText($));
        } else {
            setDatum(value, 'value', b);
            setHTML(value, getHTML($));
        }
        if (b !== a) {
            picker.fire('change', [_toValue(b)]);
        }
    }
    $$.attach = function (self, state) {
        var _state$size;
        var $ = this;
        self = self || $.self;
        state = state || $.state;
        $._active = !isDisabled(self) && !isReadOnly(self);
        $._options = new Map();
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
        var _state2 = state,
            options = _state2.options;
        if (isFunction(options)) {
            options = options.call($, null);
            if (isInstance(options, Promise)) {
                options.then(function (options) {
                    createOptionsCall($, options, maskOptions);
                    $.fire('load', [options, null]);
                });
            }
        }
        if (!isInstance(options, Promise)) {
            createOptionsCall($, options, maskOptions);
        }
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
        _mask.root = R;
        _mask.self = mask;
        _mask[isInput ? 'text' : 'value'] = text;
        $._mask = _mask;
        $.size = (_state$size = state.size) != null ? _state$size : isInput ? 1 : self.size;
        // Attach the current value(s)
        if (option = getValueInMap($._value, $._options) || (isInput ? 0 : toValuesFromMap($._options).find(function (_option) {
                return !isDisabled(_option._[OPTION_SELF]);
            }))) {
            setAttribute(option._[OPTION_SELF], 'selected', "");
            if (isInput) {
                setText(textInput, getText(option));
                if (getText(textInput, false)) {
                    setText(textInputHint, "");
                }
            } else {
                setDatum(text, 'value', getDatum(option, 'value', false));
                setHTML(text, getHTML(option));
            }
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
            _mask = $._mask,
            _options = $._options,
            mask = $.mask,
            self = $.self,
            state = $.state,
            input = _mask.input,
            n = state.n;
        setClass(mask, n + '--focus');
        setClass(mask, n + '--focus-option');
        setClass(mask, n += '--open');
        var theRootReference = getReference(R);
        if (theRootReference && $ !== theRootReference) {
            theRootReference.exit(); // Exit other(s)
        }
        setReference(R, $); // Link current picker to the root target
        setReference(W, $);
        $.fire('enter');
        if (focus) {
            $.fire('focus');
            if ('input' === getName(self)) {
                focusTo(input), selectTo(input);
            } else if (option = getValueInMap(getValue(self), _options)) {
                focusTo(option);
            }
            $.fire('focus.option');
        }
        return $;
    };
    $$.exit = function (focus) {
        var $ = this,
            _mask = $._mask,
            mask = $.mask,
            self = $.self,
            state = $.state,
            input = _mask.input,
            n = state.n;
        letClass(mask, n + '--focus');
        letClass(mask, n + '--focus-option');
        letClass(mask, n += '--open');
        $.fire('exit');
        if (focus) {
            if ('input' === getName(self)) {
                focusTo(input), selectTo(input);
            } else {
                focusTo(mask);
            }
            $.fire('focus').fire('focus.self');
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
    return OptionPicker;
}));