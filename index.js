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
    var isArray = function isArray(x) {
        return Array.isArray(x);
    };
    var isBoolean = function isBoolean(x) {
        return false === x || true === x;
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
    var hasValue = function hasValue(x, data) {
        return -1 !== data.indexOf(x);
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
    var toMapCount = function toMapCount(x) {
        return x.size;
    };
    var toNumber = function toNumber(x, base) {
        if (base === void 0) {
            base = 10;
        }
        return base ? parseInt(x, base) : parseFloat(x);
    };
    var toSetCount = function toSetCount(x) {
        return x.size;
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
            if (-1 === v) {
                array.splice(i, 1);
                continue;
            }
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
            if (-1 === v) {
                letValueInMap(k, map);
                continue;
            }
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
            if (-1 === v) {
                delete object[k];
                continue;
            }
            if (0 === v) {
                break;
            }
            if (1 === v) {
                continue;
            }
        }
        return object;
    };
    var forEachSet = function forEachSet(set, at) {
        for (var _iterator2 = _createForOfIteratorHelperLoose(set.entries()), _step2; !(_step2 = _iterator2()).done;) {
            var _step2$value = _maybeArrayLike(_slicedToArray, _step2.value, 2),
                k = _step2$value[0],
                v = _step2$value[1];
            v = at(v, k);
            if (-1 === v) {
                letValueInMap(k, set);
                continue;
            }
            if (0 === v) {
                break;
            }
            if (1 === v) {
                continue;
            }
        }
        return set;
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
    var onAnimationsEnd = function onAnimationsEnd(node, task) {
        return isFunction(node.getAnimations) ? Promise.all(node.getAnimations().map(function (v) {
            return v.finished;
        })).then(task) : task(), node;
    };
    var setObjectAttributes = function setObjectAttributes(of, attributes, asStaticAttributes) {
        if (!asStaticAttributes) {
            of = getPrototype(of);
        }
        return forEachObject(attributes, function (v, k) {
            Object.defineProperty(of, k, v);
        }), of;
    };
    var setObjectMethods = function setObjectMethods(of, methods, asStaticMethods) {
        {
            of = getPrototype(of);
        }
        return forEachObject(methods, function (v, k) {
            of [k] = v;
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
            r.push(v);
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
    var letID = function letID(node) {
        return letAttribute(node, 'id');
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
    var _getSelection = function _getSelection() {
        return D.getSelection();
    };
    var _setRange = function _setRange() {
        return D.createRange();
    };
    // <https://stackoverflow.com/a/6691294/1163000>
    var insertAtSelection = function insertAtSelection(node, content, mode, selection) {
        selection = selection || _getSelection();
        var from, range, to;
        if (selection.rangeCount) {
            range = selection.getRangeAt(0);
            range.deleteContents();
            to = D.createDocumentFragment();
            var nodeCurrent, nodeFirst, nodeLast;
            if (isString(content)) {
                from = setElement('div');
                setHTML(from, content);
                while (nodeCurrent = getChildFirst(from, 1)) {
                    nodeLast = setChildLast(to, nodeCurrent);
                }
            } else if (isArray(content)) {
                forEachArray(content, function (v) {
                    return nodeLast = setChildLast(to, v);
                });
            } else {
                nodeLast = setChildLast(to, content);
            }
            nodeFirst = getChildFirst(to, 1);
            range.insertNode(to);
            if (nodeLast) {
                range = range.cloneRange();
                range.setStartAfter(nodeLast);
                range.setStartBefore(nodeFirst);
                setSelection(node, range, selectToNone(selection));
            }
        }
        return selection;
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
            return forEachArray(hooks[event], function (v) {
                v.apply(that || $, data);
            }), $;
        };
        $$.off = function (event, task) {
            var $ = this,
                hooks = $.hooks;
            if (!isSet(event)) {
                return hooks = {}, $;
            }
            if (isSet(hooks[event])) {
                if (isSet(task)) {
                    var j = toCount(hooks[event]);
                    // Clean-up empty hook(s)
                    if (0 === j) {
                        delete hooks[event];
                    } else {
                        for (var i = 0; i < j; ++i) {
                            if (task === hooks[event][i]) {
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
        $$.on = function (event, task) {
            var $ = this,
                hooks = $.hooks;
            if (!isSet(hooks[event])) {
                hooks[event] = [];
            }
            if (isSet(task)) {
                hooks[event].push(task);
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
    var KEY_ARROW_LEFT = 'ArrowLeft';
    var KEY_ARROW_RIGHT = 'ArrowRight';
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
    var OPTION_TEXT = 1;
    var VALUE_SELF = 0;
    var VALUE_TEXT = 1;
    var filter = debounce(function ($, input, _options, selectOnly) {
        var query = isString(input) ? input : getText(input) || "",
            q = toCaseLower(query),
            _mask = $._mask,
            mask = $.mask,
            self = $.self,
            state = $.state,
            options = _mask.options,
            strict = state.strict,
            option;
        var count = _options.count();
        if (selectOnly) {
            forEachMap(_options, function (v) {
                var text = toCaseLower(getText(v[2]) + '\t' + getOptionValue(v[2]));
                if ("" !== q && q === text.slice(0, toCount(q)) && !getAria(v[2], 'disabled')) {
                    selectToOption(v[2], $);
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
            selectToOptionsNone($);
            if (strict) {
                // Silently select the first option without affecting the currently typed query and focus/select state
                if (count && "" !== q && (option = goToOptionFirst($))) {
                    setAria(option, 'selected', true);
                    option._[OPTION_SELF].selected = true;
                    setValue(self, getOptionValue(option));
                } else {
                    setValue(self, "");
                }
            } else {
                setValue(self, query);
            }
        }
        $.fire('search', [query = "" !== query ? query : null]);
        var call = state.options;
        // Only fetch when no other option(s) are available to query
        if (0 === count && isFunction(call)) {
            setAria(mask, 'busy', true);
            call = call.call($, query);
            if (isInstance(call, Promise)) {
                call.then(function (v) {
                    createOptions($, v);
                    letAria(mask, 'busy');
                    $.fire('load', [query, $.values])[goToOptionFirst($) ? 'enter' : 'exit']().fit();
                });
            } else {
                createOptions($, call);
            }
        }
    }, FILTER_COMMIT_TIME);
    var name = 'OptionPicker';

    function createOptions($, options) {
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
                    var _v$, _v$2, _v$1$value;
                    options[k][0] = (_v$ = v[0]) != null ? _v$ : "";
                    options[k][1] = (_v$2 = v[1]) != null ? _v$2 : {};
                    setValueInMap(_toValue((_v$1$value = v[1].value) != null ? _v$1$value : k), v, map);
                } else {
                    setValueInMap(_toValue(k), [v, {}], map);
                }
            });
        }
        var _options = $._options,
            self = $.self,
            state = $.state;
        state.n;
        var key,
            r = [],
            value = getValue(self);
        // Reset the option(s) data, but leave the typed query in place, and do not fire the `let.options` hook
        _options.delete(null, 0, 0);
        forEachMap(map, function (v, k) {
            var _v$1$value3;
            if (isArray(v) && v[1] && !v[1].disabled && v[1].selected) {
                var _v$1$value2;
                r.push(_toValue((_v$1$value2 = v[1].value) != null ? _v$1$value2 : k));
            }
            // Set the option data, but do not fire the `set.option` hook
            _options.set(_toValue(isArray(v) && v[1] ? (_v$1$value3 = v[1].value) != null ? _v$1$value3 : k : k), v, 0);
        });
        if (!isFunction(state.options)) {
            state.options = map;
        }
        if (0 === toCount(r)) {
            // If there is no selected option(s), get it from the current value
            if (hasKeyInMap(key = _toValue(value), map)) {
                return [key];
            }
            // Or get it from the first option
            if (key = getOptionSelected($)) {
                return [getOptionValue(key, 1)];
            }
        }
        return r;
    }

    function focusTo(node) {
        return node.focus(), node;
    }

    function focusToOption(option, picker) {
        if (option) {
            return focusTo(option), option;
        }
    }

    function focusToOptionFirst(picker, k) {
        var option;
        if (option = goToOptionFirst(picker, k)) {
            return focusToOption(option);
        }
    }

    function focusToOptionLast(picker) {
        return focusToOptionFirst(picker, 'Last');
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

    function getOptionsValues(options, parseValue) {
        return options.map(function (v) {
            return getOptionValue(v, parseValue);
        });
    }

    function getOptionsSelected($) {
        var _options = $._options,
            selected = [];
        return forEachMap(_options, function (v, k) {
            if (isArray(v) && v[2] && !getAria(v[2], 'disabled') && getAria(v[2], 'selected')) {
                selected.push(v[2]);
            }
        }), selected;
    }

    function goToOptionFirst(picker, k) {
        var _options = picker._options,
            option;
        if (option = toValuesFromMap(_options)['find' + (k || "")](function (v) {
                return !getAria(v[2], 'disabled') && !v[2].hidden;
            })) {
            return option[2];
        }
    }

    function isInput(self) {
        return 'input' === getName(self);
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
                options.hidden = false;
                selectToOptionsNone(picker, 1);
            }
        }
    }

    function onCutTextInput(e) {
        var $ = this,
            picker = getReference($),
            _mask = picker._mask,
            self = picker.self,
            strict = picker.strict,
            hint = _mask.hint;
        delay(function () {
            getText($, 0) ? setStyle(hint, 'color', 'transparent') : letStyle(hint, 'color');
            if (strict);
            else {
                setValue(self, getText($));
            }
        }, 1)();
    }

    function onFocusOption(e) {
        selectToNone();
    }
    // Focus on the “visually hidden” self will move its focus to the mask, maintains the natural flow of the tab(s)!
    function onFocusSelf(e) {
        getReference(this).focus();
    }

    function onFocusTextInput(e) {
        var $ = this,
            picker = getReference($);
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
            hint = _mask.hint,
            strict = state.strict;
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
            var currentOption = getValueInMap(_toValue(getValue(self)), _options.values);
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
                picker.enter(false).fit();
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

    function onKeyDownOption(e) {
        var $ = this,
            exit,
            key = e.key,
            keyIsAlt = e.altKey,
            keyIsCtrl = e.ctrlKey,
            keyIsShift = e.shiftKey,
            picker = getReference($),
            _mask = picker._mask,
            _options = picker._options,
            max = picker.max,
            self = picker.self,
            hint = _mask.hint,
            value = _mask.value,
            optionNext,
            optionParent,
            optionPrev,
            valueCurrent;
        picker._event = e;
        if (KEY_DELETE_LEFT === key || KEY_DELETE_RIGHT === key) {
            exit = true;
            if (value && (valueCurrent = getElement('[data-value="' + getOptionValue($).replace(/"/g, '\\"') + '"]', getParent(value)))) {
                focusTo(valueCurrent);
            } else {
                picker.exit(exit);
            }
        } else if (KEY_ENTER === key || KEY_ESCAPE === key || KEY_TAB === key || ' ' === key) {
            if (max > 1) {
                if (KEY_ESCAPE === key) {
                    picker.exit(exit = true);
                } else if (KEY_TAB === key) {
                    picker.exit(exit = false);
                } else {
                    exit = true;
                    toggleToOption($, picker);
                }
            } else {
                if (KEY_ESCAPE !== key) {
                    selectToOption($, picker);
                }
                picker.exit(exit = KEY_TAB !== key);
            }
        } else if (KEY_ARROW_DOWN === key || KEY_PAGE_DOWN === key) {
            exit = true;
            if (KEY_PAGE_DOWN === key && 'group' === getRole(optionParent = getParent($))) {
                optionNext = getNext(optionParent);
            } else {
                optionNext = getNext($);
            }
            // Skip disabled and hidden option(s)…
            while (optionNext && (getAria(optionNext, 'disabled') || optionNext.hidden)) {
                optionNext = getNext(optionNext);
            }
            if (optionNext) {
                // Next option is a group?
                if ('group' === getRole(optionNext)) {
                    optionNext = getChildFirst(optionNext);
                }
                // Is the last option?
            } else {
                // Is in a group?
                if ((optionParent = getParent($)) && 'group' === getRole(optionParent)) {
                    optionNext = getNext(optionParent);
                }
                // Next option is a group?
                if (optionNext && 'group' === getRole(optionNext)) {
                    optionNext = getChildFirst(optionNext);
                }
            }
            // Skip disabled and hidden option(s)…
            while (optionNext && (getAria(optionNext, 'disabled') || optionNext.hidden)) {
                optionNext = getNext(optionNext);
            }
            if (keyIsShift && max > 1) {
                if (optionNext) {
                    if (!getAria(optionNext, 'selected')) {
                        toggleToOption(optionNext, picker);
                    } else {
                        if (optionPrev = getPrev($)) {
                            if ('group' === getRole(optionPrev)) {
                                optionPrev = false;
                            } else {
                                while (optionPrev && (getAria(optionPrev, 'disabled') || optionPrev.hidden)) {
                                    optionPrev = getNext(optionPrev);
                                }
                            }
                        }
                        if (!optionPrev || !getAria(optionPrev, 'selected')) {
                            // This removes the selection
                            toggleToOption($, picker);
                        }
                    }
                    focusToOption(optionNext);
                }
            } else {
                optionNext ? focusToOption(optionNext) : focusToOptionFirst(picker);
            }
        } else if (KEY_ARROW_UP === key || KEY_PAGE_UP === key) {
            exit = true;
            if (KEY_PAGE_UP === key && 'group' === getRole(optionParent = getParent($))) {
                optionPrev = getPrev(optionParent);
            } else {
                optionPrev = getPrev($);
            }
            // Skip disabled and hidden option(s)…
            while (optionPrev && (getAria(optionPrev, 'disabled') || optionPrev.hidden)) {
                optionPrev = getPrev(optionPrev);
            }
            if (optionPrev) {
                // Previous option is a group?
                if ('group' === getRole(optionPrev)) {
                    optionPrev = getChildLast(optionPrev);
                }
                // Is the first option?
            } else {
                // Is in a group?
                if ((optionParent = getParent($)) && 'group' === getRole(optionParent)) {
                    optionPrev = getPrev(optionParent);
                }
                // Previous option is a group?
                if (optionPrev && 'group' === getRole(optionPrev)) {
                    optionPrev = getChildLast(optionPrev);
                }
            }
            // Skip disabled and hidden option(s)…
            while (optionPrev && (getAria(optionPrev, 'disabled') || optionPrev.hidden)) {
                optionPrev = getPrev(optionPrev);
            }
            if (keyIsShift && max > 1) {
                if (optionPrev) {
                    if (!getAria(optionPrev, 'selected')) {
                        toggleToOption(optionPrev, picker);
                    } else {
                        if (optionNext = getNext($)) {
                            if ('group' === getRole(optionNext)) {
                                optionNext = false;
                            } else {
                                while (optionNext && (getAria(optionNext, 'disabled') || optionNext.hidden)) {
                                    optionNext = getNext(optionNext);
                                }
                            }
                        }
                        if (!optionNext || !getAria(optionNext, 'selected')) {
                            // This removes the selection
                            toggleToOption($, picker);
                        }
                    }
                    focusToOption(optionPrev);
                }
            } else {
                optionPrev ? focusToOption(optionPrev) : focusToOptionLast(picker);
            }
        } else if (KEY_BEGIN === key) {
            exit = true;
            focusToOptionFirst(picker);
        } else if (KEY_END === key) {
            exit = true;
            focusToOptionLast(picker);
        } else {
            if (keyIsCtrl && !keyIsShift && 'a' === key && !isInput(self) && max > 1) {
                exit = true;
                forEachMap(_options, function (v, k) {
                    if (!getAria(v[2], 'disabled') && !v[2].hidden) {
                        letAria(valueCurrent = v[2], 'selected');
                        v[3].selected = false;
                        toggleToOption(valueCurrent, picker); // Force select
                    }
                });
                valueCurrent && focusTo(valueCurrent);
            } else if (!keyIsCtrl) {
                if (1 === toCount(key) && !keyIsAlt) {
                    if (isInput(self)) {
                        setStyle(hint, 'color', 'transparent');
                    } else {
                        searchTerm += key; // Initialize search term, right before exit
                    }
                }!keyIsShift && picker.exit(!(exit = false));
            }
        }
        exit && (offEventDefault(e), offEventPropagation(e));
    }

    function onKeyDownValue(e) {
        var $ = this,
            exit,
            key = e.key,
            keyIsAlt = e.altKey,
            keyIsCtrl = e.ctrlKey,
            keyIsShift = e.shiftKey,
            picker = getReference($),
            _mask = picker._mask,
            _options = picker._options,
            max = picker.max,
            min = picker.min,
            self = picker.self,
            options = _mask.options,
            value = _mask.value,
            values = _mask.values,
            valueCurrent,
            valueNext,
            valuePrev;
        searchTermClear();
        if (isDisabled(self) || isInput(self) && isReadOnly(self)) {
            return offEventDefault(e);
        }
        picker._event = e;
        if (getAria($, 'selected') && (KEY_DELETE_LEFT === key || KEY_DELETE_RIGHT === key)) {
            searchTerm = "";
            if (min === toSetCount(values)) {
                picker.fire('min.options', [min, min]);
            } else {
                var index = 0;
                forEachSet(values, function (v) {
                    if (min > index) {
                        if (valueCurrent = getValueInMap(getOptionValue(v, 1), _options.values)) {
                            if (min < 1) {
                                letAria(valueCurrent[2], 'selected');
                                valueCurrent[3].selected = false;
                                letDatum(v, 'value');
                                setHTML(v._[VALUE_TEXT], "");
                            }
                        }
                        focusTo(_mask.value = v);
                    } else if (getAria(v, 'selected')) {
                        if (valueCurrent = getValueInMap(getOptionValue(v, 1), _options.values)) {
                            letAria(valueCurrent[2], 'selected');
                            valueCurrent[3].selected = false;
                        }
                        offEvent('keydown', v, onKeyDownValue);
                        offEvent('mousedown', v, onPointerDownValue);
                        offEvent('touchstart', v, onPointerDownValue);
                        letValueInMap(v, values), letElement(v);
                    }
                    ++index;
                });
            }
            forEachSet(values, function (v) {
                return letAria(v, 'selected');
            });
        } else if (KEY_DELETE_LEFT === key) {
            searchTerm = "";
            var countValues = toSetCount(values);
            if (min < countValues) {
                if (valueCurrent = getValueInMap(getOptionValue($, 1), _options.values)) {
                    letAria(valueCurrent[2], 'selected');
                    valueCurrent[3].selected = false;
                    if ((valuePrev = getPrev($)) && hasKeyInMap(valuePrev, values) || (valuePrev = getNext($)) && hasKeyInMap(valuePrev, values)) {
                        focusTo(_mask.value = valuePrev);
                        offEvent('keydown', $, onKeyDownValue);
                        offEvent('mousedown', $, onPointerDownValue);
                        offEvent('touchstart', $, onPointerDownValue);
                        letValueInMap($, values), letElement($);
                        // Do not remove the only option value
                    } else {
                        letDatum(_mask.value = $, 'value');
                        setHTML($._[VALUE_TEXT], "");
                        // No option(s) selected
                        if (0 === min) {
                            selectToOptionsNone(picker, 1);
                        }
                    }
                }
            } else {
                picker.fire('min.options', [countValues, min]);
            }
            if (max !== Infinity && max > countValues) {
                forEachMap(_options, function (v, k) {
                    if (!v[3].disabled) {
                        letAria(v[2], 'disabled');
                        setAttribute(v[2], 'tabindex', 0);
                    }
                });
            }
        } else if (KEY_DELETE_RIGHT === key) {
            searchTerm = "";
            var _countValues = toSetCount(values);
            if (min < _countValues) {
                if (valueCurrent = getValueInMap(getOptionValue($, 1), _options.values)) {
                    letAria(valueCurrent[2], 'selected');
                    valueCurrent[3].selected = false;
                    if ((valueNext = getNext($)) && hasKeyInMap(valueNext, values) || (valueNext = getPrev($)) && hasKeyInMap(valueNext, values)) {
                        focusTo(_mask.value = valueNext);
                        offEvent('keydown', $, onKeyDownValue);
                        offEvent('mousedown', $, onPointerDownValue);
                        offEvent('touchstart', $, onPointerDownValue);
                        letValueInMap($, values), letElement($);
                        // Do not remove the only option value
                    } else {
                        letDatum(_mask.value = $, 'value');
                        setHTML($._[VALUE_TEXT], "");
                        // No option(s) selected
                        if (0 === min) {
                            selectToOptionsNone(picker, 1);
                        }
                    }
                }
            } else {
                picker.fire('min.options', [_countValues, min]);
            }
            if (max !== Infinity && max > _countValues) {
                forEachMap(_options, function (v, k) {
                    if (!v[3].disabled) {
                        letAria(v[2], 'disabled');
                        setAttribute(v[2], 'tabindex', 0);
                    }
                });
            }
        } else if (KEY_ESCAPE === key) {
            searchTerm = "";
            picker.exit(exit = true);
        } else if (KEY_TAB === key) {
            searchTerm = "";
            picker.exit(exit = false);
        } else if (KEY_ARROW_DOWN === key || KEY_ARROW_UP === key || KEY_ENTER === key || KEY_PAGE_DOWN === key || KEY_PAGE_UP === key || "" === searchTerm && ' ' === key) {
            var focus = exit = true;
            if (KEY_ENTER === key || ' ' === key) {
                if (valueCurrent = getValueInMap(getOptionValue($, 1), _options.values)) {
                    focus = false;
                    onAnimationsEnd(options, function () {
                        return focusTo(valueCurrent[2]);
                    }, scrollTo(valueCurrent[2]));
                }
                if (getAria($, 'selected')) {
                    letAria($, 'selected');
                } else {
                    setAria($, 'selected', true);
                }
            }
            if (picker.size < 2) {
                setStyle(options, 'max-height', 0);
            }
            picker.enter(focus).fit();
        } else if (KEY_ARROW_LEFT === key) {
            exit = true;
            if ((valuePrev = getPrev($)) && hasKeyInMap(valuePrev, values)) {
                if (keyIsShift) {
                    if (getAria(valuePrev, 'selected')) {
                        letAria($, 'selected');
                    } else {
                        setAria($, 'selected', true);
                        setAria(valuePrev, 'selected', true);
                    }
                }
                focusTo(valuePrev);
            }
        } else if (KEY_ARROW_RIGHT === key) {
            exit = true;
            if ((valueNext = getNext($)) && hasKeyInMap(valueNext, values)) {
                if (keyIsShift) {
                    if (getAria(valueNext, 'selected')) {
                        letAria($, 'selected');
                    } else {
                        setAria($, 'selected', true);
                        setAria(valueNext, 'selected', true);
                    }
                }
                focusTo(valueNext);
            }
        } else if (1 === toCount(key) && !keyIsAlt) {
            exit = true;
            if (keyIsCtrl && !keyIsShift && 'r' === key) {
                exit = false; // Native reload :(
            } else if (keyIsCtrl && !keyIsShift && 'a' === key && max > 1) {
                // Select all visually
                setAria(valueCurrent = value, 'selected', true);
                while ((valueNext = getNext(valueCurrent)) && hasKeyInMap(valueNext, values)) {
                    setAria(valueCurrent = valueNext, 'selected', true);
                }
                while ((valuePrev = getPrev(valueCurrent)) && hasKeyInMap(valuePrev, values)) {
                    setAria(valueCurrent = valuePrev, 'selected', true);
                }
            } else if (!keyIsCtrl) {
                searchTerm += key;
            }
        }
        if ("" !== searchTerm) {
            filter(picker, searchTerm, _options, true);
        }
        exit && offEventDefault(e);
    }

    function onPointerDownValue(e) {
        offEventDefault(e);
        var $ = this,
            picker = getReference($),
            _mask = picker._mask,
            max = picker.max,
            values = _mask.values;
        picker._event = e;
        // Clear all selection(s) on “click”
        forEachSet(values, function (v) {
            return letAria(v, 'selected');
        });
        // Do not show option(s) on “click” value if it is not the only value for `<select multiple>`
        max > 1 && toSetCount(values) > 1 && (picker.exit(), focusTo($), offEventPropagation(e));
    }

    function onPasteTextInput(e) {
        offEventDefault(e);
        var $ = this,
            picker = getReference($),
            _mask = picker._mask,
            hint = _mask.hint;
        delay(function () {
            return getText($, 0) ? setStyle(hint, 'color', 'transparent') : letStyle(hint, 'color');
        }, 1)();
        insertAtSelection($, e.clipboardData.getData('text/plain'));
    }
    // The default state is `0`. When the pointer is pressed on the option mask, its value will become `1`. This check is
    // done to distinguish between a “touch only” and a “touch move” on touch device(s). It is also checked on pointer
    // device(s) and should not give a wrong result.
    var currentPointerState = 0,
        touchTop = false,
        touchTopCurrent = false;

    function onPointerDownMask(e) {
        // This is necessary for device(s) that support both pointer and touch control so that they will not execute both
        // `mousedown` and `touchstart` event(s), causing the option picker’s option(s) to open and then close immediately.
        // Note that this will also disable the native pane scrolling feature on touch device(s).
        offEventDefault(e);
        var $ = this,
            picker = getReference($),
            _mask = picker._mask,
            _options = picker._options,
            self = picker.self,
            options = _mask.options,
            target = e.target;
        picker._event = e;
        if (isDisabled(self) || isReadOnly(self) || getDatum($, 'size')) {
            return;
        }
        if ('listbox' === getRole(target) || getParent(target, '[role=listbox]')) {
            // The user is likely browsing through the available option(s) by dragging the scroll bar
            return;
        }
        forEachMap(_options, function (v) {
            return v[2].hidden = false;
        });
        if (picker.size < 2) {
            setStyle(options, 'max-height', 0);
        }
        picker[getReference(R) !== picker ? 'enter' : 'exit'](true).fit();
    }

    function onPointerDownOption(e) {
        var $ = this;
        getReference($)._event = e;
        // Add an “active” effect on `touchstart` to indicate which option is about to be selected. We don’t need this
        // indication on `mousedown` because pointer device(s) already have a hover state that is clear enough to indicate
        // which option is about to be selected.
        if ('touchstart' === e.type && !getAria($, 'disabled')) {
            setAria($, 'selected', true);
        }
        currentPointerState = 1; // Pointer is “down”
    }

    function onPointerDownRoot(e) {
        if ('touchstart' === e.type) {
            touchTop = e.touches[0].clientY;
        }
        var $ = this,
            picker = getReference($);
        if (!picker) {
            return;
        }
        picker._event = e;
        var mask = picker.mask,
            target = e.target;
        if (mask !== target && mask !== getParent(target, '[role=combobox]')) {
            letReference($), picker.exit();
        }
    }

    function onPointerMoveRoot(e) {
        touchTopCurrent = 'touchmove' === e.type ? e.touches[0].clientY : false;
        var $ = this,
            picker = getReference($);
        if (!picker) {
            return;
        }
        picker._event = e;
        var _mask = picker._mask,
            lot = _mask.lot,
            v;
        if (false !== touchTop && false !== touchTopCurrent) {
            if (1 === currentPointerState && touchTop !== touchTopCurrent) {
                ++currentPointerState;
            }
            // Programmatically re-enable the swipe feature in the option(s) list because the default `touchstart` event
            // has been disabled. It does not have the innertia effect as in the native after-swipe reaction, but it is
            // still better than doing nothing :\
            v = getScroll(lot);
            v[1] -= touchTopCurrent - touchTop;
            setScroll(lot, v);
            touchTop = touchTopCurrent;
        }
    }
    // The actual option selection happens when the pointer is released, to clearly identify whether we want to select an
    // option or just want to scroll through the option(s) list by swiping over the option on touch device(s).
    function onPointerUpOption(e) {
        var $ = this,
            picker = getReference($);
        picker._event = e;
        // A “touch only” event is valid only if the pointer has not been “move(d)” up to this event
        if (1 === currentPointerState) {
            if (!getAria($, 'disabled')) {
                if (picker.max > 1) {
                    toggleToOption($, picker), focusTo($);
                } else {
                    selectToOption($, picker), picker.size < 2 ? picker.exit(true) : focusTo($);
                }
            }
        } else {
            // Remove the “active” effect that was previously added on `touchstart`
            letAria($, 'selected');
        }
        currentPointerState = 0; // Reset current pointer state
    }

    function onPointerUpRoot() {
        currentPointerState = 0; // Reset current pointer state
        touchTop = false;
    }

    function onResetForm(e) {
        getReference(this).reset()._event = e;
    }

    function onSubmitForm(e) {
        var $ = this,
            picker = getReference($),
            max = picker.max,
            min = picker.min,
            count = toCount(getOptionsSelected(picker));
        if (count < min) {
            picker.fire('min.options', [count, min]);
            offEventDefault(e);
        } else if (count > max) {
            picker.fire('max.options', [count, max]);
            offEventDefault(e);
        }
    }

    function onResizeWindow(e) {
        var picker = getReference(R);
        picker && (picker.fit()._event = e);
    }

    function onScrollWindow(e) {
        onResizeWindow.call(this, e);
    }

    function scrollTo(node) {
        node.scrollIntoView({
            block: 'nearest'
        });
    }

    function selectToOption(option, picker) {
        var _mask = picker._mask;
        picker.min;
        var self = picker.self,
            hint = _mask.hint,
            input = _mask.input,
            value = _mask.value,
            optionReal,
            v;
        if (option) {
            optionReal = option._[OPTION_SELF];
            selectToOptionsNone(picker);
            optionReal.selected = true;
            setAria(option, 'selected', true);
            setValue(self, v = getOptionValue(option));
            if (isInput(self)) {
                setAria(input, 'activedescendant', getID(option));
                setStyle(hint, 'color', 'transparent');
                setText(input, getText(option));
            } else {
                setDatum(value, 'value', v);
                setHTML(value._[VALUE_TEXT], getHTML(option._[OPTION_TEXT]));
            }
            return picker.fire('change', ["" !== v ? v : null]), option;
        }
    }

    function selectToOptionFirst(picker) {
        var option;
        if (option = goToOptionFirst(picker)) {
            return selectToOption(option, picker);
        }
    }

    function selectToOptionsNone(picker, fireValue) {
        var _mask = picker._mask,
            _options = picker._options,
            self = picker.self,
            hint = _mask.hint,
            input = _mask.input,
            value = _mask.value,
            v;
        forEachMap(_options, function (v) {
            letAria(v[2], 'selected');
            v[3].selected = false;
        });
        if (fireValue) {
            setValue(self, v = "");
            if (isInput(self)) {
                letAria(input, 'activedescendant');
                letStyle(hint, 'color');
                setText(input, "");
            } else {
                letDatum(value, 'value');
                setHTML(value._[VALUE_TEXT], v);
            }
        }
    }

    function toggleToOption(option, picker) {
        var _mask = picker._mask,
            _options = picker._options,
            max = picker.max,
            min = picker.min,
            self = picker.self,
            state = picker.state,
            value = _mask.value,
            values = _mask.values,
            n = state.n,
            selected,
            selectedFirst,
            valueCurrent,
            valueNext;
        if (option) {
            var optionReal = option._[OPTION_SELF],
                a = getOptionsValues(getOptionsSelected(picker)),
                b,
                c;
            if (getAria(option, 'selected') && optionReal.selected) {
                if (min > 0 && (c = toCount(a)) <= min) {
                    picker.fire('min.options', [c, min]);
                } else {
                    letAria(option, 'selected');
                    optionReal.selected = false;
                }
            } else {
                setAria(option, 'selected', true);
                optionReal.selected = true;
            }
            if (!isInput(self)) {
                b = getOptionsValues(getOptionsSelected(picker));
                if (max !== Infinity && (c = toCount(b)) === max) {
                    forEachMap(_options, function (v, k) {
                        if (!getAria(v[2], 'selected')) {
                            letAttribute(v[2], 'tabindex');
                            setAria(v[2], 'disabled', true);
                        }
                    });
                } else if (c > max) {
                    letAria(option, 'selected');
                    optionReal.selected = false;
                    forEachMap(_options, function (v, k) {
                        if (!getAria(v[2], 'selected')) {
                            letAttribute(v[2], 'tabindex');
                            setAria(v[2], 'disabled', true);
                        }
                    });
                    picker.fire('max.options', [c, max]);
                } else {
                    forEachMap(_options, function (v, k) {
                        if (!v[3].disabled) {
                            letAria(v[2], 'disabled');
                            setAttribute(v[2], 'tabindex', 0);
                        }
                    });
                }
                selected = getOptionsSelected(picker);
                selectedFirst = selected.shift();
                if (selectedFirst) {
                    setDatum(value, 'value', getOptionValue(selectedFirst));
                    setHTML(value._[VALUE_TEXT], getHTML(selectedFirst._[OPTION_TEXT]));
                    letValueInMap(value, values);
                    forEachSet(values, function (v) {
                        offEvent('keydown', v, onKeyDownValue);
                        offEvent('mousedown', v, onPointerDownValue);
                        offEvent('touchstart', v, onPointerDownValue);
                        letReference(v), letElement(v);
                        return -1; // Remove
                    });
                    values.add(valueCurrent = value); // Add the only value to the set
                    forEachArray(selected, function (v, k) {
                        valueNext = setID(letID(value.cloneNode(true)));
                        valueNext.tabIndex = -1;
                        valueNext._ = {};
                        valueNext._[VALUE_SELF] = null;
                        valueNext._[VALUE_TEXT] = getElement('.' + n + '__value-text', valueNext);
                        onEvent('keydown', valueNext, onKeyDownValue);
                        onEvent('mousedown', valueNext, onPointerDownValue);
                        onEvent('touchstart', valueNext, onPointerDownValue);
                        letAria(valueNext, 'selected');
                        setDatum(valueNext, 'value', getOptionValue(v));
                        setHTML(valueNext._[VALUE_TEXT], getHTML(v._[OPTION_TEXT]));
                        setReference(valueNext, picker), values.add(setNext(valueCurrent, valueNext));
                        valueCurrent = valueNext;
                    });
                }
            }
            return picker.fire('change', [b]), option;
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
        return $.attach(self, _fromStates({}, OptionPicker.state, isBoolean(state) ? {
            strict: state
        } : state || {}));
    }

    function OptionPickerOptions(of, options) {
        var $ = this;
        // Return new instance if `OptionPickerOptions` was called without the `new` operator
        if (!isInstance($, OptionPickerOptions)) {
            return new OptionPickerOptions(of, options);
        }
        $.of = of;
        $.values = new Map();
        if (options) {
            createOptions(of, options);
        }
        return $;
    }
    OptionPicker.from = function (self, state) {
        return new OptionPicker(self, state);
    };
    OptionPicker.of = getReference;
    OptionPicker.state = {
        'max': null,
        'min': null,
        'n': 'option-picker',
        'options': null,
        'size': null,
        'strict': false,
        'with': []
    };
    OptionPicker.version = '2.0.1';
    setObjectAttributes(OptionPicker, {
        name: {
            value: name
        }
    }, 1);
    setObjectAttributes(OptionPicker, {
        active: {
            get: function get() {
                return this._active;
            },
            set: function set(value) {
                var $ = this,
                    _mask = $._mask,
                    mask = $.mask,
                    self = $.self,
                    input = _mask.input,
                    inputReadOnly = _mask.value,
                    v = !!value;
                self.disabled = !($._active = v);
                if (v) {
                    letAria(mask, 'disabled');
                    if (input) {
                        letAria(input, 'disabled');
                        setAttribute(input, 'contenteditable', "");
                    } else if (inputReadOnly) {
                        setAttribute(inputReadOnly, 'tabindex', 0);
                    }
                } else {
                    setAria(mask, 'disabled', true);
                    if (input) {
                        setAria(input, 'disabled', true);
                        letAttribute(input, 'contenteditable');
                    } else if (inputReadOnly) {
                        letAttribute(inputReadOnly, 'tabindex');
                    }
                }
                return $;
            }
        },
        fix: {
            get: function get() {
                return this._fix;
            },
            set: function set(value) {
                var $ = this,
                    _mask = $._mask,
                    mask = $.mask,
                    self = $.self,
                    input = _mask.input,
                    v = !!value;
                if (!isInput(self)) {
                    return $;
                }
                $._active = !($._fix = self.readOnly = v);
                if (v) {
                    letAttribute(input, 'contenteditable');
                    setAria(input, 'readonly', true);
                    setAria(mask, 'readonly', true);
                    setAttribute(input, 'tabindex', 0);
                } else {
                    letAria(input, 'readonly');
                    letAria(mask, 'readonly');
                    letAttribute(input, 'tabindex');
                    setAttribute(input, 'contenteditable', "");
                }
                return $;
            }
        },
        max: {
            get: function get() {
                var $ = this,
                    state = $.state,
                    max = state.max;
                return Infinity === max || isInteger(max) && max > 0 ? max : 1;
            },
            set: function set(value) {
                var $ = this,
                    _active = $._active,
                    mask = $.mask,
                    self = $.self,
                    state = $.state;
                if (!_active || isInput(self)) {
                    return $;
                }
                value = (Infinity === value || isInteger(value)) && value > 0 ? value : 0;
                self.multiple = value > 1;
                state.max = value;
                value > 1 ? setAria(mask, 'multiselectable', true) : letAria(mask, 'multiselectable');
                return $;
            }
        },
        min: {
            get: function get() {
                var $ = this,
                    state = $.state,
                    min = state.min;
                return !isInteger(min) || min < 0 ? 0 : min;
            },
            set: function set(value) {
                var $ = this,
                    _active = $._active,
                    state = $.state;
                if (!_active) {
                    return $;
                }
                state.min = isInteger(value) && value > 0 ? value : 0;
                return $;
            }
        },
        options: {
            get: function get() {
                return this._options;
            },
            set: function set(options) {
                var $ = this,
                    _active = $._active;
                $._mask;
                var max = $.max,
                    selected;
                if (!_active) {
                    return $;
                }
                if (isFloat(options) || isInteger(options) || isString(options)) {
                    options = [options];
                }
                if (toCount(selected = createOptions($, options))) {
                    var isMultipleSelect = max > 1;
                    $['value' + (isMultipleSelect ? 's' : "")] = $['_value' + (isMultipleSelect ? 's' : "")] = isMultipleSelect ? selected : selected[0];
                }
                var values = [];
                forEachMap($._options, function (v) {
                    return values.push(getOptionValue(v[2]));
                });
                return $.fire('set.options', [values]);
            }
        },
        size: {
            get: function get() {
                var _self$size;
                var $ = this,
                    self = $.self,
                    state = $.state,
                    size;
                if (isInput(self)) {
                    return null;
                }
                size = (_self$size = self.size) != null ? _self$size : state.size || 1;
                return !isInteger(size) || size < 1 ? 1 : size; // <https://html.spec.whatwg.org#attr-select-size>
            },
            set: function set(value) {
                var $ = this,
                    _active = $._active,
                    _mask = $._mask,
                    mask = $.mask,
                    self = $.self,
                    state = $.state,
                    options = _mask.options,
                    size = !isInteger(value) || value < 1 ? 1 : value;
                if (isInput(self)) {
                    return $;
                }
                self.size = state.size = size;
                if (1 === size) {
                    letDatum(mask, 'size');
                    letStyle(options, 'max-height');
                    _active && letReference(R);
                } else {
                    var option = goToOptionFirst($);
                    if (option) {
                        var _ref, _getStyle;
                        var optionsBorderBottom = getStyle(options, 'border-bottom-width'),
                            optionsBorderTop = getStyle(options, 'border-top-width'),
                            optionsGap = getStyle(options, 'gap'),
                            optionHeight = (_ref = (_getStyle = getStyle(option, 'height')) != null ? _getStyle : getStyle(option, 'min-height')) != null ? _ref : getStyle(option, 'line-height');
                        setDatum(mask, 'size', size);
                        setStyle(options, 'max-height', 'calc(' + optionsBorderTop + ' + ' + optionsBorderBottom + ' + (' + optionHeight + '*' + size + ') + calc(' + optionsGap + '*' + size + '))');
                        _active && setReference(R, $);
                    }
                }
                return $;
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
                    _active = $._active,
                    _mask = $._mask,
                    hint = _mask.hint,
                    input = _mask.input,
                    text = _mask.text,
                    v;
                if (!_active || !text) {
                    return $;
                }
                setText(input, v = _fromValue(value));
                return v ? setStyle(hint, 'color', 'transparent') : letStyle(hint, 'color'), $;
            }
        },
        value: {
            get: function get() {
                var value = getValue(this.self);
                return "" !== value ? value : null;
            },
            set: function set(value) {
                var $ = this,
                    _active = $._active,
                    _options = $._options,
                    option;
                if (!_active) {
                    return $;
                }
                if (option = getValueInMap(_toValue(value), _options.values)) {
                    selectToOption(option[2], $);
                }
                return $;
            }
        },
        values: {
            get: function get() {
                return getOptionsValues(getOptionsSelected(this));
            },
            set: function set(values) {
                var $ = this,
                    _active = $._active,
                    _options = $._options,
                    option;
                if (!_active || $.max < 2) {
                    return $;
                }
                selectToOptionsNone($);
                if (isFloat(values) || isInteger(values) || isString(values)) {
                    values = [values];
                }
                if (isArray(values)) {
                    forEachArray(values, function (v) {
                        if (option = getValueInMap(_toValue(v), _options.values)) {
                            toggleToOption(option[2], $);
                        }
                    });
                }
                return $;
            }
        }
    });
    OptionPicker._ = setObjectMethods(OptionPicker, {
        attach: function attach(self, state) {
            var _state$size;
            var $ = this;
            self = self || $.self;
            state = state || $.state;
            $._event = null;
            $._options = new OptionPickerOptions($);
            $._value = null;
            $._values = [];
            $.self = self;
            $.state = state;
            var _state = state,
                max = _state.max,
                min = _state.min,
                n = _state.n,
                isDisabledSelf = isDisabled(self),
                isInputSelf = isInput(self),
                isMultipleSelect = max && max > 1 || !isInputSelf && self.multiple,
                isReadOnlySelf = isReadOnly(self),
                theInputPlaceholder = self.placeholder;
            $._active = !isDisabledSelf && !isReadOnlySelf;
            $._fix = isInputSelf && isReadOnlySelf;
            var arrow = setElement('span', {
                'class': n + '__arrow',
                'role': 'none'
            });
            var form = getParentForm(self);
            var mask = setElement('div', {
                'aria': {
                    'disabled': isDisabledSelf ? 'true' : false,
                    'expanded': 'false',
                    'haspopup': 'listbox',
                    'multiselectable': isMultipleSelect ? 'true' : false,
                    'readonly': isInputSelf && isReadOnlySelf ? 'true' : false
                },
                'class': n,
                'role': 'combobox'
            });
            $.mask = mask;
            var maskFlex = setElement('div', {
                'class': n + '__flex',
                'role': 'group'
            });
            var maskOptions = setElement('div', {
                'class': n + '__options',
                'role': 'listbox'
            });
            var maskOptionsLot = setElement('div', {
                'class': n + '__options-lot',
                'role': 'none'
            });
            var text = setElement('span', {
                'class': n + '__' + (isInputSelf ? 'text' : 'value'),
                'tabindex': isInputSelf ? false : 0
            });
            if (!isInputSelf) {
                text._ = {};
                text._[VALUE_SELF] = null;
                setChildLast(text, text._[VALUE_TEXT] = setElement('span', {
                    'class': n + '__value-text',
                    'role': 'none'
                }));
            }
            var textInput = setElement('span', {
                'aria': {
                    'autocomplete': 'list',
                    'disabled': isDisabledSelf ? 'true' : false,
                    'multiline': 'false',
                    'placeholder': isInputSelf ? theInputPlaceholder : false,
                    'readonly': isReadOnlySelf ? 'true' : false
                },
                'autocapitalize': 'off',
                'contenteditable': isDisabledSelf || isReadOnlySelf || !isInputSelf ? false : "",
                'role': 'searchbox',
                'spellcheck': !isInputSelf ? false : 'false',
                'tabindex': isReadOnlySelf && isInputSelf ? 0 : false
            });
            var textInputHint = setElement('span', isInputSelf ? theInputPlaceholder + "" : "", {
                'aria': {
                    'hidden': 'true'
                }
            });
            setChildLast(mask, maskFlex);
            setChildLast(mask, maskOptions);
            setChildLast(maskOptions, maskOptionsLot);
            setChildLast(maskFlex, text);
            setChildLast(maskFlex, arrow);
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
                onEvent('keydown', text, onKeyDownValue);
                onEvent('mousedown', text, onPointerDownValue);
                onEvent('touchstart', text, onPointerDownValue);
                setReference(text, $);
            }
            setClass(self, n + '__self');
            setNext(self, mask);
            setChildLast(mask, self);
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
            var _mask = {
                arrow: arrow,
                flex: maskFlex,
                hint: isInputSelf ? textInputHint : null,
                input: isInputSelf ? textInput : null,
                lot: maskOptionsLot,
                of: self,
                options: maskOptions,
                self: mask,
                values: new Set()
            };
            _mask[isInputSelf ? 'text' : 'value'] = text;
            if (!isInputSelf) {
                _mask.values.add(text); // Add the only value to the set
            }
            $._mask = _mask;
            // Re-assign some state value(s) using the setter to either normalize or reject the initial value
            $.max = isMultipleSelect ? max != null ? max : Infinity : 1;
            $.min = isInputSelf ? 0 : min != null ? min : 1;
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
                        if (toCount(selected = createOptions($, options))) {
                            $['value' + (isMultipleSelect ? 's' : "")] = $['_value' + (isMultipleSelect ? 's' : "")] = isMultipleSelect ? selected : selected[0];
                        } else if (selected = getOptionSelected($, 1)) {
                            selected = getOptionValue(selected);
                            $['value' + (isMultipleSelect ? 's' : "")] = $['_value' + (isMultipleSelect ? 's' : "")] = isMultipleSelect ? [selected] : selected;
                        }
                        $.fire('load', [null, $.values])[$.options.open ? 'enter' : 'exit']().fit();
                    });
                } else {
                    if (toCount(selected = createOptions($, options))) {
                        $['value' + (isMultipleSelect ? 's' : "")] = $['_value' + (isMultipleSelect ? 's' : "")] = isMultipleSelect ? selected : selected[0];
                    }
                }
            } else {
                if (toCount(selected = createOptions($, options || getOptions(self)))) {
                    $['value' + (isMultipleSelect ? 's' : "")] = $['_value' + (isMultipleSelect ? 's' : "")] = isMultipleSelect ? selected : selected[0];
                }
            }
            // After the initial value has been set, restore the previous `this._active` value
            $._active = _active;
            // Has to be set after the option(s) are set, because from that point on we want to get the computed size of the
            // option to set the correct height for the option(s) based on the `size` attribute value.
            $.size = (_state$size = state.size) != null ? _state$size : isInputSelf ? 1 : self.size;
            // Force `id` attribute(s)
            setAria(mask, 'controls', getID(setID(maskOptions)));
            setAria(mask, 'labelledby', getID(setID(text)));
            setAria(self, 'hidden', true);
            setAria(textInput, 'controls', getID(maskOptions));
            setID(arrow);
            setID(mask);
            setID(maskFlex);
            setID(maskOptionsLot);
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
                input = _mask.input,
                value = _mask.value;
            var form = getParentForm(self);
            $._active = false;
            $._options = new OptionPickerOptions($);
            $._value = null;
            $._values = [];
            if (form) {
                offEvent('reset', form, onResetForm);
                offEvent('submit', form, onSubmitForm);
            }
            if (input) {
                offEvent('blur', input, onBlurTextInput);
                offEvent('cut', input, onCutTextInput);
                offEvent('focus', input, onFocusTextInput);
                offEvent('keydown', input, onKeyDownTextInput);
                offEvent('paste', input, onPasteTextInput);
            }
            if (value) {
                offEvent('keydown', value, onKeyDownValue);
                offEvent('mousedown', value, onPointerDownValue);
                offEvent('touchstart', value, onPointerDownValue);
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
            setNext(mask, self);
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
                _mask = $._mask,
                _options = $._options,
                mask = $.mask,
                self = $.self,
                input = _mask.input,
                lot = _mask.lot,
                options = _mask.options,
                value = _mask.value,
                values = _mask.values;
            if (!_active) {
                return $;
            }
            setAria(mask, 'expanded', toCount(getChildren(lot)) > 0);
            var theRootReference = getReference(R);
            if (theRootReference && $ !== theRootReference) {
                theRootReference.exit(); // Exit other(s)
            }
            setReference(R, $); // Link current picker to the root target
            // Clear all selection(s) on “click”
            forEachSet(values, function (v) {
                return letAria(v, 'selected');
            });
            $.fire('enter');
            if (focus) {
                if (isInput(self)) {
                    focusTo(input), selectTo(input, mode);
                } else if (option = getValueInMap(_toValue(getValue(self)), _options.values)) {
                    onAnimationsEnd(options, function () {
                        return focusTo(option[2]);
                    }, scrollTo(option[2]));
                } else if (option = goToOptionFirst($)) {
                    onAnimationsEnd(options, function () {
                        return focusTo(option);
                    }, scrollTo(option));
                } else {
                    focusTo(value);
                }
            }
            return $;
        },
        exit: function exit(focus, mode) {
            var $ = this,
                _active = $._active,
                _mask = $._mask,
                _options = $._options,
                mask = $.mask,
                self = $.self,
                input = _mask.input,
                value = _mask.value;
            if (!_active) {
                return $;
            }
            forEachMap(_options, function (v) {
                return v[2].hidden = false;
            });
            setAria(mask, 'expanded', false);
            letReference(R);
            $.fire('exit');
            if (focus) {
                if (isInput(self)) {
                    focusTo(input), selectTo(input, mode);
                } else {
                    focusTo(value);
                }
            }
            return $;
        },
        fit: function fit() {
            var $ = this,
                _active = $._active,
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
            return $.fire('fit');
        },
        focus: function focus(mode) {
            var $ = this,
                _mask = $._mask,
                input = _mask.input,
                value = _mask.value;
            if (input) {
                focusTo(input), selectTo(input, mode);
            } else {
                focusTo(value);
            }
            return $;
        },
        reset: function reset(focus, mode) {
            var $ = this,
                _active = $._active,
                _value = $._value,
                _values = $._values,
                max = $.max;
            if (!_active) {
                return $;
            }
            if (max > 1) {
                $.values = _values;
            } else {
                $.value = _value;
            }
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
        at: function at(key) {
            return getValueInMap(_toValue(key), this.values);
        },
        count: function count() {
            return toMapCount(this.values);
        },
        delete: function _delete(key, _fireHook, _fireValue) {
            if (_fireHook === void 0) {
                _fireHook = 1;
            }
            if (_fireValue === void 0) {
                _fireValue = 1;
            }
            var $ = this,
                of = $.of,
                values = $.values,
                _active = of._active,
                _mask = of._mask,
                self = of.self,
                state = of.state,
                lot = _mask.lot,
                options = _mask.options,
                r;
            if (!_active) {
                return false;
            }
            if (!isSet(key)) {
                forEachMap(values, function (v, k) {
                    return $.delete(k, 0, 0);
                });
                selectToOptionsNone(of, _fireValue);
                options.hidden = true;
                return _fireHook && of.fire('let.options', [
                    []
                ]) && 0 === $.count();
            }
            if (!(r = getValueInMap(key = _toValue(key), values))) {
                return _fireHook && of.fire('not.option', [key]), false;
            }
            var parent = getParent(r[2]),
                parentReal = getParent(r[3]),
                value = getOptionValue(r[2]),
                valueReal = of.value;
            offEvent('focus', r[2], onFocusOption);
            offEvent('keydown', r[2], onKeyDownOption);
            offEvent('mousedown', r[2], onPointerDownOption);
            offEvent('mouseup', r[2], onPointerUpOption);
            offEvent('touchend', r[2], onPointerUpOption);
            offEvent('touchstart', r[2], onPointerDownOption);
            letElement(r[2]), letElement(r[3]);
            r = letValueInMap(key, values);
            // Remove empty group(s)
            parent && 'group' === getRole(parent) && 0 === toCount(getChildren(parent)) && letElement(parent);
            parentReal && 'optgroup' === getName(parentReal) && 0 === toCount(getChildren(parentReal)) && letElement(parentReal);
            // Clear value if there are no option(s)
            if (0 === toCount(getChildren(lot))) {
                selectToOptionsNone(of, !isInput(self));
                options.hidden = true;
                // Reset value to the first option if removed option is the selected option
            } else {
                setValue(self, "");
                value === valueReal && selectToOptionFirst(of);
            }
            if (!isFunction(state.options)) {
                state.options = values;
            }
            return _fireHook && of.fire('let.option', [key]), r;
        },
        get: function get(key) {
            var $ = this,
                values = $.values,
                value = getValueInMap(_toValue(key), values),
                parent;
            if (value && (parent = getParent(value[2])) && 'group' === getRole(parent)) {
                return [getElementIndex(value[2]), getElementIndex(parent)];
            }
            return value ? getElementIndex(value[2]) : -1;
        },
        has: function has(key) {
            return hasKeyInMap(_toValue(key), this.values);
        },
        let: function _let(key, _fireHook) {
            if (_fireHook === void 0) {
                _fireHook = 1;
            }
            return this.delete(key, _fireHook, 1);
        },
        set: function set(key, value, _fireHook) {
            var _getState3, _getState4, _getState5;
            if (_fireHook === void 0) {
                _fireHook = 1;
            }
            var $ = this,
                of = $.of,
                values = $.values,
                _active = of._active;
            if (!_active) {
                return false;
            }
            if ($.has(key = _toValue(key))) {
                return _fireHook && of.fire('has.option', [key]), false;
            }
            var _mask = of._mask,
                self = of.self,
                state = of.state,
                lot = _mask.lot,
                options = _mask.options,
                n = state.n,
                classes,
                itemsParent,
                option,
                optionGroup,
                optionGroupReal,
                optionReal,
                optionText,
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
                var _getState;
                optionGroup = getElement('.' + n + 's-batch[data-value="' + value[1]['&'].replace(/"/g, '\\"') + '"]', lot);
                optionGroupReal = getElement('optgroup[label="' + value[1]['&'].replace(/"/g, '\\"') + '"]', self) || setElement('optgroup', {
                    'label': value[1]['&'],
                    'title': (_getState = getState(value[1], 'title')) != null ? _getState : false
                });
                if (!optionGroup || getOptionValue(optionGroup) !== value[1]['&']) {
                    var _getState2;
                    setChildLast(lot, optionGroup = setElement('span', {
                        'class': n + 's-batch',
                        'data': {
                            'value': value[1]['&']
                        },
                        'role': 'group',
                        'title': (_getState2 = getState(value[1], 'title')) != null ? _getState2 : false
                    }));
                    setChildLast(itemsParent, optionGroupReal);
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
            v = _fromValue(v || key);
            option = value[2] || setElement('span', {
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
            optionText = value[2] ? value[2]._[OPTION_TEXT] : setElement('span', _fromValue(value[0]), {
                'class': n + '-text',
                'role': 'none'
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
            option._[OPTION_TEXT] = optionText;
            if (!disabled && !value[2]) {
                onEvent('focus', option, onFocusOption);
                onEvent('keydown', option, onKeyDownOption);
                onEvent('mousedown', option, onPointerDownOption);
                onEvent('mouseup', option, onPointerUpOption);
                onEvent('touchend', option, onPointerUpOption);
                onEvent('touchstart', option, onPointerDownOption);
            }
            setChildLast(option, optionText);
            setChildLast(optionGroup || lot, option);
            setChildLast(optionGroupReal || itemsParent, optionReal);
            setReference(option, of);
            value[2] = option;
            value[3] = optionReal;
            setValueInMap(key, value, values);
            if (!isFunction(state.options)) {
                state.options = values;
            }
            return _fireHook && of.fire('set.option', [key]), true;
        }
    });
    // In order for an object to be iterable, it must have a `Symbol.iterator` key
    getPrototype(OptionPickerOptions)[Symbol.iterator] = function () {
        return this.values[Symbol.iterator]();
    };
    OptionPicker.Options = OptionPickerOptions;
    return OptionPicker;
}));