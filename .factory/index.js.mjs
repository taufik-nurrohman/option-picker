import {D, R, W, getAttributes, getChildFirst, getChildLast, getDatum, getHTML, getName, getNext, getParent, getParentForm, getPrev, getText, hasClass, letAttribute, letClass, letElement, setAttribute, setChildLast, setClass, setElement, setHTML, setNext, setStyles, setText} from '@taufik-nurrohman/document';
import {debounce, delay} from '@taufik-nurrohman/tick';
import {fromStates, fromValue} from '@taufik-nurrohman/from';
import {getRect} from '@taufik-nurrohman/rect';
import {hasValue} from '@taufik-nurrohman/has';
import {hook} from '@taufik-nurrohman/hook';
import {isArray, isFunction, isInstance, isObject, isSet, isString} from '@taufik-nurrohman/is';
import {offEvent, offEventDefault, offEventPropagation, onEvent} from '@taufik-nurrohman/event';
import {toCaseLower, toCount, toObjectValues} from '@taufik-nurrohman/to';

const KEY_ARROW_DOWN = 'ArrowDown';
const KEY_ARROW_UP = 'ArrowUp';
const KEY_BEGIN = 'Home';
const KEY_DELETE_LEFT = 'Backspace';
const KEY_DELETE_RIGHT = 'Delete';
const KEY_END = 'End';
const KEY_ENTER = 'Enter';
const KEY_ESCAPE = 'Escape';
const KEY_TAB = 'Tab';

const bounce = debounce($ => $.fit(), 10);
const name = 'OptionPicker';

function createOptions(options, values) {
    let $ = this, optionGroup,
        {self, state} = $,
        {n} = state;
    n += '__option';
    values = isInstance(values, Map) && values.size > 0 ? values : getOptions(self);
    values.forEach((v, k) => {
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
        let {disabled, selected, value} = v[1];
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
    });
    $.state.options = values;
}

function defineProperty(of, key, state) {
    Object.defineProperty(of, key, state);
}

function getOptions(self) {
    const map = new Map;
    const value = getValue(self);
    let item, items, selected = [];
    if ('input' === getName(self)) {
        items = self.list;
        items = items ? items.children : [];
    } else {
        items = self.children;
    }
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
            getOptions(v).forEach((vv, kk) => {
                vv[1]['data-group'] = v.label;
                map.set(kk, vv);
            });
            continue;
        }
        map.set(v.value, [getText(v) || v.value, attributes, v]);
    }
    // If there is no selected option(s), get it from the current value
    if (0 === toCount(selected) && (item = map.get(value))) {
        item[1].selected = true;
        map.set(value, item);
    }
    return map;
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
    }

    // Return new instance if `OptionPicker` was called without the `new` operator
    if (!isInstance($, OptionPicker)) {
        return new OptionPicker(self, state);
    }

    self['_' + name] = hook($, OptionPicker.prototype);

    return $.attach(self, fromStates({}, OptionPicker.state, (state || {})));

}

OptionPicker.state = {
    'n': 'option-picker',
    'options': null,
    'with': []
};

OptionPicker.version = '%(version)';

defineProperty(OptionPicker, 'name', {
    value: name
});

const $$ = OptionPicker.prototype;

defineProperty($$, 'value', {
    get: function () {
        let value = getValue(this.self);
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
        {state} = picker,
        {n} = state;
    letClass($, n += '--focus');
    letClass($, n += '-self');
}

function onBlurOption() {
    let $ = this,
        picker = $['_' + name],
        {mask, state} = picker,
        {n} = state;
    letClass(mask, n + '--focus-option');
}

function onBlurTextInput() {
    let $ = this,
        picker = $['_' + name],
        {_mask, mask, state} = picker,
        {text} = _mask,
        {n} = state;
    letClass(mask, n + '--focus-text');
    letClass(text, n + '__text--focus');
}

function onCutTextInput() {
    let $ = this,
        picker = $['_' + name],
        {_mask, self} = picker,
        {hint} = _mask;
    delay(() => setText(hint, getText($, false) ? "" : self.placeholder), 1)();
}

function onFocusMask() {
    let $ = this,
        picker = $['_' + name],
        {state} = picker,
        {n} = state;
    setClass($, n += '--focus');
    setClass($, n += '-self');
}

function onFocusOption() {
    let $ = this,
        picker = $['_' + name],
        {mask, state} = picker,
        {n} = state;
    selectNone();
    setClass(mask, n + '--focus-option');
}

function onFocusTextInput() {
    let $ = this,
        picker = $['_' + name],
        {_mask, mask, self, state} = picker,
        {text} = _mask,
        {n} = state;
    setClass(text, n + '__text--focus');
    setClass(mask, n += '--focus');
    setClass(mask, n += '-text');
    getValue(self) ? selectTo($) : picker.enter(true);
}

const search = debounce(($, input, _options) => {
    let q = toCaseLower(getText(input) || "");
    for (let k in _options) {
        let v = _options[k],
            text = toCaseLower(getText(v) + '\t' + v);
        if ("" === q || hasValue(q, text)) {
            letAttribute(v, 'hidden');
        } else {
            setAttribute(v, 'hidden', "");
        }
    }
}, 10);

function onKeyDownTextInput(e) {
    let $ = this, exit,
        key = e.key,
        picker = $['_' + name],
        {_mask, _options, self, state} = picker,
        {hint} = _mask,
        {n} = state;
    n += '__option--disabled';
    delay(() => setText(hint, getText($, false) ? "" : self.placeholder), 1)();
    picker.enter();
    if (KEY_ARROW_DOWN === key || KEY_ARROW_UP === key || KEY_ENTER === key) {
        let currentOption = _options[getValue(self)];
        if (!currentOption || currentOption.hidden) {
            currentOption = toObjectValues(_options).shift();
            while (currentOption && (hasClass(currentOption, n) || currentOption.hidden)) {
                currentOption = getNext(currentOption);
            }
        }
        if (currentOption) {
            currentOption.focus();
        }
        exit = true;
    } else if (KEY_TAB === key) {
        picker.exit();
    } else {
        search(picker, $, _options);
    }
    if (exit) {
        offEventDefault(e);
        offEventPropagation(e);
    }
}

function onKeyDownMask(e) {
    let $ = this, exit,
        key = e.key,
        picker = $['_' + name];
    if (KEY_ESCAPE === key) {
        picker.exit(exit = true);
    } else if (KEY_ARROW_DOWN === key || KEY_ARROW_UP === key || KEY_ENTER === key || ' ' === key) {
        picker.enter(exit = true).fit();
    }
    exit && offEventDefault(e);
}

function onKeyDownOption(e) {
    let $ = this, exit,
        key = e.key,
        keyIsCtrl = e.ctrlKey,
        keyIsShift = e.shiftKey,
        picker = $['_' + name],
        {_mask, _options, mask, self, state} = picker,
        {hint, input, value} = _mask,
        {n} = state;
    n += '__option';
    let isInput = 'input' === getName(self),
        nextOption, parentOption, prevOption;
    if (KEY_DELETE_LEFT === key) {
        exit = true;
        selectTo(input);
    } else if (KEY_ENTER === key || KEY_ESCAPE === key || KEY_TAB === key || ' ' === key) {
        if (KEY_ESCAPE !== key) {
            if (prevOption = _options[getValue(self)]) {
                letAttribute(prevOption._of, 'selected');
                letClass(prevOption, n + '--selected');
            }
            setAttribute($._of, 'selected', "");
            setClass($, n + '--selected');
            if (isInput) {
                setText(hint, "");
                setText(input, getText($));
            } else {
                setHTML(value, getHTML($));
            }
            self.value = getDatum($, 'value');
        }
        picker.exit(exit = KEY_TAB !== key);
    } else if (KEY_ARROW_DOWN === key) {
        exit = true;
        nextOption = getNext($);
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
        }
        // Skip disabled and hidden option(s)…
        while (nextOption && (hasClass(nextOption, n + '--disabled') || nextOption.hidden)) {
            nextOption = getNext(nextOption);
        }
        if (nextOption) {
            nextOption.focus();
        }
    } else if (KEY_ARROW_UP === key) {
        exit = true;
        prevOption = getPrev($);
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
        }
        // Skip disabled and hidden option(s)…
        while (prevOption && (hasClass(prevOption, n + '--disabled') || prevOption.hidden)) {
            prevOption = getPrev(prevOption);
        }
        if (prevOption) {
            prevOption.focus();
        } else if (isInput) {
            selectTo(input);
        }
    } else {
        exit = false;
        selectTo(input);
    }
    exit && (offEventDefault(e), offEventPropagation(e));
}

function onPasteTextInput() {
    let $ = this,
        picker = $['_' + name],
        {_mask, self} = picker,
        {hint} = _mask;
    delay(() => setText($, getText($)))(); // Convert to plain text
    delay(() => setText(hint, getText($, false) ? "" : self.placeholder), 1)();
}

function onPointerDownMask(e) {
    let $ = this,
        picker = $['_' + name],
        {state} = picker,
        {n} = state;
    picker[hasClass($, n + '--open') ? 'exit' : 'enter'](true).fit(), offEventDefault(e);
}

function onPointerDownOption(e) {
    let $ = this,
        picker = $['_' + name],
        {_mask, _options, self, state} = picker,
        {hint, input, value} = _mask,
        {n} = state;
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
    if ('input' === getName(self)) {
        setText(hint, "");
        setText(input, getText($));
    } else {
        setHTML(value, getHTML($));
    }
    self.value = getDatum($, 'value');
    offEventDefault(e);
}

function onPointerDownRoot(e) {
    let $ = this,
        picker = $['_' + name];
    if (!picker) {
        return;
    }
    let {mask, state} = picker,
        {n} = state,
        target = e.target;
    if (mask !== target && mask !== getParent(target, '.' + n)) {
        picker.exit();
        delete $['_' + name];
    }
}

function onResetForm(e) {
    let $ = this,
        picker = $['_' + name];
    picker.let().fire('reset', [e]);
}

function onResizeWindow() {
    let $ = this,
        picker = $['_' + name];
    picker && bounce(picker);
}

function onScrollWindow() {
    onResizeWindow.call(this);
}

function onSubmitForm(e) {
    let $ = this,
        picker = $['_' + name];
    return picker.fire('submit', [e]);
}

function selectNone(node) {
    const selection = D.getSelection();
    if (node) {} else {
        // selection.removeAllRanges();
        if (selection.rangeCount) {
            selection.removeRange(selection.getRangeAt(0));
        }
    }
}

function selectTo(node, mode) {
    const selection = D.getSelection();
    selectNone();
    const range = D.createRange();
    range.selectNodeContents(node);
    selection.addRange(range);
    if (1 === mode) {
        selection.collapseToEnd();
    } else if (-1 === mode) {
        selection.collapseToStart();
    }
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
    let isInput = 'input' === getName(self),
        {n} = state;
    const arrow = setElement('span', {
        'class': n + '__arrow'
    });
    const form = getParentForm(self);
    const mask = setElement('div', {
        'class': n,
        'tabindex': isDisabled(self) || isInput ? false : 0
    });
    $.mask = mask;
    const maskOptions = setElement('div', {
        'class': n + '__options'
    });
    let {options} = state;
    if (isFunction(options)) {
        options = options.call($);
    }
    const map = new Map;
    if (isArray(options)) {
        options.forEach(option => {
            if (isArray(option)) {
                option[0] = option[0] ?? "";
                option[1] = option[1] ?? {};
                map.set(option[0], option);
            } else {
                map.set(option, [option, {}]);
            }
        });
    } else if (isObject(options)) {
        for (let k in options) {
            if (isArray(options[k])) {
                options[k][0] = options[k][0] ?? "";
                options[k][1] = options[k][1] ?? {};
                continue;
            }
            map.set(k, [options[k], {}]);
        }
    }
    createOptions.call($, maskOptions, options = map);
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
        onEvent('blur', textInput, onBlurTextInput);
        onEvent('cut', textInput, onCutTextInput);
        onEvent('focus', textInput, onFocusTextInput);
        onEvent('keydown', textInput, onKeyDownTextInput);
        onEvent('paste', textInput, onPasteTextInput);
        textInput['_' + name] = $;
    } else {
        onEvent('blur', mask, onBlurMask);
        onEvent('focus', mask, onFocusMask);
        onEvent('keydown', mask, onKeyDownMask);
    }
    setClass(self, n + '__self');
    setNext(self, mask);
    if (form) {
        form['_' + name] = $;
        onEvent('reset', form, onResetForm);
        onEvent('submit', form, onSubmitForm);
    }
    onEvent('mousedown', R, onPointerDownRoot);
    onEvent('mousedown', mask, onPointerDownMask);
    onEvent('resize', W, onResizeWindow);
    onEvent('scroll', W, onScrollWindow);
    onEvent('touchstart', R, onPointerDownRoot);
    onEvent('touchstart', mask, onPointerDownMask);
    self.tabIndex = -1;
    mask['_' + name] = $;
    let _mask = {}, option;
    _mask.hint = isInput ? textInputHint : null;
    _mask.input = isInput ? textInput : null;
    _mask.of = self;
    _mask.options = maskOptions;
    _mask.root = R;
    _mask.self = mask;
    _mask[isInput ? 'text' : 'value'] = text;
    $._mask = _mask;
    // Attach the current value(s)
    if (option = $._options[$._value]) {
        setAttribute(option._of, 'selected', "");
        if (isInput) {
            setText(textInput, getText(option));
            if (getText(textInput, false)) {
                setText(textInputHint, "");
            }
        } else {
            setHTML(text, getHTML(option));
        }
    }
    // Attach extension(s)
    if (isSet(state) && isArray(state.with)) {
        for (let i = 0, j = toCount(state.with); i < j; ++i) {
            let value = state.with[i];
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

$$.blur = function () {};

$$.detach = function () {
    let $ = this,
        {_mask, mask, self, state} = $,
        {input} = _mask;
    const form = getParentForm(self);
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
    offEvent('mousedown', R, onPointerDownRoot);
    offEvent('mousedown', mask, onPointerDownMask);
    offEvent('resize', W, onResizeWindow);
    offEvent('scroll', W, onScrollWindow);
    offEvent('touchstart', R, onPointerDownRoot);
    offEvent('touchstart', mask, onPointerDownMask);
    // Detach extension(s)
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
        of: self
    };
    $.mask = null;
    return $;
};

$$.enter = function (focus) {
    let $ = this, option,
        {_mask, _options, mask, self, state} = $,
        {input} = _mask,
        {n} = state;
    setClass(mask, n += '--open');
    if (R['_' + name] && R['_' + name] !== $) {
        R['_' + name].exit(); // Exit other(s)
    }
    R['_' + name] = $; // Link current picker to the root target
    W['_' + name] = $;
    $.fire('enter');
    if (focus) {
        $.fire('focus');
        if ('input' === getName(self)) {
            input.focus(), selectTo(input);
        } else if (option = _options[getValue(self)]) {
            option.focus();
        }
        $.fire('focus.option');
    }
    return $;
};

$$.exit = function (focus) {
    let $ = this,
        {_mask, mask, self, state} = $,
        {input} = _mask,
        {n} = state;
    letClass(mask, n += '--open');
    $.fire('exit');
    if (focus) {
        if ('input' === getName(self)) {
            input.focus(), selectTo(input);
        } else {
            mask.focus();
        }
        $.fire('focus').fire('focus.self');
    }
    return $;
}

$$.fit = function () {
    let $ = this,
        {_mask, mask} = $,
        {options} = _mask;
    let rectMask = getRect(mask),
        rectWindow = getRect(W);
    if (rectMask[1] + (rectMask[3] / 2) > (rectWindow[3] / 2)) {
        setStyles(options, {
            'bottom': '100%',
            'max-height': rectMask[1],
            'top': 'auto'
        });
    } else {
        setStyles(options, {
            'bottom': 'auto',
            'max-height': rectWindow[3] - rectMask[1] - rectMask[3],
            'top': '100%'
        });
    }
    return $;
};

$$.focus = function () {};

export default OptionPicker;