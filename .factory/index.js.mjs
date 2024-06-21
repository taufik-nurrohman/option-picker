import {R, W, getAttributes, getChildFirst, getChildLast, getDatum, getHTML, getName, getNext, getParent, getParentForm, getPrev, getText, hasClass, letAttribute, letClass, letElement, setAttribute, setChildLast, setClass, setElement, setHTML, setNext, setStyles} from '@taufik-nurrohman/document';
import {debounce, delay} from '@taufik-nurrohman/tick';
import {fromStates, fromValue} from '@taufik-nurrohman/from';
import {getRect} from '@taufik-nurrohman/rect';
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

const bounce = debounce($ => $.fit(), 10);
const name = 'OptionPicker';

function createOptions(options, values) {
    let $ = this, optionGroup,
        {self, state} = $,
        {n} = state;
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
        let items = self.children, selected = [];
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

OptionPicker.version = '%(version)';

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
        {input, value} = _mask,
        {n} = state;
    n += '__option';
    let nextOption, parentOption, prevOption;
    if (KEY_ENTER === key || KEY_ESCAPE === key || KEY_TAB === key || ' ' === key) {
        picker.exit(exit = KEY_TAB !== key);
    } else if (KEY_ARROW_DOWN === key) {
        exit = true;
        nextOption = getNext($);
        // Skip disabled option(s)…
        while (nextOption && hasClass(nextOption, n + '--disabled')) {
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
        // Skip disabled option(s)…
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
            self.value = getDatum(nextOption, 'value');
        }
    } else if (KEY_ARROW_UP === key) {
        exit = true;
        prevOption = getPrev($);
        // Skip disabled option(s)…
        while (prevOption && hasClass(prevOption, n + '--disabled')) {
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
        // Skip disabled option(s)…
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
            self.value = getDatum(prevOption, 'value');
        }
    }
    exit && (offEventDefault(e), offEventPropagation(e));
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
        {input, value} = _mask,
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
    setHTML(input || value, getHTML($));
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
        'tabindex': isDisabled(self) ? false : 0
    });
    $.mask = mask;
    const maskOptions = setElement('div', {
        'class': n + '__options'
    });
    let {options} = state;
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
    onEvent('mousedown', R, onPointerDownRoot);
    onEvent('mousedown', mask, onPointerDownMask);
    onEvent('resize', W, onResizeWindow);
    onEvent('scroll', W, onScrollWindow);
    onEvent('touchstart', R, onPointerDownRoot);
    onEvent('touchstart', mask, onPointerDownMask);
    self.tabIndex = -1;
    mask['_' + name] = $;
    let _mask = {};
    _mask.hint = isInput ? textInputHint : null;
    _mask.input = isInput ? textInput : null;
    _mask.of = self;
    _mask.options = maskOptions;
    _mask.root = R;
    _mask.self = mask;
    _mask[isInput ? 'text' : 'value'] = text;
    $._mask = _mask;
    // Attach the current value(s)
    let option = $._options[$._value];
    setAttribute(option._of, 'selected', "");
    setHTML(isInput ? textInput : text, getHTML(option));
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
        {_options, mask, self, state} = $,
        {n} = state;
    setClass(mask, n += '--open');
    R['_' + name] = $;
    W['_' + name] = $;
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

$$.exit = function (focus) {
    let $ = this,
        {mask, state} = $,
        {n} = state;
    letClass(mask, n += '--open');
    $.fire('exit');
    if (focus) {
        mask.focus(), $.fire('focus').fire('focus.self');
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