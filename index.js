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

    function _arrayLikeToArray(r, a) {
        (null == a || a > r.length) && (a = r.length);
        for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
        return n;
    }

    function _arrayWithHoles(r) {
        if (Array.isArray(r)) return r;
    }

    function _createForOfIteratorHelperLoose(r, e) {
        var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
        if (t) return (t = t.call(r)).next.bind(t);
        if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || r && "number" == typeof r.length) {
            t && (r = t);
            var o = 0;
            return function () {
                return o >= r.length ? {
                    done: !0
                } : {
                    done: !1,
                    value: r[o++]
                };
            };
        }
        throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    function _iterableToArrayLimit(r, l) {
        var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
        if (null != t) {
            var e,
                n,
                i,
                u,
                a = [],
                f = !0,
                o = !1;
            try {
                if (i = (t = t.call(r)).next, 0 === l) {
                    if (Object(t) !== t) return;
                    f = !1;
                } else
                    for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
            } catch (r) {
                o = !0, n = r;
            } finally {
                try {
                    if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
                } finally {
                    if (o) throw n;
                }
            }
            return a;
        }
    }

    function _maybeArrayLike(r, a, e) {
        if (a && !Array.isArray(a) && "number" == typeof a.length) {
            var y = a.length;
            return _arrayLikeToArray(a, e < y ? e : y);
        }
        return r(a, e);
    }

    function _nonIterableRest() {
        throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    function _slicedToArray(r, e) {
        return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
    }

    function _unsupportedIterableToArray(r, a) {
        if (r) {
            if ("string" == typeof r) return _arrayLikeToArray(r, a);
            var t = {}.toString.call(r).slice(8, -1);
            return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
        }
    }
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
        return /^[+-]?(?:\d*\.)?\d+$/.test(x + "");
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
    var toString = function toString(x, base) {
        return isNumber(x) ? x.toString(base) : "" + x;
    };
    var _toValue = function toValue(x) {
        if (isArray(x)) {
            return x.map(function (v) {
                return _toValue(v);
            });
        }
        if (isObject(x)) {
            for (var k in x) {
                x[k] = _toValue(x[k]);
            }
            return x;
        }
        if (isString(x) && isNumeric(x)) {
            if ('0' === x[0] && -1 === x.indexOf('.')) {
                return x;
            }
            return toNumber(x);
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
    var forEachArray = function forEachArray(array, at) {
        for (var i = 0, j = toCount(array), v; i < j; ++i) {
            v = at(array[i], i);
            if (0 === v) {
                break;
            }
            if (1 === v) {
                continue;
            }
        }
        return array;
    };
    var forEachMap = function forEachMap(map, at) {
        for (var _iterator = _createForOfIteratorHelperLoose(map), _step; !(_step = _iterator()).done;) {
            var _step$value = _maybeArrayLike(_slicedToArray, _step.value, 2),
                k = _step$value[0],
                v = _step$value[1];
            v = at(v, k);
            if (0 === v) {
                break;
            }
            if (1 === v) {
                continue;
            }
        }
        return map;
    };
    var forEachObject = function forEachObject(object, at) {
        var v;
        for (var k in object) {
            v = at(object[k], k);
            if (0 === v) {
                break;
            }
            if (1 === v) {
                continue;
            }
        }
        return object;
    };
    var getPrototype = function getPrototype(of) {
        return of.prototype;
    };
    var getReference = function getReference(key) {
        return getValueInMap(key, references) || null;
    };
    var getValueInMap = function getValueInMap(k, map) {
        return map.get(k);
    };
    var hasKeyInMap = function hasKeyInMap(k, map) {
        return map.has(k);
    };
    var letReference = function letReference(k) {
        return letValueInMap(k, references);
    };
    var letValueInMap = function letValueInMap(k, map) {
        return map.delete(k);
    };
    var setObjectAttributes = function setObjectAttributes(of, attributes, asStaticAttributes) {
        if (!asStaticAttributes) {
            of = getPrototype(of);
        }
        return forEachObject(attributes, function (v, k) {
            return Object.defineProperty(of, k, v);
        }), of;
    };
    var setObjectMethods = function setObjectMethods(of, methods, asStaticMethods) {
        {
            of = getPrototype(of);
        }
        return forEachObject(methods, function (v, k) {
            return of [k] = v;
        }), of;
    };
    var setReference = function setReference(key, value) {
        return setValueInMap(key, value, references);
    };
    var setValueInMap = function setValueInMap(k, v, map) {
        return map.set(k, v);
    };
    var toValueFirstFromMap = function toValueFirstFromMap(map) {
        return toValuesFromMap(map).shift();
    };
    var toValuesFromMap = function toValuesFromMap(map) {
        var r = [];
        return forEachMap(map, function (v) {
            return r.push(v);
        }), r;
    };
    var references = new WeakMap();

    function _toArray(iterable) {
        return Array.from(iterable);
    }
    var D = document;
    var W = window;
    var B = D.body;
    var R = D.documentElement;
    var getAria = function getAria(node, aria, parseValue) {
        if (parseValue === void 0) {
            parseValue = true;
        }
        return getAttribute(node, 'aria-' + aria, parseValue);
    };
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
            values = {};
        forEachArray(attributes, function (v) {
            var name = v.name,
                value = v.value;
            values[name] = parseValue ? _toValue(value) : value;
        });
        return values;
    };
    var getChildFirst = function getChildFirst(parent, anyNode) {
        return parent['first' + (anyNode ? "" : 'Element') + 'Child'] || null;
    };
    var getChildLast = function getChildLast(parent, anyNode) {
        return parent['last' + (anyNode ? "" : 'Element') + 'Child'] || null;
    };
    var getChildren = function getChildren(parent, index, anyNode) {
        var children = _toArray(parent['child' + (anyNode ? 'Nodes' : 'ren')]);
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
    var getElementIndex = function getElementIndex(node, anyNode) {
        if (!node || !getParent(node)) {
            return -1;
        }
        var index = 0;
        while (node = getPrev(node, anyNode)) {
            ++index;
        }
        return index;
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
    var getID = function getID(node, batch) {
        if (batch === void 0) {
            batch = 'e:';
        }
        if (hasID(node)) {
            return getAttribute(node, 'id');
        }
        if (!isSet(theID[batch])) {
            theID[batch] = 0;
        }
        return batch + toString(Date.now() + (theID[batch] += 1), 16);
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
    var getRole = function getRole(node) {
        return getAttribute(node, 'role');
    };
    var getStyle = function getStyle(node, style, parseValue) {
        var value = W.getComputedStyle(node).getPropertyValue(style);
        return value || "" === value || 0 === value ? value : null;
    };
    var getState = function getState(node, state) {
        return hasState(node, state) && node[state] || null;
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
    var getType = function getType(node) {
        return node && node.nodeType || null;
    };
    var getValue = function getValue(node, parseValue) {
        var value = (node.value || "").replace(/\r?\n|\r/g, '\n');
        value = value;
        return "" !== value ? value : null;
    };
    var hasAttribute = function hasAttribute(node, attribute) {
        return node.hasAttribute(attribute);
    };
    var hasID = function hasID(node) {
        return hasAttribute(node, 'id');
    };
    var hasState = function hasState(node, state) {
        return state in node;
    };
    var isDisabled = function isDisabled(node) {
        return node.disabled;
    };
    var isReadOnly = function isReadOnly(node) {
        return node.readOnly;
    };
    var isWindow = function isWindow(node) {
        return node === W;
    };
    var letAria = function letAria(node, aria) {
        return letAttribute(node, 'aria-' + aria);
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
    var letHTML = function letHTML(node) {
        var state = 'innerHTML';
        return hasState(node, state) && (node[state] = ""), node;
    };
    var letStyle = function letStyle(node, style) {
        return node.style[toCaseCamel(style)] = null, node;
    };
    var setAria = function setAria(node, aria, value) {
        return setAttribute(node, 'aria-' + aria, true === value ? 'true' : value);
    };
    var setArias = function setArias(node, data) {
        return forEachObject(data, function (v, k) {
            v || "" === v || 0 === v ? setAria(node, k, v) : letAria(node, k);
        }), node;
    };
    var setAttribute = function setAttribute(node, attribute, value) {
        if (true === value) {
            value = attribute;
        }
        return node.setAttribute(attribute, _fromValue(value)), node;
    };
    var setAttributes = function setAttributes(node, attributes) {
        return forEachObject(attributes, function (v, k) {
            if ('aria' === k && isObject(v)) {
                return setArias(node, v), 1;
            }
            if ('class' === k) {
                return setClasses(node, v), 1;
            }
            if ('data' === k && isObject(v)) {
                return setData(node, v), 1;
            }
            if ('style' === k && isObject(v)) {
                return setStyles(node, v), 1;
            }
            v || "" === v || 0 === v ? setAttribute(node, k, v) : letAttribute(node, k);
        }), node;
    };
    var setChildLast = function setChildLast(parent, node) {
        return parent.append(node), node;
    };
    var setClass = function setClass(node, value) {
        return node.classList.add(value), node;
    };
    var setClasses = function setClasses(node, classes) {
        if (isArray(classes)) {
            return forEachArray(classes, function (k) {
                return setClass(node, k);
            }), node;
        }
        if (isObject(classes)) {
            return forEachObject(classes, function (v, k) {
                return v ? setClass(node, k) : letClass(node, k);
            }), node;
        }
        return node.className = classes, node;
    };
    var setData = function setData(node, data) {
        return forEachObject(data, function (v, k) {
            v || "" === v || 0 === v ? setDatum(node, k, v) : letDatum(node, k);
        }), node;
    };
    var setDatum = function setDatum(node, datum, value) {
        if (isArray(value) || isObject(value)) {
            value = toJSON(value);
        }
        return setAttribute(node, 'data-' + datum, true === value ? 'true' : value);
    };
    var setElement = function setElement(node, content, attributes, options) {
        node = isString(node) ? D.createElement(node, isString(options) ? {
            is: options
        } : options) : node;
        if (isArray(content) && toCount(content)) {
            letHTML(node);
            forEachArray(content, function (v) {
                return setChildLast(isString(v) ? setElementText(v) : v);
            });
        } else if (isObject(content)) {
            attributes = content;
            content = false;
        }
        if (isString(content)) {
            setHTML(node, content);
        }
        if (isObject(attributes)) {
            return setAttributes(node, attributes), node;
        }
        return node;
    };
    var setElementText = function setElementText(text) {
        return isString(text) ? text = D.createTextNode(text) : text, text;
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
    var setID = function setID(node, value, batch) {
        if (batch === void 0) {
            batch = 'e:';
        }
        return setAttribute(node, 'id', isSet(value) ? value : getID(node, batch));
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
        return forEachObject(styles, function (v, k) {
            v || "" === v || 0 === v ? setStyle(node, k, v) : letStyle(node, k);
        }), node;
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
    var setValue = function setValue(node, value) {
        if (null === value) {
            return letAttribute(node, 'value');
        }
        return node.value = _fromValue(value), node;
    };
    var theID = {};
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
    var _getSelection = function _getSelection() {
        return D.getSelection();
    };
    var _setRange = function _setRange() {
        return D.createRange();
    };
    // The `node` parameter is currently not in use
    var letSelection = function letSelection(node, selection) {
        selection = selection || _getSelection();
        return selection.empty(), selection;
    };
    // <https://stackoverflow.com/a/13950376/1163000>
    var restoreSelection = function restoreSelection(node, store, selection) {
        var index = 0,
            range = _setRange();
        range.setStart(node, 0);
        range.collapse(true);
        var exit,
            hasStart,
            nodeCurrent,
            nodeStack = [node];
        while (!exit && (nodeCurrent = nodeStack.pop())) {
            if (3 === getType(nodeCurrent)) {
                var indexNext = index + toCount(nodeCurrent);
                if (!hasStart && store[0] >= index && store[0] <= indexNext) {
                    range.setStart(nodeCurrent, store[0] - index);
                    hasStart = true;
                }
                if (hasStart && store[1] >= index && store[1] <= indexNext) {
                    exit = true;
                    range.setEnd(nodeCurrent, store[1] - index);
                }
                index = indexNext;
            } else {
                forEachArray(getChildren(nodeCurrent, null, 1), function (v) {
                    return nodeStack.push(v);
                });
            }
        }
        return setSelection(node, range, letSelection(node, selection));
    };
    var selectTo = function selectTo(node, mode, selection) {
        selection = selection || _getSelection();
        letSelection(node, selection);
        var range = _setRange();
        range.selectNodeContents(node);
        selection = setSelection(node, range, selection);
        if (1 === mode) {
            selection.collapseToEnd();
        } else if (-1 === mode) {
            selection.collapseToStart();
        } else;
    };
    var selectToNone = function selectToNone(selection) {
        selection = selection || _getSelection();
        // selection.removeAllRanges();
        if (selection.rangeCount) {
            selection.removeRange(selection.getRangeAt(0));
        }
        return selection;
    };
    // The `node` parameter is currently not in use
    var setSelection = function setSelection(node, range, selection) {
        selection = selection || _getSelection();
        if (isArray(range)) {
            return restoreSelection(node, range, selection);
        }
        return selection.addRange(range), selection;
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
    var FILTER_COMMIT_TIME = 10;
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

    function createOptions($, options, values) {
        var itemsParent,
            key,
            selected = [],
            _options = $._options,
            self = $.self,
            state = $.state;
        state.n;
        var value = getValue(self);
        if (isInput(self)) {
            (itemsParent = self.list) ? getChildren(itemsParent): [];
        } else {
            getChildren(itemsParent = self);
        }
        // Reset the option(s) data, but leave the typed query in place, and do not fire the `let.options` hook
        _options.delete(null, 0, 0);
        forEachMap(values, function (v, k) {
            var _v$1$value2;
            if (isArray(v) && v[1] && !v[1].disabled && v[1].selected) {
                var _v$1$value;
                selected.push(_toValue((_v$1$value = v[1].value) != null ? _v$1$value : k));
            }
            // Set the option data, but do not fire the `set.option` hook
            _options.set(_toValue(isArray(v) && v[1] ? (_v$1$value2 = v[1].value) != null ? _v$1$value2 : k : k), v, 0);
        });
        if (!isFunction(state.options)) {
            state.options = values;
        }
        if (0 === toCount(selected)) {
            // If there is no selected option(s), get it from the current value
            if (hasKeyInMap(key = _toValue(value), values)) {
                return [key];
            }
            // Or get it from the first option
            if (key = getOptionSelected($)) {
                return [getOptionValue(key, 1)];
            }
        }
        return selected;
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
            forEachObject(options, function (v, k) {
                if (isArray(v)) {
                    var _v$, _v$2, _v$1$value3;
                    options[k][0] = (_v$ = v[0]) != null ? _v$ : "";
                    options[k][1] = (_v$2 = v[1]) != null ? _v$2 : {};
                    setValueInMap(_toValue((_v$1$value3 = v[1].value) != null ? _v$1$value3 : k), v, map);
                } else {
                    setValueInMap(_toValue(k), [v, {}], map);
                }
            });
        }
        return createOptions($, maskOptions, map);
    }

    function focusTo(node) {
        return node.focus(), node;
    }

    function focusToOption(option) {
        if (option) {
            return focusTo(option), option;
        }
    }

    function focusToOptionFirst(k) {
        var option;
        if (option = goToOptionFirst(k)) {
            return focusToOption(option);
        }
    }

    function focusToOptionLast() {
        return focusToOptionFirst('Last');
    }

    function getOptionSelected($, strict) {
        var _options = $._options,
            self = $.self,
            selected;
        forEachMap(_options, function (v, k) {
            if (isArray(v) && v[2] && !getAria(v[2], 'disabled') && getAria(v[2], 'selected')) {
                return selected = v[2], 0;
            }
        });
        if (!isSet(selected) && (strict || !isInput(self))) {
            // Select the first option
            forEachMap(_options, function (v, k) {
                return selected = v[2], 0;
            });
        }
        return selected;
    }

    function getOptionValue(option, parseValue) {
        return getDatum(option, 'value', parseValue);
    }

    function getOptions(self) {
        var map = new Map();
        var item,
            items,
            itemsParent,
            selected = [],
            value = getValue(self);
        if (isInput(self)) {
            items = (itemsParent = self.list) ? getChildren(itemsParent) : [];
        } else {
            items = getChildren(itemsParent = self);
        }
        forEachArray(items, function (v, k) {
            var attributes = getAttributes(v);
            forEachArray(['disabled', 'selected'], function (k) {
                if (hasState(attributes, k)) {
                    attributes[k] = "" === attributes[k] ? true : attributes[k];
                    if ('selected' === k) {
                        selected.push(1);
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
            } else {
                setValueInMap(_toValue(v.value), [getText(v) || v.value, attributes, null, v], map);
            }
        });
        // If there is no selected option(s), get it from the current value
        if (0 === toCount(selected) && (item = getValueInMap(value = _toValue(value), map))) {
            item[1].selected = true;
            setValueInMap(value, item, map);
        }
        return map;
    }

    function goToOptionFirst(picker, k) {
        var _options = picker._options,
            option;
        if (option = toValuesFromMap(_options)['find' + ("")](function (v) {
                return !getAria(v[2], 'disabled') && !v[2].hidden;
            })) {
            return option[2];
        }
    }

    function isInput(self) {
        return 'input' === getName(self);
    }

    function scrollTo(node) {
        node.scrollIntoView({
            block: 'nearest'
        });
    }
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
        var strict = state.strict,
            hasSize = getDatum(mask, 'size'),
            option;
        var count = _options.count;
        if (selectOnly) {
            forEachMap(_options, function (v) {
                var text = toCaseLower(getText(v[2]) + '\t' + getOptionValue(v[2]));
                if ("" !== q && q === text.slice(0, toCount(q)) && !getAria(v[2], 'disabled')) {
                    selectToOption(v[2], $);
                    if (hasSize) {
                        scrollTo(v[2]);
                    }
                    return 0;
                }
                --count;
            });
        } else {
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
            if (strict) {
                selectToOptionsNone($);
                // Silently select the first option without affecting the currently typed query and focus/select state
                if (count && (option = goToOptionFirst($))) {
                    setAria(option, 'selected', true);
                    setAttribute(option._[OPTION_SELF], 'selected', "");
                    setValue(self, getOptionValue(option));
                } else {
                    setValue(self, "");
                }
            } else {
                setValue(self, query);
            }
        }
        $.fire('search', [_event, query]);
        var call = state.options;
        // Only fetch when no other option(s) are available to query
        if (0 === count && isFunction(call)) {
            setAria(mask, 'busy', true);
            call = call.call($, query);
            if (isInstance(call, Promise)) {
                call.then(function (v) {
                    createOptionsFrom($, v, options);
                    letAria(mask, 'busy');
                    $.fire('load', [_event, query, v])[$.options.open ? 'enter' : 'exit']().fit();
                });
            } else {
                createOptionsFrom($, call, options);
            }
        }
    }, FILTER_COMMIT_TIME);

    function onBlurMask(e) {
        var $ = this,
            picker = getReference($);
        picker.fire('blur', [e]).fire('blur.self', [e])._event = e;
    }

    function onBlurOption(e) {
        var $ = this,
            picker = getReference($);
        picker._event = e;
    }

    function onBlurTextInput(e) {
        var $ = this,
            picker = getReference($),
            _mask = picker._mask,
            state = picker.state,
            options = _mask.options,
            strict = state.strict,
            option;
        if (strict) {
            if (!options.hidden && (option = getOptionSelected(picker, 1))) {
                selectToOption(option, picker);
            } else {
                selectToOptionsNone(picker, 1);
            }
        }
        picker.fire('blur', [e])._event = e;
    }

    function onCutTextInput(e) {
        var $ = this,
            picker = getReference($),
            _mask = picker._mask;
        picker.self;
        var hint = _mask.hint;
        delay(function () {
            return getText($, 0) ? setStyle(hint, 'color', 'transparent') : letStyle(hint, 'color');
        }, 1)();
        picker.fire('cut', [e])._event = e;
    }

    function onFocusMask(e) {
        var $ = this,
            picker = getReference($);
        picker.fire('focus', [e]).fire('focus.self', [e])._event = e;
    }

    function onFocusOption(e) {
        var $ = this,
            picker = getReference($);
        picker._event = e;
        selectToNone();
    }

    function onFocusSelf(e) {
        var $ = this,
            picker = getReference($);
        picker._event = e;
        picker.focus();
    }

    function onFocusTextInput(e) {
        var $ = this,
            picker = getReference($);
        picker._event = e;
        getText($, 0) ? selectTo($) : picker.enter().fit();
    }
    var searchQuery = "";

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
            hint = _mask.hint;
        _mask.input;
        var strict = state.strict;
        picker._event = e;
        delay(function () {
            return getText($, 0) ? setStyle(hint, 'color', 'transparent') : letStyle(hint, 'color');
        }, 1)();
        if (KEY_DELETE_LEFT === key || KEY_DELETE_RIGHT === key || 1 === toCount(key)) {
            delay(function () {
                return picker.enter().fit();
            }, FILTER_COMMIT_TIME + 1)();
        }
        if (KEY_ARROW_DOWN === key || KEY_ARROW_UP === key || KEY_ENTER === key) {
            var currentOption = getValueInMap(_toValue(getValue(self)), _options._o);
            currentOption = currentOption ? currentOption[2] : 0;
            if (!currentOption || currentOption.hidden) {
                currentOption = toValueFirstFromMap(_options);
                currentOption = currentOption ? currentOption[2] : 0;
                while (currentOption && (getAria(currentOption, 'disabled') || currentOption.hidden)) {
                    currentOption = getNext(currentOption);
                }
            }
            exit = true;
            if (!getAria(mask, 'expanded')) {
                picker.enter(exit);
                currentOption && focusTo(currentOption);
            } else if (strict && KEY_ENTER === key) {
                // Automatically select the first option!
                selectToOptionFirst(picker) && picker.exit(exit);
            } else {
                currentOption && focusTo(currentOption);
            }
        } else if (KEY_TAB === key) {
            picker.exit();
        } else {
            delay(function () {
                if ("" === searchQuery || searchQuery !== getText($) + "") {
                    filter(picker, $, _options);
                    searchQuery = getText($) + "";
                }
            }, 1)();
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
            picker.exit(exit = false);
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
            hint = _mask.hint;
        _mask.input;
        _mask.value;
        var nextOption, parentOption, prevOption;
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
            if (KEY_PAGE_DOWN === key && 'group' === getRole(parentOption = getParent($))) {
                nextOption = getNext(parentOption);
            } else {
                nextOption = getNext($);
            }
            // Skip disabled and hidden option(s)…
            while (nextOption && (getAria(nextOption, 'disabled') || nextOption.hidden)) {
                nextOption = getNext(nextOption);
            }
            if (nextOption) {
                // Next option is a group?
                if ('group' === getRole(nextOption)) {
                    nextOption = getChildFirst(nextOption);
                }
                // Is the last option?
            } else {
                // Is in a group?
                if ((parentOption = getParent($)) && 'group' === getRole(parentOption)) {
                    nextOption = getNext(parentOption);
                }
                // Next option is a group?
                if (nextOption && 'group' === getRole(nextOption)) {
                    nextOption = getChildFirst(nextOption);
                }
            }
            // Skip disabled and hidden option(s)…
            while (nextOption && (getAria(nextOption, 'disabled') || nextOption.hidden)) {
                nextOption = getNext(nextOption);
            }
            nextOption ? focusToOption(nextOption) : focusToOptionFirst();
        } else if (KEY_ARROW_UP === key || KEY_PAGE_UP === key) {
            exit = true;
            if (KEY_PAGE_UP === key && 'group' === getRole(parentOption = getParent($))) {
                prevOption = getPrev(parentOption);
            } else {
                prevOption = getPrev($);
            }
            // Skip disabled and hidden option(s)…
            while (prevOption && (getAria(prevOption, 'disabled') || prevOption.hidden)) {
                prevOption = getPrev(prevOption);
            }
            if (prevOption) {
                // Previous option is a group?
                if ('group' === getRole(prevOption)) {
                    prevOption = getChildLast(prevOption);
                }
                // Is the first option?
            } else {
                // Is in a group?
                if ((parentOption = getParent($)) && 'group' === getRole(parentOption)) {
                    prevOption = getPrev(parentOption);
                }
                // Previous option is a group?
                if (prevOption && 'group' === getRole(prevOption)) {
                    prevOption = getChildLast(prevOption);
                }
            }
            // Skip disabled and hidden option(s)…
            while (prevOption && (getAria(prevOption, 'disabled') || prevOption.hidden)) {
                prevOption = getPrev(prevOption);
            }
            prevOption ? focusToOption(prevOption) : focusToOptionLast();
        } else if (KEY_BEGIN === key) {
            exit = true;
            focusToOptionFirst();
        } else if (KEY_END === key) {
            exit = true;
            focusToOptionLast();
        } else {
            isInput(self) && 1 === toCount(key) && !keyIsAlt && !keyIsCtrl && setText(hint, "");
            picker.exit(!(exit = false));
        }
        exit && (offEventDefault(e), offEventPropagation(e));
    }

    function onPasteTextInput(e) {
        offEventDefault(e);
        var $ = this,
            picker = getReference($),
            _mask = picker._mask;
        picker.self;
        var hint = _mask.hint;
        delay(function () {
            return getText($, 0) ? setStyle(hint, 'color', 'transparent') : letStyle(hint, 'color');
        }, 1)();
        setText($, e.clipboardData.getData('text/plain')), selectTo($); // Paste as plain text
        picker.fire('paste', [e])._event = e;
    }

    function onPointerDownMask(e) {
        // This will prevent us from being able to focus natively on the mask because current `e.type` is `mousedown` or
        // `touchstart`, so we will have to fire the `focus` and `focus.self` hook(s) manually as if it were actually going
        // to focus natively.
        offEventDefault(e);
        var $ = this,
            picker = getReference($),
            _options = picker._options,
            self = picker.self,
            target = e.target;
        picker._event = e;
        if (isDisabled(self) || isReadOnly(self) || getDatum($, 'size')) {
            return;
        }
        if ('listbox' === getRole(target) || getParent(target, '[role=listbox]')) {
            // The user is likely browsing the available option(s) by dragging the scroll bar
            return;
        }
        forEachMap(_options, function (v) {
            return v[2].hidden = false;
        });
        picker.fire('focus', [e]).fire('focus.self', [e])[getAria($, 'expanded') ? 'exit' : 'enter'](true).fit();
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
        picker.reset();
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
        return picker.fire('submit', [e, picker.value]);
    }

    function selectToOption(option, picker) {
        var _event = picker._event,
            _mask = picker._mask;
        picker._options;
        var self = picker.self,
            hint = _mask.hint,
            input = _mask.input,
            value = _mask.value;
        if (option) {
            var a = getValue(self),
                b;
            selectToOptionsNone(picker);
            setAria(option, 'selected', true);
            setAttribute(option._[OPTION_SELF], 'selected', "");
            setValue(self, b = getOptionValue(option));
            if (isInput(self)) {
                setAria(input, 'activedescendant', getID(option));
                setText(hint, "");
                setText(input, getText(option));
            } else {
                setDatum(value, 'value', b);
                setHTML(value, getHTML(option));
            }
            if (a !== b) {
                picker.fire('change', [_event, _toValue(b)]);
            }
            return option;
        }
    }

    function selectToOptionFirst(picker, k) {
        var option;
        if (option = goToOptionFirst(picker)) {
            return selectToOption(option, picker);
        }
    }

    function selectToOptionsNone(picker, fireValue) {
        picker._event;
        var _mask = picker._mask,
            _options = picker._options,
            self = picker.self,
            hint = _mask.hint,
            input = _mask.input;
        _mask.options;
        var value = _mask.value,
            v;
        forEachMap(_options, function (v) {
            letAria(v[2], 'selected');
            letAttribute(v[3], 'selected');
        });
        if (fireValue) {
            setValue(self, v = "");
            if (isInput(self)) {
                letAria(input, 'activedescendant');
                letStyle(hint, 'color');
                setText(input, "");
            } else {
                letDatum(value, 'value');
                setHTML(value, v);
            }
        }
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

    function OptionPickerOptions(of, options) {
        var $ = this;
        // Return new instance if `OptionPickerOptions` was called without the `new` operator
        if (!isInstance($, OptionPickerOptions)) {
            return new OptionPickerOptions(of, options);
        }
        $._o = new Map();
        $.count = 0;
        $.of = of;
        if (options && toCount(options)) {
            createOptionsFrom(of, options, of._mask.options);
        }
        return $;
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
    setObjectAttributes(OptionPicker, {
        name: {
            value: name
        }
    }, 1);
    setObjectAttributes(OptionPicker, {
        options: {
            get: function get() {
                return this._options;
            },
            set: function set(options) {
                var $ = this,
                    _event = $._event,
                    _mask = $._mask,
                    _options = $._options,
                    self = $.self,
                    selected;
                if (isFloat(options) || isInteger(options) || isString(options)) {
                    options = [options];
                }
                var value = $.value; // The previous value
                if (toCount(selected = createOptionsFrom($, options, _mask.options))) {
                    // Sets the value of `self.value` so that change(s) in value are not detected when we set the value of
                    // `$.value` after this
                    setValue(self, selected[0]);
                    // Setting the value of `$.value` will not trigger the `change` hook because the `$.value` value has
                    // already been made equal to the `self.value` value
                    $.value = $._value = selected[0];
                    // $.values = selected;
                    // Fire the `change` hook manually
                    if (value !== $.value) {
                        $.fire('change', [_event, $.value]);
                    }
                }
                var values = [];
                forEachMap(_options, function (v, k) {
                    return values.push(k);
                });
                return $.fire('set.options', [_event, values]);
            }
        },
        size: {
            get: function get() {
                var size = this.state.size || 1;
                if (!isInteger(size)) {
                    return 1;
                }
                return size < 1 ? 1 : size; // <https://html.spec.whatwg.org#attr-select-size>
            },
            set: function set(value) {
                var $ = this,
                    _event = $._event,
                    _mask = $._mask,
                    mask = $.mask,
                    state = $.state,
                    options = _mask.options,
                    size = !isInteger(value) ? 1 : value < 1 ? 1 : value;
                state.size = size;
                if (1 === size) {
                    letDatum(mask, 'size');
                    letStyle(options, 'max-height');
                    letReference(R);
                } else {
                    var option = goToOptionFirst($);
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
                return $.fire('set.size', [_event, size]);
            }
        },
        text: {
            get: function get() {
                var $ = this,
                    _mask = $._mask,
                    input = _mask.input,
                    text = _mask.text;
                return text ? getText(input) : null;
            },
            set: function set(value) {
                var $ = this,
                    _event = $._event,
                    _mask = $._mask;
                $.self;
                var hint = _mask.hint,
                    input = _mask.input,
                    text = _mask.text,
                    v;
                if (text) {
                    setText(input, v = _fromValue(value));
                    v ? setStyle(hint, 'color', 'transparent') : letStyle(hint, 'color');
                }
                return $.fire('set.text', [_event, value]);
            }
        },
        value: {
            get: function get() {
                var value = getValue(this.self);
                return "" === value ? null : value;
            },
            set: function set(value) {
                var $ = this,
                    _active = $._active,
                    _event = $._event,
                    _options = $._options;
                $.mask;
                var state = $.state;
                state.n;
                var v;
                if (!_active) {
                    return $;
                }
                if (v = getValueInMap(_toValue(value), _options._o)) {
                    selectToOption(v[2], $);
                }
                return $.fire('set.value', [_event, value]);
            }
        },
        // TODO: `<select multiple>`
        values: {
            get: function get() {},
            set: function set(values) {}
        }
    });
    OptionPicker._ = setObjectMethods(OptionPicker, {
        attach: function attach(self, state) {
            var _state$size;
            var $ = this;
            self = self || $.self;
            state = state || $.state;
            $._active = !isDisabled(self) && !isReadOnly(self);
            $._event = null;
            $._options = new OptionPickerOptions($, []);
            $._value = getValue(self) || null;
            $.self = self;
            $.state = state;
            var isInputSelf = isInput(self),
                _state = state,
                n = _state.n;
            var arrow = setElement('span', {
                'class': n + '__arrow'
            });
            var form = getParentForm(self);
            var mask = setElement('div', {
                'aria': {
                    'expanded': 'false',
                    'haspopup': 'listbox',
                    'multiselectable': self.multiple ? 'true' : false
                },
                'class': n,
                'role': 'combobox',
                'tabindex': isDisabled(self) || isInputSelf ? false : 0
            });
            $.mask = mask;
            var maskOptions = setElement('div', {
                'class': n + '__options',
                'role': 'listbox'
            });
            var maskValues = setElement('div', {
                'class': n + '__values',
                'role': 'group'
            });
            var text = setElement('span', {
                'class': n + '__' + (isInputSelf ? 'text' : 'value')
            });
            var textInput = setElement('span', {
                'aria': {
                    'autocomplete': 'list',
                    'disabled': isDisabled(self) ? 'true' : false,
                    'multiline': 'false',
                    'placeholder': isInputSelf ? self.placeholder : false,
                    'readonly': isReadOnly(self) ? 'true' : false
                },
                'autocapitalize': 'off',
                'contenteditable': isDisabled(self) || isReadOnly(self) || !isInputSelf ? false : "",
                'role': 'searchbox',
                'spellcheck': !isInputSelf ? false : 'false',
                'tabindex': isReadOnly(self) && isInputSelf ? 0 : false
            });
            var textInputHint = setElement('span', isInputSelf ? self.placeholder + "" : "");
            setChildLast(mask, maskValues);
            setChildLast(mask, maskOptions);
            setChildLast(maskValues, text);
            setChildLast(maskValues, arrow);
            if (isInputSelf) {
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
                setID(form);
                setReference(form, $);
            }
            onEvent('focus', self, onFocusSelf);
            onEvent('mousedown', R, onPointerDownRoot);
            onEvent('mousedown', mask, onPointerDownMask);
            onEvent('mousemove', R, onPointerMoveRoot);
            onEvent('mouseup', R, onPointerUpRoot);
            onEvent('resize', W, onResizeWindow, {
                passive: true
            });
            onEvent('scroll', W, onScrollWindow, {
                passive: true
            });
            onEvent('touchend', R, onPointerUpRoot);
            onEvent('touchmove', R, onPointerMoveRoot, {
                passive: true
            });
            onEvent('touchstart', R, onPointerDownRoot);
            onEvent('touchstart', mask, onPointerDownMask);
            self.tabIndex = -1;
            setReference(mask, $);
            var _mask = {};
            _mask.arrow = arrow;
            _mask.hint = isInputSelf ? textInputHint : null;
            _mask.input = isInputSelf ? textInput : null;
            _mask.of = self;
            _mask.options = maskOptions;
            _mask.self = mask;
            _mask[isInputSelf ? 'text' : 'value'] = text;
            $._mask = _mask;
            $.size = (_state$size = state.size) != null ? _state$size : isInputSelf ? 1 : self.size;
            var _active = $._active,
                _state2 = state,
                options = _state2.options,
                selected;
            // Force the `this._active` value to `true` to set the initial value
            $._active = true;
            if (isFunction(options)) {
                setAria(mask, 'busy', 'true');
                options = options.call($, null);
                if (isInstance(options, Promise)) {
                    options.then(function (options) {
                        letAria(mask, 'busy');
                        if (toCount(selected = createOptionsFrom($, options, maskOptions))) {
                            $.value = selected[0];
                            // $.values = selected;
                        } else if (selected = getOptionSelected($, 1)) {
                            $.value = getOptionValue(selected);
                            // $.values = selected;
                        }
                        var values = [];
                        forEachMap($._options, function (v, k) {
                            return values.push(k);
                        });
                        $.fire('load', [$._event, null, values])[$.options.open ? 'enter' : 'exit']().fit();
                    });
                } else {
                    if (toCount(selected = createOptionsFrom($, options, maskOptions))) {
                        $.value = selected[0];
                        // $.values = selected;
                    }
                }
            } else {
                if (toCount(selected = createOptionsFrom($, options || getOptions(self), maskOptions))) {
                    $.value = selected[0];
                    // $.values = selected;
                }
            }
            // After the initial value has been set, restore the previous `this._active` value
            $._active = _active;
            // Force `id` attribute(s)
            setAria(mask, 'controls', getID(setID(maskOptions)));
            setAria(mask, 'labelledby', getID(setID(text)));
            setAria(self, 'hidden', true);
            setAria(textInput, 'controls', getID(maskOptions));
            setID(arrow);
            setID(mask);
            setID(maskValues);
            setID(self);
            setID(textInput);
            setID(textInputHint);
            // Attach extension(s)
            if (isSet(state) && isArray(state.with)) {
                forEachArray(state.with, function (v, k) {
                    if (isString(v)) {
                        v = OptionPicker[v];
                    }
                    // `const Extension = function (self, state = {}) {}`
                    if (isFunction(v)) {
                        v.call($, self, state);
                        // `const Extension = {attach: function (self, state = {}) {}, detach: function (self, state = {}) {}}`
                    } else if (isObject(v) && isFunction(v.attach)) {
                        v.attach.call($, self, state);
                    }
                });
            }
            return $;
        },
        blur: function blur() {
            var $ = this,
                _mask = $._mask,
                mask = $.mask,
                input = _mask.input;
            if (input) {
                selectToNone();
            }
            return (input || mask).blur(), $.exit();
        },
        detach: function detach() {
            var $ = this,
                _mask = $._mask,
                mask = $.mask,
                self = $.self,
                state = $.state,
                input = _mask.input;
            var form = getParentForm(self);
            $._active = false;
            $._options = new OptionPickerOptions($, state.options = getOptions(self));
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
                forEachArray(state.with, function (v, k) {
                    if (isString(v)) {
                        v = OptionPicker[v];
                    }
                    if (isObject(v) && isFunction(v.detach)) {
                        v.detach.call($, self, state);
                    }
                });
            }
            self.tabIndex = null;
            letAria(self, 'hidden');
            letClass(self, state.n + '__self');
            letElement(mask);
            $._mask = {
                of: self
            };
            $.mask = null;
            return $;
        },
        enter: function enter(focus, mode) {
            var $ = this,
                option,
                _active = $._active,
                _event = $._event,
                _mask = $._mask,
                _options = $._options,
                mask = $.mask,
                self = $.self,
                input = _mask.input,
                options = _mask.options;
            if (!_active) {
                return $;
            }
            setAria(mask, 'expanded', toCount(getChildren(options)) > 0);
            var theRootReference = getReference(R);
            if (theRootReference && $ !== theRootReference) {
                theRootReference.exit(); // Exit other(s)
            }
            setReference(R, $); // Link current picker to the root target
            setReference(W, $);
            $.fire('enter', [_event]);
            if (focus) {
                if (isInput(self)) {
                    focusTo(input), selectTo(input, mode);
                } else if (option = getValueInMap(_toValue(getValue(self)), _options._o)) {
                    focusTo(option[2]), delay(function () {
                        return scrollTo(option[2]);
                    }, 1)();
                }
            }
            return $;
        },
        exit: function exit(focus, mode) {
            var $ = this,
                _active = $._active,
                _event = $._event,
                _mask = $._mask,
                _options = $._options,
                mask = $.mask,
                self = $.self,
                input = _mask.input;
            if (!_active) {
                return $;
            }
            forEachMap(_options, function (v) {
                return v[2].hidden = false;
            });
            setAria(mask, 'expanded', false);
            $.fire('exit', [_event]);
            if (focus) {
                if (isInput(self)) {
                    focusTo(input), selectTo(input, mode);
                } else {
                    focusTo(mask);
                }
            }
            return $;
        },
        fit: function fit() {
            var $ = this,
                _active = $._active,
                _event = $._event,
                _mask = $._mask,
                mask = $.mask,
                options = _mask.options;
            if (!_active || !getAria(mask, 'expanded') || getDatum(mask, 'size')) {
                return $;
            }
            setStyle(options, 'max-height', 0);
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
            return $.fire('fit', [_event]);
        },
        focus: function focus(mode) {
            var $ = this,
                _event = $._event,
                _mask = $._mask,
                mask = $.mask,
                input = _mask.input;
            if (input) {
                focusTo(input), selectTo(input, mode);
            } else {
                focusTo(mask);
            }
            return $.fire('focus', [_event]).fire('focus.self', [_event]);
        },
        reset: function reset(focus, mode) {
            var $ = this,
                _active = $._active,
                _event = $._event,
                _value = $._value;
            if (!_active) {
                return $;
            }
            var value = $.value; // The previous value
            $.value = _value;
            $.fire('reset', [_event, value]);
            return focus ? $.focus(mode) : $;
        }
    });
    setObjectAttributes(OptionPickerOptions, {
        name: {
            value: name + 'Options'
        }
    }, 1);
    setObjectAttributes(OptionPickerOptions, {
        open: {
            get: function get() {
                var $ = this,
                    of = $.of,
                    mask = of.mask;
                return getAria(mask, 'expanded');
            }
        }
    });
    setObjectMethods(OptionPickerOptions, {
        delete: function _delete(key, _fireValue, _fireHook) {
            if (_fireValue === void 0) {
                _fireValue = 1;
            }
            if (_fireHook === void 0) {
                _fireHook = 1;
            }
            var $ = this,
                _o = $._o,
                of = $.of,
                _active = of._active,
                _event = of._event,
                _mask = of._mask,
                self = of.self,
                options = _mask.options,
                r;
            if (!_active) {
                return false;
            }
            if (!isSet(key)) {
                forEachMap(_o, function (v, k) {
                    return $.let(k, 0);
                });
                selectToOptionsNone(of, _fireValue);
                options.hidden = true;
                return _fireHook && of.fire('let.options', [_event, []]) && 0 === $.count;
            }
            if (!(r = getValueInMap(key = _toValue(key), _o))) {
                return _fireHook && of.fire('not.option', [_event, key]), false;
            }
            var parent = getParent(r[2]),
                parentReal = getParent(r[3]),
                value = getOptionValue(r[2]),
                valueReal = of.value;
            offEvent('blur', r[2], onBlurOption);
            offEvent('focus', r[2], onFocusOption);
            offEvent('keydown', r[2], onKeyDownOption);
            offEvent('mousedown', r[2], onPointerDownOption);
            offEvent('touchend', r[2], onPointerUpOption);
            offEvent('touchstart', r[2], onPointerDownOption);
            letElement(r[2]), letElement(r[3]);
            if (r = letValueInMap(key, _o)) {
                --$.count;
            }
            // Remove empty group(s)
            parent && 'group' === getRole(parent) && 0 === toCount(getChildren(parent)) && letElement(parent);
            parentReal && 'optgroup' === getName(parentReal) && 0 === toCount(getChildren(parentReal)) && letElement(parentReal);
            // Clear value if there are no option(s)
            if (0 === toCount(getChildren(options))) {
                selectToOptionsNone(of, !isInput(self));
                options.hidden = true;
                // Reset value to the first option if removed option is the selected option
            } else {
                // setValue(self, "");
                value === valueReal && selectToOptionFirst(of);
            }
            return _fireHook && of.fire('let.option', [_event, key]), r;
        },
        get: function get(key) {
            var $ = this,
                _o = $._o;
            $.of;
            var value = getValueInMap(_toValue(key), _o),
                parent;
            if (value && (parent = getParent(value[2])) && 'group' === getRole(parent)) {
                return [getElementIndex(value[2]), getElementIndex(parent)];
            }
            return value ? getElementIndex(value[2]) : -1;
        },
        has: function has(key) {
            return hasKeyInMap(_toValue(key), this._o);
        },
        let: function _let(key, _fireHook) {
            if (_fireHook === void 0) {
                _fireHook = 1;
            }
            return this.delete(key, 1, _fireHook);
        },
        set: function set(key, value, _fireHook) {
            var _getState3, _getState4, _getState5;
            if (_fireHook === void 0) {
                _fireHook = 1;
            }
            var $ = this,
                _o = $._o,
                of = $.of,
                _active = of._active,
                _event = of._event;
            if (!_active) {
                return false;
            }
            if ($.has(key = _toValue(key))) {
                return _fireHook && of.fire('has.option', [_event, key]), false;
            }
            var _mask = of._mask,
                self = of.self,
                state = of.state,
                options = _mask.options,
                n = state.n,
                classes,
                itemsParent,
                option,
                optionGroup,
                optionGroupReal,
                optionReal,
                styles;
            n += '__option';
            if (isInput(self)) {
                (itemsParent = self.list) ? getChildren(itemsParent): [];
            } else {
                getChildren(itemsParent = self);
            }
            options.hidden = false;
            // Force `id` attribute(s)
            setID(itemsParent);
            // `picker.options.set('asdf')`
            if (!isSet(value)) {
                value = [key, {}];
                // `picker.options.set('asdf', 'asdf')`
            } else if (isFloat(value) || isInteger(value) || isString(value)) {
                value = [value, {}];
                // `picker.options.set('asdf', [ … ])`
            } else;
            if (hasState(value[1], '&')) {
                optionGroup = getElement('.' + n + 's-batch[data-value="' + value[1]['&'].replace(/"/g, '\\"') + '"]', options);
                if (!optionGroup || getOptionValue(optionGroup) !== value[1]['&']) {
                    var _getState, _getState2;
                    setChildLast(options, optionGroup = setElement('span', {
                        'class': n + 's-batch',
                        'data': {
                            'value': value[1]['&']
                        },
                        'role': 'group',
                        'title': (_getState = getState(value[1], 'title')) != null ? _getState : false
                    }));
                    setChildLast(itemsParent, optionGroupReal = setElement('optgroup', {
                        'label': value[1]['&'],
                        'title': (_getState2 = getState(value[1], 'title')) != null ? _getState2 : false
                    }));
                    if (classes = getState(value[1], 'class')) {
                        setClasses(optionGroup, classes);
                        setClasses(optionGroupReal, classes);
                    }
                    if (isObject(styles = getState(value[1], 'style'))) {
                        setStyles(optionGroup, styles);
                        setStyles(optionGroupReal, styles);
                    } else if (styles) {
                        setAttribute(optionGroup, 'style', styles);
                        setAttribute(optionGroupReal, 'style', styles);
                    }
                    // Force `id` attribute(s)
                    setID(optionGroup);
                    setID(optionGroupReal);
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
                'aria': {
                    'disabled': disabled ? 'true' : false,
                    'selected': selected ? 'true' : false
                },
                'class': n,
                'data': {
                    'batch': (_getState3 = getState(value[1], '&')) != null ? _getState3 : false,
                    'value': v
                },
                'role': 'option',
                'tabindex': disabled ? false : -1,
                'title': (_getState4 = getState(value[1], 'title')) != null ? _getState4 : false
            });
            optionReal = value[3] || setElement('option', _fromValue(value[0]), {
                'disabled': disabled ? "" : false,
                'selected': selected ? "" : false,
                'title': (_getState5 = getState(value[1], 'title')) != null ? _getState5 : false,
                'value': v
            });
            if (classes = getState(value[1], 'class')) {
                setClasses(option, classes);
                setClasses(optionReal, classes);
            }
            if (isObject(styles = getState(value[1], 'style'))) {
                setStyles(option, styles);
                setStyles(optionReal, styles);
            } else if (styles) {
                setAttribute(option, 'style', styles);
                setAttribute(optionReal, 'style', styles);
            }
            // Force `id` attribute(s)
            setID(option);
            setID(optionReal);
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
            setValueInMap(key, value, _o);
            return _fireHook && of.fire('set.option', [_event, key]), true;
        }
    });
    // In order for an object to be iterable, it must have a `Symbol.iterator` key
    getPrototype(OptionPickerOptions)[Symbol.iterator] = function () {
        return this._o[Symbol.iterator]();
    };
    OptionPicker.Options = OptionPickerOptions;
    return OptionPicker;
}));