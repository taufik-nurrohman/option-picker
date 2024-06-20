import {delay} from '@taufik-nurrohman/tick';
import {fromStates, fromValue} from '@taufik-nurrohman/from';
import {getAttributes, getName, getNext, getParentForm, getPrev, getText, hasClass, letAttribute, letClass, letElement, setAttribute, setChildLast, setClass, setElement, setNext, setText, toggleClass} from '@taufik-nurrohman/document';
import {hook} from '@taufik-nurrohman/hook';
import {isArray, isFunction, isInstance, isObject, isSet, isString} from '@taufik-nurrohman/is';
import {offEvent, offEventDefault, offEventPropagation, onEvent} from '@taufik-nurrohman/event';
import {toCount} from '@taufik-nurrohman/to';

const KEY_ARROW_DOWN = 'ArrowDown';
const KEY_ARROW_UP = 'ArrowUp';
const KEY_BEGIN = 'Home';
const KEY_END = 'End';
const KEY_ENTER = 'Enter';
const KEY_ESCAPE = 'Escape';
const KEY_TAB = 'Tab';

const name = 'OptionPicker';

function createOptions(options) {
    let $ = this,
        {self, state} = $,
        {n} = state;
    n += '__option';
    let values = getOptions(self);
    for (let k in values) {
        let v = values[k];
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
        setChildLast(options, option);
    }
}

function defineProperty(of, key, state) {
    Object.defineProperty(of, key, state);
}

function getOptions(self) {
    const options = {};
    const value = getValue(self);
    if ('input' === getName(self)) {
        // TODO
    } else {
        let selected = [];
        for (let i = 0, j = toCount(self.options), v; i < j; ++i) {
            let v = self.options[i],
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
            options[v.value] = [getText(v) || v.value, attributes, v];
        }
        // If there is no selected option(s), get it from the current value
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

function onBlurTextInput() {}

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
    setClass(mask, n + '--focus-option');
}

function onFocusTextInput() {}

function onKeyDownMask(e) {
    let $ = this, exit,
        key = e.key,
        keyIsCtrl = e.ctrlKey,
        keyIsShift = e.shiftKey,
        picker = $['_' + name],
        {_options, self, state} = picker,
        {n} = state,
        option = _options[self.value];
    if (KEY_ESCAPE === key) {
        letClass($, n + '--open');
        $.focus();
        exit = true;
    } else if (option) {
        if (KEY_ARROW_DOWN === key || KEY_ENTER === key || ' ' === key) {
            setClass($, n + '--open');
            option.focus();
            exit = true;
        }
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
        {input} = _mask,
        {n} = state;
    n += '__option';
    let nextOption, prevOption;
    if (KEY_ENTER === key || KEY_ESCAPE === key || KEY_TAB === key || ' ' === key) {
        letClass(mask, state.n + '--open');
        if (KEY_TAB !== key) {
            mask.focus();
            exit = true;
        }
    } else if (KEY_ARROW_DOWN === key) {
        if (nextOption = getNext($)) {
            while (nextOption && hasClass(nextOption, n + '--disabled')) {
                nextOption = getNext(nextOption);
            }
            if (nextOption) {
                letAttribute($._of, 'selected');
                letClass($, n + '--selected');
                nextOption.focus();
                setAttribute(nextOption._of, 'selected', "");
                setClass(nextOption, n + '--selected');
                setText(input, getText(nextOption));
            }
        }
        exit = true;
    } else if (KEY_ARROW_UP === key) {
        if (prevOption = getPrev($)) {
            while (prevOption && hasClass(prevOption, n + '--disabled')) {
                prevOption = getPrev(prevOption);
            }
            if (prevOption) {
                letAttribute($._of, 'selected');
                letClass($, n + '--selected');
                prevOption.focus();
                setAttribute(prevOption._of, 'selected', "");
                setClass(prevOption, n + '--selected');
                setText(input, getText(prevOption));
            }
        } else {
            letClass(mask, state.n + '--open');
            mask.focus();
        }
        exit = true;
    }
    exit && (offEventDefault(e), offEventPropagation(e));
}

function onPointerDownMask(e) {
    let $ = this,
        picker = $['_' + name],
        {_options, self, state} = picker,
        {n} = state;
    n += '--open';
    toggleClass($, n);
    if (hasClass($, n) && _options[self.value]) {
        _options[self.value].focus();
    } else {
        $.focus();
    }
    offEventDefault(e);
}

function onPointerDownOption(e) {
    let $ = this,
        picker = $['_' + name],
        {_mask, _options, self, state} = picker,
        {input} = _mask,
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
    setText(input, getText($));
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
    const form = getParentForm(self);
    const mask = setElement('div', {
        'class': n,
        'tabindex': isDisabled(self) ? false : 0
    });
    $.mask = mask;
    const maskOptions = setElement('div', {
        'class': n + '__options'
    });
    createOptions.call($, maskOptions);
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
    setChildLast(text, textInput);
    if (isInput) {
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
    _mask.hint = textInputHint;
    _mask.input = textInput;
    _mask.of = self;
    _mask.options = null;
    _mask.self = mask;
    _mask.text = text;
    $._mask = _mask;
    // Attach the current value(s)
    let option = $._options[$._value];
    setAttribute(option._of, 'selected', "");
    setText(textInput, getText(option));
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
        {_mask, mask, self, state} = $;
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

$$.focus = function () {};

export default OptionPicker;