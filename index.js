/*!
 *
 * The MIT License (MIT)
 *
 * Copyright © 2021 Taufik Nurrohman <https://github.com/taufik-nurrohman>
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
(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.OP = factory());
})(this, function() {
    'use strict';
    var isArray = function isArray(x) {
        return Array.isArray(x);
    };
    var isDefined = function isDefined(x) {
        return 'undefined' !== typeof x;
    };
    var isInstance = function isInstance(x, of ) {
        return x && isSet( of ) && x instanceof of ;
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
        if ('object' !== typeof x) {
            return false;
        }
        return isPlain ? isInstance(x, Object) : true;
    };
    var isSet = function isSet(x) {
        return isDefined(x) && !isNull(x);
    };
    var isString = function isString(x) {
        return 'string' === typeof x;
    };
    var fromStates = function fromStates() {
        for (var _len = arguments.length, lot = new Array(_len), _key = 0; _key < _len; _key++) {
            lot[_key] = arguments[_key];
        }
        return Object.assign.apply(Object, [{}].concat(lot));
    };
    var fromValue = function fromValue(x) {
        if (isArray(x)) {
            return x.map(function(v) {
                return fromValue(x);
            });
        }
        if (isObject(x)) {
            for (var k in x) {
                x[k] = fromValue(x[k]);
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
    var toArray = function toArray(x) {
        return isArray(x) ? x : [x];
    };
    var toCaseCamel = function toCaseCamel(x) {
        return x.replace(/[-_.](\w)/g, function(m0, m1) {
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
    var toObjectCount = function toObjectCount(x) {
        return toCount(toObjectKeys(x));
    };
    var toObjectKeys = function toObjectKeys(x) {
        return Object.keys(x);
    };
    var toValue = function toValue(x) {
        if (isArray(x)) {
            return x.map(function(v) {
                return toValue(v);
            });
        }
        if (isNumeric(x)) {
            return toNumber(x);
        }
        if (isObject(x)) {
            for (var k in x) {
                x[k] = toValue(x[k]);
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
        return parseValue ? toValue(value) : value;
    };
    var getChildren = function getChildren(parent, index) {
        var children = parent.children;
        return isNumber(index) ? children[index] || null : children || [];
    };
    var getName = function getName(node) {
        return toCaseLower(node && node.nodeName || "") || null;
    };
    var getNext = function getNext(node) {
        return node.nextElementSibling || null;
    };
    var getParent = function getParent(node) {
        return node.parentNode || null;
    };
    var getStyle = function getStyle(node, style, parseValue) {
        if (parseValue === void 0) {
            parseValue = true;
        }
        var value = W.getComputedStyle(node).getPropertyValue(style);
        if (parseValue) {
            value = toValue(value);
        }
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
        return node.setAttribute(attribute, fromValue(value)), node;
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
    var setData = function setData(node, data) {
        var value;
        for (var datum in data) {
            value = data[datum];
            if (value || "" === value || 0 === value) {
                setDatum(node, datum, value);
            } else {
                letDatum(node, datum);
            }
        }
        return node;
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
        return getParent(current).insertBefore(node, getNext(current)), node;
    };
    var setStyle = function setStyle(node, style, value) {
        if (isNumber(value)) {
            value += 'px';
        }
        return node.style[toCaseCamel(style)] = fromValue(value), node;
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
    var toggleClass = function toggleClass(node, name, force) {
        return node.classList.toggle(name, force), node;
    };
    var event = function event(name, options, cache) {
        if (cache && isSet(events[name])) {
            return events[name];
        }
        return events[name] = new Event(name, options);
    };
    var events = {};
    var fireEvent = function fireEvent(name, node, options, cache) {
        node.dispatchEvent(event(name, options, cache));
    };
    var offEvent = function offEvent(name, node, then) {
        node.removeEventListener(name, then);
    };
    var offEventDefault = function offEventDefault(e) {
        return e && e.preventDefault();
    };
    var onEvent = function onEvent(name, node, then, options) {
        if (options === void 0) {
            options = false;
        }
        node.addEventListener(name, then, options);
    };

    function hook($) {
        var hooks = {};

        function fire(name, data) {
            if (!isSet(hooks[name])) {
                return $;
            }
            hooks[name].forEach(function(then) {
                return then.apply($, data);
            });
            return $;
        }

        function off(name, then) {
            if (!isSet(name)) {
                return hooks = {}, $;
            }
            if (isSet(hooks[name])) {
                if (isSet(then)) {
                    for (var i = 0, _j = hooks[name].length; i < _j; ++i) {
                        if (then === hooks[name][i]) {
                            hooks[name].splice(i, 1);
                            break;
                        }
                    } // Clean-up empty hook(s)
                    if (0 === j) {
                        delete hooks[name];
                    }
                } else {
                    delete hooks[name];
                }
            }
            return $;
        }

        function on(name, then) {
            if (!isSet(hooks[name])) {
                hooks[name] = [];
            }
            if (isSet(then)) {
                hooks[name].push(then);
            }
            return $;
        }
        $.hooks = hooks;
        $.fire = fire;
        $.off = off;
        $.on = on;
        return $;
    }
    var getOffset = function getOffset(node) {
        return [node.offsetLeft, node.offsetTop];
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
    var getSize = function getSize(node) {
        return isWindow(node) ? [node.innerWidth, node.innerHeight] : [node.offsetWidth, node.offsetHeight];
    };
    var getScroll = function getScroll(node) {
        return [node.scrollLeft, node.scrollTop];
    };
    var setScroll = function setScroll(node, data) {
        node.scrollLeft = data[0];
        node.scrollTop = data[1];
        return node;
    };
    let name = 'OP';

    function OP(source, state = {}) {
        if (!source) return;
        const $ = this; // Return new instance if `OP` was called without the `new` operator
        if (!isInstance($, OP)) {
            return new OP(source, state);
        } // Already instantiated, skip!
        if (source[name]) {
            return;
        }
        let {
            fire,
            hooks
        } = hook($);
        $.state = state = fromStates(OP.state, state);
        $.options = {};
        $.source = source;
        $.value = source.value; // Store current instance to `OP.instances`
        OP.instances[source.id || source.name || toObjectCount(OP.instances)] = $; // Mark current DOM as active option picker to prevent duplicate instance
        source[name] = 1;

        function getLot() {
            return [toValue(getValue()), $.options];
        }

        function getValue() {
            let value = source.value;
            return "" !== value ? value : null;
        }

        function setValue(value) {
            source.value = value;
        }
        let className = state['class'],
            selectBox = setElement(source, {
                'class': className + '-source',
                'tabindex': -1
            }),
            selectBoxItems = getChildren(selectBox);
        selectBox.multiple; // TODO
        let selectBoxOptionIndex = 0,
            selectBoxOptions = toArray(selectBox.options),
            selectBoxSize = selectBox.size,
            selectBoxTitle = selectBox.title,
            selectBoxValue = getValue(),
            selectBoxWindow = state.parent || B,
            selectBoxFake = setElement('div', {
                'class': className,
                'tabindex': 0,
                'title': selectBoxTitle
            }),
            selectBoxFakeLabel = setElement('b', '\u200c'),
            selectBoxFakeDropDown = setElement('div', {
                'tabindex': -1
            }),
            selectBoxFakeOptions = [];
        setChildLast(selectBoxFake, selectBoxFakeLabel);
        setNext(selectBox, selectBoxFake);

        function doBlur() {
            letClass(selectBoxFake, 'focus');
            fire('blur', getLot());
        }

        function doFocus() {
            setClass(selectBoxFake, 'focus');
            fire('focus', getLot());
        }

        function doEnter() {
            setClass(selectBoxFake, 'open');
            fire('enter', getLot());
        }

        function doExit() {
            letClass(selectBoxFake, 'open');
            fire('exit', getLot());
        }

        function doToggle(force) {
            toggleClass(selectBoxFake, 'open', force);
            let isOpen = isEnter();
            fire(isOpen ? 'enter' : 'exit', getLot());
            return isOpen;
        }

        function isEnter() {
            return hasClass(selectBoxFake, 'open');
        }

        function onSelectBoxChange(e) {
            onSelectBoxInput.call(this, e);
        }

        function onSelectBoxFocus(e) {
            selectBoxFake.focus();
        }

        function onSelectBoxInput() {
            let selectBoxFakeOption = selectBoxFakeOptions.find(selectBoxFakeOption => {
                return selectBoxValue === selectBoxFakeOption._value;
            });
            selectBoxFakeOption && fireEvent('click', selectBoxFakeOption);
        }

        function onSelectBoxFakeOptionClick(e) {
            let selectBoxFakeOption = this,
                selectBoxValuePrevious = selectBoxValue;
            selectBoxValue = selectBoxFakeOption._value;
            setText(selectBoxFakeLabel, getText(selectBoxFakeOption));
            e.isTrusted && selectBoxFake.focus();
            selectBoxFakeOptions.forEach(selectBoxFakeOption => {
                toggleClass(selectBoxFakeOption, 'active', selectBoxValue === selectBoxFakeOption._value);
            });
            if (selectBoxValue !== selectBoxValuePrevious) {
                setValue(selectBoxValue);
                fire('change', getLot());
                fireEvent('input', selectBox); // `input` must come first
                fireEvent('change', selectBox);
            }
            offEventDefault(e);
        }

        function onSelectBoxFakeBlur(e) {
            doBlur();
        }

        function onSelectBoxFakeClick(e) {
            if (selectBoxSize) {
                return doEnter();
            }
            doToggle() && setSelectBoxFakeOptionsPosition(selectBoxFake);
        }

        function onSelectBoxFakeFocus() {
            doFocus();
        }

        function onSelectBoxFakeKeyDown(e) {
            let key = e.key,
                selectBoxOptionIndexCurrent = selectBox.selectedIndex,
                selectBoxFakeOption = selectBoxFakeOptions[selectBoxOptionIndexCurrent],
                selectBoxFakeOptionIsDead = selectBoxFakeOption => hasClass(selectBoxFakeOption, 'dead'),
                isOpen = isEnter();
            if ('ArrowDown' === key) {
                while (selectBoxFakeOption = selectBoxFakeOptions[++selectBoxOptionIndexCurrent]) {
                    if (!selectBoxFakeOptionIsDead(selectBoxFakeOption)) {
                        break;
                    }
                }
                selectBoxFakeOption && (fireEvent('click', selectBoxFakeOption), doToggle(isOpen));
                offEventDefault(e);
            } else if ('ArrowUp' === key) {
                while (selectBoxFakeOption = selectBoxFakeOptions[--selectBoxOptionIndexCurrent]) {
                    if (!selectBoxFakeOptionIsDead(selectBoxFakeOption)) {
                        break;
                    }
                }
                selectBoxFakeOption && (fireEvent('click', selectBoxFakeOption), doToggle(isOpen));
                offEventDefault(e);
            } else if ('End' === key) {
                selectBoxOptionIndexCurrent = toCount(selectBoxOptions);
                while (selectBoxFakeOption = selectBoxFakeOptions[--selectBoxOptionIndexCurrent]) {
                    if (!selectBoxFakeOptionIsDead(selectBoxFakeOption)) {
                        break;
                    }
                }
                selectBoxFakeOption && (fireEvent('click', selectBoxFakeOption), doToggle(isOpen));
                offEventDefault(e);
            } else if ('Enter' === key) {
                doToggle(), offEventDefault(e);
            } else if ('Escape' === key) {
                !selectBoxSize && doExit(); // offEventDefault(e);
            } else if ('Home' === key) {
                selectBoxOptionIndexCurrent = 0;
                while (selectBoxFakeOption = selectBoxFakeOptions[++selectBoxOptionIndexCurrent]) {
                    if (!selectBoxFakeOptionIsDead(selectBoxFakeOption)) {
                        break;
                    }
                }
                selectBoxFakeOption && (fireEvent('click', selectBoxFakeOption), doToggle(isOpen));
                offEventDefault(e);
            } else if ('Tab' === key) {
                selectBoxFakeOption && fireEvent('click', selectBoxFakeOption);
                !selectBoxSize && doExit(); // offEventDefault(e);
            }
            isOpen && setSelectBoxFakeOptionsPosition(selectBoxFake);
        }

        function onSelectBoxWindowKey(e) {}

        function onSelectBoxWindowClick(e) {
            let target = e.target;
            if (target !== selectBoxFake) {
                while (target = getParent(target)) {
                    if (selectBoxFake === target) {
                        break;
                    }
                }
            }
            selectBoxFake !== target && doExit();
        }

        function setSelectBoxFakeOptions(selectBoxItem, parent) {
            if ('optgroup' === getName(selectBoxItem)) {
                let selectBoxFakeOptionGroup = setElement('span'),
                    selectBoxItems = getChildren(selectBoxItem);
                selectBoxFakeOptionGroup.title = selectBoxItem.label;
                for (let i = 0, j = toCount(selectBoxItems); i < j; ++i) {
                    setSelectBoxFakeOptions(selectBoxItems[i], selectBoxFakeOptionGroup);
                }
                setChildLast(parent, selectBoxFakeOptionGroup);
                return;
            }
            let selectBoxOptionValue = getAttribute(selectBoxItem, 'value', false),
                selectBoxOptionText = getText(selectBoxItem),
                selectBoxFakeOption = setElement('a', selectBoxOptionText, {
                    'tabindex': -1,
                    'title': selectBoxOptionText
                });
            selectBoxOptionValue = selectBoxOptionValue || selectBoxOptionText;
            selectBoxFakeOption._index = selectBoxOptionIndex;
            selectBoxFakeOption._value = selectBoxOptionValue;
            setData(selectBoxFakeOption, {
                index: selectBoxOptionIndex,
                value: selectBoxOptionValue
            });
            $.options[selectBoxOptionValue] = selectBoxOptionText;
            if (selectBoxItem.disabled) {
                setClass(selectBoxFakeOption, 'dead');
            } else {
                onEvent('click', selectBoxFakeOption, onSelectBoxFakeOptionClick);
            }
            setChildLast(parent, selectBoxFakeOption);
            selectBoxFakeOptions.push(selectBoxFakeOption);
            if (selectBoxOptionValue === selectBoxValue) {
                setClass(selectBoxFakeOption, 'active');
                setText(selectBoxFakeLabel, selectBoxOptionText);
                setValue(selectBoxValue);
                $.option = selectBoxValue;
            }
            ++selectBoxOptionIndex;
        }

        function setSelectBoxFakeOptionsPosition(selectBoxFake) {
            let selectBoxFakeBorderTopWidth = toNumber(getStyle(selectBoxFake, 'border-top-width')),
                selectBoxFakeBorderBottomWidth = toNumber(getStyle(selectBoxFake, 'border-bottom-width'));
            if (!selectBoxSize) {
                let [left, top, width, height] = getRect(selectBoxFake),
                    heightWindow = getSize(W)[1],
                    heightMax = heightWindow - top - height;
                setStyles(selectBoxFakeDropDown, {
                    'bottom': "",
                    'left': left,
                    'max-height': heightMax,
                    'top': top + height - selectBoxFakeBorderTopWidth,
                    'width': width
                });
                if (heightMax < (heightWindow - height) / 2) {
                    heightMax = top;
                    setStyles(selectBoxFakeDropDown, {
                        'top': "",
                        'bottom': heightWindow - top - selectBoxFakeBorderBottomWidth,
                        'max-height': heightMax + selectBoxFakeBorderTopWidth
                    });
                    setClass(selectBoxFakeDropDown, 'up');
                } else {
                    letClass(selectBoxFakeDropDown, 'up');
                }
            }
            let selectBoxFakeOption = selectBoxFakeOptions.find(selectBoxFakeOption => {
                return hasClass(selectBoxFakeOption, 'active');
            });
            if (selectBoxFakeOption) {
                let height = getSize(selectBoxFakeOption)[1],
                    heightParent = getSize(selectBoxFakeDropDown)[1],
                    [left, top] = getOffset(selectBoxFakeOption),
                    topScroll = getScroll(selectBoxFakeDropDown)[1];
                if (top < topScroll) {
                    setScroll(selectBoxFakeDropDown, [left, top]);
                } else if (top + height - heightParent > topScroll) {
                    setScroll(selectBoxFakeDropDown, [left, top + height - heightParent]);
                }
            }
            fire('fit', getLot());
        }
        if (selectBox.disabled) {
            setClass(selectBoxFake, 'dead');
        } else {
            onEvent('click', selectBoxWindow, onSelectBoxWindowClick);
            onEvent('keydown', selectBoxWindow, onSelectBoxWindowKey);
            onEvent('keyup', selectBoxWindow, onSelectBoxWindowKey);
            onEvent('focus', selectBox, onSelectBoxFocus);
            onEvent('change', selectBox, onSelectBoxChange);
            onEvent('input', selectBox, onSelectBoxInput);
            onEvent('blur', selectBoxFake, onSelectBoxFakeBlur);
            onEvent('click', selectBoxFake, onSelectBoxFakeClick);
            onEvent('focus', selectBoxFake, onSelectBoxFakeFocus);
            onEvent('keydown', selectBoxFake, onSelectBoxFakeKeyDown);
        }
        let j = toCount(selectBoxItems);
        if (j) {
            setChildLast(selectBoxFake, selectBoxFakeDropDown);
            for (let i = 0; i < j; ++i) {
                setSelectBoxFakeOptions(selectBoxItems[i], selectBoxFakeDropDown);
            }
            if (selectBoxSize) {
                let selectBoxFakeOption = selectBoxFakeOptions[0],
                    selectBoxFakeOptionSize = getSize(selectBoxFakeOption),
                    heightMax = selectBoxFakeOptionSize[1] * selectBoxSize;
                setStyle(selectBoxFakeDropDown, 'max-height', heightMax);
            }
        }
        if (selectBoxSize) {
            // Force `open` class
            setClass(selectBoxFake, 'open');
        }
        $.get = (parseValue = true) => {
            let value = getValue();
            return parseValue ? toValue(value) : value;
        };
        $.pop = () => {
            if (!source[name]) {
                return $; // Already ejected
            }
            delete source[name];
            offEvent('click', selectBoxWindow, onSelectBoxWindowClick);
            offEvent('keydown', selectBoxWindow, onSelectBoxWindowKey);
            offEvent('keyup', selectBoxWindow, onSelectBoxWindowKey);
            offEvent('change', selectBox, onSelectBoxChange);
            offEvent('focus', selectBox, onSelectBoxFocus);
            offEvent('input', selectBox, onSelectBoxInput);
            letClass(selectBox, className + '-source');
            offEvent('blur', selectBoxFake, onSelectBoxFakeBlur);
            offEvent('click', selectBoxFake, onSelectBoxFakeClick);
            offEvent('focus', selectBoxFake, onSelectBoxFakeFocus);
            offEvent('keydown', selectBoxFake, onSelectBoxFakeKeyDown);
            letText(selectBoxFake);
            letElement(selectBoxFake);
            return fire('pop', getLot());
        };
        $.set = value => {
            setValue(fromValue(value));
            fireEvent(source, 'input');
            fireEvent(source, 'change');
            fire('change', getLot());
            return $;
        };
        $.self = selectBoxFake;
        return $;
    }
    OP.instances = {};
    OP.state = {
        'class': 'option-picker',
        'parent': null
    };
    OP.version = '1.0.0';
    return OP;
});