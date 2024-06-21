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
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.OptionPicker = factory());
})(this, function () {
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
    var isInstance = function isInstance(x, of ) {
        return x && isSet( of ) && x instanceof of ;
    };
    var isNull = function isNull(x) {
        return null === x;
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
    var toCaseLower = function toCaseLower(x) {
        return x.toLowerCase();
    };
    var toCount = function toCount(x) {
        return x.length;
    };
    var toNumber = function toNumber(x, base) {
        if (base === void 0) {
            base = 10;
        }
        return base ? parseInt(x, base) : parseFloat(x);
    };
    var toValue = function toValue(x) {
        if (isArray(x)) {
            return x.map(function (v) {
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
            return x.map(function (v) {
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
    var getAttributes = function getAttributes(node, parseValue) {
        if (parseValue === void 0) {
            parseValue = true;
        }
        var attributes = node.attributes,
            value,
            values = {};
        for (var i = 0, j = attributes.length; i < j; ++i) {
            value = attributes[i].value;
            values[attributes[i].name] = parseValue ? toValue(value) : value;
        }
        return values;
    };
    var getChildFirst = function getChildFirst(parent) {
        return parent.firstElementChild || null;
    };
    var getChildLast = function getChildLast(parent) {
        return parent.lastElementChild || null;
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
    var hasClass = function hasClass(node, value) {
        return node.classList.contains(value);
    };
    var hasState = function hasState(node, state) {
        return state in node;
    };
    var letAttribute = function letAttribute(node, attribute) {
        return node.removeAttribute(attribute), node;
    };
    var letClass = function letClass(node, value) {
        return node.classList.remove(value), node;
    };
    var letElement = function letElement(node) {
        var parent = getParent(node);
        return node.remove(), parent;
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

    function hook($) {
        var hooks = {};

        function fire(name, data) {
            if (!isSet(hooks[name])) {
                return $;
            }
            hooks[name].forEach(function (then) {
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
    const KEY_ARROW_DOWN = 'ArrowDown';
    const KEY_ARROW_UP = 'ArrowUp';
    const KEY_ENTER = 'Enter';
    const KEY_ESCAPE = 'Escape';
    const KEY_TAB = 'Tab';
    const name = 'OptionPicker';

    function createOptions(options, values) {
        let $ = this,
            optionGroup, {
                self,
                state
            } = $,
            {
                n
            } = state;
        n += '__option';
        values = values || getOptions(self);
        for (let k in values) {
            let v = values[k];
            if ('data-group' in v[1]) {
                if (!optionGroup) {
                    setChildLast(options, optionGroup = setElement('span', {
                        'class': n + '-group',
                        'data-value': v[1]['data-group']
                    }));
                }
            } else {
                optionGroup = false;
            }
            let {
                disabled,
                selected,
                value
            } = v[1];
            let option = setElement('span', v[0], {
                'class': n + (disabled ? ' ' + n + '--disabled' : "") + (selected ? ' ' + n + '--selected' : ""),
                'data-value': fromValue(value || k),
                'tabindex': disabled ? false : -1
            });
            if (!disabled) {
                onEvent('blur', option, onBlurOption);
                onEvent('focus', option, onFocusOption);
                onEvent('keydown', option, onKeyDownOption);
                onEvent('mousedown', option, onPointerDownOption);
                onEvent('touchstart', option, onPointerDownOption);
            }
            option._of = v[2];
            option['_' + name] = $;
            $._options[k] = option;
            setChildLast(optionGroup || options, option);
        }
    }

    function defineProperty( of , key, state) {
        Object.defineProperty( of , key, state);
    }

    function getOptions(self) {
        const options = {};
        const value = getValue(self);
        if ('input' === getName(self));
        else {
            let items = self.children,
                selected = [];
            for (let i = 0, j = toCount(items); i < j; ++i) {
                let v = items[i],
                    attributes = getAttributes(v);
                ['disabled', 'selected'].forEach(k => {
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
                    let items2 = getOptions(v);
                    for (let k in items2) {
                        items2[k][1]['data-group'] = v.label;
                        options[k] = items2[k];
                    }
                    continue;
                }
                options[v.value] = [getText(v) || v.value, attributes, v];
            } // If there is no selected option(s), get it from the current value
            if (0 === toCount(selected) && options[value]) {
                options[value][1].selected = true;
            }
        }
        return options;
    }

    function getValue(self) {
        return (self.value || "").replace(/\r/g, "");
    }

    function isDisabled(self) {
        return self.disabled;
    }

    function isReadOnly(self) {
        return self.readOnly;
    }

    function OptionPicker(self, state) {
        const $ = this;
        if (!self) {
            return $;
        } // Return new instance if `OptionPicker` was called without the `new` operator
        if (!isInstance($, OptionPicker)) {
            return new OptionPicker(self, state);
        }
        self['_' + name] = hook($);
        return $.attach(self, fromStates({}, OptionPicker.state, state || {}));
    }
    OptionPicker.state = {
        'n': 'option-picker',
        'options': null,
        'with': []
    };
    OptionPicker.version = '2.0.0';
    defineProperty(OptionPicker, 'name', {
        value: name
    });
    const $$ = OptionPicker.prototype;
    defineProperty($$, 'value', {
        get: function () {
            let value = this.self.value;
            return "" === value ? null : value;
        },
        set: function (value) {
            let $ = this;
            $.fire('change');
        }
    });

    function onBlurMask() {
        let $ = this,
            picker = $['_' + name],
            {
                state
            } = picker,
            {
                n
            } = state;
        letClass($, n += '--focus');
        letClass($, n += '-self');
    }

    function onBlurOption() {
        let $ = this,
            picker = $['_' + name],
            {
                mask,
                state
            } = picker,
            {
                n
            } = state;
        letClass(mask, n + '--focus-option');
    }

    function onFocusMask() {
        let $ = this,
            picker = $['_' + name],
            {
                state
            } = picker,
            {
                n
            } = state;
        setClass($, n += '--focus');
        setClass($, n += '-self');
    }

    function onFocusOption() {
        let $ = this,
            picker = $['_' + name],
            {
                mask,
                state
            } = picker,
            {
                n
            } = state;
        setClass(mask, n + '--focus-option');
    }

    function onKeyDownMask(e) {
        let $ = this,
            exit,
            key = e.key,
            picker = $['_' + name];
        if (KEY_ESCAPE === key) {
            picker.exit(exit = true);
        } else if (KEY_ARROW_DOWN === key || KEY_ENTER === key || ' ' === key) {
            picker.enter(exit = true, 'down');
        } else if (KEY_ARROW_UP === key) {
            picker.enter(exit = true, 'up');
        }
        exit && offEventDefault(e);
    }

    function onKeyDownOption(e) {
        let $ = this,
            exit,
            key = e.key;
        e.ctrlKey;
        e.shiftKey;
        let picker = $['_' + name],
            {
                _mask,
                _options,
                mask,
                self,
                state
            } = picker,
            {
                input,
                value
            } = _mask,
            {
                n
            } = state;
        n += '__option';
        let nextOption, parentOption, prevOption;
        if (KEY_ENTER === key || KEY_ESCAPE === key || KEY_TAB === key || ' ' === key) {
            picker.exit(exit = KEY_TAB !== key);
        } else if (KEY_ARROW_DOWN === key) {
            exit = true;
            nextOption = getNext($); // Skip disabled option(s)…
            while (nextOption && hasClass(nextOption, n + '--disabled')) {
                nextOption = getNext(nextOption);
            }
            if (nextOption) {
                // Next option is a group?
                if (hasClass(nextOption, n + '-group')) {
                    nextOption = getChildFirst(nextOption);
                } // Is the last option?
            } else {
                // Is in a group?
                if ((parentOption = getParent($)) && hasClass(parentOption, n + '-group')) {
                    nextOption = getNext(parentOption);
                }
            } // Skip disabled option(s)…
            while (nextOption && hasClass(nextOption, n + '--disabled')) {
                nextOption = getNext(nextOption);
            }
            if (nextOption) {
                letAttribute($._of, 'selected');
                letClass($, n + '--selected');
                nextOption.focus();
                setAttribute(nextOption._of, 'selected', "");
                setClass(nextOption, n + '--selected');
                setHTML(input || value, getHTML(nextOption));
            } else if (hasClass(mask, state.n + '--open-up')) {
                picker.exit(exit);
            }
        } else if (KEY_ARROW_UP === key) {
            exit = true;
            prevOption = getPrev($); // Skip disabled option(s)…
            while (prevOption && hasClass(prevOption, n + '--disabled')) {
                prevOption = getPrev(prevOption);
            }
            if (prevOption) {
                // Previous option is a group?
                if (hasClass(prevOption, n + '-group')) {
                    prevOption = getChildLast(prevOption);
                } // Is the first option?
            } else {
                // Is in a group?
                if ((parentOption = getParent($)) && hasClass(parentOption, n + '-group')) {
                    prevOption = getPrev(parentOption);
                }
            } // Skip disabled option(s)…
            while (prevOption && hasClass(prevOption, n + '--disabled')) {
                prevOption = getPrev(prevOption);
            }
            if (prevOption) {
                letAttribute($._of, 'selected');
                letClass($, n + '--selected');
                prevOption.focus();
                setAttribute(prevOption._of, 'selected', "");
                setClass(prevOption, n + '--selected');
                setHTML(input || value, getHTML(prevOption));
            } else if (hasClass(mask, state.n + '--open-down')) {
                picker.exit(exit);
            }
        }
        exit && (offEventDefault(e), offEventPropagation(e));
    }

    function onPointerDownMask(e) {
        let $ = this,
            picker = $['_' + name],
            {
                state
            } = picker,
            {
                n
            } = state;
        picker[hasClass($, n + '--open') ? 'exit' : 'enter'](true), offEventDefault(e);
    }

    function onPointerDownOption(e) {
        let $ = this,
            picker = $['_' + name],
            {
                _mask,
                _options,
                self,
                state
            } = picker,
            {
                input,
                value
            } = _mask,
            {
                n
            } = state;
        n += '__option--selected';
        for (let k in _options) {
            let option = _options[k];
            if ($ === option) {
                continue;
            }
            letAttribute(option._of, 'selected');
            letClass(option, n);
        }
        setAttribute($._of, 'selected', "");
        setClass($, n);
        setHTML(input || value, getHTML($));
        offEventDefault(e);
    }

    function onResetForm(e) {
        let $ = this,
            picker = $['_' + name];
        picker.let().fire('reset', [e]);
    }

    function onSubmitForm(e) {
        let $ = this,
            picker = $['_' + name];
        return picker.fire('submit', [e]);
    }
    $$.attach = function (self, state) {
        let $ = this;
        self = self || $.self;
        state = state || $.state;
        $._active = !isDisabled(self) && !isReadOnly(self);
        $._options = {};
        $._value = getValue(self) || null;
        $.self = self;
        $.state = state;
        let n = state.n,
            isInput = 'input' === getName(self);
        const arrow = setElement('span', {
            'class': n + '__arrow'
        });
        const form = getParentForm(self);
        const mask = setElement('div', {
            'class': n,
            'tabindex': isDisabled(self) ? false : 0
        });
        $.mask = mask;
        const maskOptions = setElement('div', {
            'class': n + '__options'
        });
        let {
            options
        } = state;
        if (isFunction(options)) {
            options = options.call($);
        }
        createOptions.call($, maskOptions, options);
        const maskValues = setElement('div', {
            'class': n + '__values'
        });
        const text = setElement('span', {
            'class': n + '__' + (isInput ? 'text' : 'value')
        });
        const textInput = setElement('span', {
            'contenteditable': isDisabled(self) || isReadOnly(self) || !isInput ? false : "",
            'spellcheck': !isInput ? false : 'false'
        });
        const textInputHint = setElement('span', isInput ? self.placeholder + "" : "");
        setChildLast(mask, maskValues);
        setChildLast(mask, maskOptions);
        setChildLast(maskValues, text);
        setChildLast(maskValues, arrow);
        if (isInput) {
            setChildLast(text, textInput);
            setChildLast(text, textInputHint);
        }
        setClass(self, n + '__self');
        setNext(self, mask);
        if (form) {
            form['_' + name] = $;
            onEvent('reset', form, onResetForm);
            onEvent('submit', form, onSubmitForm);
        }
        onEvent('blur', mask, onBlurMask);
        onEvent('focus', mask, onFocusMask);
        onEvent('keydown', mask, onKeyDownMask);
        onEvent('mousedown', mask, onPointerDownMask);
        onEvent('touchstart', mask, onPointerDownMask);
        self.tabIndex = -1;
        mask['_' + name] = $;
        let _mask = {};
        _mask.hint = isInput ? textInputHint : null;
        _mask.input = isInput ? textInput : null;
        _mask.of = self;
        _mask.options = maskOptions;
        _mask.self = mask;
        _mask[isInput ? 'text' : 'value'] = text;
        $._mask = _mask; // Attach the current value(s)
        let option = $._options[$._value];
        setAttribute(option._of, 'selected', "");
        setHTML(isInput ? textInput : text, getHTML(option)); // Attach extension(s)
        if (isSet(state) && isArray(state.with)) {
            for (let i = 0, j = toCount(state.with); i < j; ++i) {
                let value = state.with[i];
                if (isString(value)) {
                    value = OptionPicker[value];
                } // `const Extension = function (self, state = {}) {}`
                if (isFunction(value)) {
                    value.call($, self, state);
                    continue;
                } // `const Extension = {attach: function (self, state = {}) {}, detach: function (self, state = {}) {}}`
                if (isObject(value) && isFunction(value.attach)) {
                    value.attach.call($, self, state);
                    continue;
                }
            }
        }
        return $;
    };
    $$.blur = function () {};
    $$.detach = function () {
        let $ = this,
            {
                _mask,
                mask,
                self,
                state
            } = $;
        const form = getParentForm(self);
        $._active = false;
        $._value = getValue(self) || null; // Update initial value to be the current value
        if (form) {
            offEvent('reset', form, onResetForm);
            offEvent('submit', form, onSubmitForm);
        }
        offEvent('blur', mask, onBlurMask);
        offEvent('focus', mask, onFocusMask);
        offEvent('keydown', mask, onKeyDownMask);
        offEvent('mousedown', mask, onPointerDownMask);
        offEvent('touchstart', mask, onPointerDownMask); // Detach extension(s)
        if (isArray(state.with)) {
            for (let i = 0, j = toCount(state.with); i < j; ++i) {
                let value = state.with[i];
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
            of : self
        };
        $.mask = null;
        return $;
    };
    $$.enter = function (focus, direction = 'down') {
        let $ = this,
            option, {
                _options,
                mask,
                self,
                state
            } = $,
            {
                n
            } = state;
        setClass(mask, n += '--open');
        setClass(mask, n + '-' + (direction || 'down'));
        $.fire('enter');
        if (focus) {
            $.fire('focus');
            if (option = _options[self.value]) {
                option.focus();
            }
            $.fire('focus.option');
        }
        return $;
    };
    $$.exit = function (focus, directions = ['down', 'up']) {
        let $ = this,
            {
                mask,
                state
            } = $,
            {
                n
            } = state;
        letClass(mask, n += '--open');
        if (isString(directions)) {
            directions = [directions];
        }
        directions.forEach(direction => letClass(mask, n + '-' + direction));
        $.fire('exit');
        if (focus) {
            mask.focus(), $.fire('focus').fire('focus.self');
        }
        return $;
    };
    $$.focus = function () {};
    return OptionPicker;
});