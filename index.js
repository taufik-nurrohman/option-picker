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
    var hasValue = function hasValue(x, data) {
        return -1 !== data.indexOf(x);
    };
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
    var fromStates = function fromStates() {
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
                } // Merge array
                if (isArray(out[k]) && isArray(lot[i][k])) {
                    out[k] = [
                        /* Clone! */
                    ].concat(out[k]);
                    for (var ii = 0, jj = toCount(lot[i][k]); ii < jj; ++ii) {
                        if (!hasValue(lot[i][k][ii], out[k])) {
                            out[k].push(lot[i][k][ii]);
                        }
                    } // Merge object recursive
                } else if (isObject(out[k]) && isObject(lot[i][k])) {
                    out[k] = fromStates({
                        /* Clone! */
                    }, out[k], lot[i][k]); // Replace value
                } else {
                    out[k] = lot[i][k];
                }
            }
        }
        return out;
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
    var getClasses = function getClasses(node, toArray) {
        if (toArray === void 0) {
            toArray = true;
        }
        var value = (getState(node, 'className') || "").trim();
        return toArray ? value.split(/\s+/) : value;
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
    var letText = function letText(node) {
        var state = 'textContent';
        return hasState(node, state) && (node[state] = ""), node;
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
    var toggleClass = function toggleClass(node, name, force) {
        return node.classList.toggle(name, force), node;
    };
    var offEvent = function offEvent(name, node, then) {
        node.removeEventListener(name, then);
    };
    var offEventDefault = function offEventDefault(e) {
        return e && e.preventDefault();
    };
    var offEvents = function offEvents(names, node, then) {
        names.forEach(function(name) {
            return offEvent(name, node, then);
        });
    };
    var onEvent = function onEvent(name, node, then, options) {
        if (options === void 0) {
            options = false;
        }
        node.addEventListener(name, then, options);
    };
    var onEvents = function onEvents(names, node, then, options) {
        if (options === void 0) {
            options = false;
        }
        names.forEach(function(name) {
            return onEvent(name, node, then, options);
        });
    };
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
    let name = 'OP',
        PROP_INDEX = 'i',
        PROP_SOURCE = '$',
        PROP_VALUE = 'v';
    const KEY_ARROW_DOWN = 'ArrowDown';
    const KEY_ARROW_UP = 'ArrowUp';
    const KEY_END = 'End';
    const KEY_ENTER = 'Enter';
    const KEY_ESCAPE = 'Escape';
    const KEY_START = 'Home';
    const KEY_TAB = 'Tab';

    function OP(source, state = {}) {
        if (!source) return;
        const $ = this; // Already instantiated, skip!
        if (source[name]) {
            return source[name];
        } // Return new instance if `OP` was called without the `new` operator
        if (!isInstance($, OP)) {
            return new OP(source, state);
        }
        let {
            fire,
            hooks
        } = hook($);
        $.state = state = fromStates({}, OP.state, state);
        $.options = {};
        $.source = source; // Store current instance to `OP.instances`
        OP.instances[source.id || source.name || toObjectCount(OP.instances)] = $; // Mark current DOM as active option picker to prevent duplicate instance
        source[name] = $;

        function getLot() {
            return [toValue(getValue()), $.options];
        }

        function getValue() {
            if (selectBoxMultiple) {
                let values = [];
                for (let i = 0, j = toCount(selectBoxOptions); i < j; ++i) {
                    if (getOptionSelected(selectBoxOptions[i])) {
                        values.push(getOptionValue(selectBoxOptions[i]));
                    }
                }
                return values;
            }
            let value = source.value;
            return "" !== value ? value : null;
        }

        function getOptionValue(selectBoxOption) {
            let value = selectBoxOption.value || getText(selectBoxOption);
            return "" !== value ? value : null;
        }

        function getOptionSelected(selectBoxOption) {
            return hasAttribute(selectBoxOption, 'selected');
        }

        function getOptionFakeSelected(selectBoxFakeOption) {
            return hasClass(selectBoxFakeOption, classNameOptionM + 'selected');
        }

        function letOptionSelected(selectBoxOption) {
            letAttribute(selectBoxOption, 'selected');
            selectBoxOption.selected = false;
        }

        function letOptionFakeSelected(selectBoxFakeOption) {
            letClass(selectBoxFakeOption, classNameOptionM + 'selected');
        }

        function setOptionSelected(selectBoxOption) {
            setAttribute(selectBoxOption, 'selected', true);
            selectBoxOption.selected = true;
        }

        function setOptionFakeSelected(selectBoxFakeOption) {
            setClass(selectBoxFakeOption, classNameOptionM + 'selected');
        }

        function setLabelContent(content) {
            content = content || '\u200c';
            selectBoxFakeLabel.title = content.replace(/<.*?>/g, "");
            setHTML(selectBoxFakeLabel, content);
        }

        function setValue(value) {
            if (selectBoxMultiple) {
                let values = toArray(value),
                    value;
                for (let i = 0, j = toCount(selectBoxOptions); i < j; ++i) {
                    value = getOptionValue(selectBoxOptions[i]);
                    if (values.includes(toValue(value))) {
                        setOptionSelected(selectBoxOptions[i]);
                    } else {
                        letOptionSelected(selectBoxOptions[i]);
                    }
                }
            }
        }
        let classNameB = state['class'],
            classNameE = classNameB + '__',
            classNameM = classNameB + '--',
            classNameOptionB = classNameE + 'option',
            classNameOptionM = classNameOptionB + '--',
            classNameOptionsB = classNameE + 'options',
            classNameValueB = classNameE + 'value',
            classNameValuesB = classNameE + 'values',
            selectBox = setElement(source, {
                'class': classNameE + 'source',
                'tabindex': '-1'
            }),
            selectBoxIsDisabled = () => selectBox.disabled,
            selectBoxItems = getChildren(selectBox),
            selectBoxMultiple = selectBox.multiple,
            selectBoxOptionIndex = 0,
            selectBoxOptions = selectBox.options,
            selectBoxParent = state.parent || D,
            selectBoxSize = selectBox.size,
            selectBoxTitle = selectBox.title,
            selectBoxValue = getValue(),
            selectBoxFake = setElement('div', {
                'class': classNameB,
                'tabindex': selectBoxIsDisabled() ? false : '0',
                'title': selectBoxTitle
            }),
            selectBoxFakeLabel = setElement('div', '\u200c', {
                'class': classNameValuesB
            }),
            selectBoxFakeBorderBottomWidth = 0,
            selectBoxFakeBorderTopWidth = 0,
            selectBoxFakeDropDown = setElement('div', {
                'class': classNameOptionsB,
                'tabindex': '-1'
            }),
            selectBoxFakeOptions = [],
            _keyIsCtrl = false,
            _keyIsShift = false;
        if (selectBoxMultiple && !selectBoxSize) {
            selectBox.size = selectBoxSize = state.size;
        }
        setChildLast(selectBoxFake, selectBoxFakeLabel);
        setNext(selectBox, selectBoxFake);

        function doBlur() {
            letClass(selectBoxFake, classNameM + 'focus');
            fire('blur', getLot());
        }

        function doFocus() {
            setClass(selectBoxFake, classNameM + 'focus');
            fire('focus', getLot());
        }

        function doEnter() {
            setClass(selectBoxFake, classNameM + 'open');
            fire('enter', getLot());
        }

        function doExit() {
            if (selectBoxMultiple || selectBoxSize) {
                return;
            }
            letClass(selectBoxFake, classNameM + 'open');
            fire('exit', getLot());
        }

        function doToggle(force) {
            toggleClass(selectBoxFake, classNameM + 'open', force);
            let isOpen = isEnter();
            fire(isOpen ? 'enter' : 'exit', getLot());
            return isOpen;
        }

        function doValue(content, value, index, classNames) {
            return '<span class="' + classNameValueB + ' ' + classNames + '" data-index="' + index + '"' + (value ? ' data-value="' + value + '"' : "") + '>' + content + '</span>';
        }

        function isEnter() {
            return hasClass(selectBoxFake, classNameM + 'open');
        }

        function onSelectBoxFocus() {
            selectBoxFake.focus();
        }

        function onSelectBoxFakeOptionClick(e) {
            if (selectBoxIsDisabled()) {
                return;
            }
            let selectBoxFakeOption = this,
                selectBoxOption = selectBoxFakeOption[PROP_SOURCE],
                selectBoxValuePrevious = selectBoxValue;
            selectBoxOptionIndex = selectBoxFakeOption[PROP_INDEX];
            selectBoxValue = selectBoxFakeOption[PROP_VALUE];
            let selectBoxFakeLabelContent = [],
                content,
                index,
                value;
            e && e.isTrusted && onSelectBoxFocus();
            offEventDefault(e);
            if (selectBoxMultiple && (_keyIsCtrl || _keyIsShift)) {
                if (getOptionFakeSelected(selectBoxFakeOption)) {
                    letOptionSelected(selectBoxOption);
                    letOptionFakeSelected(selectBoxFakeOption);
                } else {
                    setOptionSelected(selectBoxOption);
                    setOptionFakeSelected(selectBoxFakeOption);
                }
                for (let i = 0, j = toCount(selectBoxOptions); i < j; ++i) {
                    if (getOptionSelected(selectBoxOptions[i])) {
                        content = getText(selectBoxFakeOptions[i]);
                        index = selectBoxFakeOptions[i][PROP_INDEX];
                        value = selectBoxFakeOptions[i][PROP_VALUE];
                        content = doValue(content, value, index, getClasses(selectBoxFakeOptions[i], false));
                        selectBoxFakeLabelContent.push(content);
                    }
                }
                setLabelContent(selectBoxFakeLabelContent.join('<span>' + state.join + '</span>'));
                fire('change', getLot());
                return;
            }
            content = getText(selectBoxFakeOption);
            index = selectBoxFakeOption[PROP_INDEX];
            value = selectBoxFakeOption[PROP_VALUE];
            content = doValue(content, value, index, getClasses(selectBoxFakeOption, false));
            setLabelContent(content);
            selectBoxFakeOptions.forEach(selectBoxFakeOption => {
                if (selectBoxValue === selectBoxFakeOption[PROP_VALUE]) {
                    setOptionSelected(selectBoxFakeOption[PROP_SOURCE]);
                    setOptionFakeSelected(selectBoxFakeOption);
                } else {
                    letOptionSelected(selectBoxFakeOption[PROP_SOURCE]);
                    letOptionFakeSelected(selectBoxFakeOption);
                }
            });
            if (selectBoxValue !== selectBoxValuePrevious) {
                fire('change', getLot());
            }
        }

        function onSelectBoxFakeBlur(e) {
            doBlur();
        }

        function onSelectBoxFakeClick(e) {
            if (selectBoxIsDisabled()) {
                return;
            }
            selectBoxOptionIndex = selectBox.selectedIndex;
            if (selectBoxSize) {
                return doEnter();
            }
            selectBoxFakeBorderBottomWidth = toNumber(getStyle(selectBoxFake, 'border-bottom-width'));
            selectBoxFakeBorderTopWidth = toNumber(getStyle(selectBoxFake, 'border-top-width')), doToggle() && setSelectBoxFakeOptionsPosition(selectBoxFake);
        }

        function onSelectBoxFakeFocus(e) {
            selectBoxOptionIndex = selectBox.selectedIndex;
            doFocus();
        }

        function onSelectBoxFakeKeyDown(e) {
            _keyIsCtrl = e.ctrlKey;
            _keyIsShift = e.shiftKey;
            let key = e.key,
                selectBoxOptionIndexCurrent = selectBoxOptionIndex,
                selectBoxFakeOption = selectBoxFakeOptions[selectBoxOptionIndexCurrent],
                selectBoxFakeOptionIsDisabled = selectBoxFakeOption => hasClass(selectBoxFakeOption, classNameOptionM + 'disabled'),
                doClick = selectBoxFakeOption => onSelectBoxFakeOptionClick.call(selectBoxFakeOption),
                isOpen = isEnter(); // Cache the enter state
            if (KEY_ARROW_DOWN === key) {
                // Continue walking down until it finds an option that is not disabled
                while (selectBoxFakeOption = selectBoxFakeOptions[++selectBoxOptionIndexCurrent]) {
                    if (!selectBoxFakeOptionIsDisabled(selectBoxFakeOption)) {
                        break;
                    }
                }
                if (selectBoxFakeOption) {
                    doClick(selectBoxFakeOption), doToggle(isOpen);
                }
                if (selectBoxMultiple && _keyIsShift && (selectBoxFakeOption = selectBoxFakeOptions[selectBoxOptionIndex - 1])) {
                    // TODO: Preserve selection on the previous option
                    setOptionSelected(selectBoxFakeOption[PROP_SOURCE]);
                    setOptionFakeSelected(selectBoxFakeOption);
                }
                offEventDefault(e);
            } else if (KEY_ARROW_UP === key) {
                // Continue walking up until it finds an option that is not disabled
                while (selectBoxFakeOption = selectBoxFakeOptions[--selectBoxOptionIndexCurrent]) {
                    if (!selectBoxFakeOptionIsDisabled(selectBoxFakeOption)) {
                        break;
                    }
                }
                if (selectBoxFakeOption) {
                    doClick(selectBoxFakeOption), doToggle(isOpen);
                }
                if (selectBoxMultiple && _keyIsShift && (selectBoxFakeOption = selectBoxFakeOptions[selectBoxOptionIndex + 1])) {
                    // TODO: Preserve selection on the next option
                    setOptionSelected(selectBoxFakeOption[PROP_SOURCE]);
                    setOptionFakeSelected(selectBoxFakeOption);
                }
                offEventDefault(e);
            } else if (KEY_END === key) {
                // Start from the last option position + 1
                selectBoxOptionIndexCurrent = toCount(selectBoxOptions); // Continue walking up until it finds an option that is not disabled
                while (selectBoxFakeOption = selectBoxFakeOptions[--selectBoxOptionIndexCurrent]) {
                    if (!selectBoxFakeOptionIsDisabled(selectBoxFakeOption)) {
                        break;
                    }
                }
                selectBoxFakeOption && (doClick(selectBoxFakeOption), doToggle(isOpen));
                offEventDefault(e);
            } else if (KEY_ENTER === key) {
                doToggle(), offEventDefault(e);
            } else if (KEY_ESCAPE === key) {
                !selectBoxSize && doExit(); // offEventDefault(e);
            } else if (KEY_START === key) {
                // Start from the first option position - 1
                selectBoxOptionIndexCurrent = -1; // Continue walking up until it finds an option that is not disabled
                while (selectBoxFakeOption = selectBoxFakeOptions[++selectBoxOptionIndexCurrent]) {
                    if (!selectBoxFakeOptionIsDisabled(selectBoxFakeOption)) {
                        break;
                    }
                }
                selectBoxFakeOption && (doClick(selectBoxFakeOption), doToggle(isOpen));
                offEventDefault(e);
            } else if (KEY_TAB === key) {
                selectBoxFakeOption && doClick(selectBoxFakeOption);
                !selectBoxSize && doExit(); // offEventDefault(e);
            }
            isEnter() && !_keyIsCtrl && !_keyIsShift && setSelectBoxFakeOptionsPosition(selectBoxFake);
        }

        function onSelectBoxFakeKeyUp() {
            _keyIsCtrl = _keyIsShift = false;
        }

        function onSelectBoxParentClick(e) {
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

        function onSelectBoxWindow() {
            isEnter() && setSelectBoxFakeOptionsPosition(selectBoxFake, 1);
        }

        function setSelectBoxFakeOptions(selectBoxItem, parent) {
            if ('optgroup' === getName(selectBoxItem)) {
                let selectBoxFakeOptionGroup = setElement('span', {
                        'class': classNameOptionB + '-group' + (selectBoxItem.disabled ? ' ' + classNameOptionM + 'disabled' : "")
                    }),
                    selectBoxItems = getChildren(selectBoxItem);
                selectBoxFakeOptionGroup.title = selectBoxItem.label;
                for (let i = 0, j = toCount(selectBoxItems); i < j; ++i) {
                    setSelectBoxFakeOptions(selectBoxItems[i], selectBoxFakeOptionGroup);
                }
                setChildLast(parent, selectBoxFakeOptionGroup);
                return;
            }
            let selectBoxOptionValue = getAttribute(selectBoxItem, 'value', false),
                selectBoxOptionValueReal = selectBoxOptionValue,
                selectBoxOptionText = getText(selectBoxItem),
                selectBoxOptionTitle = selectBoxItem.title,
                selectBoxFakeOption = setElement('a', selectBoxOptionText, {
                    'class': classNameOptionB,
                    'title': selectBoxOptionTitle || selectBoxOptionText
                });
            selectBoxOptionValue = selectBoxOptionValue || selectBoxOptionText;
            selectBoxFakeOption[PROP_INDEX] = selectBoxOptionIndex;
            selectBoxFakeOption[PROP_SOURCE] = selectBoxItem;
            selectBoxFakeOption[PROP_VALUE] = selectBoxOptionValue;
            setData(selectBoxFakeOption, {
                index: selectBoxOptionIndex,
                value: selectBoxOptionValueReal
            });
            $.options[selectBoxOptionValue] = selectBoxOptionText;
            let selectBoxOptionIsDisabled = selectBoxItem.disabled;
            if (selectBoxOptionIsDisabled) {
                setClass(selectBoxFakeOption, classNameOptionM + 'disabled');
            } else {
                onEvent('click', selectBoxFakeOption, onSelectBoxFakeOptionClick);
            }
            setChildLast(parent, selectBoxFakeOption);
            selectBoxFakeOptions.push(selectBoxFakeOption);
            if ("" === selectBoxOptionValueReal) {
                selectBoxOptionValue = null;
            }
            if (isArray(selectBoxValue) && hasValue(selectBoxOptionValue, selectBoxValue) || selectBoxOptionValue === selectBoxValue) {
                setClass(selectBoxFakeOption, classNameOptionM + 'selected');
                setLabelContent(doValue(selectBoxOptionText, selectBoxOptionValueReal, selectBoxOptionIndex, classNameOptionB + ' ' + (selectBoxOptionIsDisabled ? ' ' + classNameOptionM + 'disabled' : "")));
                setOptionSelected(selectBoxItem);
            } else {
                letOptionSelected(selectBoxItem);
            }
            ++selectBoxOptionIndex;
        }

        function setSelectBoxFakeOptionsPosition(selectBoxFake, useEvent) {
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
                    letClass(selectBoxFake, classNameM + 'down');
                    setClass(selectBoxFake, classNameM + 'up');
                } else {
                    letClass(selectBoxFake, classNameM + 'up');
                    setClass(selectBoxFake, classNameM + 'down');
                }
            }
            if (!useEvent) {
                let selectBoxFakeOption = selectBoxFakeOptions.find(selectBoxFakeOption => {
                    return hasClass(selectBoxFakeOption, classNameOptionM + 'selected');
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
            }
            fire('fit', getLot());
        }
        onEvents(['resize', 'scroll'], W, onSelectBoxWindow);
        onEvent('click', selectBoxParent, onSelectBoxParentClick);
        onEvent('focus', selectBox, onSelectBoxFocus);
        onEvent('blur', selectBoxFake, onSelectBoxFakeBlur);
        onEvent('click', selectBoxFake, onSelectBoxFakeClick);
        onEvent('focus', selectBoxFake, onSelectBoxFakeFocus);
        onEvent('keydown', selectBoxFake, onSelectBoxFakeKeyDown);
        onEvent('keyup', selectBoxFake, onSelectBoxFakeKeyUp);
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
            // Force `down` and `open` class
            setClass(selectBoxFake, classNameM + 'down');
            setClass(selectBoxFake, classNameM + 'open');
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
            offEvents(['resize', 'scroll'], W, onSelectBoxWindow);
            offEvent('click', selectBoxParent, onSelectBoxParentClick);
            offEvent('focus', selectBox, onSelectBoxFocus);
            letClass(selectBox, classNameE + 'source');
            offEvent('blur', selectBoxFake, onSelectBoxFakeBlur);
            offEvent('click', selectBoxFake, onSelectBoxFakeClick);
            offEvent('focus', selectBoxFake, onSelectBoxFakeFocus);
            offEvent('keydown', selectBoxFake, onSelectBoxFakeKeyDown);
            offEvent('keyup', selectBoxFake, onSelectBoxFakeKeyUp);
            letText(selectBoxFake);
            letElement(selectBoxFake);
            return fire('pop', getLot());
        };
        $.set = value => {
            setValue(fromValue(value));
            selectBoxFakeOptions.forEach((selectBoxFakeOption, index) => {
                let selectBoxOption = selectBoxOptions[index];
                toggleClass(selectBoxFakeOption, classNameOptionM + 'selected', selectBoxOption && getOptionSelected(selectBoxOption));
            });
            fire('change', getLot());
            return $;
        };
        $.self = selectBoxFake;
        return $;
    }
    OP.instances = {};
    OP.state = {
        'class': 'option-picker',
        'join': ', ',
        'parent': null,
        'size': 5
    };
    OP.version = '1.2.3';
    return OP;
});